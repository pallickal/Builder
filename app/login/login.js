angular.module('login', ['user'])
  .controller('loginCtrl', function($scope, $window, userService){
    $scope.formData = { 'userName' : 'demo', 'password' : 'opstack' };

    $scope.processFunction = function() {
      userService.signIn($scope.formData.userName, $scope.formData.password)
        .then(function() {
          $window.location.href = '#/tenants';
        }, function(error) {
          console.log(error);
          console.log(error.stack);
        });
    };
  });
