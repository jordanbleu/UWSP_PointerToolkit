(function () {
    'use strict';

    function config($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        $stateProvider.state('dashboard', {
            url: '/dashboard',
            templateUrl: 'js/dashboard/dashboard.template.html',
            controller: 'DashboardController'
        });

        $stateProvider.state('campusmap', {
            url: '/campusmap',
            templateUrl: 'js/campusmap/campusmap.template.html',
            controller: 'CampusMapController'
        });

        $stateProvider.state('busroutes', {
            url: '/busroutes',
            templateUrl: 'js/busroutes/busroutes.template.html',
            controller: 'BusRoutesMapController'
        });

        $stateProvider.state('dining', {
            url: '/dining',
            templateUrl: 'js/dining/dining.template.html',
            controller: 'DiningController'
        });

        $stateProvider.state('notes', {
            url: '/notes',
            templateUrl: 'js/notes/notes.template.html',
            controller: 'NotesController'
        });

        $stateProvider.state('quickLinks', {
            url: '/quicklinks',
            templateUrl: 'js/quicklinks/quicklinks.template.html',
            controller: 'QuickLinksController'
        });

        $stateProvider.state('sports', {
            url: '/sports',
            templateUrl: 'js/sports/sports.template.html',
            controller: 'SportsController'
        });

        $stateProvider.state('about', {
            url: '/about',
            templateUrl: 'js/about/about.template.html',
            controller: 'AboutController'
        });

        $urlRouterProvider.otherwise('/dashboard');
        $ionicConfigProvider.scrolling.jsScrolling(false);
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.views.transition('none');

    }



    angular
    .module('starter')
    .config(config)
    .controller('StarterController', function ($scope, $ionicHistory, $ionicPopover, $timeout) {
        $scope.$on('$ionicView.beforeEnter', function () {
            angular.element(document.getElementsByTagName('ion-header-bar')).addClass('visible');
        });
        $scope.myGoBack = function () {
            // Code to show popup and then go back
            angular.element(document.getElementsByClassName('animated fadeInRight'))
            .removeClass('animated fadeInRight')
            .addClass('animated slideOutRight');
            //angular.element(document.getElementsByTagName('ion-header-bar'))
            //.removeClass('animated fadeInDown')
            //.addClass('animated fadeOutUp');
            $timeout(function () {
                angular.element(document.getElementsByClassName('animated slideOutRight'))
                .removeClass('animated slideOutRight')
                .addClass('animated fadeInRight');
                //angular.element(document.getElementsByTagName('ion-header-bar'))
                //.removeClass('animated fadeOutUp')
                //.addClass('animated fadeInDown');
                $ionicHistory.goBack();
            }, 200); // this is now faster

            $("#dotMenu").hide().removeClass('animated slideInRight')
                  .addClass('animated slideOutRight');
            //$ionicHistory.clearCache();
        }

        //$scope.goTo = function (destination) {
        //    angular.element(document.getElementById('dashboard-animation'))
        //    .removeClass('animated fadeInLeft')
        //    .addClass('animated slideOutLeft');
        //    //angular.element(document.getElementsByTagName('ion-header-bar'))
        //    //.removeClass('animated slideInDown')
        //    //.addClass('animated fadeOutUp');
        //    $timeout(function () {
        //        angular.element(document.getElementById('dashboard-animation'))
        //        .removeClass('animated slideOutLeft')
        //        .addClass('animated fadeInLeft');
        //        angular.element(document.getElementsByClassName('title')).removeClass('mainTitle');
        //        $state.go(destination);
        //    }, 200); // This is now faster
        //}

        // this here code shows the menu
        $scope.showMenu = function () {
            $("#dotMenu")
                .removeClass('animated slideOutRight')
                .addClass('animated slideInRight').fadeIn(500);


        }

        // this here code hides the menu
        $scope.hideMenu = function () {
            $("#dotMenu").removeClass('animated slideInRight')
                .addClass('animated slideOutRight').fadeOut(500);

        }

    });

})();
