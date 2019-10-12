---
title: "What Is Chef Habitat?"
date: 2019-10-12T09:33:26-04:00
draft: true
tags: ["chef", "habitat"]
categories: ["software"]
---

What is Chef Habitat? This is a question I get a lot from clients, meetups and conferences (even ChefConf). If you visit [the habitat website](https://www.habitat.sh/) you'll probably see some marketing mumbo jumbo like "Application Automation Framework" or "Automation that travels with your app". The real answer is habitat consists of a few different components so it's hard to categorize in a single sentence.

## Habitat is a cross-platform package manager

The first component of habitat is a cross-platform package manager that supports linux and windows (not darwin). This part of habitat is most closely related to the [nix package manager](https://nixos.org/nix/) or [chocolatey](https://chocolatey.org/) and allows you to create a package using bash or powershell. All packages are built and uploaded to an artifact repository called Builder where you can tag versions with a channel like unstable, stable or dev/qa/prod.

![Builder](/images/bldr.png)

This alone is a pretty cool feature since it's the only package manager that works accross both windows and linux that I have come across. It also allows you to create packages, manage them and install them _the same way_ in all of your VMs and containers.

For example, installing and adding jq to your `$PATH` on linux, windows or inside a docker container is all the same command.

```
hab pkg install core/jq-static --binlink
```

## Habitat is a service manager

The next component of habitat is the habitat supervisor. This component is a service manager, not unlike systemd, runit, init.d, etc. that can manage habitat services. Habitat services are also packages but they include an application that you'd like to run as a service. This could be a web server like nginx, a ruby on rails application, or just about anything else you could imagine.

The habitat supervisor is responsible for running these services and making sure they stay up. It also exposes an API on `0.0.0.0:9631` that lets you query for services and their health.

```
curl localhost:9631/services/redis/prod/health

Response:
{"status":"OK","stdout":"","stderr":""}
```


## Habitat is a service discovery and dynamic service configuration tool

The habitat supervisor has the ability to `peer` with other habitat supervisors to create a [GOSSIP](https://en.wikipedia.org/wiki/Gossip_protocol) ring. Through peering supervisors, you're able to create service groups which can share configuration with each other. For example if you have peered N supervisors each running a redis service, you can apply a configuration to all of the redis servers in your ring at once with a single command.

```
hab config apply redis.prod $(date +%s) redis.toml
```

Habitat rings also open up the ability to `bind` with other service groups so you can do service discovery. For example, if you had defined a rails application that required redis, you can use the habitat bind information to discover its IP and port and automatically configure the rails app with that information.

```
hab svc load gscho/my-rails-pkg --bind redis.prod
```

## Summary

The nice thing about chef habitat is that you can pick and choose which components you'd like to use. For example you could just use it as a package manager or you could use it as a services manager but use another tool like consul for service discovery.
