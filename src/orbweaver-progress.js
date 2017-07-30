(function (window, angular, undefined) {
  'use strict';

  var orbweaver = angular.module('orbProgress', ['orbResource']);

  orbweaver.factory('NProgress', ['$window', function($window) {
    return $window.NProgress;
  }]);

  orbweaver.provider('orbRestfulProgressService', ['$resourceProvider', 'orbRestfulResourceProvider', function RestfulProgressServiceProvider($resourceProvider, orbRestfulResourceProvider) {
    this.$get = ['$q', 'orbProgressService', 'orbRestfulService', function ($q, orbProgressService, orbRestfulService) {
      function restfulProgressServiceFactory(url, params, actions, options) {
        var extend = angular.extend,
          forEach = angular.forEach;

        actions = extend({}, $resourceProvider.defaults.actions, orbRestfulResourceProvider.defaults.actions, actions);
        options = extend({}, orbRestfulResourceProvider.defaults.options, options);

        var resource = new orbRestfulService(url, params, actions, options);

        function RestfulProgressService() {
          return new resource();
        }

        RestfulProgressService.empty = function() {
          return new resource();
        };

        if (options.saveAsCreateOrUpdate !== false) {
          RestfulProgressService.save = function (args) {
            orbProgressService.start();
            var result = resource.save.apply(this, arguments);
            if (result.$promise) {
              return result.$promise.finally(function() { orbProgressService.done(); });
            } else {
              orbProgressService.done();
              return result;
            }
          };
        }

        forEach(actions, function(action, name) {
          RestfulProgressService[name] = function(args) {
            orbProgressService.start();
            var result = resource[name].apply(this, arguments);
            if (result.$promise) {
              return result.$promise.finally(function() { orbProgressService.done(); });
            } else {
              orbProgressService.done();
              return result;
            }
          };
        });

        return RestfulProgressService;
      }

      return restfulProgressServiceFactory;
    }];
  }]);

  orbweaver.factory("orbProgressService", ['NProgress', function (NProgress) {
    var progressCounter = 0;

    function incrementProgressCounter() {
      if (progressCounter === 0) {
        NProgress.start();
      }
      progressCounter++;
    }

    function decrementProgressCounter() {
      progressCounter--;
      if (progressCounter === 0) {
        NProgress.done();
      }
    }

    return {
      start: incrementProgressCounter,
      done: decrementProgressCounter
    };
  }]);

})(window, window.angular);

