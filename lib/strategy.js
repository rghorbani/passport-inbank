/**
 * Module dependencies.
 */
var util = require('util'),
	OAuth2Strategy = require('passport-oauth2'),
	InternalOAuthError = require('passport-oauth2').InternalOAuthError,
	InBankAuthorizationError = require('./errors/inbankauthorizationerror'),
	InBankTokenError = require('./errors/inbanktokenerror');


/**
 * `Strategy` constructor.
 *
 * The InBank authentication strategy authenticates requests by delegating to
 * InBank using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your InBank application's App ID
 *   - `clientSecret`  your InBank application's App Secret
 *   - `callbackURL`   URL to which InBank will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new InBankStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/inbank/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
	options = options || {};
	options.authorizationURL = options.authorizationURL || 'http://obg.in-bank.ir/apibank/oauth/authorize';
	options.tokenURL = options.tokenURL || 'http://obg.in-bank.ir/apibank/oauth/token';
	options.scopeSeparator = options.scopeSeparator || ',';
	var authString = new Buffer(options.clientID+':'+options.clientSecret);
	options.customHeaders = {
		"Authorization": "Basic " + authString.toString('base64')
	};
	function customVerify (accessToken, refreshToken, params, profile, done) {
		profile.expires_in = params.expires_in;
		profile.scope = params.scope.toString();
		profile.scopes = params.scope.toString().split(" ");
		verify(accessToken, refreshToken, profile, done);
	};

	OAuth2Strategy.call(this, options, customVerify);
	this.name = 'inbank';
	this._clientSecret = options.clientSecret;
	this._enableProof = options.enableProof;
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Authenticate request by delegating to InBank using OAuth 2.0.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
	// InBank doesn't conform to the OAuth 2.0 specification, with respect to
	// redirecting with error codes.
	//
	//   FIX: https://github.com/jaredhanson/passport-oauth/issues/16
	if (req.query && req.query.error_code && !req.query.error) {
		return this.error(new InBankAuthorizationError(req.query.error_message, parseInt(req.query.error_code, 10)));
	}

	OAuth2Strategy.prototype.authenticate.call(this, req, options);
};

/**
 * Parse error response from InBank OAuth 2.0 token endpoint.
 *
 * @param {String} body
 * @param {Number} status
 * @return {Error}
 * @api protected
 */
Strategy.prototype.parseErrorResponse = function(body, status) {
	var json = JSON.parse(body);
	if (json.error && typeof json.error == 'object') {
		return new InBankTokenError(json.error.message, json.error.type, json.error.code, json.error.error_subcode);
	}

	return OAuth2Strategy.prototype.parseErrorResponse.call(this, body, status);
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
