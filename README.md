# archtika

## About
  
archtika is a FLOSS, modern, performant, lightweight and self-hosted CMS (Content Mangement System) in the form of a web application. It allows you to easily create, manage and publish minimal, responsive and SEO friendly blogging and documentation websites using the templates provided. Contributors can also be added to a website, allowing multiple people to work on a project.

## How it works

For the backend, PostgreSQL is used in combination with PostgREST to create a RESTful API. JSON web tokens along with row-level security control authentication and authorisation flows.

The web application uses SvelteKit with SSR (Server Side Rendering) and Svelte version 5.

NGINX is used to deploy the websites, serving the static website files from the `/var/www/archtika-websites` directory. The website files are generated and written to this directory by the web application on the server side for preview and publishing.


## Virtual machine for local development

The website directory used by the virtual machine needs to be created and the NodeJS process, which typically runs as the default system user, needs permission to write to this directory.

This can be achieved using the following commands:

```bash
sudo mkdir -p /var/www/archtika-websites
```

```bash
sudo chown $USER:$(id -gn) /var/www/archtika-websites
```

```bash
nix run .#dev-vm
```
