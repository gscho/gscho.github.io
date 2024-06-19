---
layout: base
title: "Configuring Harbor With Dex OIDC"
categories: devops docker
---

# Configuring Harbor With Dex OIDC

Harbor supports OIDC authentication with a few providers out of the box. In this example, we're configuring GitHub as the auth provider which means we need Dex.

Dex is an OAuth provider that you're app can integrate with but in this case we just want to deploy it as a server on kubernetes.

## Configuring Dex for GitHub Auth

Treat the dex configuration file as a secret because it has GitHub OAuth settings.

You must replace:

* <issuerUrl> - Example: https://dex.example.com
* <ghClientID> - The GitHub client ID you get when creating an OAuth application in GitHub
* <ghClientSecret> - The GitHub client secret you get when creating an OAuth application in GitHub
* <ghOrg> - The GitHub organization users need to belong to in order to log in
* <harborClientID> - Your made-up clientID for harbor
* <harborClientSecret> - Your made-up clientSecret for harbor
* <harborUrl> - Example: https://core.harbor.example.com

```yaml
issuer: "<issuerUrl>"
storage:
  type: memory
connectors:
- type: github
  id: github
  name: GitHub
  config:
    clientID: <ghClientID>
    clientSecret: <ghClientSecret>
    redirectURI: "<issuerUrl>/callback"
    orgs:
    - name: <ghOrg>
staticClients:
- id: harbor
  name: <harborClientID>
  secret: <harborClientSecret>
  redirectURIs:
    - "<harborUrl>/c/oidc/callback"
```

## Deploying Dex on K8s

This `yaml` example assumes that you created a kubernetes secret named `dex-config` with the key `config.yaml` containing the config file from above.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dex
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dex
  template:
    metadata:
      name: dex
      labels:
        app: dex
    spec:
      containers:
        - name: dex
          image: ghcr.io/dexidp/dex:v2.37.0
          imagePullPolicy: IfNotPresent
          args: 
            - dex
            - serve
            - --web-http-addr
            - 0.0.0.0:5556
            - --telemetry-addr
            - 0.0.0.0:5558
            - /etc/dex/config.yaml
          ports:
            - name: http
              containerPort: 5556
              protocol: TCP
            - name: telemetry
              containerPort: 5558
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /healthz/live
              port: telemetry
          readinessProbe:
            httpGet:
              path: /healthz/ready
              port: telemetry
          volumeMounts:
            - name: dex-config
              mountPath: /etc/dex
      volumes:
        - name: dex-config
          secret:
            secretName: dex-config
```

## Configuring Harbor to use Dex OIDC

Finally, we need to tell harbor to use OIDC auth and point it to our Dex server endpoint.

Log in as an admin user and then click on "Configuration".

Set the following:

* OIDC Provider Name: `github` 
* OIDC Endpoint: `<issuerUrl>` from above
* OIDC Client ID: `<harborClientID>` from above
* OIDC Client Secret: `<harborClientSecret>` from above
* OIDC Scope: `openid,profile,email`
