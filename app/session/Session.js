angular.module('session', ['token', 'tenantTokens', 'tokensPolling', 'ui.router.util'])
  .service('Session', function($q, UserToken, TenantTokens) {
    return {
      withUserToken: withUserToken,
      withTenantToken: withTenantToken
    };

    function withUserToken() {
      return withToken(UserToken);
    }

    function withTenantToken(tenantId) {
      return withToken(TenantTokens, tenantId);
    }

    function withToken(tokenService, tenantId) {
      var token = tokenService.get(tenantId);

      if (token) {
        var minTillExpiration = moment(token.expiresAt).diff(moment(), 'minutes');
        var secSinceStored = moment().diff(moment(token.storedAt), 'seconds');

        if (secSinceStored < 7) {
          return $q.resolve(token);
        } else if (minTillExpiration <= 2) {
          return tokenService.renew(tenantId);
        } else {
          tokenService.setDirty(tenantId);
          return $q.resolve(token);
        }
      } else {
        return tokenService.renew(tenantId);
      }
    }
  });
