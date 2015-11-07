angular.module('session', ['user', 'token', 'tenantTokens', 'tokensPolling'])
  .service('sessionService', function($q, userService, tokenService, tenantTokensService) {
    return {
      authenticate: authenticate,
      withToken: withToken,
      withTenantToken: withTenantToken
    };

    function authenticate(userName, password) {
      return userService.signIn(userName, password);
    };

    function withToken() {
      var token = tokenService.get();
      if (token) {
        var min_till_exp = moment(token.expires_at).diff(moment(), 'minutes');
        var sec_since_stored = moment().diff(moment(token.stored_at), 'seconds');

        console.log(
          'sessionService:withToken - current date/time = ' +
          moment().toISOString()
        );
        console.log(
          'sessionService:withToken - expires_at = ' +
          moment(token.expires_at).toISOString()
        );
        console.log(
          'sessionService:withToken - expires_at minutes from current date/time = ' +
          min_till_exp
        );
        console.log(
          'sessionService:withToken - stored_at = ' +
          moment(token.stored_at).toISOString()
        );
        console.log(
          'sessionService:withToken - stored_at seconds from current date/time = ' +
          sec_since_stored
        );

        if (min_till_exp <= 0) {
          return $q.reject('sessionService:withToken - Warning! Token expired and still held as cookie');
        } else if (sec_since_stored < 7) {
          console.log('sessionService:withToken - Skipping refresh. < 7 seconds elapsed.');
          tokenService.injectIntoHttpCommonHeaders();
          return $q.resolve(token);
        } else if (min_till_exp > 2) {
          console.log('sessionService:withToken - Delaying refresh. > 2 minutes till expiration.');
          tokenService.injectIntoHttpCommonHeaders();
          tokenService.setDirty();
          return $q.resolve(token);
        } else {
          console.log('sessionService:withToken - < 2 minutes till expiration. Refresh first.');
          return tokenService.renew();
        }

      } else {
        return $q.reject(new Error('Token never existed or expired'));
      }
    }

    function withTenantToken(tenant_id) {
      return withToken()
        .then(function(subject_token) {
          var token = tenantTokensService.get(tenant_id);

          function renew() {
            return tenantTokensService.renew(subject_token.id, tenant_id);
          }

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
              tenantTokensService.injectIntoHttpCommonHeaders(tenant_id);
              return $q.resolve(token);
            } else if (min_till_exp > 2) {
              console.log('sessionService:withTenantToken - Delayed refresh. > 2 minutes till expiration.');
              tenantTokensService.injectIntoHttpCommonHeaders(tenant_id);
              tenantTokensService.setDirty(tenant_id);
              return $q.resolve(token);
            } else {
              if (min_till_exp <= 0) {
                console.log('sessionService:withTenantToken - Warning! Tenant scoped token expired and still held as cookie');
              } else {
                console.log('sessionService:withTenantToken - < 2 minutes till expiration, refresh first.');
              }
              return renew();
            }

          } else {
            console.log('sessionService:withTenantToken - Token never existed or expired');
            return renew();
          }
        });
      }
  });
