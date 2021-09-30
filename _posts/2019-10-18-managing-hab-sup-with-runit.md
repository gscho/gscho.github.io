---
layout: default
title: "managing hab-sup with runit"
header: "managing hab-sup with runit"
date: 2019-10-18T12:06:42-04:00
---

The habitat supervisor is a component of [Chef Habitat](../2019-10-12-what-is-habitat) that will manage the lifecycle of habitat services but what manages the habitat supervisor?

There are a few good tutorials out there on how to do this via systemd but let's look at doing it using [runit](http://smarden.org/runit/).

## What is runit?

Runit is a Unix init scheme that will start services on boot and keep them running. It will also constantly monitor the state of the service and restart (with a 1s cooldown) it if it fails. It's included in many popular linux distros and is considered a light-weight alternative to systemd. If you've had any experience with chef-server or other chef enterprise software in the past, you might recognize it.

## Getting started

For this tutorial we're going to be using [vagrant](https://www.vagrantup.com/downloads.html) so make sure that's installed first.

Create a directory to work out of and a `Vagrantfile`.

    $ mkdir ~/hab-runit
    $ cd ~/hab-runit
    $ touch Vagrantfile

The contents of your `Vagrantfile` should be the following.

```ruby
Vagrant.configure("2") do |config|
  config.vm.box = "gscho/centos-7-4-habitat"
  config.vm.box_version = "0.88.0"
end
```

This vagrant box is based on centos 7.4 and has habitat 0.88.0 pre-installed. After the file has been updated you can bring up a vagrant guest and login.

    $ vagrant ssh
    $ vagrant up

And switch to root.

    $ sudo su

The last step is installing runit since centos 7.4 does not come with it by default. **You can skip this step on distros that come with runit pre-installed or included in their package repo**.

    $ curl -s https://packagecloud.io/install/repositories/imeyer/runit/script.rpm.sh | sudo bash
    $ yum install -y runit


## Creating the hab-sup runit template

To set up a runit template for the hab-sup service we create the required directory structure inside of `/etc/`. To do this we first create the `/etc/sv/hab-sup` directory and the `run` files that will instruct runit how to run the service and collect its logs.

    $ mkdir /etc/sv
    $ mkdir /etc/sv/hab-sup
    $ mkdir /etc/sv/hab-sup/log
    $ mkdir /etc/sv/hab-sup/env
    $ touch /etc/sv/hab-sup/run
    $ touch /etc/sv/hab-sup/log/run
    $ chmod +x /etc/sv/hab-sup/run
    $ chmod +x /etc/sv/hab-sup/log/run

We also need to create a directory that we can log our services output to. Let's use `/var/log/hab-sup`.

    $ mkdir -p /var/log/hab-sup

### The run file in `/etc/sv/hab-sup/log`

The run file inside of the service's log directory will tell runit how and where to log the output of your service. For this runit comes with a configurable loggin tool called `svlogd` which handles logging output and rotating the log file once it gets too large or reaches a certain age. It is expected that the monitored service logs to stdout.

Our `/etc/sv/hab-sup/log/run` file will simply be this:

```bash
#!/bin/sh
exec svlogd -tt /var/log/hab-sup
```

We execute the `svlogd` command and pass it the directory we want it to log to. The `-tt` flag means it will append each log entry with a human readable timestamp.

### The env directory in `/etc/sv/hab-sup`

The `env` directory is an optional service directory which will contain all of the environment variables you wish to set for your service. It can be anywhere on the filesystem but having it inside the `/etc/sv/hab-sup` directory might make the most sense.

Runit expects that the name of each file in the env directory to be the name (key) of the environment variable and the contents of the files to be the value.

Let's set the `HAB_BLDR_URL` environment variable for our service.

    $ echo "https://bldr.habitat.sh" >> /etc/sv/hab-sup/env/HAB_BLDR_URL

### The run file in `/etc/sv/hab-sup`

Next we need to tell runit how to run the habitat supervisor process. There is another tool called `chpst` (change process state) that can be used for modifying thing like which user the service should run as or setting environment variables.

Our `/etc/sv/hab-sup/run` file should look like the following:

```bash
#!/bin/sh
exec chpst -e /etc/sv/hab-sup/env /bin/hab sup run 2>&1
```

Here we execute `chpst` and pass the `-e` flag to tell it the path to our environment directory. We also redirect stderr to stdout since syslogd collects stdout only.

## Running the service

The final step now that our service template has been created is to add a symbolic link for `/etc/sv/hab-sup` to `/etc/service`. Most distros use this directory as the service directory but you can double check using `ps -ef | grep runsvdir` to see what runit is watching. This step makes runit aware that the hab-sup service should be started and kept alive.

    $ ln -s /etc/sv/hab-sup /etc/service/hab-sup

Within 5 seconds runit will recognize the change and start the service!

### Controlling the hab-sup process

Once the service is up and running, you can use the `sv` command to control the state of the process.

Here are some basic commands to get your started:

- `sv u hab-sup` - starts the service
- `sv d hab-sup` - stops the service
- `sv t hab-sup` - kills the service (which causes it to start up again, in essence a restart)

### Logging

Logs will be output to the file `/var/log/hab-sup/current`. This file will be automatically rotated when it reaches the default size (1000000 bytes).

## Credits

Thanks to [Mike Perham](https://www.mikeperham.com/2014/07/07/use-runit/) and the [Rubyists](https://rubyists.github.io/2011/05/02/runit-for-ruby-and-everything-else.html).

