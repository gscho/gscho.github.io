---
layout: default
title: Blog | Simple Jekyll
header: Blog
description: Where the magic happens - this is the blog!
permalink: /blog/
---

{% for post in site.posts %}
<article>
  <span>{{ post.date | date_to_string }}</span>
  <a href="{{ post.url }}">{{ post.title }}</a>
<article>
{% endfor %}