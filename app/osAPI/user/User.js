angular.module('osApp.user', [])
  .service('User', function($http, $q, $localStorage, $state, UserToken,
    TenantTokens, CurrentTenant) {
    return {
      signIn: signIn,
      signOut: signOut
    };

    function signIn(userName, password) {
      var data = {
        "auth": {
          "passwordCredentials": {
            "username": userName,
            "password": password
          }
        }
      };

      signOut();

      return $http.post('http://192.168.122.183:5000/v2.0/tokens', data)
        .then(function(response) {
          UserToken.set(response.data);
          set(response.data);
        }, function(response) {
          return $q.reject(new Error('Error signing in'));
        });
    };

    function signOut() {
      UserToken.remove();
      TenantTokens.remove();
      CurrentTenant.remove();
      remove();
      $state.go('signIn');
    }

    function set(data) {
      var user = angular.copy(data.access.user);

      user.responseData = data;
      $localStorage.user = user;
    }

    function remove() {
      delete $localStorage.user;
    }
  });
