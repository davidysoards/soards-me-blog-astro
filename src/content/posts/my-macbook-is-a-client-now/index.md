---
title: My MacBook is a client now
subtitle: Remote development on a Mac mini with Tailscale, SSH, and a separate dev account
description: Why I moved development to a dedicated Mac mini, and how Tailscale, SSH, Herdr, Zed, and Codex Desktop make the remote workflow practical.
pubDate: 2026-09-28T12:00:00.000Z
heroImage: mac-mini-remote-development.webp
tags:
  - macos
  - development
  - ai
  - workflow
---

I wanted to **stop running development code and scripts on the same machine that holds my personal information**. My MacBook has my iCloud data, personal files, and browser sessions. Giving coding agents access to that environment was making me increasingly uncomfortable.

Agents add to the concern, but ordinary development already involves running plenty of other people's code. Supply chain attacks involving JavaScript and Python packages worry me whether I'm installing a dependency myself or letting an agent do it. The recent <a href="https://www.sonatype.com/blog/open-source-malware-index-q4-2025-automation-overwhelms-ecosystems" target="_blank" rel="noopener">surge in malicious open-source packages</a>, particularly on npm, has made that concern harder to ignore.

So I moved development onto a dedicated Mac mini and kept the MacBook as the client. I also wanted one place for my repositories and tooling, instead of maintaining development environments across multiple Macs.

Containers and VMs are reasonable alternatives, and might be a better fit depending on the isolation you need. I find them a PITA to work in all the time. For me, a dedicated machine is simpler and more pleasant for everyday work, with enough reduction in exposure to make the change worthwhile.

## A separate development account

The Mini has a standard user account named `dev`, with its own home directory. I haven't connected it to iCloud, signed into my personal browser profile, or intentionally copied personal files into it. I keep the administrator account separate and use admin credentials explicitly when something needs elevated permissions.

Switching between the admin and development accounts during setup was slightly annoying at first. But I wanted routine development to happen as a standard user, so that inconvenience was part of the choice.

**The goal is to reduce what development code can reach.** Source code and the development credentials I provide are still exposed to activity I authorize. So are the services those credentials can access. A separate account doesn't provide the isolation of a VM, and a separate computer doesn't make arbitrary commands harmless. Agent sandboxing and permissions still matter on the Mini.

The basic arrangement is:

```text
MacBook                              Mac mini
  Zed                                  dev account
  Ghostty + Herdr      SSH over           repositories
  Codex Desktop  ──── Tailscale ────>     development tools
                                         agent sessions
                                         development credentials
```

The clients run on the MacBook. The development environment lives on the Mini.

## Tailscale for the network, OpenSSH for access

I use Tailscale to provide a private network path between the two machines. **Tailscale provides the network; standard OpenSSH provides the remote-access layer.**

I deliberately chose normal SSH rather than Tailscale SSH because I already understand and trust the macOS/OpenSSH model. I can use ordinary Unix users and SSH keys, with `authorized_keys` on the server and `~/.ssh/config` on the client. Tailscale documents this <a href="https://tailscale.com/docs/reference/ssh-over-tailscale" target="_blank" rel="noopener">standard SSH arrangement</a> separately from its own SSH authentication feature.

On the Mini, I enabled macOS Remote Login for the `dev` user and authorized an Ed25519 public key from the MacBook in that account's `~/.ssh/authorized_keys`. Remote Login lets you <a href="https://support.apple.com/guide/mac-help/allow-a-remote-computer-to-access-your-mac-mchlp1066/mac" target="_blank" rel="noopener">restrict access to selected users</a>.

Here's the relevant entry in the MacBook's `~/.ssh/config`. Replace the angle-bracket values with your own hostname and key filename:

```text
Host mac-mini
    HostName <mac-mini-tailscale-hostname>
    User dev
    IdentityFile ~/.ssh/<dev-key>
    IdentitiesOnly yes
```

`mac-mini` is an SSH alias. It doesn't have to be the Mini's actual network hostname. That gives me one name to use across tools, while the destination is configured in one place:

```sh
ssh mac-mini
herdr --remote mac-mini
```

Those are separate ways to connect from the MacBook. Zed and Codex Desktop can use the same SSH target after their remote connections are set up. If I switch away from Tailscale later, I'll need another network path, but I can keep the ordinary SSH setup.

The key that lets my MacBook log into the Mini is also separate from the credentials the Mini uses to access GitHub.

## Sharing only the credentials I need

I set up a 1Password guest account for use in the development account and share only the passwords it needs. The <a href="https://support.1password.com/guests/" target="_blank" rel="noopener">guest-sharing feature</a> lets me limit access to a selected vault instead of bringing my full personal password manager into the environment.

I also use Secure Notes to pass temporary text into the development account, including API keys, SSH keys, passwords, or whatever other text I need there. Temporary describes how I use those notes; they don't automatically expire or delete themselves.

Not having my full password manager available can be frustrating. It means an extra step when I need something I haven't shared yet. But copying all my personal secrets over would undo a large part of why I made this setup. I prefer **credentials scoped to the development work that needs them**. Once I make a secret available to an agent or command, storing it in a password manager doesn't prevent that authorized use.

I also cleaned up GitHub authentication. I had a package-access token exported globally as `GH_TOKEN`, which could override the credentials I intended the GitHub CLI to use. For github.com, <a href="https://cli.github.com/manual/gh_help_environment" target="_blank" rel="noopener">the CLI checks `GH_TOKEN`, then `GITHUB_TOKEN`, ahead of stored credentials</a>.

I removed the global `GH_TOKEN` export and used:

```sh
gh auth login
```

That leaves package access configured for the package tooling that needs it. A read-packages token shouldn't accidentally become the credential for every `gh` command.

By default, <a href="https://cli.github.com/manual/gh_auth_login" target="_blank" rel="noopener">`gh auth login`</a> uses a browser login and stores the token in the system credential store. It can fall back to a plaintext file if that store is unavailable, so using the command alone isn't a guarantee about storage. Environment tokens are still useful for automation; I just didn't need one overriding my normal CLI login everywhere.

## An authentication problem that was actually networking

During setup, `gh auth status` inside Codex made it look like my GitHub credential was invalid. In this case, **the workspace sandbox had outbound networking disabled**. Enabling networking resolved the issue.

This is the relevant configuration for Codex's `workspace-write` sandbox:

```toml
sandbox_mode = "workspace-write"

[sandbox_workspace_write]
network_access = true
```

The <a href="https://learn.chatgpt.com/docs/config-file/config-reference" target="_blank" rel="noopener">configuration reference</a> defines `network_access` as allowing outbound network access inside that sandbox. For Codex running under `dev` on the Mini, the default user configuration location is `~/.codex/config.toml` in that account. <a href="https://learn.chatgpt.com/docs/config-file/config-basic" target="_blank" rel="noopener">Project settings and command-line overrides</a> can take precedence, so check the configuration for the process actually running the command.

This deliberately gives sandboxed commands network access. I was comfortable allowing it for my work on the Mini, while keeping the filesystem restrictions. It isn't a general fix for authentication errors. In this instance, the credential was usable once the command could reach GitHub.

## Herdr and closing the laptop

I use <a href="https://github.com/motionharvest/herdr" target="_blank" rel="noopener">Herdr</a> to manage CLI agents in the terminal. My first attempt was to open a normal SSH session to the Mini and launch Herdr inside it:

```sh
ssh mac-mini
herdr
```

That worked until I closed the MacBook or let it sleep long enough for the connection to break. I'd come back to `Broken pipe`, sometimes with raw mouse-control escape sequences appearing in Ghostty and the terminal left in a mangled state.

The remote work could still be there. The annoying part was getting the client back into a usable state.

Now I run this directly on the MacBook:

```sh
herdr --remote mac-mini
```

In <a href="https://herdr.dev/docs/persistence-remote/" target="_blank" rel="noopener">Herdr's remote mode</a>, the local client draws the interface while the remote server owns the running panes and sessions. It needs working SSH access and a compatible Herdr installation on the host; the remote-access docs cover discovery and setup.

I can close the MacBook with several agents working, then run the same command later to reconnect to the existing work. **The agents can continue while the laptop is closed** because they're running on the Mini. The Mini needs to stay awake and its processes need to keep running, of course. This doesn't promise uninterrupted work through a reboot or server failure.

That has made the terminal workflow much more comfortable. I can disconnect the client without treating it as the end of the work session.

## Zed makes remote editing practical

Being able to open and edit files as easily as if they were on my local filesystem is a must-have for me. If connecting to the Mini were a chore every time I wanted to change a file, I wouldn't stick with this setup.

VS Code offered similar remote editing, but in my experience it was slower and flakier. I had to reconnect frequently, and reconnecting was slow enough to be annoying.

**Zed is super fast at connecting and reconnecting.** I usually only need to reconnect after the laptop goes to sleep. That ease and speed are a large part of what makes remote development usable for me every day.

<a href="https://zed.dev/docs/remote-development" target="_blank" rel="noopener">Zed's remote development</a> uses the local SSH client and inherits the matching settings from `~/.ssh/config`. In its Remote Projects dialog, I can use `ssh mac-mini` as the connection command, then choose the project directory on the Mini. Zed runs its interface locally, while the remote server handles things like language servers and terminal commands.

Another remote editor could fill this role. Zed is the one that has made it comfortable enough for me to keep all my development files on the Mini.

## One environment, a few familiar clients

The maintenance benefit is straightforward. My repositories, runtimes, and package managers are on one machine. So are the agent tools and their instructions, skills, and hooks. When I change that environment, the next client connection reaches the same setup. **I don't have to repeat the development-tool changes on the laptop.**

Codex Desktop has also become a bigger part of my workflow. It supports <a href="https://learn.chatgpt.com/docs/remote-connections#connect-to-an-ssh-host" target="_blank" rel="noopener">projects over SSH</a>, using the same `mac-mini` alias. I love having local and remote projects together in the sidebar, with the remote entries identified by the host name and a different folder icon. Working in those remote projects feels almost no different from working locally. I expected to stay mostly with CLI agents, but Desktop has been so easy to work with that I've found myself using it more. It's an optional client for this setup, and I still use the CLIs.

![Codex Desktop sidebar showing remote projects on mac-mini](./images/codex-sidebar-ssh.png)

I now do all my development on the Mini, using Zed for file editing, Codex Desktop, and Ghostty with Herdr for Codex and pi CLI agents. I've uninstalled the Codex CLI from my MacBook.
