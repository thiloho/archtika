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
        guest.port = 1800;
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
            port = 1800;
          }
        ];
        locations = {
          "/" = {
            root = "/var/www/archtika-websites/";
            index = "index.html";
            tryFiles = "$uri $uri/ $uri.html $uri/index.html index.html =404";
            extraConfig = ''
              autoindex on;
            '';
          };
        };
      };
    };
  };

  services.getty.autologinUser = "dev";

  system.stateVersion = "24.05";
}
