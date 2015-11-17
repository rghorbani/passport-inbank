# passport-inbank

[Passport](http://passportjs.org/) strategy for authenticating with [InBank](http://www.in-bank.ir/)
using the OAuth 2.0 API.

This module lets you authenticate using InBank in your Node.js applications.
By plugging into Passport, InBank authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-inbank

## Usage

#### Configure Strategy

The InBank authentication strategy authenticates users using a InBank
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying an app ID, app secret, callback URL.

    passport.use(new InBankStrategy({
        clientID: INBANK_APP_ID,
        clientSecret: INBANK_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/inbank/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ inbankId: uuid.v4() }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'inbank'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/inbank',
      passport.authenticate('inbank'));

    app.get('/auth/inbank/callback',
      passport.authenticate('inbank', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/rghorbani/passport-inbank/tree/master/examples/login).

## Tests

    $ npm install
    $ npm test

## Credits

  - [Reza Ghorbani Farid](http://github.com/rghorbani)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015 Reza Ghorbani Farid <[http://rghorbani.ir](http://rghorbani.ir)>
