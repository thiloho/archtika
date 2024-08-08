# archtika

## About
  
archtika is a FLOSS, modern, performant and lightweight CMS (Content Mangement System) in the form of a web application. It allows you to easily create, manage and publish minimal, responsive and SEO friendly blogging and documentation websites with official, professionally designed templates.

It is also possible to add contributors to your sites, which is very useful for larger projects where, for example, several people are constantly working on the documentation.

## How it works

For the backend, PostgreSQL is used in combination with PostgREST to create a RESTful API. JSON web tokens along with row-level security control authentication and authorisation flows.

The web application uses SvelteKit with SSR (Server Side Rendering) and Svelte version 5, currently in beta.

NGINX is used to deploy the websites, serving the static site files from the `/var/www/archtika-websites` directory. The static files can be found in this directory via the path `<user_id>/<website_id>`, which is dynamically created by the web application.


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

For production, a separate `node` user can be created to run the systemd service for the node process; this user would have only the essential permissions to maintain the principle of least privilege.
