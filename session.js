angular.module('session', [])
  .factory('sessionFactory', function($http, $cookies, $cacheFactory, $q, $window) {
    return {
      authenticate: authenticate,
      withToken: withToken,
      withTenantToken: withTenantToken
    };

    ////////

    function persistToken(x_subject_token, expires_at) {
      var token = $cookies.getObject('X-Subject-Token') || {};

      token = {
        'id': x_subject_token,
        'expires_at': expires_at,
        'stored_at': moment().toISOString()
      };

      $cookies.putObject('X-Subject-Token', token, {expires: expires_at});
      console.log(
        "sessionFactory:persistToken - |X-Subject-Token| = " +
        JSON.stringify($cookies.getObject('X-Subject-Token'), null, '  ')
      );
    }

    function authenticate(userName, password, callback) {
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

      console.log('sessionFactory:authenticate - requestData:\n' + JSON.stringify(requestData, null, '  '));

      $http.post('http://192.168.122.183:35357/v3/auth/tokens', requestData)
        .then(function(response) {
          console.log('sessionFactory:authenticate - Token response header:\n' + JSON.stringify(response.headers(), null, '  '));
          console.log('sessionFactory:authenticate - Token response:\n' + JSON.stringify(response, null, '  '));

          persistToken(response.headers('X-Subject-Token'), response.data.token.expires_at);
          $http.defaults.headers.common['X-Auth-Token'] = response.headers('X-Subject-Token');
          deferred.resolve();
        }, function(err_response) {
          deferred.reject('sessionFactory:authenticate - HTTP failure response:' + JSON.stringify(err_response, null, '  '))
        });
      return deferred.promise;
    };

    function withToken() {
      var deferred = $q.defer();
      var token = $cookies.getObject('X-Subject-Token');

      console.log(
        "sessionFactory:withToken - |X-Subject-Token| = " +
        JSON.stringify($cookies.getObject('X-Subject-Token'), null, '  ')
      );

      function renewToken() {
        var requestData = {
          "auth": {
            "token": {
              "id": token.id
            }
          }
        };

        $http.defaults.headers.common['X-Auth-Token'] = token.id;
        $http.post('http://192.168.122.183:35357/v2.0/tokens', requestData)
        .then(
          function(response) {
            console.log('sessionFactory:withToken:renewToken:postSuccess - Response:\n' + JSON.stringify(response, null, '  '));
            persistToken(response.data.access.token.id, response.data.access.token.expires);
            deferred.resolve(response.data.access.token.id);
          },
          function(response) {
            console.log('sessionFactory:withToken:renewToken:postError - Response:\n' + response);
            deferred.reject(response);
          }
        );  // redirect to sign in on failure
      }

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
//        replace with code to set a token "dirty" flag so it can be refreshed within 30 sec by polling
//          callback = function() {};
//          renewToken();
        } else {
          console.log('sessionFactory:withToken - < 2 minutes till expiration. Refresh first.');
          renewToken();
        }

      } else {
        console.log('sessionFactory:withToken - Token never existed or expired');
        deferred.reject('sessionFactory:withToken - Token never existed or expired');
      }
      return deferred.promise;
    }

    function withTenantToken(tenant_id, callback) {
      var deferred = $q.defer();
      var token = $cookies.getObject(tenant_id) || {};

      console.log(
        'sessionFactory:withTenantToken - |' + tenant_id + '| = ' +
        JSON.stringify($cookies.getObject(tenant_id), null, '  ')
      );

      function persistTenantToken(tenant_token, expires_at, stored_at) {
        token = {
          'id': tenant_token,
          'expires_at': expires_at,
          'stored_at': moment().toISOString()
        };

        $cookies.putObject(tenant_id, token, {expires: expires_at});
        console.log(
          'sessionFactory:withTenantToken:persistTenantToken - |' + tenant_id + '| = ' +
          JSON.stringify($cookies.getObject(tenant_id), null, '  ')
        );
      }

      function refreshTenantToken() {
        withToken()
          .then(function(token_id) {
            var requestData = {
              "auth": {
                "token": {
                  "id": token_id
                },
                "tenantId": tenant_id
              }
            };
            console.log('sessionFactory:withTenantToken - Request data\n' + JSON.stringify(requestData, null, '  '));

            $http.post('http://192.168.122.183:35357/v2.0/tokens', requestData)
              .then(
                function(response) {
                  console.log('sessionFactory:withTenantToken - Response:\n' + JSON.stringify(response, null, '  '));
                  persistTenantToken(response.data.access.token.id, response.data.access.token.expires);
                  $http.defaults.headers.common['X-Auth-Token'] = response.data.access.token.id;
                  deferred.resolve(response.data.access.token.id);
                },
                function(response) {
                  console.log('sessionFactory:withTenantToken - Could not get tenant scoped token');
                  deferred.reject('sessionFactory:withTenantToken - Could not get tenant scoped token');
                }
              );
            }, function(error) {
              console.log('sessionFactory:withTenantToken:refreshTenantToken - Rejected promise from withToken, error:\n' + error)
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
          //        replace with code to set a token "dirty" flag so it can be refreshed within 30 sec by polling
//              callback = function() {};
//              refreshTenantToken();
        } else {
          if (min_till_exp <= 0) {
            console.log('sessionFactory:withTenantToken - Warning! Tenant scoped token expired and still held as cookie');
          } else {
            console.log('sessionFactory:withTenantToken - < 2 minutes till expiration, refresh first.');
          }
          refreshTenantToken();
        }

      } else {
        console.log('sessionFactory:withTenantToken - Token never existed or expired');
        refreshTenantToken();
      }
      return deferred.promise;
    }

  })
  .controller('loginCtrl', function($scope, $http, $cookies, $window, sessionFactory){
    $scope.formData = { 'userName' : 'demo', 'password' : 'opstack' };

    console.log('loginCtrl: |X-Subject-Token| = ' + JSON.stringify($cookies.getObject('X-Subject-Token'), null, '  '));

    $scope.processFunction = function() {
      sessionFactory.authenticate($scope.formData.userName, $scope.formData.password)
        .then(function() {
          $window.location.href = '#/tenants';
        }, function(error) {
          console.log('loginCtrl: - Error from sessionFactory:authenticate:' + error);
        });
    };
  });
