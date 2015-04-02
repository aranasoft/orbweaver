(function (window, angular, undefined) {
  'use strict';

  var orbweaver = angular.module('orbMessage', []);

  orbweaver.constant('orbToastrOptions', {
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
  });

  orbweaver.factory("orbMessageService", ['$rootScope', '$timeout', 'orbToastrOptions', function ($rootScope, $timeout, orbToastrOptions) {
    toastr.options = orbToastrOptions;

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
  }]);
})(window, window.angular);
