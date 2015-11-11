angular.module('session', ['user', 'token', 'tenantTokens', 'tokensPolling', 'ui.router.util'])
  .service('sessionService', function($q, userService, subjectTokenService, tenantTokensService) {
    return {
      withSubjectToken: withSubjectToken,
      withTenantToken: withTenantToken
    };

    function withSubjectToken() {
      var token = subjectTokenService.get();
      if (token) {
        var minTillExpiration = moment(token.expiresAt).diff(moment(), 'minutes');
        var secSinceStored = moment().diff(moment(token.storedAt), 'seconds');

        if (secSinceStored < 7) {
          return $q.resolve(token);
        } else if (minTillExpiration <= 2) {
          return subjectTokenService.renew();
        } else {
          subjectTokenService.setDirty();
          return $q.resolve(token);
        }
      } else {
        return $q.reject(new Error('Token never existed or expired'));
      }
    }

    function withTenantToken(tenantId) {
      var token = tenantTokensService.get(tenantId);

      if (token) {
        var minTillExpiration = moment(token.expiresAt).diff(moment(), 'minutes');
        var secSinceStored = moment().diff(moment(token.storedAt), 'seconds');

        if (secSinceStored < 7) {
          return $q.resolve(token);
        } else if (minTillExpiration <= 2) {
          return tenantTokensService.renew(tenantId);
        } else {
          tenantTokensService.setDirty(tenantId);
          return $q.resolve(token);
        }
      } else {
        return tenantTokensService.renew(tenantId);
      }
    }
  });
