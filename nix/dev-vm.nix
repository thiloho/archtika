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
    memorySize = 2048;
    cores = 2;
    diskSize = 10240;
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
        guest.port = 1800;
      }
    ];
  };

  services = {
    postgresql = {
      enable = true;
      package = pkgs.postgresql_16;
      /*
        PL/Perl:
        overrideAttrs (
          finalAttrs: previousAttrs: {
            buildInputs = previousAttrs.buildInputs ++ [ pkgs.perl ];
            configureFlags = previousAttrs.configureFlags ++ [ "--with-perl" ];
          }
        );
      */
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
      recommendedProxySettings = true;
      recommendedTlsSettings = true;
      recommendedZstdSettings = true;
      recommendedOptimisation = true;

      virtualHosts."_" = {
        listen = [
          {
            addr = "0.0.0.0";
            port = 1800;
          }
        ];
        locations = {
          "/previews/" = {
            alias = "/var/www/archtika-websites/previews/";
            index = "index.html";
            tryFiles = "$uri $uri/ $uri.html =404";
          };
          "/" = {
            root = "/var/www/archtika-websites";
            index = "index.html";
            tryFiles = "$uri $uri/ $uri.html =404";
          };
        };
      };
    };
  };

  services.getty.autologinUser = "dev";

  system.stateVersion = "24.05";
}
