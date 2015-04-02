(function (window, angular, undefined) {
  'use strict';

  var orbweaver = angular.module('orbweaver', ['ngResource']);

  orbweaver.factory("restfulResource", ['$resource', function ($resource) {
    return function (url, params, methods) {
      var defaults = {
        update: {method: 'put', isArray: false},
        create: {method: 'post'}
      };

      methods = angular.extend(defaults, methods);

      var resource = $resource(url, params, methods);

      resource.prototype.$save = function (params, success, failure) {
        if (!this.id) {
          this.$create(params, success, failure);
        } else {
          this.$update(params, success, failure);
        }
      };

      return resource;
    };
  }]);

  orbweaver.factory("restfulService", ['$q', 'progressService', function ($q, progressService) {
    var defer = function (fn, params) {
      params = params || {};
      var deferred = $q.defer();
      progressService.start();
      fn(params,
        function (response) {
          progressService.done();
          deferred.resolve(response);
        },
        function (response) {
          progressService.done();
          deferred.reject(response);
        });
      return deferred.promise;
    };

    var deferInstance = function (inst, fn, params) {
      params = params || {};
      var deferred = $q.defer();
      progressService.start();
      inst[fn](params,
        function (response) {
          progressService.done();
          deferred.resolve(response);
        },
        function (response) {
          progressService.done();
          deferred.reject(response);
        });
      return deferred.promise;
    };

    return {
      withPromises: function (restfulResource) {
        return {
          empty: function () {
            return new restfulResource();
          },
          all: function (params) {
            return defer(restfulResource.all, params);
          },
          find: function (id, params) {
            params = params || {};
            params = _.extend(params, {id: id});
            return defer(restfulResource.get, params);
          },
          save: function (res, params) {
            params = params || {};
            if (res.id) {
              params = _.extend(params, {id: res.id});
              return deferInstance(res, "$update", params);
            } else {
              return deferInstance(res, "$create", params);
            }
          },
          delete: function (res, params) {
            return deferInstance(res, "$delete", {id: res.id});
          }
        };
      }
    };
  }]);

  orbweaver.factory("progressService", function () {
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

  orbweaver.factory("messageService", function ($rootScope, $timeout) {
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "positionClass": "toast-top-right",
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "3000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    };


    return {
      success: function (message) {
        toastr.success(message);
      },
      info: function (message) {
        toastr.info(message);
      },
      warning: function (message) {
        toastr.warning(message);
      },
      error: function (message) {
        toastr.error(message);
      }
    };
  });
})(window, window.angular);
