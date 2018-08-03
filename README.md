# Server for Sharity MVP
## Sheppard Somers
July 2018
Started from lab5 of CS52 at Dartmouth College taught by Timothy Pierson so this is built from course notes and assignments as well as stack exchange and [youtube](https://www.youtube.com/watch?v=Td-2D-_7Y2E&index=20&list=PLoYCgNOIyGABj2GQSlDRjgvXtqfDxKm5b).

# TODO
 * Error statuses and messages
 * extend users model to include username & more
 * store and send offers and requests
 * add filters
 * add sort
 * add search
 * add favorites for each user (array of refs to posts)
 * number of views/upvotes/likes
 * add AWS S3 for image uploading
 * add chat functionality between users
 * add comments?

`*` involves server side as well


## Deploy
Add the server to herokuapp -- done!

## Supports:
  * sign in
  * sign up
  * only author can delete and edit
  * only registered user can create
  * redirects to sign in for create and edit if you are not signed in
    * redirects when the protected action involves a new link via the wrapper function for those components in the NavLinks
    * because of this it does not work for the delete since that is just a button not a link (TODO?) --> does hit an error on the attempted delete and will only delete if you are the author
      * fixed: now gets author for each post so checks the user's username against the author to hide the edit and delete buttons. Server still checks when requests for delete and edit come in since the API links are still accessible.
  * likes on each post
    * no authorization necessary
    * can like multiple times
  * Sorts by newest, trending, location, alphabetical. Filter by requests and offers (client filtering)
  * Search for posts, exact word matches only
    * add in fuzzy and phrase matching

# Sources
* Primarily the CS52 course from Dartmouth
* Sending email with Nodemailer
  * Nodemailer docs
  * https://medium.com/@manojsinghnegi/sending-an-email-using-nodemailer-gmail-7cfa0712a799
* Email verification from https://codemoto.io/coding/nodejs/email-verification-node-express-mongodb


# starter express app template

* node with babel
* expressjs
* airbnb eslint rules

Don't think this is being used anymore:
Procfile set up to run on [heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs#deploy-the-app)
