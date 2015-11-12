angular.module('tokensPolling', ['token', 'tenantTokens'])
  .service('tokensPollingService', function($interval, $q, $http, userTokenService, tenantTokensService) {
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
      tenantTokensService.renewDirty();
      userTokenService.renewDirty();
    };
  })
  .run(function(tokensPollingService) {
    tokensPollingService.start();
  });
