{ pkgs, localArchtikaPackage, ... }:
let
  domain = "qs.archtika.com";
in
{
  imports = [
    ./hardware-configuration.nix
    ../shared.nix
    ../../module.nix
  ];

  networking.hostName = "archtika-qs";

  services.archtika = {
    enable = true;
    package = localArchtikaPackage;
    inherit domain;
    settings = {
      disableRegistration = true;
      maxWebsiteStorageSize = 50;
      maxUserWebsites = 2;
    };
  };

  security.acme = {
    acceptTerms = true;
    defaults.email = "thilo.hohlt@tutanota.com";
    certs."${domain}" = {
      inherit domain;
      extraDomainNames = [ "*.${domain}" ];
      dnsProvider = "porkbun";
      environmentFile = /var/lib/porkbun.env;
      group = "nginx";
    };
  };
}
