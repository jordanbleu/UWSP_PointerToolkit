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

        $stateProvider.state('campusEvents', {
            url: '/campusEvents',
            templateUrl: 'js/campusEvents/campusEvents.template.html',
            controller: 'campusEventsController'
        });

        $stateProvider.state('gpa', {
            url: '/gpa',
            templateUrl: 'js/gpa/gpa.template.html',
            controller: 'gpaController'
        });

        $stateProvider.state('wirelessReport', {
            url: '/wirelessReport',
            templateUrl: 'js/wirelessReport/wirelessReport.template.html',
            controller: 'WirelessReportController'
        });

        $urlRouterProvider.otherwise('/dashboard');
        $ionicConfigProvider.scrolling.jsScrolling(false);
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.views.transition('none');
        $ionicConfigProvider.backButton.previousTitleText(false);

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

            $timeout(function () {
                angular.element(document.getElementsByClassName('animated slideOutRight'))
                .removeClass('animated slideOutRight')
                .addClass('animated fadeInRight');

                $ionicHistory.goBack();
            }, 200); // this is now faster

            $("#dotMenu").hide().removeClass('animated slideInRight')
                  .addClass('animated slideOutRight');
            //$ionicHistory.clearCache();
        };

        $scope.swipeLeft = function () {
            showMenu();
        }


        // this here code shows the menu
        $scope.showMenu = function () {

            $("#ContentView").animate({
                opacity: 0.25
            }, 500);


            $("#dotMenu")
                .removeClass('animated slideOutRight')
                .addClass('animated slideInRight').fadeIn(500)
                .data("isOpen", true);


        };

        // this here code hides the menu
        $scope.hideMenu = function () {
            $("#ContentView").animate({
                opacity: 1
            }, 500);
            $("#dotMenu").removeClass('animated slideInRight')
                .addClass('animated slideOutRight').fadeOut(500)
                .data("isOpen", false);
        };

    });

})();
