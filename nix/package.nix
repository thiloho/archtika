{
  lib,
  stdenv,
  buildNpmPackage,
  importNpmLock,
  symlinkJoin,
}:

let
  web = buildNpmPackage {
    name = "web-app";
    src = ../web-app;
    npmDepsHash = "sha256-ab7MJ5vl6XNaAHTyzRxj/Zpk1nEKQLzGmPGJdDrdemg=";
    npmFlags = [ "--legacy-peer-deps" ];
    installPhase = ''
      mkdir -p $out/web-app
      cp package.json $out/web-app
      cp -r node_modules $out/web-app
      cp -r build/* $out/web-app
      cp -r template-styles $out/web-app
    '';
  };

  api = stdenv.mkDerivation {
    name = "api";
    src = ../rest-api;
    installPhase = ''
      mkdir -p $out/rest-api/db/migrations
      cp -r db/migrations/* $out/rest-api/db/migrations
    '';
  };
in
symlinkJoin {
  name = "archtika";
  pname = "archtika";

  paths = [
    web
    api
  ];
}
