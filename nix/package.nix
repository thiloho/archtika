{
  lib,
  stdenv,
  buildNpmPackage,
  symlinkJoin,
}:

let
  pname = "archtika";
  version = "1.0.0";

  web = buildNpmPackage {
    inherit pname version;
    name = "archtika-web-app";
    src = ../web-app;
    npmDepsHash = "sha256-DmIII/x5ANlEpKtnZC/JlbVAvhbgnSiNn8hkj+qVCZY=";
    npmFlags = [ "--legacy-peer-deps" ];
    installPhase = ''
      mkdir -p $out/web-app
      cp package.json $out/web-app
      cp -r node_modules $out/web-app
      cp -r build/* $out/web-app
    '';
  };

  api = stdenv.mkDerivation {
    inherit pname version;
    name = "archtika-api";
    src = ../rest-api;
    installPhase = ''
      mkdir -p $out/rest-api/db/migrations
      cp -r db/migrations/* $out/rest-api/db/migrations
    '';
  };

  templates = stdenv.mkDerivation {
    inherit pname version;
    name = "archtika-templates";
    src = ../templates;
    installPhase = ''
      mkdir -p $out/templates
      cp -r * $out/templates
    '';
  };
in
symlinkJoin {
  name = pname;
  paths = [
    web
    api
    templates
  ];

  meta = with lib; {
    description = "A modern, performant and lightweight CMS";
    homepage = "https://archtika.com";
    license = licenses.mit;
    maintainers = with maintainers; [ thiloho ];
    platforms = platforms.unix;
  };
}
