{
  config,
  lib,
  pkgs,
  ...
}:

with lib;

let
  cfg = config.services.archtika;
in
{
  options.services.archtika = {
    enable = mkEnableOption "archtika service";

    user = mkOption {
      type = types.str;
      default = "archtika";
      description = "User account under which archtika runs.";
    };

    group = mkOption {
      type = types.str;
      default = "archtika";
      description = "Group under which archtika runs.";
    };

    databaseName = mkOption {
      type = types.str;
      default = "archtika";
      description = "Name of the PostgreSQL database for archtika.";
    };

    jwtSecret = mkOption {
      type = types.str;
      description = "JWT secret for archtika.";
    };

    port = mkOption {
      type = types.port;
      default = 3000;
      description = "Port on which the API runs.";
    };

    webAppPort = mkOption {
      type = types.port;
      default = 4000;
      description = "Port on which the web application runs.";
    };
  };

  config = mkIf cfg.enable {
    users.users.${cfg.user} = {
      isSystemUser = true;
      group = cfg.group;
      home = "/var/lib/archtika";
      createHome = true;
    };

    users.groups.${cfg.group} = { };

    systemd.services.archtika-api = {
      description = "archtika API service";
      wantedBy = [ "multi-user.target" ];
      after = [
        "network.target"
        "postgresql.service"
      ];
      environment = {
        PGRST_DB_URI = "postgres://authenticator@localhost:5432/${cfg.databaseName}";
        PGRST_JWT_SECRET = cfg.jwtSecret;
      };

      serviceConfig = {
        ExecStart = "${pkgs.postgrest}/bin/postgrest";
        User = cfg.user;
        Group = cfg.group;
        Restart = "always";
      };
    };

    systemd.services.archtika-web = {
      description = "Archtika Web App service";
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" ];
      environment = {
        ORIGIN = "https://${cfg.domain}";
        HOST = "127.0.0.1";
        PORT = toString cfg.webAppPort;
      };

      serviceConfig = {
        ExecStart = "${pkgs.nodejs_22}/bin/node ${pkgs.callPackage ../packages/web.nix { }}";
        User = cfg.user;
        Group = cfg.group;
        Restart = "always";
      };
    };

    services.postgresql = {
      enable = true;
      package = pkgs.postgresql_16;
      ensureDatabases = [ cfg.databaseName ];
      ensureUsers = [
        {
          name = cfg.user;
          ensurePermissions = {
            "DATABASE ${cfg.databaseName}" = "ALL PRIVILEGES";
          };
        }
      ];
      authentication = lib.mkForce ''
        local all all trust
        host all all 127.0.0.1/32 trust
      '';
      enableTCPIP = true;
      extraPlugins = with pkgs.postgresql16Packages; [ pgjwt ];
    };

    services.nginx = {
      enable = true;
      recommendedProxySettings = true;
      recommendedTlsSettings = true;

      virtualHosts.${cfg.domain} = {
        forceSSL = true;
        enableACME = true;

        locations."/" = {
          proxyPass = "http://127.0.0.1:${toString cfg.webAppPort}";
        };

        locations."/api/" = {
          proxyPass = "http://127.0.0.1:${toString cfg.port}/";
        };
      };
    };

    networking.firewall.allowedTCPPorts = [
      80
      443
    ];

    system.activationScripts.archtika-setup = ''
      mkdir -p /etc/archtika
      cat > /etc/archtika/postgrest.conf << EOF
      db-uri = "$(systemd-escape "postgres://${cfg.user}:${cfg.user}@localhost/${cfg.databaseName}")"
      db-schema = "api"
      db-anon-role = "anon"
      jwt-secret = "$(systemd-escape "${cfg.jwtSecret}")"
      server-port = ${toString cfg.port}
      EOF
      chown -R ${cfg.user}:${cfg.group} /etc/archtika
      chmod 600 /etc/archtika/postgrest.conf
    '';
  };
}
