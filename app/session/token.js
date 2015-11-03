angular.module('token', [])
  .service('tokenService', function($interval, $q, $http, $cookies) {
    return {
      init: init,
      get: get,
      setDirty: setDirty,
      renew: renew,
      injectIntoHttpCommonHeaders: injectIntoHttpCommonHeaders
    };

    function init(userName, password) {
      var deferred = $q.defer();
      var requestData = {
                        "auth": {
                          "identity": {
                            "methods": [
                              "password"
                            ],
                            "password": {
                              "user": {
                                "domain": {
                                  "name": "default"
                                },
                                "name": userName,
                                "password": password
                              }
                            }
                          }
                        }
                      };

      console.log('tokenService:get - requestData:\n' + JSON.stringify(requestData, null, '  '));

      $http.post('http://192.168.122.183:35357/v3/auth/tokens', requestData)
        .then(function(response) {
          console.log('tokenService:get - Token response header:\n' + JSON.stringify(response.headers(), null, '  '));
          console.log('tokenService:get - Token response:\n' + JSON.stringify(response, null, '  '));

          persist(response.headers('X-Subject-Token'), response.data.token.expires_at);
          $http.defaults.headers.common['X-Auth-Token'] = response.headers('X-Subject-Token');
          deferred.resolve();
        }, function(err_response) {
          deferred.reject('tokenService:get - HTTP failure response:\n' + JSON.stringify(err_response, null, '  '))
        });
      return deferred.promise;
    }

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
