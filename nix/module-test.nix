{
  pkgs,
  lib,
  modulesPath,
  localArchtikaPackage,
  ...
}:
{
  imports = [
    "${modulesPath}/virtualisation/qemu-vm.nix"
    ./module.nix
  ];

  networking = {
    hostName = "archtika-module-test";
    firewall.enable = false;
  };

  nix.settings.experimental-features = [ "nix-command flakes" ];

  users.users.dev = {
    isNormalUser = true;
    extraGroups = [ "wheel" ];
    password = "dev";
  };

  virtualisation = {
    graphics = false;
    # Alternatively a bridge network for QEMU could be setup, but requires much more effort
    forwardPorts = [
      {
        from = "host";
        host.port = 5000;
        guest.port = 5000;
      }
      {
        from = "host";
        host.port = 10000;
        guest.port = 10000;
      }
      {
        from = "host";
        host.port = 15000;
        guest.port = 15000;
      }
    ];
  };

  services.archtika = {
    enable = true;
    package = localArchtikaPackage;
    jwtSecret = "a42kVyAhTImYxZeebZkApoAZLmf0VtDA";
  };

  system.stateVersion = "24.05";
}
