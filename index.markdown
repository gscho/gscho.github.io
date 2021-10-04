---
title: Greg Schofield
permalink: /
---

{% for post in site.posts %}
<article>
  <h3 class="postdate">{{ post.date | date_to_string }}</h3>
  <a href="{{ post.url }}" class="postlink"><strong>{{ post.title }}</strong></a>
<article>
{% endfor %}
