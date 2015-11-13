/**
 * `InBankAuthorizationError` error.
 *
 * InBankAuthorizationError represents an error in response to an
 * authorization request on InBank.  Note that these responses don't conform
 * to the OAuth 2.0 specification.
 *
 * References:
 *   - http://obg.in-bank.ir/apibank/public/reference_manual
 *
 * @constructor
 * @param {String} [message]
 * @param {Number} [code]
 * @api public
 */
function InBankAuthorizationError(message, code) {
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.name = 'InBankAuthorizationError';
	this.message = message;
	this.code = code;
	this.status = 500;
}

/**
 * Inherit from `Error`.
 */
InBankAuthorizationError.prototype.__proto__ = Error.prototype;


/**
 * Expose `InBankAuthorizationError`.
 */
module.exports = InBankAuthorizationError;
