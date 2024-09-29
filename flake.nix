{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
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
              alias dbmate="${pkgs.dbmate}/bin/dbmate --no-dump-schema --url postgres://postgres@localhost:15432/archtika?sslmode=disable"
              alias formatsql="${pkgs.pgformatter}/bin/pg_format -s 2 -f 2 -U 2 -i db/migrations/*.sql"
              alias dbconnect="${pkgs.postgresql_16}/bin/psql postgres://postgres@localhost:15432/archtika"
            '';
          };
          web = pkgs.mkShell {
            packages = with pkgs; [ nodejs_22 ];
            shellHook = ''
              export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
              export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
            '';
          };
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

          docker = pkgs.callPackage ./nix/docker.nix { };
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
              JWT_SECRET=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c64)

              ${pkgs.postgresql_16}/bin/psql postgres://postgres@localhost:15432/archtika -c "ALTER DATABASE archtika SET \"app.jwt_secret\" TO '$JWT_SECRET'"

              ${pkgs.dbmate}/bin/dbmate --url postgres://postgres@localhost:15432/archtika?sslmode=disable --migrations-dir ${self.outPath}/rest-api/db/migrations up

              PGRST_ADMIN_SERVER_PORT=3001 PGRST_DB_SCHEMAS="api" PGRST_DB_ANON_ROLE="anon" PGRST_OPENAPI_MODE="ignore-privileges" PGRST_DB_URI="postgres://authenticator@localhost:15432/archtika" PGRST_JWT_SECRET="$JWT_SECRET" ${pkgs.postgrest}/bin/postgrest
            ''}/bin/api-setup";
          };
        }
      );

      nixosConfigurations = {
        dev-vm = nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";
          modules = [ ./nix/dev-vm.nix ];
        };
        qs = nixpkgs.lib.nixosSystem {
          system = "aarch64-linux";
          modules = [
            ./nix/deploy/qs
            { _module.args.localArchtikaPackage = self.packages."aarch64-linux".default; }
          ];
        };
        prod = nixpkgs.lib.nixosSystem {
          system = "aarch64-linux";
          modules = [
            ./nix/deploy/prod
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
