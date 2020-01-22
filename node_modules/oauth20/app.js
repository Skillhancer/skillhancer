let axios = require('axios');
let credentialsOAuth = Symbol('credentialsOAuth');
let urlsOAuth = Symbol('urlsOAuth');
let postOAuth = Symbol('postOAuth');
let querystring = require('querystring');

class OAuth2 {
	constructor(clientId, clientSecret, redirecturl, scopes, accessToken, urlBase, urlAuthorizate='authorize', urlToken='token', urlRevoke='revoke') {
		this[credentialsOAuth] = {
			clientId: clientId,
			clientSecret: clientSecret,
			redirecturl: redirecturl,
			scopes: scopes,
			accessToken: accessToken,
			refreshToken: '',
			expiresIn: ''
		};

		this[urlsOAuth] = {
			base: urlBase,
			authorizate: urlAuthorizate,
			token: urlToken,
			revoke: urlRevoke
		};

		this.axiosOAuth = axios.create({
		  baseURL: urlBase
		});

		this.axiosOAuth.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
	}

	authorizationUrl() {
		return `${this[urlsOAuth].base}${this[urlsOAuth].authorizate}?response_type=code&client_id=${this[credentialsOAuth].clientId}&redirect_uri=${this[credentialsOAuth].redirecturl}&scope=${this[credentialsOAuth].scopes}`;
	}

	getCredentials() {
		return {
			accessToken: this[credentialsOAuth].accessToken,
			refreshToken: this[credentialsOAuth].refreshToken,
			expiresIn: this[credentialsOAuth].expiresIn
		};
	}

	connect(code) {
		let url = `${this[urlsOAuth].token}`;
		let data = {
			grant_type: 'authorization_code',
			client_id: this[credentialsOAuth].clientId,
			client_secret: this[credentialsOAuth].clientSecret,
			redirect_uri: this[credentialsOAuth].redirecturl,
			code: code
		};

		return this[postOAuth](url, data).then((result) => {
			this[credentialsOAuth].accessToken = result.data.access_token;
			this[credentialsOAuth].refreshToken = result.data.refresh_token;
			this[credentialsOAuth].expiresIn = result.data.expires_in;

			return result;
		});
	}

	reconnect(refreshToken) {
		let url = `${this[urlsOAuth].token}`;
		let data = {
			grant_type: 'refresh_token',
			client_id: this[credentialsOAuth].clientId,
			client_secret: this[credentialsOAuth].clientSecret,
			refresh_token: refreshToken
		};

		return this[postOAuth](url, data).then((result) => {
			this[credentialsOAuth].accessToken = result.data.access_token;
			this[credentialsOAuth].refreshToken = result.data.refresh_token || refreshToken;
			this[credentialsOAuth].expiresIn = result.data.expires_in;

			return result;
		});
	}

	revoke() {
		let url = `${this[urlsOAuth].revoke}`;
		let data = {
			token: this[credentialsOAuth].accessToken
		};

		return this[postOAuth](url, data).then((result) => {
			this[credentialsOAuth].accessToken = '';
			this[credentialsOAuth].refreshToken = '';
			this[credentialsOAuth].expiresIn = 0;

			return result;
		});
	}

	[postOAuth](url, data) {
		return this.axiosOAuth.post(url, querystring.stringify(data))
		.catch((err) => {
			console.log(`status: ${err.response.status}, url: ${err.response.config.url}, data: ${err.response.config.data}, message: ${JSON.stringify(err.response.data)}`);
			return Promise.reject(err);
		});
	}
}

module.exports = OAuth2;