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
      type = types.either types.str types.path;
      description = "JWT secret for archtika. Can be a string or a path to a file containing the secret";
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

      script =
        let
          getSecret = if isPath cfg.jwtSecret then "cat ${cfg.jwtSecret}" else "echo -n '${cfg.jwtSecret}'";
        in
        ''
          JWT_SECRET=$(${getSecret})

          ${pkgs.postgresql_16}/bin/psql postgres://postgres@localhost:5432/${cfg.databaseName} -c "ALTER DATABASE ${cfg.databaseName} SET \"app.jwt_secret\" TO '$JWT_SECRET'"

          ${pkgs.dbmate}/bin/dbmate --url postgres://postgres@localhost:5432/archtika?sslmode=disable --migrations-dir ${cfg.package}/rest-api/db/migrations up

          PGRST_SERVER_PORT=${toString cfg.port} PGRST_DB_SCHEMAS="api" PGRST_DB_ANON_ROLE="anon" PGRST_OPENAPI_MODE="ignore-privileges" PGRST_DB_URI="postgres://authenticator@localhost:5432/${cfg.databaseName}" PGRST_JWT_SECRET="$JWT_SECRET" ${pkgs.postgrest}/bin/postgrest
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
        ORIGIN=https://demo.archtika.com PORT=${toString cfg.webAppPort} ${pkgs.nodejs_22}/bin/node ${cfg.package}/web-app
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
        "demo.archtika.com" = {
          enableACME = true;
          forceSSL = true;
          locations = {
            "/" = {
              proxyPass = "http://localhost:${toString cfg.webAppPort}";
            };
            "/previews/" = {
              alias = "/var/www/archtika-websites/previews/";
              index = "index.html";
              tryFiles = "$uri $uri/ $uri/index.html =404";
              extraConfig = ''
                autoindex on;
              '';
            };
            "/api/" = {
              proxyPass = "http://localhost:${toString cfg.port}/";
              extraConfig = ''
                default_type  application/json;
                proxy_hide_header Content-Location;
                add_header Content-Location /api/$upstream_http_content_location;
                proxy_set_header Connection "";
                proxy_http_version 1.1;
              '';
            };
          };
        };
      };
    };

    security.acme = {
      acceptTerms = true;
      defaults.email = "thilo.hohlt@tutanota.com";
    };
  };
}
