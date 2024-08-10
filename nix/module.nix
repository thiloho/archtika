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

    jwtSecret = mkOption {
      type = types.str;
      description = "JWT secret for archtika.";
    };

    port = mkOption {
      type = types.port;
      default = 5000;
      description = "Port on which the API runs.";
    };

    webAppPort = mkOption {
      type = types.port;
      default = 10000;
      description = "Port on which the web application runs.";
    };

    nginxPort = mkOption {
      type = types.port;
      default = 15000;
      description = "Port on which NGINX runs.";
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
        ${pkgs.postgresql_16}/bin/psql postgres://postgres@localhost:5432/${cfg.databaseName} -c "ALTER DATABASE ${cfg.databaseName} SET \"app.jwt_secret\" TO '${cfg.jwtSecret}'"

        ${pkgs.dbmate}/bin/dbmate --url postgres://postgres@localhost:5432/archtika?sslmode=disable --migrations-dir ${cfg.package}/rest-api/db/migrations up

        PGRST_SERVER_PORT=${toString cfg.port} PGRST_DB_SCHEMAS="api" PGRST_DB_ANON_ROLE="anon" PGRST_OPENAPI_MODE="ignore-privileges" PGRST_DB_URI="postgres://authenticator@localhost:5432/${cfg.databaseName}" PGRST_JWT_SECRET="${cfg.jwtSecret}" ${pkgs.postgrest}/bin/postgrest
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
      };

      script = ''
        ORIGIN=http://localhost:${toString cfg.webAppPort} PORT=${toString cfg.webAppPort} ARCHTIKA_API_PORT=${toString cfg.port} ARCHTIKA_NGINX_PORT=${toString cfg.nginxPort} ${pkgs.nodejs_22}/bin/node ${cfg.package}/web-app
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

      virtualHosts."_" = {
        listen = [
          {
            addr = "0.0.0.0";
            port = cfg.nginxPort;
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
}
