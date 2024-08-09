{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs =
    { self, nixpkgs, ... }:
    let
      allSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems = nixpkgs.lib.genAttrs allSystems;
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          api = pkgs.mkShell {
            shellHook = ''
              alias dbmate="${pkgs.dbmate}/bin/dbmate --url postgres://postgres@localhost:15432/archtika?sslmode=disable"
              alias formatsql="${pkgs.pgformatter}/bin/pg_format -s 2 -f 2 -U 2 -i db/migrations/*.sql"
            '';
          };
          web = pkgs.mkShell { packages = with pkgs; [ nodejs_22 ]; };
        }
      );

      packages = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          module-test = self.nixosConfigurations.${system}.module-test.config.system.build.vm;
          dev-vm = self.nixosConfigurations.${system}.dev-vm.config.system.build.vm;

          web = pkgs.buildNpmPackage {
            name = "archtika-web-app";
            src = ./web-app;
            npmDepsHash = "sha256-DmIII/x5ANlEpKtnZC/JlbVAvhbgnSiNn8hkj+qVCZY=";
            npmFlags = [ "--legacy-peer-deps" ];
            installPhase = ''
              mkdir $out
              cp package.json $out
              cp -r node_modules $out
              cp -r build/* $out
            '';
          };

          api = pkgs.stdenv.mkDerivation {
            name = "archtika-api";
            src = ./rest-api;
            installPhase = ''
              mkdir $out
              cp -r db/migrations $out
            '';
          };
        }
      );

      apps = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          api = {
            type = "app";
            program = "${pkgs.writeShellScriptBin "api-setup" ''
              ${pkgs.postgresql_16}/bin/psql postgres://postgres@localhost:15432/archtika -c "ALTER DATABASE archtika SET \"app.jwt_secret\" TO 'a42kVyAhTImYxZeebZkApoAZLmf0VtDA'"

              ${pkgs.dbmate}/bin/dbmate --url postgres://postgres@localhost:15432/archtika?sslmode=disable --migrations-dir ${self.packages.${system}.api}/migrations up

              PGRST_DB_SCHEMAS="api" PGRST_DB_ANON_ROLE="anon" PGRST_OPENAPI_MODE="ignore-privileges" PGRST_DB_URI="postgres://authenticator@localhost:15432/archtika" PGRST_JWT_SECRET="a42kVyAhTImYxZeebZkApoAZLmf0VtDA" ${pkgs.postgrest}/bin/postgrest
            ''}/bin/api-setup";
          };

          web = {
            type = "app";
            program = "${pkgs.writeShellScriptBin "web-wrapper" ''
              ORIGIN=http://localhost:4000 HOST=127.0.0.1 PORT=4000 ${pkgs.nodejs_22}/bin/node ${self.packages.${system}.web}
            ''}/bin/web-wrapper";
          };
        }
      );

      nixosConfigurations = forAllSystems (system: {
        module-test = nixpkgs.lib.nixosSystem {
          inherit system;
          modules = [
            ./nix/module-test.nix
            { _module.args.archtikaPackages = self.packages.${system}; }
          ];
        };
        dev-vm = nixpkgs.lib.nixosSystem {
          inherit system;
          modules = [ ./nix/dev-vm.nix ];
        };
      });

      nixosModules = {
        archtika =
          { pkgs, ... }:
          {
            imports = [ ./nix/module.nix ];
            _module.args.archtikaPackages = self.packages.${pkgs.system};
          };
      };

      formatter = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        pkgs.nixfmt-rfc-style
      );
    };
}
