{ pkgs, localArchtikaPackage, ... }:
let
  domain = "demo.archtika.com";
  docsSubdomain = "docs.archtika.com";
  portfolioDomain = "thilohohlt.com";
in
{
  imports = [
    ./hardware-configuration.nix
    ../shared.nix
  ];

  networking.hostName = "archtika-demo";

  services.archtika = {
    enable = true;
    package = localArchtikaPackage;
    inherit domain;
    settings = {
      disableRegistration = true;
    };
  };

  security.acme = {
    acceptTerms = true;
    defaults.email = "thilo.hohlt@tutanota.com";
    certs."${domain}" = {
      inherit domain;
      extraDomainNames = [
        "*.${domain}"
        docsSubdomain
      ];
      dnsProvider = "porkbun";
      environmentFile = /var/lib/porkbun.env;
      group = "nginx";
    };
  };

  services.nginx.virtualHosts."${docsSubdomain}" = {
    useACMEHost = domain;
    forceSSL = true;
    locations = {
      "/" = {
        root = "/var/www/archtika-websites/archtika/archtika-documentation";
        index = "index.html";
        tryFiles = "$uri $uri/ $uri.html =404";
      };
    };
  };

  services.nginx.virtualHosts."${portfolioDomain}" = {
    enableACME = true;
    forceSSL = true;
    locations = {
      "/" = {
        root = "/var/www/archtika-websites/thiloho/thilo-hohlt";
        index = "index.html";
        tryFiles = "$uri $uri/ $uri.html =404";
      };
    };
  };

  services.postgresql.settings.default_text_search_config = "pg_catalog.english";
}
