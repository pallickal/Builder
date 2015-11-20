angular.module('osAPI.Images', [])
  .service('Images', function($http) {
    return { get: get }

    function get() {
      return $http.get('http://192.168.122.183:9292/v2/images')
        .then(function(response) {
          return response.data.images;
        });
    }
});
