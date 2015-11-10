angular.module('session', ['user', 'token', 'tenantTokens', 'tokensPolling', 'ui.router.util'])
  .service('sessionService', function($q, userService, tokenService, tenantTokensService) {
    return {
      withSubjectToken: withSubjectToken,
      withTenantToken: withTenantToken
    };

    function withSubjectToken() {
      var token = tokenService.get();
      if (token) {
        var min_till_exp = moment(token.expires_at).diff(moment(), 'minutes');
        var sec_since_stored = moment().diff(moment(token.stored_at), 'seconds');

        console.log(
          'sessionService:withSubjectToken - current date/time = ' +
          moment().toISOString()
        );
        console.log(
          'sessionService:withSubjectToken - expires_at = ' +
          moment(token.expires_at).toISOString()
        );
        console.log(
          'sessionService:withSubjectToken - expires_at minutes from current date/time = ' +
          min_till_exp
        );
        console.log(
          'sessionService:withSubjectToken - stored_at = ' +
          moment(token.stored_at).toISOString()
        );
        console.log(
          'sessionService:withSubjectToken - stored_at seconds from current date/time = ' +
          sec_since_stored
        );

        if (min_till_exp <= 0) {
          return $q.reject('sessionService:withSubjectToken - Warning! Token expired and still held as cookie');
        } else if (sec_since_stored < 7) {
          console.log('sessionService:withSubjectToken - Skipping refresh. < 7 seconds elapsed.');
          return $q.resolve(token);
        } else if (min_till_exp > 2) {
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
        .then(function(subject_token) {
          var token = tenantTokensService.get(tenantId);

          if (token) {
            var min_till_exp = moment(token.expires_at).diff(moment(), 'minutes');
            var sec_since_stored = moment().diff(moment(token.stored_at), 'seconds');

            console.log(
              'sessionService:withTenantToken - expires_at minutes from current date/time = ' +
              min_till_exp
            );
            console.log(
              'sessionService:withTenantToken - min_till_exp seconds from current date/time = ' +
              sec_since_stored
            );

            if (min_till_exp > 0 && sec_since_stored < 7) {
              console.log('sessionService:withTenantToken - Skipping refresh. < 7 seconds elapsed.');
              return $q.resolve(token);
            } else if (min_till_exp > 2) {
              console.log('sessionService:withTenantToken - Delayed refresh. > 2 minutes till expiration.');
              tenantTokensService.setDirty(tenantId);
              return $q.resolve(token);
            } else {
              if (min_till_exp <= 0) {
                console.log('sessionService:withTenantToken - Warning! Tenant scoped token expired and still held as cookie');
              } else {
                console.log('sessionService:withTenantToken - < 2 minutes till expiration, refresh first.');
              }
              return tenantTokensService.renew(subject_token.id, tenantId);
            }

          } else {
            console.log('sessionService:withTenantToken - Token never existed or expired');
            return tenantTokensService.renew(subject_token.id, tenantId);
          }
        });
    }
  });
