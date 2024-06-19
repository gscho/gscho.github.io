---
layout: base
title: "Creating Cloud Resources Using Fog"
categories: devops ruby
---

# Creating Cloud Resources Using Fog

![fog-logo]({{ site.baseurl }}/assets/images/fog-logo.png)

## What is fog?

Fog is a ruby cloud service library that provides a common abstraction over cloud provider SDKs. It supports a large number of cloud providers like AWS, Azure, GCP, DigialOcean, etc. albeit with varying degrees of maturity. You can find the [whole list here](https://fog.io/about/provider_documentation.html). The documentation is lack-luster but most fog cloud provider libraries have extensive test suites that serve as a how-to for that particular provider.

## Why fog?

So you might be asking yourself, "Doesn't terraform do this for me?".

Terraform at its heart a large diffing algorithm that maintains a snapshot of your infrastructure's state and tries to make changes based on the current vs. desired state. It uses a configuration language developed by HashiCorp called `hcl` to create, update and manage that state.

Fog on the other hand is a ruby library that can be used like any other rubygem. It's just ruby so you get all of the goodness of a dynamic, object-oriented programming language when creating cloud resources. Where fog really shines is as a cross-platform SDK that gives a consitent interface to doing common tasks like creating servers, volumes, etc. Another great feature is `Fog.mock` that lets you unit test your logic without creating any cloud resources and incurring costs.

## Use Cases

I recently choose fog for a project where I needed to create a rails app that would allow users to CRUD compute resources and security groups for AWS, Azure and GCP.

Fog is a good choice if:

- your team is already using ruby and you're tasked with creating and managing your own compute and storage infrastructure.

- you want loops, branching logic (if-else), OOP design patterns, mock testing using rspec or minitest

- you need to use more than one cloud-provider sdk and want a common interface across compute and storage resources.


## Example

In the example script below I'm using fog to create one ec2 instance. Once the instance is created, the instance's ID is saved to a yaml file to make things idempotent.

```ruby
# frozen_string_literal: true

require 'fog/aws'
require 'yaml/store'

STORE = YAML::Store.new 'fog-aws.yml'
instance_id = STORE.transaction { STORE['instance_id'] }
ec2 = Fog::Compute.new(provider: 'AWS', region: 'us-east-1')

if instance_id.nil?
  key_name = 'fog-test'
  ec2.key_pairs.create(name: key_name) if ec2.key_pairs.get(key_name).nil?
  
  instance = ec2.servers.create(
    tags: { Name: 'fog-ec2' },
    key_name: key_name,
    flavor_id: 't3.small',
    image_id: 'ami-087c17d1fe0178315'
  )
  puts 'Instance is creating'
  STORE.transaction { STORE['instance_id'] = instance.id }
  instance.wait_for { ready? }
  puts 'Instance is ready!'
else
  puts 'Instance already exists'
  instance = ec2.servers.get(instance_id)
end

puts <<-EOF
public_dns_name = http://#{instance.dns_name}
public_ip_address = http://#{instance.public_ip_address}
private_dns_name = http://#{instance.private_dns_name}
private_ip_address = http://#{instance.private_ip_address}
EOF

```
