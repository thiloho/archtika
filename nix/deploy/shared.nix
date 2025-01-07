{ pkgs, ... }:
{
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
          "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFlDyJt72c/mxyN9cujc081J3uzWCyKtr4k2faBtgldD thiloho@pc"
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
          "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIFlDyJt72c/mxyN9cujc081J3uzWCyKtr4k2faBtgldD thiloho@pc"
        ];
      };
    };
  };

  services.openssh = {
    enable = true;
    settings.PasswordAuthentication = false;
  };

  system.stateVersion = "24.11";
}
