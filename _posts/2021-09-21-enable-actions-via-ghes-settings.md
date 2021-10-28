---
layout: default
title: "Enabling Actions for GitHub Enterprise Server using the settings API"
header: "Enabling Actions for GitHub Enterprise Server using the settings API"
date: 2021-09-21
---

# Enabling Actions for GitHub Enterprise Server using the settings API

When automating a GitHub Enterprise Server deployment, the [set-settings](https://docs.github.com/en/enterprise-server@3.1/rest/reference/enterprise-admin#set-settings) API can be used to pass a `settings.json` object to configure the server. The `settings.json` object can be retreived from the [get-settings](https://docs.github.com/en/enterprise-server@3.1/rest/reference/enterprise-admin#get-settings) API of your enterprise server.

If however you want to enable actions, the administrator usually needs to do it from the administration console of the GitHub Enterprise server.

It turns out you can automate this too by passing some "hidden" settings. First you will need to make sure the `enterprise.feature_toggles.actions.enabled` setting is `true` and then add the `enterprise.actions_storage` settings.

S3 example with only the settings for enabling Actions shown:

```
{
  "enterprise": {
    "feature_toggles": {
      "actions": {
        "enabled": true
      }
    },
    "actions_storage": {
      "blob_provider": "s3",
      "s3": {
        "bucket_name": "<my-bucket-name>",
        "service_url": "https://s3.<my-aws-region>.amazonaws.com",
        "access_key_id": "<redacted>",
        "access_secret": "<redacted>"
      }
    }
  },
  "run_list": [
    "recipe[enterprise-configure]"
  ]
}
```

Azure example with only the settings for enabling Actions shown:

```
{
  "enterprise": {
    "feature_toggles": {
      "actions": {
        "enabled": true
      }
    },
    "actions_storage": {
      "blob_provider": "azure",
      "azure": {
        "connection_string": "<my-connection-string>"
      }
    }
  },
  "run_list": [
    "recipe[enterprise-configure]"
  ]
}
```

**Note:** If you access the [get-settings](https://docs.github.com/en/enterprise-server@3.1/rest/reference/enterprise-admin#get-settings) API after enabling actions, the storage secrets will not be returned.