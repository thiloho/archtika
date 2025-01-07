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

      dbUrl = user: "postgres://${user}@127.0.0.1:15432/archtika";
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          api = pkgs.mkShell {
            packages = with pkgs; [
              postgresql
              postgrest
            ];
            shellHook = ''
              alias dbmate="${pkgs.dbmate}/bin/dbmate --no-dump-schema --url ${dbUrl "postgres"}?sslmode=disable"
              alias formatsql="${pkgs.pgformatter}/bin/pg_format -s 2 -f 2 -U 2 -i db/migrations/*.sql"
              alias dbconnect="${pkgs.postgresql_16}/bin/psql ${dbUrl "postgres"}"
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
            program =
              let
                settings = {
                  maxStorage = 100;
                  maxWebsites = 3;
                };
                jwtSecret = "BMlgCY9fEzmf7jhQpNnxlS6TM8E6xk2vS08C3ukm5LM2aTooaF5PfxT3o2K9uKzq";
              in
              "${pkgs.writeShellScriptBin "api-setup" ''
                psql ${dbUrl "postgres"} \
                  -c "ALTER DATABASE archtika SET \"app.jwt_secret\" TO '${jwtSecret}'" \
                  -c "ALTER DATABASE archtika SET \"app.website_max_storage_size\" TO ${toString settings.maxStorage}" \
                  -c "ALTER DATABASE archtika SET \"app.website_max_number_user\" TO ${toString settings.maxWebsites}"

                ${pkgs.dbmate}/bin/dbmate --no-dump-schema \
                  --url ${dbUrl "postgres"}?sslmode=disable \
                  --migrations-dir ${self.outPath}/rest-api/db/migrations up

                PGRST_ADMIN_SERVER_PORT=3001 \
                PGRST_DB_SCHEMAS="api" \
                PGRST_DB_ANON_ROLE="anon" \
                PGRST_OPENAPI_MODE="ignore-privileges" \
                PGRST_DB_URI="${dbUrl "authenticator"}" \
                PGRST_JWT_SECRET="${jwtSecret}" \
                ${pkgs.postgrest}/bin/postgrest
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
