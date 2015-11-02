angular.module('session', ['token', 'tenantTokens'])
  .factory('sessionFactory', function($http, $cookies, $cacheFactory, $q, $window, tokenService, tenantTokensService) {
    return {
      authenticate: authenticate,
      withToken: withToken,
      withTenantToken: withTenantToken
    };

    function authenticate(userName, password) {
      return tokenService.init(userName, password);
    };

    function withToken() {
      var deferred = $q.defer();
      var token = $cookies.getObject('X-Subject-Token');

      console.log(
        "sessionFactory:withToken - |X-Subject-Token| = " +
        JSON.stringify($cookies.getObject('X-Subject-Token'), null, '  ')
      );

      if (token) {
        var min_till_exp = moment(token.expires_at).diff(moment(), 'minutes');
        var sec_since_stored = moment().diff(moment(token.stored_at), 'seconds');

        console.log(
          'sessionFactory:withToken - current date/time = ' +
          moment().toISOString()
        );
        console.log(
          'sessionFactory:withToken - expires_at = ' +
          moment(token.expires_at).toISOString()
        );
        console.log(
          'sessionFactory:withToken - expires_at minutes from current date/time = ' +
          min_till_exp
        );
        console.log(
          'sessionFactory:withToken - stored_at = ' +
          moment(token.stored_at).toISOString()
        );
        console.log(
          'sessionFactory:withToken - stored_at seconds from current date/time = ' +
          sec_since_stored
        );

        if (min_till_exp <= 0) {
          console.log('sessionFactory:withToken - Warning! Token expired and still held as cookie');
          deferred.reject('sessionFactory:withToken - Warning! Token expired and still held as cookie');
        } else if (sec_since_stored < 7) {
          console.log('sessionFactory:withToken - Skipping refresh. < 7 seconds elapsed.');
          $http.defaults.headers.common['X-Auth-Token'] = token.id;
          deferred.resolve(token.id);
        } else if (min_till_exp > 2) {
          console.log('sessionFactory:withToken - Delaying refresh. > 2 minutes till expiration.');
          $http.defaults.headers.common['X-Auth-Token'] = token.id;
          deferred.resolve(token.id);
          tokenService.setDirty();
        } else {
          console.log('sessionFactory:withToken - < 2 minutes till expiration. Refresh first.');
          tokenService.renew(deferred);
        }

      } else {
        console.log('sessionFactory:withToken - Token never existed or expired');
        deferred.reject('sessionFactory:withToken - Token never existed or expired');
      }
      return deferred.promise;
    }

    function withTenantToken(tenant_id) {
      var deferred = $q.defer();
      var token = $cookies.getObject(tenant_id);

      console.log(
        'sessionFactory:withTenantToken - |' + tenant_id + '| = ' +
        JSON.stringify($cookies.getObject(tenant_id), null, '  ')
      );

      function renew() {
        withToken()
          .then(function(token_id) {
            tenantTokensService.renew(token_id, tenant_id, deferred);
          }, function(error) {
            console.log('sessionFactory:withTenantToken:refreshTenantToken - Rejected promise from withToken, error:\n' + error)
            deferred.reject(error);
          });
      }

      if (token) {
        var min_till_exp = moment(token.expires_at).diff(moment(), 'minutes');
        var sec_since_stored = moment().diff(moment(token.stored_at), 'seconds');

        console.log(
          'sessionFactory:withTenantToken - expires_at minutes from current date/time = ' +
          min_till_exp
        );
        console.log(
          'sessionFactory:withTenantToken - min_till_exp seconds from current date/time = ' +
          sec_since_stored
        );

        if (min_till_exp > 0 && sec_since_stored < 7) {
          console.log('sessionFactory:withTenantToken - Skipping refresh. < 7 seconds elapsed.');
          $http.defaults.headers.common['X-Auth-Token'] = token.id;
          deferred.resolve(token.id);
        } else if (min_till_exp > 2) {
          console.log('sessionFactory:withTenantToken - Delayed refresh. > 2 minutes till expiration.');
          $http.defaults.headers.common['X-Auth-Token'] = token.id;
          deferred.resolve(token.id);
          tenantTokensService.setDirty(tenant_id);
        } else {
          if (min_till_exp <= 0) {
            console.log('sessionFactory:withTenantToken - Warning! Tenant scoped token expired and still held as cookie');
          } else {
            console.log('sessionFactory:withTenantToken - < 2 minutes till expiration, refresh first.');
          }
          renew();
        }

      } else {
        console.log('sessionFactory:withTenantToken - Token never existed or expired');
        renew();
      }
      return deferred.promise;
    }

  });
