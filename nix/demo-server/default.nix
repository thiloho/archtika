{ pkgs, localArchtikaPackage, ... }:
{
  imports = [
    ./hardware-configuration.nix
    ../module.nix
  ];

  boot = {
    loader = {
      systemd-boot.enable = true;
      efi.canTouchEfiVariables = true;
    };
    kernelPackages = pkgs.linuxPackages_latest;
  };

  nix.settings.experimental-features = [
    "nix-command"
    "flakes"
  ];

  time.timeZone = "Europe/Amsterdam";

  nixpkgs.config.allowUnfree = true;

  networking = {
    hostName = "archtika-demo-server";
    networkmanager.enable = true;
    firewall = {
      allowedTCPPorts = [
        80
        443
      ];
    };
  };

  security.pam = {
    sshAgentAuth.enable = true;
    services.sudo.sshAgentAuth = true;
  };

  users = {
    mutableUsers = false;
    users = {
      root.hashedPassword = "$y$j9T$MuWDs5Ind6VPEM78u5VTy/$XAuRCaOPtS/8Vj8XgpxB/XX2ygftNLql2VrFWcC/sq7";
      thiloho = {
        isNormalUser = true;
        extraGroups = [
          "wheel"
          "networkmanager"
        ];
        hashedPassword = "$y$j9T$Y0ffzVb7wrZSdCKbiYHin0$oahgfFqH/Eep6j6f4iKPETEfGZSOkgu74UT2eyG2uI1";
        openssh.authorizedKeys.keys = [
          "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBj6+r+vMXJyy5wvQTLyfd2rIw62WCg9eIpwsciHg4ym thiloho@pc"
          "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFE42q8e7egSSTs4YJo8vQFDbRWqrGTQkR1weq8nT0Zx thiloho@pc"
          "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIgfOa8N46PBUO2gj8UeyrV0R+MRZFnJqUzG132UjaFS thiloho@laptop"
        ];
      };
    };
  };

  services.openssh = {
    enable = true;
    settings.PasswordAuthentication = false;
  };

  services.archtika = {
    enable = true;
    package = localArchtikaPackage;
    jwtSecret = "a42kVyAhTImYxZeebZkApoAZLmf0VtDA";
  };

  system.stateVersion = "24.11";
}
