(function () {
  'use strict';

  angular
    .module('starter',
            ['ionic',
             'campusmap',
             'dashboard',
             'busroutes',
             'dining',
             'notes',
             'quickLinks',
			 'sports',
             'about',
             'campusEvents',
             'gpa',
             'wirelessReport',
             '720kb.tooltips'
           ]);

  //instantiate submodules here
  angular
    .module('dashboard', []);

  angular
    .module('campusmap', ['leaflet-directive','swipe']);

  angular
    .module('busroutes', ['leaflet-directive', 'swipe']);

  angular
    .module('dining', ['leaflet-directive', 'swipe']);

  angular
    .module('notes', ['leaflet-directive', 'swipe']);

  angular
    .module('quickLinks', ['leaflet-directive', 'swipe']);
	
  angular
    .module('sports', ['leaflet-directive', 'swipe']);

  angular
    .module('about', ['leaflet-directive', 'swipe']);

  angular
    .module('campusEvents', ['leaflet-directive', 'swipe']);

  angular
    .module('gpa', ['leaflet-directive', 'swipe']);

  angular
    .module('wirelessReport', ['leaflet-directive', 'swipe']);
	
})();
