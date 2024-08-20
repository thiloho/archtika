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
            packages = with pkgs; [ postgresql_16 ];
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
          dev-vm = self.nixosConfigurations.dev-vm.config.system.build.vm;

          default = pkgs.callPackage ./nix/package.nix { };
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

              ${pkgs.dbmate}/bin/dbmate --url postgres://postgres@localhost:15432/archtika?sslmode=disable --migrations-dir ${self.outPath}/rest-api/db/migrations up

              PGRST_DB_SCHEMAS="api" PGRST_DB_ANON_ROLE="anon" PGRST_OPENAPI_MODE="ignore-privileges" PGRST_DB_URI="postgres://authenticator@localhost:15432/archtika" PGRST_JWT_SECRET="a42kVyAhTImYxZeebZkApoAZLmf0VtDA" ${pkgs.postgrest}/bin/postgrest
            ''}/bin/api-setup";
          };
        }
      );

      nixosConfigurations = {
        dev-vm = nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";
          modules = [ ./nix/dev-vm.nix ];
        };
        demo-server = nixpkgs.lib.nixosSystem {
          system = "aarch64-linux";
          modules = [
            ./nix/demo-server
            { _module.args.localArchtikaPackage = self.packages."aarch64-linux".default; }
          ];
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
