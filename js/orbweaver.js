(function(window, angular, undefined) {
  'use strict';

  var orbweaver = angular.module('orbweaver', ['ng']);

  orbweaver.factory("restfulResource", ['$resource', function ($resource) {
    return function(url, params, methods) {
      var defaults = {
        update: {method: 'put',isArray: false},
        create: { method: 'post' }
      };

      methods = angular.extend(defaults, methods);
      
      var resource = $resource(url, params, methods);

      resource.prototype.$save = function (params, success, failure) {
        if (!this.id) {
          this.$create(success, failure);
        } else {
          this.$update(success,failure);
        }
      };

      return resource;
    };
  }]);
  
  orbweaver.factory("restfulService", ['$q', function ($q) {
    var defer = function (fn, params) {
      params = params || {};
      var deferred = $q.defer();
      fn(params,
        function(response) {
          deferred.resolve(response);
        },
        function(response) {
          deferred.reject(response);
        });
      return deferred.promise;
    };

    var deferInstance = function(inst, fn, params) {
      params = params || {};
      var deferred = $q.defer();
      inst[fn](params,
        function(response) {
          deferred.resolve(response);
        },
        function(response) {
          deferred.reject(response);
        });
      return deferred.promise;
    };
    
    return {
      withPromises: function(restfulResource) {
        return {
          empty: function() {
            return new restfulResource();
          },
          all: function () {
            return defer(restfulResource.all);
          },
          find: function(id) {
            return defer(restfulResource.get, { id: id });
          },
          save: function (res) {
            if (res.id) {
              return deferInstance(res, "$update", { id: res.id });
            } else {
              return deferInstance(res, "$create");
            }
          },
          delete: function(res) {
            return deferInstance(res, "$delete", { id: res.id });
          }
        };
      }
    };
  }]);
})(window, window.angular);
