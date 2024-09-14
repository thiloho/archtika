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
    hostName = "archtika-qs";
    networkmanager.enable = true;
    firewall = {
      allowedTCPPorts = [
        80
        443
      ];
    };
  };

  users = {
    mutableUsers = false;
    users = {
      root = {
        openssh.authorizedKeys.keys = [
          "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFE42q8e7egSSTs4YJo8vQFDbRWqrGTQkR1weq8nT0Zx thiloho@pc"
        ];
        hashedPassword = "$y$j9T$MuWDs5Ind6VPEM78u5VTy/$XAuRCaOPtS/8Vj8XgpxB/XX2ygftNLql2VrFWcC/sq7";
      };
      thiloho = {
        isNormalUser = true;
        extraGroups = [
          "wheel"
          "networkmanager"
        ];
        hashedPassword = "$y$j9T$Y0ffzVb7wrZSdCKbiYHin0$oahgfFqH/Eep6j6f4iKPETEfGZSOkgu74UT2eyG2uI1";
        openssh.authorizedKeys.keys = [
          "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBj6+r+vMXJyy5wvQTLyfd2rIw62WCg9eIpwsciHg4ym thiloho@pc"
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
    domain = "qs.archtika.com";
    acmeEmail = "thilo.hohlt@tutanota.com";
    dnsProvider = "porkbun";
    dnsEnvironmentFile = /var/lib/porkbun.env;
  };

  system.stateVersion = "24.11";
}
