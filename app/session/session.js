angular.module('session', ['user', 'token', 'tenantTokens', 'tokensPolling', 'ui.router.util'])
  .service('sessionService', function($q, userService, tokenService, tenantTokensService) {
    return {
      withSubjectToken: withSubjectToken,
      withTenantToken: withTenantToken
    };

    function withSubjectToken() {
      var token = tokenService.get();
      if (token) {
        var minTillExpiration = moment(token.expiresAt).diff(moment(), 'minutes');
        var secSinceStored = moment().diff(moment(token.storedAt), 'seconds');

        if (minTillExpiration <= 0) {
          return $q.reject('sessionService:withSubjectToken - Warning! Token expired and still held as cookie');
        } else if (secSinceStored < 7) {
          return $q.resolve(token);
        } else if (minTillExpiration > 2) {
          tokenService.setDirty();
          return $q.resolve(token);
        } else {
          return tokenService.renew();
        }

      } else {
        return $q.reject(new Error('Token never existed or expired'));
      }
    }

    function withTenantToken(tenantId) {
      return withSubjectToken()
        .then(function(subjectToken) {
          var token = tenantTokensService.get(tenantId);

          if (token) {
            var minTillExpiration = moment(token.expiresAt).diff(moment(), 'minutes');
            var secSinceStored = moment().diff(moment(token.storedAt), 'seconds');

            if (minTillExpiration > 0 && secSinceStored < 7) {
              return $q.resolve(token);
            } else if (minTillExpiration > 2) {
              tenantTokensService.setDirty(tenantId);
              return $q.resolve(token);
            } else {
              return tenantTokensService.renew(subjectToken.id, tenantId);
            }

          } else {
            return tenantTokensService.renew(subjectToken.id, tenantId);
          }
        });
    }
  });
