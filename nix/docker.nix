{
  pkgs,
  ...
}:

# Behaviour of the Nix module needs to be replicated, which includes PostgreSQL, NGINX, ACME (DNS01), env variables, etc.
# Basic initialisation template can be found below
let
  archtika = pkgs.callPackage ./package.nix { };

  postgresConf = pkgs.writeText "postgres.conf" ''

  '';

  nginxConf = pkgs.writeText "nginx.conf" ''

  '';

  entrypoint = pkgs.writeShellScriptBin "entrypoint" ''

  '';
in
pkgs.dockerTools.buildLayeredImage {
  name = "archtika";
  tag = "latest";
  contents = [
    archtika
    entrypoint
    pkgs.postgresql_16
    pkgs.nginx
    pkgs.acme-sh
    pkgs.bash
    pkgs.coreutils
  ];
  config = {
    Cmd = [ "${entrypoint}/bin/entrypoint" ];
    ExposedPorts = {
      "80" = { };
      "443" = { };
    };
    Volumes = {
      "/var/lib/postgresql/data" = { };
    };
  };
}
