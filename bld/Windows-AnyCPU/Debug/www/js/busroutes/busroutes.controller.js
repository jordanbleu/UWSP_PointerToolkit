(function () {
  'use strict';
  var BusRoutesMapController = function($rootScope, $ionicModal, $interval, $timeout, $q, $http, $scope, $log, leafletData, $window) {

//objects
    var leafletMap;//leaflet map object reference
    var geojsoncollection;//object containing data from the geojson busroute file
    var eta;//this is the interval callback. if defined, eta is tracking times, if undefined, eta is not.
    var busIcon;//SVG image file reference
    var busRoutes = {
      campusConnection: {
        times: "assets/json/campusconnection.times.json",
        path: "assets/json/campusconnection.path.geojson"
      },
      campusShopping: {
        times: "assets/json/campusShopping.times.json",
        path: "assets/json/campusShopping.path.geojson"
      }
    };
//arrays
    var busTimes; //array holding all times for reach stop. ([array position (stop)][1 for times][times])
    var fullPathData;//array of coordinates featuring the full path
    var pathData;//array of coordinates featuring the current path the bus is on
    var allStops;//array of coordinates featuring only data pertaining to stops
    var currentTimes = [];//array tracking specified times. (for ETA and modal data)
//bools
    var runWeekdays;//bool indicating if bus runs on weekdays (setBusRouteData, isBusRunning)
    var runSaturday;//bool indicating if bus runs on saturday (setBusRouteData, isBusRunning)
    var pageActive = true;//bool for functions to determine if they should continue running or not. Must start at true.
    var busActive;//bool determinig if functions run or not
//ints
    var adjust = 0;//adjust time if in the middle of the going through path. 0 is default.
    var duration = 0;//used for animation of route. 0 is default
    var currPath = 1;//track the current path bus is on. 1 is default
    var currPathIndex;//int tracking current index of path
    var nextPathIndex;//int tracking index for the next path
    var currETAIndex;//int tracking index for the current paths ETA
//Strings
    var currRoute;//String referencing the name of the current bus route
//SVG/D3 objects
    var svg;//DOM object reference to leaflet svg in overlay panes layer
    var g;//DOM object reference to SVG element g
    var fullPath;//D3/SVG path
    var marker;
    var linePath;
    var stops;
    var etaText;//DS/SVG text that indicates the time till bus arrives at specified stop (14')
//D3 specific
    var transform = d3.geo.transform({point: projectPoint});
    var d3path = d3.geo.path().projection(transform);
    //generate a line from input points.
    //input points will be in Lat/Long
    //applyLatLngToLayer method converst to map units
    var toLine = d3.svg.line()
    .interpolate("linear")
    .x(function(d) {
      return applyLatLngToLayer(d).x
    })
    .y(function(d) {
      return applyLatLngToLayer(d).y
    });
//end variables -------------------
//-----------------------------------------------
//EVENT LISTENERS ------------------------------------------------------------
    $scope.$on('$ionicView.beforeEnter', function() {
      pageActive = true;
      if(busActive) {
        etaStart();
      } else {
        start();
      }
    });

    $scope.$on('$ionicView.leave', function() {
      etaStop();
      d3.select('marker').transition();
      pageActive = false;
      $scope.modal1.remove();
      $scope.modal2.remove();
    });

    $scope.$on('$destroy', function() {
      $scope.modal1.remove();
      $scope.modal2.remove();
      $scope.modal3.remove();
    });
//end event listeners -------------
//---------------------------------------------------
//$SCOPE FUNCTIONS ------------------------------------------------------------
    $scope.toggleFAB = function(e) {
      var fab = angular.element(document.getElementById(e));
      if(fab.hasClass("active")) {
        fab.removeClass("active");
        angular.element(document.getElementsByTagName('tooltip')).removeClass("active");
        angular.element(document.getElementById(e + "-i")).addClass('ion-android-more-vertical');
        angular.element(document.getElementById(e + "-i")).removeClass('ion-android-close');
        var fabContent = angular.element(document.getElementsByClassName(e + "-content"));
        fabContent.removeClass('animated bounceIn');
        fabContent.addClass('animated zoomOut');
        fabContent.removeClass('visible');

      } else {
        fab.addClass("active");
        angular.element(document.getElementsByTagName('tooltip')).addClass("active");
        angular.element(document.getElementById(e + "-i")).addClass('ion-android-close');
        angular.element(document.getElementById(e + "-i")).removeClass('ion-android-more-vertical');
        var fabContent = angular.element(document.getElementsByClassName(e + "-content"));
        fabContent.removeClass('animated zoomOut');
        fabContent.addClass('animated bounceIn');
        fabContent.addClass('visible');
      }

    }

    $scope.startCampusConnection = function() {
      d3.select('marker').transition();
      angular.element(document.getElementsByClassName("routeSVG")).remove();
      etaStop();
      currRoute = "Campus Connection";
      start(busRoutes.campusConnection);
    }

    $scope.startCampusShopping = function() {
      d3.select('marker').transition();
      angular.element(document.getElementsByClassName("routeSVG")).remove();
      etaStop();
      currRoute = "Campus Shopping";
      start(busRoutes.campusShopping);
    }

    $scope.openModal = function(index) {
     if (index == 1) {
       $scope.modal1.show();
     } else if (index == 2) {
       $scope.modal2.show();
     } else {
       $scope.modal3.show();
     }
   };

   $scope.closeModal = function(index) {
     if (index == 1) {
       $scope.modal1.hide();
     } else if (index == 2) {
       $scope.modal2.hide();
     } else {
       $scope.modal3.hide();
     }
   };

    $scope.loadModalData = function (stop) {
      if (isNaN(stop)) {
        stop = d3.select(stop).attr("id");
      } else {
        if (stop == 1) {
          if ($scope.currFocus == 7) {
            stop = 1;
          } else {stop = $scope.currFocus + 1;}
        } else if (stop == -1) {
          if ($scope.currFocus == 1) {
            stop = 7;
          } else {stop = $scope.currFocus - 1;}
        }
      }
      var target = (allStops[stop - 1].geometry.coordinates);
      var targetPoint = leafletMap.project([target[1], target[0]]);
      targetPoint = L.point(targetPoint.x, (targetPoint.y + (leafletMap.getSize().y / 4)));
      var targetLatLng = leafletMap.unproject(targetPoint);
      leafletMap.panTo(targetLatLng);
      $scope.stopName = allStops[stop - 1].properties.name;
      $scope.currRoute = currRoute;
      $scope.currFocus = Number(stop);
      if ($scope.currFocus== 7) {
        $scope.selectedOption = 2;
      } else {
        $scope.selectedOption = $scope.currFocus+ 1;
      }
      $scope.nextStop = currentTimes[stop-1];
      $scope.lastStop = busTimes[stop-1][1][busTimes[0][1].length-1];
      $scope.firstStop = busTimes[stop-1][1][0];
      $scope.expanded=false;
      $scope.timesList = busTimes;
      $scope.routeOptions = [];
      for(var i = 0; i<allStops.length; i++) {
        $scope.routeOptions[i] = {name: allStops[i].properties.name, id: allStops[i].properties.stop};
      }
      $scope.modal1.show();
    }
//end $scope functions -----------------------
//----------------------------------------------------------
//MODAL INSTANTIATION & FUNCTIONS --------------------------------------------
    $ionicModal.fromTemplateUrl('js/busroutes/busstop-modal.template.html', function($ionicModal) {
      $scope.modal1 = $ionicModal;
    }, {
      id: '1',
      // Use our scope for the scope of the modal to keep it simple
      scope: $scope,
      // The animation we want to use for the modal entrance
      animation: 'slide-in-up'
    });
    $ionicModal.fromTemplateUrl('js/busroutes/bustimes-modal.template.html', function($ionicModal) {
      $scope.modal2 = $ionicModal;
    }, {
      id: '2',
      // Use our scope for the scope of the modal to keep it simple
      scope: $scope,
      // The animation we want to use for the modal entrance
	  //COME BACK
      animation: 'slide-in-left'
    });
    $ionicModal.fromTemplateUrl('js/busroutes/bustimes-modal2.template.html', function($ionicModal) {
      $scope.modal3 = $ionicModal;
    }, {
      id: '3',
      // Use our scope for the scope of the modal to keep it simple
      scope: $scope,
      // The animation we want to use for the modal entrance
      animation: 'slide-in-right'
    });


    function resetModalData() {
      $scope.selectedOption1 = 1;
      $scope.selectedOption2 = 2;
      $scope.currRoute = currRoute;
      $scope.timesList = busTimes;
      $scope.routeOptions = [];

      allStops = geojsoncollection.features.filter(function(d) {
        return d.properties.stop != "no"
      });
      for(var i = 0; i<allStops.length; i++) {
        $scope.routeOptions[i] = {name: allStops[i].properties.name, id: allStops[i].properties.stop};
      }
    }
//end modal instantiation & functions ------------
//LEAFLET MAP CUSTOMIZATION & INSTANTIATION----------------------
    angular.extend($scope, {
      maxbounds: {
        northEast: {lat: 44.571183, lng: -89.477477},
        southWest: {lat: 44.435591, lng: -89.612889}
      },
      center: {lat: 44.528872, lng: -89.571870, zoom: 13},
      defaults: {
        tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
        maxZoom: 18,
        minZoom: 12,
        path: {
          weight: 10,
          color: '#800000',
          opacity: 1
        }
      }
      //markers: {m1: {lat: 44.52884, lng: -89.58578}}
    });
//end leafet map customization & instantiation ----------
//-----------------------------------------------------------------
//MAIN BUS ROUTE FUNCTIONS ----------------------------------------------------
    function start(newRoute) {
      //if we passed in a specific route we'll start that route.
      //otherwise default to Campus Connection.
      if (!angular.isDefined(newRoute)) {
        newRoute = busRoutes.campusConnection;
        currRoute = "Campus Connection";
      }
      //set the data for the specific route
      setBusRouteData(newRoute).then(function() {//NOTE: setBusRouteData return a promise so the nested code wont run until then
        //based off data: if bus is running then do more stuff and begin to construct
        // else we'll do nothing
        if (isBusRunning()) {
          busActive = true;
          setBusPathAndDuration();
          leafletData.getMap('map1').then(function(map) {
            leafletMap = map;
            d3.xml("assets/svg/bus.svg", "image/svg+xml", function(xml) {
              busIcon = xml.documentElement;
              construct();
            });
          });
        }
      }, function(result) {
        alert('Woops! Something went wrong here: ' + result);
        console.log(result);
      });
    }//end start()


    function setBusRouteData(newRoute) {
      var deferred = $q.defer();
      var currDay = new Date().getDay();
      $http.get(newRoute.times).success(function(data) {
        busTimes = data.times;
        busActive = false;
        runSaturday = data.saturday;
        if (runSaturday && angular.isDefined(data.timesSaturday) && currDay == 6) {
          busTimes = data.timesSaturday;
        }
        runWeekdays = data.weekdays;
        d3.json(newRoute.path, function(collection) {
          //This uses the d3 filter function
          // currPath is an array of point objects
          geojsoncollection = collection;
          deferred.resolve();
          resetModalData();
        })

      })
      .error(function(response) {
        deferred.reject(response);
      });
      return deferred.promise;
    }//end setBusRouteData

    function setBusPathAndDuration() {
      if (!isBusRunning()) {
        busActive = false;
        return;
      }
      //First grab currenttime
      var currTime = getCurrentTime();
      var target = currTime;
      currPathIndex = 0;
      currETAIndex = 0;
      //then find where bus should be based on currTime using closest function
      for(var i = 0; i < busTimes[0][1].length; i++) {
        for(var j = 0; j < busTimes.length; j++) {
          if (timestampToMS(busTimes[j][1][i]) <= target) {
            currPathIndex = j;
            currETAIndex = i;
          }
        }
      }
      //now we set the current path to that location
      var nextETAIndex;
      currPath = busTimes[currPathIndex][0];
      if ((currPathIndex+1) >= busTimes.length) {
        nextPathIndex = 0;
        if((currETAIndex+1 >= busTimes[0][1].length)) {
          nextETAIndex = currETAIndex;
        } else {
          nextETAIndex = currETAIndex + 1;
        }
      } else {
        nextPathIndex = currPathIndex + 1;
        nextETAIndex = currETAIndex;
      }
      //now lets calculate the start and end time
      var startStopTime = timestampToMS(busTimes[currPathIndex][1][currETAIndex]);
      var endStopTime = timestampToMS(busTimes[nextPathIndex][1][nextETAIndex]);;
      //and how long it should take based on what the current time is
      var busETA = endStopTime - currTime;
      //and set the duration
      duration = endStopTime-startStopTime;
      //we gotta adjust the time and location so that the bus is placed where
      //it should actually be (somewhere between start and end)
      adjust = 1-(busETA/duration);
    }//end setBusPathAndDuration()

    function construct() {
      //grab the leaflet layer to append our busroute svg
      svg = d3.select(leafletMap.getPanes().overlayPane).append("svg").attr("class", "routeSVG");
      //define the svg element we'll be appending to the DOM
      g = svg.append("g").attr("class", "leaflet-zoom-hide");

      fullPathData = geojsoncollection.features.filter(function(d) {
        return d.properties.id = "route1"
      });
      pathData = geojsoncollection.features.filter(function(d) {
        return d.properties.path == currPath;
      });
      allStops = geojsoncollection.features.filter(function(d) {
        return d.properties.stop != "no"
      });

      // Now we are appending our features to the group element.
      fullPath = g.selectAll(".routeConnect")
      .data([fullPathData])
      .enter()
      .append("path")
      .attr("class", "routeConnect")
      .style("cursor", "grab")
      .style("stroke", "#2464bc")
      .style("fill", "none")
      .style("stroke-width", "7px")
      .style("opacity", 1);

      //We surround the currPath with [] to tell d3 to treat all the points as a single line.
      linePath = g.selectAll(".lineConnect")
      .data([pathData])
      .enter()
      .append("path")
      .attr("class", "lineConnect")
      .style("cursor", "grab")
      .style("fill", "none")
      .style("stroke", "#00a3ff")
      .style("stroke-width", "7px")
      .style("opacity", 1);

      // filters go in defs element
      var defs = svg.append("defs");
      // create filter with id #drop-shadow
      var filter = defs.append("filter")
      .attr("id", "drop-shadow")
      .attr("height", "180%");
      // SourceAlpha refers to opacity of graphic that this filter will be applied to
      // convolve that with a Gaussian with standard deviation 2 and store result
      // in blur
      filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 2)
      .attr("result", "blur");
      // overlay original SourceGraphic over translated blurred opacity by using
      // feMerge filter. Order of specifying inputs is important!
      var feMerge = filter.append("feMerge");
      feMerge.append("feMergeNode")
      .attr("in", "offsetBlur")
      feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");

      //Highlight key bus stops
      stops = g.selectAll(".stops")
      .data(allStops)
      .enter()
      .append("circle")
      .attr("class", "stops")
      .attr("r", 16)
      .attr("id", function(d, i) { return allStops[i].properties.stop; })
      .style("fill", "#df583d")
      .style("cursor", "pointer")
      .style("z-index", "1000")
      .style("opacity", "1")
      .style("filter", "url(#drop-shadow)");

      //attach click event to stops (to load modal w/ more info)
      g.selectAll(".stops").on("click", function(scope) {
        $scope.loadModalData(this);
      });

      //append text on top of the stops which will indicate the eta
      etaText = g.selectAll("text")
      .data(allStops)
      .enter()
      .append("text")
      .attr("class", "eta")
      .attr("text-anchor", "middle")
      .style("pointer-events", "none")
      .attr("y", function(d) {
        return 4
      })
      .attr("x", function(d) {
        return 0
      });

      //the marker is the BUS which translates along the path
      marker = g.append("g")
      .attr("id", "marker")
      .attr("class", "travelMarker")
      .style("pointer-events", "none")
      .style("filter", "url(#drop-shadow)");
      //append the bus icon to the marker element
      angular.element(document.getElementById('marker')).append(busIcon);

      etaStart();
      leafletMap.on("viewreset", redraw);// when the user zooms in or out you need to reset the view
      redraw();
      transition();
    }//end construct()

    function redraw() {
      if (pageActive && busActive) {
        var bounds = d3path.bounds(geojsoncollection),
        topLeft = bounds[0],
        bottomRight = bounds[1];

        //Here we position the appended SVG elements
        //We also set styles, width, height etc to the SVG.

        etaText.attr("transform",
        function(d) {
          return "translate(" +
          applyLatLngToLayer(d).x + "," +
          applyLatLngToLayer(d).y + ")";
        });

        stops.attr("transform",
        function(d) {
          return "translate(" +
          applyLatLngToLayer(d).x + "," +
          applyLatLngToLayer(d).y + ")";
        });

        marker.attr("transform",
        function() {
          var y = pathData[0].geometry.coordinates[1]
          var x = pathData[0].geometry.coordinates[0]
          return "translate(" +
          leafletMap.latLngToLayerPoint(new L.LatLng(y, x)).x + "," +
          leafletMap.latLngToLayerPoint(new L.LatLng(y, x)).y + ")";
        });
        // Setting the size and location of the overall SVG container
        svg.attr("width", bottomRight[0] - topLeft[0] + 120)
        .attr("height", bottomRight[1] - topLeft[1] + 120)
        .style("left", topLeft[0] - 50 + "px")
        .style("top", topLeft[1] - 50 + "px");

        fullPath.attr("d", toLine);
        linePath.attr("d", toLine);

        g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
      }
    } // end redraw

    //Set the animation
    function transition() {
      if (pageActive && busActive) {
        marker.transition()
        .duration(duration)
        .ease('linear')
        .attrTween("transform", tweenTimeDistance);
      }
    } //end transition

    function tweenTimeDistance() {

      return function(t) {
        t += adjust;
        if (t>=1) {
          adjust = 0;
          //when we've reached the end of the path we need to update
          //our data for the next path (next stop)
          updatePathData();
        }
        //total length of path (single value)
        var l = linePath.node().getTotalLength();

        // p is the point on the line (coordinates) at a given length
        // along the line. Ex: if l=50 and we're midway through
        // the time then this would be 25.
        var p = linePath.node().getPointAtLength(t * l);

        //Move the marker to that point as long as bus is active
        if (busActive) {
          return "translate(" + p.x.toFixed(4) + "," + p.y.toFixed(4) + ")"; //move marker
        } else {
          var p = linePath.node().getPointAtLength(1 * l);
          return "translate(" + p.x.toFixed(4) + "," + p.y.toFixed(4) + ")"; //move marker
        }
      }
    } //end tweenDash

    function updatePathData() {
      //reset the data to next path
      setBusPathAndDuration();
      //if still active set new pathData for curr Path and redraw, begin animation, and update the ETA times
      if (pageActive && busActive) {
        pathData = geojsoncollection.features.filter(function(d) {
          return d.properties.path==currPath;
        });
        g.selectAll(".lineConnect").data([pathData]);

        redraw();
        transition();
        etaStart();
      }
    }//end updatePathData

    function etaStart() {
      var startPath = nextPathIndex;
      var startETA = currETAIndex;
      var arrETA = [];

      //first path is 1, not 0.
      if (startPath == 0) {
        startETA++;
      }

      //spit all times based on current location of bus into an arrETA
      for(var i = 0; i < busTimes.length; i++) {
        var etaTime;
        if(startPath >= busTimes.length-1 && startETA >= busTimes[0][1].length-1  ) {
          etaTime = Math.abs(Math.floor((timestampToMS(busTimes[busTimes.length-1][1][busTimes[0][1].length-1]) - getCurrentTime())/1000/60));
          arrETA[busTimes.length-1] = etaTime + "′";
          currentTimes[busTimes.length-1] = busTimes[busTimes.length-1][1][busTimes[0][1].length-1];
        } else {
          if(startPath>=busTimes.length) {
            startPath = 0;
            startETA++;
          }
          etaTime = Math.abs(Math.floor((timestampToMS(busTimes[startPath][1][startETA]) - getCurrentTime())/1000/60));
          currentTimes[startPath] = busTimes[startPath][1][startETA];
          arrETA[startPath] = etaTime + "′ ";
          startPath++;
        }
      }
      //since our first and last stop is the same location we'll just keep the first one empty.
      //this is for visual UX
      arrETA[0] = "";

      //append ETA data to text svg elements
      etaText.text(function(d, i) { return arrETA[i];});

      //if we've already created the ETA interval then dont create it again (return)
      // else create the interval and have it update every minute.
      if (angular.isDefined(eta)) {
        return;
      } else {
        eta = $interval(function() {
          etaStart();
        }, 60000);
      }
    }

    function etaStop() {
      //clear the interval if it is defined
      if (angular.isDefined(eta)) {
        $interval.cancel(eta);
        eta = undefined;
      }
    }
//end main bus routes functions --------------
//-------------------------------------------------------
//UTILITY FUNCTIONS --------------------------------------------------------
    function applyLatLngToLayer(d) {
      var y = d.geometry.coordinates[1]
      var x = d.geometry.coordinates[0]
      return leafletMap.latLngToLayerPoint(new L.LatLng(y, x))
    }
    function projectPoint(x, y) {
      //latLngToLayerPoint is a Leaflet conversion method:
      //Returns the leafletMap layer point that corresponds to the given geographical
      //coordinates (useful for placing overlays on the leafletMap).
      var point = leafletMap.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    } //end projectPoint

    function timestampToMS (t) {
      //takes a string timestamp in the format of "hour:minute"
      //converts the time to milliseconds
      t.toString();
      var hour = t.substr(0, t.indexOf(':'));
      var minute = t.substr((t.indexOf(':')+1), t.length);
      hour = hour * 60 * 60;
      minute = minute * 60;
      var convertedTime = (hour + minute) * 1000;
      return convertedTime;
    }

    function getCurrentTime() {
      var hour = new Date().getHours();
      var min = new Date().getMinutes();
      var sec = new Date().getSeconds();
      hour = hour * 60 * 60;
      min = min * 60;
      var currTime = ((sec + min + hour) * 1000);
      return currTime;
    }

    function isBusRunning() {
      var currDay = new Date().getDay();
      var currTime = getCurrentTime();
      var endTime = timestampToMS(busTimes[busTimes.length-1][1][busTimes[0][1].length-1]);
      var startTime = timestampToMS(busTimes[0][1][0]);

      //remove our DOM error layer in the template by default
      angular.element(document.getElementById('busError')).removeClass('visible');
      //only reappend this layer (make visibile) if the bus is not running.
      if (runWeekdays && (currDay>0 && currDay<6))  {
        if ((currTime>startTime) && (currTime<endTime)) {
          return true;
        } else {
          $scope.busError = currRoute + " begins running at: " + busTimes[0][1][0];
          angular.element(document.getElementById('busError')).addClass('visible');
          return false;
        }
      } else if (runSaturday && currDay == 6) {
        if ((currTime>startTime) && (currTime<endTime)) {
          return true;
        } else {
          $scope.busError = currRoute + " begins running at: " + busTimes[0][1][0];
          angular.element(document.getElementById('busError')).addClass('visible');
          return false;
        }
      } else {
        $scope.busError = currRoute + " does not run today.";
        angular.element(document.getElementById('busError')).addClass('visible');
        return false;
      }
    }
//end utility functions ---------------------
//----------------------------------------------------------
  }//END CONTROLLER

  angular
  .module('busroutes')
  .controller('BusRoutesMapController', BusRoutesMapController);
})();
