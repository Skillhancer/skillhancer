# Changelog
All notable changes to this project will be documented in this file.

## [3.0.0] - 2019-08-XX
#### Security
- **BREAKING** update Axios and dependecies

## [2.0.0] - 2017-10-18
#### Added
- revoke access token
- default values for urlAuthorizate, urlToken and urlRevoke
- accessToken in params of constructor

## [1.0.7] - 2017-10-11
#### Added
- create new instance of axios
- Reconnect with refreshToken
- time of expire of accessToken in getCredentials
#### Changed
- Content-type to application/x-www-form-urlencoded
- Specific Symbol names to avoid inheritance conflicts
- Tests
- Documentation
#### Removed
- accessToken and refreshToken from params

## [1.0.6] - 2017-09-29
### Added
- Change connect implementation
- Add accessToken and refreshToken on params
- Promises
- Add documentation promises to Readme.md
- Add msg of error in console when status code not is 200