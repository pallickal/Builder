angular.module('token', [])
  .service('tokenService', function($interval, $q, $http, $cookies) {
    return {
      get: get,
      setDirty: setDirty,
      renew: renew,
      injectIntoHttpCommonHeaders: injectIntoHttpCommonHeaders,
      set: set,
      remove: remove
    };

    function get() {
      console.log(
        "tokenService:get - |X-Subject-Token| = " +
        JSON.stringify($cookies.getObject('X-Subject-Token'), null, '  ')
      );
      return $cookies.getObject('X-Subject-Token');
    }

    function setDirty() {
      var token = get();
      console.log('tokenService:setDirty - setting token dirty');
      token.dirty = true;
      set(token.id, token.expires_at, token.dirty);
    };

    function renew() {
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
          set(response.data.access.token.id, response.data.access.token.expires);
          return $q.resolve(response.data.access.token.id);
        },
        function(response) {
          return $q.reject(new Error('Error retrieving subject token'));
        }
      );
    }

    function injectIntoHttpCommonHeaders() {
      $http.defaults.headers.common['X-Auth-Token'] = get().id;
    }

    function set(x_subject_token, expires_at, dirty) {
      var token = {
        'id': x_subject_token,
        'dirty': (dirty ? true : false),
        'expires_at': expires_at,
        'stored_at': moment().toISOString()
      };
      $cookies.putObject('X-Subject-Token', token, {expires: token.expires_at});
      console.log(
        "tokenService:set - |X-Subject-Token| = " +
        JSON.stringify($cookies.getObject('X-Subject-Token'), null, '  ')
      );
    }

    function remove() {
      $cookies.remove('X-Subject-Token');
      console.log(
        "tokenService:remove - Subject token removed. |X-Subject-Token| = " +
        JSON.stringify($cookies.getObject('X-Subject-Token'), null, '  ')
      );
    }
  });
