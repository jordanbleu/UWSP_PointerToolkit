//OnLoad
(function () {
    'use strict';

    function AboutController($scope, $ionicHistory, $timeout, $state) {
        $timeout(function () {
        });

        $("#aboutcontent").children().each(function (index) { $(this).hide(); });
        $("#aboutcontent").children().each(function (index) {
            $(this).delay(100 * index).fadeIn(200);
        });
    }



    angular
      .module('about', [])
      .controller('AboutController', AboutController);
})();

