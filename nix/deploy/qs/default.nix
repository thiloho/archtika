{ pkgs, localArchtikaPackage, ... }:
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
    domain = "qs.archtika.com";
    acmeEmail = "thilo.hohlt@tutanota.com";
    dnsProvider = "porkbun";
    dnsEnvironmentFile = /var/lib/porkbun.env;
  };
}
