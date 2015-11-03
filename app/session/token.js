angular.module('token', [])
  .service('tokenService', function($interval, $q, $http, $cookies) {
    return {
      get: get,
      setDirty: setDirty,
      renew: renew,
      injectIntoHttpCommonHeaders: injectIntoHttpCommonHeaders,
      persist: persist
    };

    function get() {
      console.log(
        "tokenService:get - |X-Subject-Token| = " +
        JSON.stringify($cookies.getObject('X-Subject-Token'), null, '  ')
      );
      return $cookies.getObject('X-Subject-Token');
    }

    function setDirty() {
      console.log('tokenService:setDirty - setting token dirty');
      var token = get();
      token.dirty = true;
      set(token);
    };

    function renew(deferred) {
      var token = get();

      var requestData = {
        "auth": {
          "token": {
            "id": token.id
          }
        }
      };

      injectIntoHttpCommonHeaders();
      $http.post('http://192.168.122.183:35357/v2.0/tokens', requestData)
      .then(
        function(response) {
          console.log('tokenService:renew:postSuccess - Response:\n' + JSON.stringify(response, null, '  '));
          persist(response.data.access.token.id, response.data.access.token.expires);
          if (deferred) deferred.resolve(response.data.access.token.id);
        },
        function(response) {
          if (deferred) deferred.reject('tokenService:renew - Error retrieving subject token');
        }
      );
    }

    function injectIntoHttpCommonHeaders() {
      $http.defaults.headers.common['X-Auth-Token'] = get().id;
    }

    function set(token) {
      $cookies.putObject('X-Subject-Token', token, {expires: token.expires_at});
    }

    function persist(x_subject_token, expires_at) {
      var token = {
        'id': x_subject_token,
        'dirty': false,
        'expires_at': expires_at,
        'stored_at': moment().toISOString()
      };
      set(token);
    }
  });
