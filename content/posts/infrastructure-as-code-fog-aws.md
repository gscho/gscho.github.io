---
title: "Creating AWS Resources using fog-aws"
date: 2019-07-09T18:46:26-04:00
draft: true
tags: ["ruby", "fog"]
categories: ["aws", "iiac"]
---

![fog-logo](/fog-logo.png)

## What is fog?

Fog is a ruby cloud service library that aspires to be a one stop shop for provisioning cloud resources. It supports a large number of cloud providers including the big guys (AWS, Azure, GCP) as well as others (like DigialOcean). You can find the [whole list here](http://fog.io/about/provider_documentation.html). The documentation is pretty lack-luster but most cloud provider libraries have entensive test suites that serve as a how-to for that particular provider.

## Why fog?

So you might be asking yourself, "Doesn't terraform do this for me?" and you'd be _mostly_ right.

Terraform at its heart a large diffing algorithm that maintains a snapshot of your infrastructure's state and tries to make changes based on the current vs. desired state. It uses a configuration language developed by HashiCorp called `HCL` to create, update and manage that state.

Fog on the other hand is a ruby library that can be used like any other rubygem. It's just ruby so you get all of the goodness of a dynamic, object-oriented programming language when creating cloud resources. Where fog really shines is as a cross-platform SDK that gives a consitent interface to doing common tasks like creating servers, volumes, etc.

Imagine a ruby-on-rails application where you are giving users the ability to create and manage an ec2 server. The user must be able to create, update and destroy their ec2 server. Using terraform for this would mean you need to manage statefiles for each user (probably in s3) and invoke terraform on their behalf. This can become a problem if the state becomes corrupt and terraform fails. With fog, you could implement a simple database table that manages the state of the ec2 server and even do additional things like stop a server. Sure you could do this with the ruby `aws-sdk` but when you want to support GCP you need to learn how to use a new SDK!

fog is great if you like:

- loops
- branching logic (if-else)
- inheritance
- OOP design patterns
- fine grained control over cloud provider SDKs
- testing using your favorite test-suite (rspec, minitest)

fog is poor if you like:

- creating your entire infrastructure at once
- managed state/statefiles
- using configuration languages

##
