# archtika

## Virtual machine for local development

The website directory used by the virtual machine needs to be created and the NodeJS process, which typically runs as the default system user, needs permission to write to this directory.

This can be achieved using the following commands:

```bash
sudo mkdir -p /var/www/archtika-websites
```

```bash
sudo chown $USER:$(id -gn) /var/www/archtika-websites
```

For production, a separate `node` user can be created to run the systemd service for the node process; this user would have only the essential permissions to maintain the principle of least privilege.