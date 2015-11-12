angular.module('login', ['user'])
  .controller('loginCtrl', function($scope, $state, userService){
    $scope.formData = { 'userName' : 'demo', 'password' : 'opstack' };

    $scope.processFunction = function() {
      userService.signIn($scope.formData.userName, $scope.formData.password)
        .then(function() {
          $state.go('app.tenants');
        }, function(error) {
          console.log(error.stack);
        });
    };
  });
