(function () {
    'use strict';
    function DashboardController($scope, $ionicHistory, $timeout, $state) {
        var firstRun = true;
        $scope.$on('$ionicView.beforeEnter', function () {
            angular.element(document.getElementsByClassName('title')).addClass('header-item');
            if (firstRun) {
                angular.element(document.getElementsByTagName('ion-header-bar')).addClass('animated slideInDown');
                firstRun = false;
            }
        });
        $scope.goTo = function (destination) {
            angular.element(document.getElementById('dashboard-animation'))
            .removeClass('animated fadeInLeft')
            .addClass('animated slideOutLeft');
            angular.element(document.getElementsByTagName('ion-header-bar'))
            .removeClass('animated slideInDown')
            .addClass('animated fadeOutUp');
            $timeout(function () {
                angular.element(document.getElementById('dashboard-animation'))
                .removeClass('animated slideOutLeft')
                .addClass('animated fadeInLeft');
                angular.element(document.getElementsByTagName('ion-header-bar'))
                .removeClass('animated fadeOutUp')
                .addClass('animated fadeInDown');
                angular.element(document.getElementsByClassName('title')).removeClass('mainTitle');
                $state.go(destination);
            }, 200); // This is now faster
        }

        Waves.attach('.ripple', ['waves-button', 'waves-light']);
        var wavesConfig = {
            // How long Waves effect duration
            // when it's clicked (in milliseconds)
            duration: 1000,

            // Delay showing Waves effect on touch
            // and hide the effect if user scrolls
            // (0 to disable delay) (in milliseconds)
            delay: 0
        };

        // Initialise Waves with the config
        Waves.init(wavesConfig);
    }

    angular
      .module('dashboard')
      .controller('DashboardController', DashboardController);
})();