angular.module('tenantTokens', ['token'])
  .service('tenantTokensService', function($interval, $http, $cookies, tokenService) {
    return {
      get: get,
      setDirty: setDirty,
      renew: renew,
      injectIntoHttpCommonHeaders: injectIntoHttpCommonHeaders,
      remove: remove
    };

    function get(tenant_id) {
      console.log(
        'tenantTokensService:get - |' + tenant_id + '| = ' +
        JSON.stringify($cookies.getObject(tenant_id), null, '  ')
      );
      return $cookies.getObject(tenant_id);
    }

    function setDirty(tenant_id) {
      var token = get(tenant_id);
      console.log('tenantTokensService:setDirty - setting tenant ' + tenant_id + ' token dirty');
      token.dirty = true;
      set(tenant_id, token.id, token.expires_at, token.dirty);
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

      tokenService.injectIntoHttpCommonHeaders();
      $http.post('http://192.168.122.183:35357/v2.0/tokens', requestData)
        .then(
          function(response) {
            console.log('tenantTokensService:renew - Response:\n' + JSON.stringify(response, null, '  '));
            set(tenant_id, response.data.access.token.id, response.data.access.token.expires);
            injectIntoHttpCommonHeaders(tenant_id);
            if (deferred) deferred.resolve(response.data.access.token.id);
          },
          function(response) {
            console.log('tenantTokensService:renew - Could not get tenant scoped token');
            if (deferred) deferred.reject('tenantTokensService:renew - Could not get tenant token for id ' + tenant_id);
          }
        );
    }

    function injectIntoHttpCommonHeaders(tenant_id) {
      $http.defaults.headers.common['X-Auth-Token'] = get(tenant_id).id;
    }

    function set(tenant_id, tenant_token, expires_at, dirty) {
      token = {
        'id': tenant_token,
        'dirty': (dirty ? true : false),
        'expires_at': expires_at,
        'stored_at': moment().toISOString()
      };
      $cookies.putObject(tenant_id, token, {expires: token.expires_at});
    }

    function remove() {
      // implement after tenant token store is re-implemented to be enumerable
      console.log('tenantTokensService:delete - Warning! Not implemented');
    }
  });
