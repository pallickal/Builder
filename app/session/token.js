angular.module('token', [])
  .service('tokenService', function($interval, $q, $http, $cookies) {
    return {
      get: get,
      setDirty: setDirty,
      renewDirty: renewDirty,
      renew: renew,
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

    function renewDirty() {
      var token = get();
      if (token && token.dirty) {
        console.log('tokenService:renewDirty - subject token is dirty');
        renew()
          .catch(function(error) {
            console.log(error.stack);
          });
      }
    }

    function renew() {
      var token = get();

      var data = {
        "auth": {
          "token": {
            "id": token.id
          }
        }
      };

      return $http.post('http://192.168.122.183:35357/v2.0/tokens', data)
      .then(
        function(response) {
          console.log('tokenService:renew:postSuccess - Response:\n' + JSON.stringify(response, null, '  '));
          set(response.data.access.token.id, response.data.access.token.expires);
          return get();
        },
        function(response) {
          return $q.reject(new Error('Error retrieving subject token'));
        }
      );
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
