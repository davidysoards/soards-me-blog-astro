---
title: Setup a VPS on Hetzner Cloud
subtitle: Lambda What, Lambda Who
description: How to setup a secure VPS on Hetzner with SSH, firewall, reverse-proxy, git, Docker, and more.
pubDate: 2024-04-09T05:10:00.000Z
heroImage: hetzner-vps.png
tags:
  - vps
  - docker
  - nginx
---

For deploying my personal projects and websites I have mostly relied on the hobby tiers of serverless services like Netlify, Github pages, or Cloudflare pages. Prior to that I used simple FTP on shared hosting.

The **DX of using serverless platforms is very appealing**. Just connect a Github account, push your code, and they do all the work for you. For simple statically generated websites, it can't be beat. But when I started using lambda functions for server-side actions, **I quickly hit some annoying edge cases** because the runtimes are not 100% Node compatible.

That experience motivated me to setup my own VPS for deploying containerized applications. It was also an opportunity **to learn how the abstractions and tools I use actually work**. I chose Hetzner because it was the cheapest and I like German stuff.

These are the steps I took to **get up and running with a VPS on Hetzner Cloud:**

## Hetzner Cloud

Start a Hetzner account at https://accounts.hetzner.com/signUp

Donate the blood of your first born child. I kid, but if you are from the U.S. you will need to verify your identity using your passport and then wait for a manual approval. My approval only took a couple hours.

Log into your new Hetzner account and choose Hetzner Cloud. In the Hetzner Cloud dashboard, **start a new project and add a server**. I used the following settings for a basic server to host my side projects.

### Location

Choose the nearest location. For me it was (Ashburn, VA) us-east.

### Image

Either choose Ubuntu OS or if you plan on using Docker, you can switch to Apps and select Docker CE. It will give you the latest Ubuntu OS with Docker Community Edition pre-installed. If you prefer, you can also install Docker yourself later.

### Type

Shared cVPU
x86 (Intel/AMD)
CPX11 - 2GB Ram / 40GB SSD

### Networking

Select both IPv4 and IPv6. IPv6 only is a tiny bit cheaper, but you will almost definitely still need IPv4 also.

### SSH Keys

Add an SSH Key. Github has a nice guide on [generating SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent). Lately I've been using [1Password's SSH agent](https://developer.1password.com/docs/ssh/agent/) and I like how I can easily use the same keys on different machines.

### Skip for now

Volumes, Firewalls, Backups, Placement groups, Labels, and Cloud Config can be configured later if you need them.

### Name

I used the default name.

Click **Create & Buy Now**.

## Configure your server

Now it's time to SSH into the server and set it up.

Copy your new server's IP Address and open a terminal.

```bash
ssh root@<server_ip_address>
```

The first time you will be prompted to add the server's fingerprint to your `known_hosts`.

### Updates

Run system updates to make sure we are using the latest, greatest, and most secure packages.

```bash
sudo apt-get update

sudo apt-get upgrade
```

### SSH

Create a new sudo user.

```bash
sudo adduser <new_user_name>

usermod -aG sudo <new_user_name>
```

Add the public SSH key to your new user on the server.
To do that, switch to your new user.

```bash
su <new_user_name>
```

Then make a new `.ssh` directory.

```bash
mkdir ~/.ssh
```

To that directory, add a new file `authorized_keys`. Open that file with `nano` and paste in your public key.

```bash
nano ~/.ssh/authorized_keys
```

End your session and log back in with your new user to make sure SSH is working properly.

```bash
ssh <new_user_name>@<server_ip_address>
```

Now that you can ssh in with your username, you should disable login via the root user.
Navigate to the `ssh` directory and edit the `sshd_config` file. You may want to disable login via password entirely as well.

```bash
cd /etc/ssh
nano sshd_config
```

```
# sshd_config

PermitRootLogin no
PasswordAuthentication no
```

A lot of people recommend changing the default SSH port, but I left mine on 22.

For convenience you can edit your local `.ssh/config` file like so:

```
Host <nickname>
  HostName <server_ip_address>
  User <new_user_name>
  PreferredAuthentications publickey
```

With the above config, instead of typing `ssh <new_user_name>@<server_ip_address>` every time, you can just type `ssh <nickname>`.

### UFW

Enable Uncomplicated Firewall and allow ports for SSH.

```bash
sudo ufw enable
sudo ufw allow OpenSSH
sudo ufw allow 22
```

### Fail2Ban

Install Fail2Ban to prevent brute force attacks.

```bash
sudo apt install fail2ban
```

To configure, copy the `jail.conf` to `jail.local` and edit the file with `nano`.

```bash
cd /etc/fail2ban

# copy conf
sudo cp jail.conf jail.local

# edit
sudo nano jail.local
```

Make sure the `sshd` jail is enabled. It should be on by default.

```
[sshd]
enabled = true
port    = ssh
```

### Nginx

Install Nginx and allow ports 80 and 443 on your firewall.

```bash
sudo apt-get install nginx
sudo ufw allow 'Nginx Full'
```

Setup reverse-proxy to **allow hosting multiple containers on a single server**. Each container will be accessed publicly through a subdomain.

There are several different methods for configuring reverse-proxy. Using `sites-enabled` / `site-available` has long been the convention for Debian/Ubuntu, but a lot of people recommend avoiding it. I find it overly complicated.

A simpler method is to add a `*.conf` file to the `conf.d` directory for each subdomain.

```bash
cd /etc/nginx
```

```nginx
# conf.d/subdomain.conf

server {
        listen 80;
        listen [::]:80;
        server_name subdomain.example.com;
        location / {
                proxy_pass http://localhost:3000;
                proxy_set_header Host $host;
                proxy_set_header X-Real-IP $remote_addr;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
}
```

To only use subdomains and remove the default Nginx page from your root domain, disable default in sites-enabled.

```bash
sudo unlink sites-enabled/default
```

And return a root 404 page instead.

```nginx
# conf.d/root.conf

server {
        listen 80 default_server;
        listen [::]:80 default_server;
        server_name _;
        location / {
                return 404;
        }
}
```

Restart Nginx.

```bash
sudo systemctl restart nginx
```

### Docker

If you didn't install Docker when you added your server, install it now by following instructions from the docs. https://docs.docker.com/engine/install/ubuntu/

### unattended-upgrade

Keep your system up to date automatically by installing `unattend-upgrade`.

By default it only auto updates security updates, but you can configure to update other packages as well. I left it on the default settings.

```bash
# install
sudo apt install unattended-upgrades
# configure
sudo dpkg-reconfigure unattended-upgrades
# check is running
sudo systemctl status unattended-upgrades
```

### git

Install git so you can clone your repos, build them on your server, and share with the world.

```bash
apt-get install git
```

Congrats, you're officially a system admin! 🤜🤛
