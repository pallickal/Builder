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

        console.log(
          'sessionService:withSubjectToken - current date/time = ' +
          moment().toISOString()
        );
        console.log(
          'sessionService:withSubjectToken - expiresAt = ' +
          moment(token.expiresAt).toISOString()
        );
        console.log(
          'sessionService:withSubjectToken - expires_at minutes from current date/time = ' +
          minTillExpiration
        );
        console.log(
          'sessionService:withSubjectToken - storedAt = ' +
          moment(token.storedAt).toISOString()
        );
        console.log(
          'sessionService:withSubjectToken - storedAt seconds from current date/time = ' +
          secSinceStored
        );

        if (minTillExpiration <= 0) {
          return $q.reject('sessionService:withSubjectToken - Warning! Token expired and still held as cookie');
        } else if (secSinceStored < 7) {
          console.log('sessionService:withSubjectToken - Skipping refresh. < 7 seconds elapsed.');
          return $q.resolve(token);
        } else if (minTillExpiration > 2) {
          console.log('sessionService:withSubjectToken - Delaying refresh. > 2 minutes till expiration.');
          tokenService.setDirty();
          return $q.resolve(token);
        } else {
          console.log('sessionService:withSubjectToken - < 2 minutes till expiration. Refresh first.');
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

            console.log(
              'sessionService:withTenantToken - expires_at minutes from current date/time = ' +
              minTillExpiration
            );
            console.log(
              'sessionService:withTenantToken - minTillExpiration seconds from current date/time = ' +
              secSinceStored
            );

            if (minTillExpiration > 0 && secSinceStored < 7) {
              console.log('sessionService:withTenantToken - Skipping refresh. < 7 seconds elapsed.');
              return $q.resolve(token);
            } else if (minTillExpiration > 2) {
              console.log('sessionService:withTenantToken - Delayed refresh. > 2 minutes till expiration.');
              tenantTokensService.setDirty(tenantId);
              return $q.resolve(token);
            } else {
              if (minTillExpiration <= 0) {
                console.log('sessionService:withTenantToken - Warning! Tenant scoped token expired and still held as cookie');
              } else {
                console.log('sessionService:withTenantToken - < 2 minutes till expiration, refresh first.');
              }
              return tenantTokensService.renew(subjectToken.id, tenantId);
            }

          } else {
            console.log('sessionService:withTenantToken - Token never existed or expired');
            return tenantTokensService.renew(subjectToken.id, tenantId);
          }
        });
    }
  });
