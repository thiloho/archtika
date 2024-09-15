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

    package = mkPackageOption pkgs "archtika" { };

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

    apiPort = mkOption {
      type = types.port;
      default = 5000;
      description = "Port on which the API runs.";
    };

    apiAdminPort = mkOption {
      type = types.port;
      default = 7500;
      description = "Port on which the API admin server runs.";
    };

    webAppPort = mkOption {
      type = types.port;
      default = 10000;
      description = "Port on which the web application runs.";
    };

    domain = mkOption {
      type = types.str;
      default = null;
      description = "Domain to use for the application.";
    };

    acmeEmail = mkOption {
      type = types.str;
      default = null;
      description = "Email to notify for the SSL certificate renewal process.";
    };

    dnsProvider = mkOption {
      type = types.str;
      default = null;
      description = "DNS provider for the DNS-01 challenge (required for wildcard domains).";
    };

    dnsEnvironmentFile = mkOption {
      type = types.path;
      default = null;
      description = "API secrets for the DNS-01 challenge (required for wildcard domains).";
    };
  };

  config = mkIf cfg.enable {
    users.users.${cfg.user} = {
      isSystemUser = true;
      group = cfg.group;
    };

    users.groups.${cfg.group} = { };

    systemd.tmpfiles.rules = [ "d /var/www/archtika-websites 0755 ${cfg.user} ${cfg.group} -" ];

    systemd.services.archtika-api = {
      description = "archtika API service";
      wantedBy = [ "multi-user.target" ];
      after = [
        "network.target"
        "postgresql.service"
      ];

      serviceConfig = {
        User = cfg.user;
        Group = cfg.group;
        Restart = "always";
      };

      script = ''
        JWT_SECRET=$(tr -dc 'A-Za-z0-9' < /dev/urandom | head -c64)

        ${pkgs.postgresql_16}/bin/psql postgres://postgres@localhost:5432/${cfg.databaseName} -c "ALTER DATABASE ${cfg.databaseName} SET \"app.jwt_secret\" TO '$JWT_SECRET'"

        ${pkgs.dbmate}/bin/dbmate --url postgres://postgres@localhost:5432/archtika?sslmode=disable --migrations-dir ${cfg.package}/rest-api/db/migrations up

        PGRST_ADMIN_SERVER_PORT=${toString cfg.apiAdminPort} PGRST_SERVER_PORT=${toString cfg.apiPort} PGRST_DB_SCHEMAS="api" PGRST_DB_ANON_ROLE="anon" PGRST_OPENAPI_MODE="ignore-privileges" PGRST_DB_URI="postgres://authenticator@localhost:5432/${cfg.databaseName}" PGRST_JWT_SECRET="$JWT_SECRET" ${pkgs.postgrest}/bin/postgrest
      '';
    };

    systemd.services.archtika-web = {
      description = "archtika Web App service";
      wantedBy = [ "multi-user.target" ];
      after = [ "network.target" ];

      serviceConfig = {
        User = cfg.user;
        Group = cfg.group;
        Restart = "always";
        WorkingDirectory = "${cfg.package}/web-app";
      };

      script = ''
        BODY_SIZE_LIMIT=Infinity ORIGIN=https://${cfg.domain} PORT=${toString cfg.webAppPort} ${pkgs.nodejs_22}/bin/node ${cfg.package}/web-app
      '';
    };

    services.postgresql = {
      enable = true;
      package = pkgs.postgresql_16;
      ensureDatabases = [ cfg.databaseName ];
      authentication = lib.mkForce ''
        # IPv4 local connections:
        host    all    all    127.0.0.1/32    trust
        # IPv6 local connections:
        host    all    all    ::1/128         trust
        # Local socket connections:
        local   all    all                    trust
      '';
      extraPlugins = with pkgs.postgresql16Packages; [ pgjwt ];
    };

    services.nginx = {
      enable = true;
      recommendedProxySettings = true;
      recommendedTlsSettings = true;

      virtualHosts = {
        "${cfg.domain}" = {
          useACMEHost = cfg.domain;
          forceSSL = true;
          locations = {
            "/" = {
              proxyPass = "http://localhost:${toString cfg.webAppPort}";
            };
            "/previews/" = {
              root = "/var/www/archtika-websites/previews/";
              index = "index.html";
              tryFiles = "$uri $uri/ $uri.html =404";
            };
            "/api/" = {
              proxyPass = "http://localhost:${toString cfg.apiPort}/";
              extraConfig = ''
                default_type  application/json;
                proxy_set_header Connection "";
                proxy_http_version 1.1;
              '';
            };
          };
        };
        "~^(?<subdomain>.+)\\.${lib.strings.escapeRegex cfg.domain}$" = {
          useACMEHost = cfg.domain;
          forceSSL = true;
          locations = {
            "/" = {
              root = "/var/www/archtika-websites/$subdomain";
              index = "index.html";
              tryFiles = "$uri $uri/ $uri.html =404";
            };
          };
        };
      };
    };

    security.acme = {
      acceptTerms = true;
      defaults.email = cfg.acmeEmail;
      certs."${cfg.domain}" = {
        domain = cfg.domain;
        extraDomainNames = [ "*.${cfg.domain}" ];
        dnsProvider = cfg.dnsProvider;
        environmentFile = cfg.dnsEnvironmentFile;
        group = config.services.nginx.group;
      };
    };
  };
}
