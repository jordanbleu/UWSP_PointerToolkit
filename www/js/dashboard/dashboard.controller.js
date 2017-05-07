(function () {
    'use strict';
    function DashboardController($scope, $ionicHistory, $timeout, $state) {
        var firstRun = true;

        // A stupid but functional way to fix the layout on iOS
        Apply_iOS_Patch();

        $timeout(function () {         
        });

        $scope.$on('$ionicView.beforeEnter', function () {
            angular.element(document.getElementsByClassName('title')).addClass('header-item');
            

            if (firstRun) {
                $("#dashboard-animation").addClass("animated fadeInDown");
                firstRun = false;
            } else {
                $("#dashboard-animation").removeClass("slideOutLeft").removeClass("fadeInDown").addClass("animated fadeInLeft");
            }
        });

        $scope.goTo = function (destination) {
            angular.element(document.getElementById('dashboard-animation'))
            .removeClass('animated fadeInLeft')
            .addClass('animated slideOutLeft');

            $timeout(function () {
                angular.element(document.getElementById('dashboard-animation'));
                //.removeClass('animated slideOutLeft')
                angular.element(document.getElementsByClassName('title')).removeClass('mainTitle');
                $state.go(destination);
            }, 300); // This is now faster
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

    function Apply_iOS_Patch() {
        if ($(".platform-ios").length > 0) {
            $("#iosFix").css("margin-top", "20%");
        } else {
            $("#iosFix").css("margin-top", "15%");
        }
    }

    angular
      .module('dashboard')
      .controller('DashboardController', DashboardController);
})();