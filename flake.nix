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
            packages = with pkgs; [
              dbmate
              postgrest
            ];

            shellHook = ''
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
          dev-vm = self.nixosConfigurations.${system}.dev-vm.config.system.build.vm;

          api-setup = pkgs.writeShellScriptBin "api-setup" ''
            source .env

            ${pkgs.postgresql_16}/bin/psql $DATABASE_URL -c "ALTER DATABASE archtika SET \"app.jwt_secret\" TO '$JWT_SECRET'"

            ${pkgs.dbmate}/bin/dbmate up

            echo "Running command: PGRST_DB_URI=\"$PGRST_DB_URI\" PGRST_JWT_SECRET=\"$JWT_SECRET\" ${pkgs.postgrest}/bin/postgrest postgrest.conf"

            PGRST_DB_URI="$PGRST_DB_URI" PGRST_JWT_SECRET="$JWT_SECRET" ${pkgs.postgrest}/bin/postgrest postgrest.conf
          '';

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
        }
      );

      apps = forAllSystems (
        system:
        let
          pkgs = nixpkgs.legacyPackages.${system};
        in
        {
          web = {
            type = "app";
            program = "${pkgs.writeShellScriptBin "web-wrapper" ''
              export ORIGIN=http://localhost:4000
              export HOST=127.0.0.1
              export PORT=4000

              ${pkgs.nodejs_22}/bin/node ${self.packages.${system}.web}
            ''}/bin/web-wrapper";
          };
        }
      );

      nixosConfigurations = forAllSystems (system: {
        dev-vm = nixpkgs.lib.nixosSystem {
          inherit system;
          modules = [
            self.nixosModules.dev-vm
            {
              virtualisation =
                nixpkgs.lib.optionalAttrs
                  (nixpkgs.lib.elem system [
                    "x86_64-darwin"
                    "aarch64-darwin"
                  ])
                  {
                    vmVariant = {
                      virtualisation.host.pkgs = nixpkgs.legacyPackages.${system};
                    };
                  };
            }
          ];
        };
      });

      nixosModules.dev-vm =
        {
          pkgs,
          lib,
          modulesPath,
          ...
        }:
        {
          imports = [ "${modulesPath}/virtualisation/qemu-vm.nix" ];

          networking = {
            hostName = "archtika";
            firewall.enable = false;
          };

          nix.settings.experimental-features = [ "nix-command flakes" ];

          users.users.dev = {
            isNormalUser = true;
            extraGroups = [ "wheel" ];
            password = "dev";
          };

          systemd.tmpfiles.rules = [ "d /var/www/archtika-websites 0777 root root -" ];

          virtualisation = {
            graphics = false;
            sharedDirectories = {
              websites = {
                source = "/var/www/archtika-websites";
                target = "/var/www/archtika-websites";
              };
            };
            # Alternatively a bridge network for QEMU could be setup, but requires much more effort
            forwardPorts = [
              {
                from = "host";
                host.port = 15432;
                guest.port = 5432;
              }
              {
                from = "host";
                host.port = 18000;
                guest.port = 80;
              }
            ];
          };

          services = {
            postgresql = {
              enable = true;
              package = pkgs.postgresql_16;
              ensureDatabases = [ "archtika" ];
              authentication = lib.mkForce ''
                local all all trust
                host all all all trust
              '';
              enableTCPIP = true;
              extraPlugins = with pkgs.postgresql16Packages; [ pgjwt ];
            };
            nginx = {
              enable = true;
              virtualHosts."_" = {
                listen = [
                  {
                    addr = "0.0.0.0";
                    port = 80;
                  }
                ];
                locations = {
                  "/" = {
                    root = "/var/www/archtika-websites";
                    index = "index.html";
                    tryFiles = "$uri $uri/ $uri/index.html =404";
                    extraConfig = ''
                      autoindex on;
                    '';
                  };
                };
              };
            };
          };

          system.stateVersion = "24.05";
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
