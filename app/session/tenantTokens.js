angular.module('tenantTokens', ['token'])
  .service('tenantTokensService', function($interval, $http, $cookies, $q, tokenService) {
    return {
      get: get,
      setDirty: setDirty,
      renew: renew,
      injectIntoHttpCommonHeaders: injectIntoHttpCommonHeaders,
      remove: remove
    };

    function get(tenant_id) {
      var tenant_tokens = $cookies.getObject('Tenant-Tokens');
      var requested_token = (tenant_tokens ? tenant_tokens[tenant_id] : tenant_tokens);
      console.log(
        'tenantTokensService:get - |Tenant-Tokens|["' + tenant_id + '"] = ' +
        JSON.stringify(requested_token, null, '  ')
      );
      return requested_token;
    }

    function setDirty(tenant_id) {
      var token = get(tenant_id);
      console.log('tenantTokensService:setDirty - setting tenant ' + tenant_id + ' token dirty');
      token.dirty = true;
      set(tenant_id, token.id, token.expires_at, token.dirty);
    };

    function renew(subject_token_id, tenant_id) {
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
            $q.resolve(response.data.access.token.id);
          },
          function(response) {
            $q.reject(new Error('Error getting tenant token for id ' + tenant_id));
          }
        );
    }

    function injectIntoHttpCommonHeaders(tenant_id) {
      $http.defaults.headers.common['X-Auth-Token'] = get(tenant_id).id;
    }

    function remove() {
      $cookies.remove('Tenant-Tokens');
      console.log(
        "tenantTokenService:remove - Tenant tokens removed. |Tenant-Tokens| = " +
        JSON.stringify($cookies.getObject('Tenant-Tokens'), null, '  ')
      );
    }

    function set(tenant_id, tenant_token, expires_at, dirty) {
      tenant_tokens = $cookies.getObject('Tenant-Tokens') || {};
      token = {
        'id': tenant_token,
        'dirty': (dirty ? true : false),
        'expires_at': expires_at,
        'stored_at': moment().toISOString()
      };
      tenant_tokens[tenant_id] = token;
      $cookies.putObject('Tenant-Tokens', tenant_tokens, {expires: token.expires_at});
      console.log(
        "tenantTokenService:set - Added tenant_id " + tenant_id +
        "\n|Tenant-Tokens| = " +
        JSON.stringify($cookies.getObject('Tenant-Tokens'), null, '  ')
      );
    }
  });
