angular.module('login', [])
  .controller('loginCtrl', function($scope, $window, sessionService){
    $scope.formData = { 'userName' : 'demo', 'password' : 'opstack' };

    $scope.processFunction = function() {
      sessionService.authenticate($scope.formData.userName, $scope.formData.password)
        .then(function() {
          $window.location.href = '#/tenants';
        }, function(error) {
          console.log(error.stack);
        });
    };
  });
