(function (window, angular, undefined) {
  'use strict';

  var orbweaver = angular.module('orbProgress', ['orbResource']);

  orbweaver.factory("orbRestfulProgressService", ['$q', 'orbProgressService', function ($q, orbProgressService) {
    return function (RestfulResource) {
      var idProperty = RestfulResource.idProperty;

      return {
        empty: function () {
          return new RestfulResource();
        },
        all: function (params) {
          return RestfulResource.query(params).$promise;
        },
        find: function (id, params) {
          params = params || {};
          var options = {};
          options[idProperty] = id;
          params = angular.extend(params, options);
          orbProgressService.start();
          return RestfulResource.get(params).$promise.finally(function() {
            orbProgressService.done();
          });
        },
        save: function (inst, params) {
          params = params || {};
          if (inst.id) {
            var options = {};
            options[idProperty] = inst[idProperty];
            params = angular.extend(params, options);
            orbProgressService.start();
            return RestfulResource.update(params, inst).$promise.finally(function() {
              orbProgressService.done();
            });
          } else {
            orbProgressService.start();
            return RestfulResource.create(params, inst).$promise.finally(function() {
              orbProgressService.done();
            });
          }
        },
        'delete': function (inst, params) {
          params = params || {};
          var options = {};
          options[idProperty] = inst[idProperty];
          params = angular.extend(params, options);
          orbProgressService.start();
          return RestfulResource['delete'](params).$promise.finally(function() {
            orbProgressService.done();
          });
        }
      };
    };
  }]);

  orbweaver.factory("orbProgressService", function () {
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
      start: function () {
        incrementProgressCounter();
      },
      done: function () {
        decrementProgressCounter();
      }
    };
  });

})(window, window.angular);

