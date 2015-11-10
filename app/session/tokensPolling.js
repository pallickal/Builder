angular.module('tokensPolling', ['token', 'tenantTokens'])
  .service('tokensPollingService', function($interval, $q, $http, tokenService, tenantTokensService) {
    return {
      start: start,
      stop: stop
    };

    var intervalPromise;

    function start() {
      stop();
      intervalPromise = $interval(refreshDirtyToken, 30000, false);
    };

    function stop() {
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
