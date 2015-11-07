angular.module('login', [])
  .controller('loginCtrl', function($scope, $window, sessionFactory){
    $scope.formData = { 'userName' : 'demo', 'password' : 'opstack' };

    $scope.processFunction = function() {
      sessionFactory.authenticate($scope.formData.userName, $scope.formData.password)
        .then(function() {
          $window.location.href = '#/tenants';
        }, function(error) {
          console.log(error.stack);
        });
    };
  });
