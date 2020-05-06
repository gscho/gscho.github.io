---
title: "Using ShuttleOps to Deploy a Load-Balanced Go Microservice"
date: 2019-10-18T12:06:42-04:00
tags: ["shuttleops", "chef", "habitat", "go", "golang"]
categories: ["software"]
---

[ShuttleOps](https://www.shuttleops.io) is a new No Code CI/CD platform that allows you to easily deploy applications to three major cloud providers. This post will take you through an example of how to build and deploy a load-balanced golang microservice to AWS using ShuttleOps.

## Prerequisites

In order to follow along with this tutorial, you'll need to have the following things installed and setup.

1. Habitat - https://www.habitat.sh/docs/install-habitat
2. A Habitat origin created on `https://bldr.habitat.sh`
3. An AWS account
4. A github/gitlab/bitbucket account with `git` installed
5. Go - https://golang.org/doc/install
6. Docker for Mac (only if you're a MacOS user) - https://store.docker.com/editions/community/docker-ce-desktop-mac

## Getting Started

**If you'd like to skip building a go app, you can fork my repo instead:**
https://github.com/gscho/simple-go-app

First, we'll start by creating a new go application called `simple-go-app` in our `$GOPATH`. This app will be a `gin` web service that returns the hostname of the server. Since I'm going to store my source code on github, I'm going to use a subdirectory that matches my VCS.

```bash
mkdir -p $GOPATH/src/github.com/gscho/simple-go-app
cd $GOPATH/src/github.com/gscho/simple-go-app
go mod init
go get github.com/gin-gonic/gin
touch main.go
```

Next we will create our web service by updating the contents of `main.go`.

```go
package main

import (
  "net/http"
  "github.com/gin-gonic/gin"
  "os"
)

func main() {
  r := gin.Default()

  r.GET("/", func(c *gin.Context) {
    host, _ := os.Hostname()
    c.JSON(http.StatusOK, gin.H{"hostname": host})
  })

  r.Run()
}
```

Test that everything worked by running the application and checking the result using `curl`.

```bash
go run main.go
curl localhost:8080
> {"hostname":"gscho.local"}
```

## Building a Habitat Package

Now that we have a working go app, we will create a habitat package that will easily allow us to version, deploy and manage our app within ShuttleOps! Luckily Chef Habitat makes this easy with `scaffolding`.

From within the root of the source code directory, run the following.

```bash
mkdir -p habitat/hooks
touch habitat/plan.sh
```

The contents of your plan file should look like this. Change your `pkg_origin` to the one you have setup on `bldr.habitat.sh`.

```bash
pkg_name=simple-go-app
pkg_origin=gscho
pkg_version="0.1.0"
pkg_scaffolding=core/scaffolding-go
scaffolding_go_module=on
pkg_bin_dirs=(bin)
```

And that's the entire plan file! Now we just need to define a run hook so habitat knows how to run our application. Since we've added `pkg_bin_dirs=(bin)` to our plan file, the binary our go app produces will be available on the path of our package already. That means our run hook will look like this.

Our `hooks/run` looks like this.

```bash
#!/bin/sh

exec simple-go-app
```

## Adding our code to git

At this point, we have everything we need to deploy a go application, so lets add our code to our VCS (if you haven't already).

```
echo "# simple-go-app" >> README.md
git init
git add .
git commit -m "first commit"
git remote add origin <your-clone-url>
git push -u origin master
```

## Building our application using ShuttleOps

To build our application, head over to [ShuttleOps](https://app.shuttleops.io) and login with your VCS provider.

Once loggeed in we will add our [Habitat Builder](https://bldr.habitat.sh) token to the ShuttleOps vault via the `Connect` page so that ShuttleOps can upload and promote our packages. Make sure you have also created an origin on Habitat Builder so we can upload your package!


![ConnectHabitat](/images/connect_habitat.png)

Let's create a build pipeline to build and upload our code. From the `Build` page, we will create a new pipeline. The default `Build` pipeline has a `code` task already added for us so open it up and select the repo you want to build.

![RepoSelection](/images/repo_selection.png)

And that's it! Just click `launch` to build your go app.

## Deploying our application using ShuttleOps

To deploy our application to AWS, we'll head back to the `Connect` page and add some AWS credentials to the ShuttleOps vault. For your convience, there is a `launch stack` button that will create a shuttleops IAM user in your account with the minimum permissions required.

![ConnectAWS](/images/connect_aws.png)

Finally, let's create a `Deploy` pipeline to deploy our app to AWS. A deploy pipeline will have 2 tasks already added for you, a `payload` task where you can select the application to deploy and a `destination` task that will define the deployment destination, in our case AWS.

In the `payload` task, select the output of our `Build` pipeline.

![BuildPipelineOutput](/images/build_pipeline_output.png)

Next, we'll update the destination task to tell ShuttleOps how to deploy our application to AWS. We will deploy 3 instances on t3.nano instances.

![DeployPipelineInstance](/images/deploy_pipeline_instance.png)

Since we don't want anyone accessing our instance except through the load balancer, let's remove all the security rules from the `Security Rules` tab.

![DeployPipelineSecurityRules](/images/deploy_pipeline_security_rules.png)

Lastly, add the load balancer with a listener on port 80 that forwards traffic to our go microservice on port 8080.

![DeployPipelineLoadBalancer](/images/deploy_pipeline_load_balancer.png)

Save and click the `launch` button to deploy your app!

## Viewing our app running in AWS

After the application has finished deploying, head over to the `Manage` page to find the link to your load balancer.

![ManagePageLoadBalancer](/images/manage_load_balancer.png)

When you visit the load balancer endpoint, refresh the page a few times to see that the requests are being served by multiple servers.

