angular.module('tokensPolling', ['token', 'tenantTokens'])
  .service('tokensPollingService', function($interval, $q, $http, tokenService, tenantTokensService) {
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
      tokenService.renewDirty();
      tenantTokensService.renewDirty();
    };
  })
  .run(function(tokensPollingService) {
    tokensPollingService.start();
  });
