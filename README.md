# CS52 Lab 5
## Sheppard Somers
July 2018

# The methods that the herokuapp works with now work on this one

Sorts posts by date created with newest first, uses timestamp in object ID so updates do not change order.

# V2
## Supports:
  * sign in
  * sign up
  * only author can delete and edit
  * only registered user can create
  * redirects to sign in for create and edit if you are not signed in
    * redirects when the protected action involves a new link via the wrapper function for those components in the NavLinks
    * because of this it does not work for the delete since that is just a button not a link (TODO?) --> does hit an error on the attempted delete and will only delete if you are the author
  * likes on each post
    * no authorization necessary
    * can like multiple times


# starter express app template

* node with babel
* expressjs
* airbnb eslint rules

Procfile set up to run on [heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)
