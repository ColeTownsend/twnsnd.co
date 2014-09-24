---
layout: post

title: Travis Deployment
date: 2014-08-11
category: journal
accent_color: ""
tags: []
extra_css:
image:
  feature: 
---

[Devin Halladay](http://devinhalladay.com) was kind enough to walk me through an awesome Travis CI deployment stack. It's wicked fast and easy to maintain after setup.

1. Make your repo public
2. Go to https://travis-ci.org/
3. Make sure you see your list of repos
4. Turn on travis with a switch to the right
5. Create or log in to Amazon AWS
6. Create a new bucket for your bundler cache
7. Generate a new security key in your console

## The Terminal Portion

Run `travis login --auto` in terminal.

Run `travis encrypt AWS_ACCESS_KEY_ID="key-here" AWS_SECRET_ACCESS_KEY="key-here" --add`. Replace `key-here` with your keys.
