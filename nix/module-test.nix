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
        host.port = 13000;
        guest.port = 3000;
      }
      {
        from = "host";
        host.port = 14000;
        guest.port = 4000;
      }
    ];
  };

  services.archtika = {
    enable = true;
    package = localArchtikaPackage;
    jwtSecret = "test-secret";
  };

  system.stateVersion = "24.05";
}
