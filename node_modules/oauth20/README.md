# OAuth 2.0

[![Build Status](https://travis-ci.org/tnovas/oauth2.0.svg?branch=master)](https://travis-ci.org/tnovas/oauth2.0)
[![Coverage Status](https://coveralls.io/repos/github/tnovas/oauth2.0/badge.svg)](https://coveralls.io/github/tnovas/oauth2.0)

#### This module is a implementation of OAuth 2.0 standard protocol for authorization - https://oauth.net/2/

You need nodejs version > 6x because this module was made with ES6.
```
node --version
```

## Installation:
Add the latest version of `oauth20` to your package.json:
```
npm install oauth20 --save
```

## Usage:
```js
let OAuth2 = require('oauth20');
```

Give the credentials of the OAuth to the constructor

| Params       | Description     | Optional | 
| --------     |:---------------| :-----:|
| **ClientId**     | *The Client Id* | **false** |
| **ClientSecret** | *The Client Secret* | **false** |
| **RedirectUrl**  | *The RedirectUrl with format 'http://yourdomain/youraction'* | **false** |
| **Scopes**       | *The scopes* | **false** |
| **AccessToken**   | *The access token if you have one* | **false** |
| **UrlBase**       | *The url base of Authentication* | **false** |
| **UrlAuthorizate** | *The path of url Authorization. Default is authorize* | **true** |
| **UrlToken**       | *The path of url Token. Default is token* | **true** |

```js
let oauth2 = new OAuth2('clientId', 'clientSecret', 'http://yourdomain/youraction', 'scopes', 'accessToken', 'https://domain/oauth/', 'auth', 'token');
```

### Authorization
To authenticate with OAuth you will call `authorizationUrl` and will return an URL, you will make a request with a browser and authorizate in OAuth. After that you will be redirect to `RedirectUrl` and you will get a `code` on QueryString `?code='hjqweassxzass'`

```js
let urlAuthorization = oauth2.authorizationUrl();
```

### Get Access Token
For generate an access token and refresh token you have to call `connect` with the `code` you got on QueryString

| Params   | Description     | Optional | 
| -------- |:---------------| :-----:|
| **Code**  | *The code you got in the querystring* | **false** |

```js
oauth.connect(code);
```

### Refresh Access Token
If you need refresh the access token, you have to call `reconnect` and send the `refreshToken`

| Params   | Description     | Optional | 
| -------- |:---------------| :-----:|
| **RefreshToken**  | *The refresh token you got in credentials* | **false** |

```js
oauth.reconnect(refreshToken);
```

### Get Credentials
If you need the credentials, you have to call `getCredentials` and you will get an object with:

```js
{
  accessToken,
  refreshToken,
  expiresIn
}
```

#### Promises
If you add `then` to call you will take the success of response and if you add `catch` you will take the error of response.
```js
oauth.connect(code)
	.then((res) => console.log(res)))
	.catch((err) => console.log(err)))
```