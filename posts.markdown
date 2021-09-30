---
layout: default
title: posts | Greg Schofield
header: posts
description: Where the magic happens - this is the blog!
permalink: /
---

{% for post in site.posts %}
<article>
  <span class="postdate">{{ post.date | date_to_string }}</span>
  <a href="{{ post.url }}" class="postlink"><button type=submit>{{ post.title }}</button></a>
<article>
{% endfor %}