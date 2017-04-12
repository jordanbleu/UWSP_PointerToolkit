(function () {
  'use strict';

  function ionicStart($ionicPlatform, $rootScope, $ionicHistory, $window) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if(window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if(window.StatusBar) {
        StatusBar.styleDefault();
      }

        // Custom Android hardware back button handler
      $ionicPlatform.registerBackButtonAction(function (e) {
          // Prevent the default functionality
          e.preventDefault();
          e.stopPropagation();

          // if the menu is open, close it 
          if ($("#dotMenu").data("isOpen")) {
              if ($ionicHistory.currentStateName() == "dashboard") {
                  $window.scope.hideMenu();
              } else {
                  $window.scope.$parent.hideMenu();
              }
              // If the menu is not open...
          } else  {
              $ionicHistory.goBack();
          }
      }, 100);




    });
  }

  angular
    .module('starter')
    .run(ionicStart);
})();
