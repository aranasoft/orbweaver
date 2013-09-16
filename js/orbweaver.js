(function(window, angular, undefined) {
  'use strict';

  var orbweaver = angular.module('orbweaver', ['ng']);

  orbweaver.factory("restfulService", function($q) {
    return {
      asPromises: function(resourceService) {
        return {
          all: function() {
            var deferred = $q.defer();
            resourceService.resource.all({},
              function(response) {
                deferred.resolve(response);
              },
              function(response) {
                deferred.reject(response);
              });
            return deferred.promise;
          },
          find: function(id) {
            var deferred = $q.defer();
            resourceService.resource.get({ id: id },
              function(response) {
                deferred.resolve(response);
              },
              function(response) {
                deferred.reject(response);
              });
            return deferred.promise;
          }
        };
      }
    };
  });
})(window, window.angular);
