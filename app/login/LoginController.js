angular.module('builderApp.signIn', [])
  .controller('SignInController', function($scope, $state, User){
    $scope.formData = { 'userName' : 'demo', 'password' : 'opstack' };

    $scope.processFunction = function() {
      User.signIn($scope.formData.userName, $scope.formData.password)
        .then(function() {
          $state.go('app.tenants');
        }, function(error) {
          console.log(error.stack);
        });
    };
  });
