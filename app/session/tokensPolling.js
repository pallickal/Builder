angular.module('tokensPolling', ['token'])
  .service('tokensPollingService', function($interval, $q, $http, tokenService) {
    return {
      start: start,
      stop: stop
    };

    var intervalPromise;

    function start() {
      console.log('tokensPollingService:start');
      stop();
      intervalPromise = $interval(refreshDirtyToken, 30000, false);
      console.log('tokensPollingService:start - new interval set');
    };

    function stop() {
      console.log('tokensPollingService:stop');
      $interval.cancel(intervalPromise);
    };

    function refreshDirtyToken() {
      console.log('tokensPollingService:refreshDirtyTokens');
      var token = tokenService.get();
      if (token && token.dirty) {
        console.log('tokensPollingService:refreshDirtyTokens - token is dirty');
        tokenService.renew()
          .catch(function(error) {
            console.log(error.stack);
          });
      }
    };
  });
