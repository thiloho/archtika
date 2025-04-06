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
    npmDepsHash = "sha256-J58LwSEQa0p6J6h/wPhpGY/60n9a7TOV5WfNm4K1NH0=";
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
