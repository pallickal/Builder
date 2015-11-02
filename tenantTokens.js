angular.module('tenantTokens', ['token', 'session'])
  .service('tenantTokensService', function($interval, $http, $cookies, tokenService) {
    return {
      setDirty: setDirty,
      renew: renew
    };

    function setDirty(tenant_id) {
      console.log('tenantTokensService:setDirty - setting tenant ' + tenant_id + ' token dirty');
      var token = $cookies.getObject(tenant_id);
      token.dirty = true;
      $cookies.putObject(tenant_id, token, {expires: token.expires_at});
    };

    function renew(subject_token_id, tenant_id, deferred) {
      var requestData = {
        "auth": {
          "token": {
            "id": subject_token_id
          },
          "tenantId": tenant_id
        }
      };
      console.log('tenantTokensService:renew - Request data\n' + JSON.stringify(requestData, null, '  '));

      $http.post('http://192.168.122.183:35357/v2.0/tokens', requestData)
        .then(
          function(response) {
            console.log('tenantTokensService:renew - Response:\n' + JSON.stringify(response, null, '  '));
            persist(tenant_id, response.data);
            $http.defaults.headers.common['X-Auth-Token'] = response.data.access.token.id;
            if (deferred) deferred.resolve(response.data.access.token.id);
          },
          function(response) {
            console.log('tenantTokensService:renew - Could not get tenant scoped token');
            if (deferred) deferred.reject('tenantTokensService:renew - Could not get tenant scoped token');
          }
        );
    }

    function persist(tenant_id, data) {
      token = {
        'id': data.access.token.id,
        'dirty': false,
        'expires_at': data.access.token.expires,
        'stored_at': moment().toISOString()
      };

      $cookies.putObject(tenant_id, token, {expires: data.access.token.expires});
      console.log(
        'tenantTokensService:persist - |' + tenant_id + '| = ' +
        JSON.stringify($cookies.getObject(tenant_id), null, '  ')
      );
    }
  });
