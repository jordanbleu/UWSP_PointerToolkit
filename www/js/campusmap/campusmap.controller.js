(function () {
    'use strict';

    function CampusMapController($scope, $log, $ionicModal, $q, $http, leafletData) {
        // Set global variables
        var pageActive = true;//must start at true
        var leafletMap;
        var svg;
        var g;
        var buildingGeoJsonFilePath = 'js/campusmap/campusmap.geojson';
        var geojsoncollection;
        var fullBuildingData;
        var buildings;
        var interiorMapPath = 'assets/svg/';
        var transform = d3.geo.transform({ point: projectPoint });
        var d3path = d3.geo.path().projection(transform);
        var route;
        var mapkey = "mapzen-zwv6skb" // Mapzen API Key
        var currentPosition;


        /*----MAP SPECIFICATIONS----------------------------------*/
        angular.extend($scope, {
            maxbounds: {
                northEast: { lat: 44.541767, lng: -89.547171 },
                southWest: { lat: 44.515146, lng: -89.587087 }
            },
            center: { lat: 44.528700, lng: -89.571000, zoom: 16 },
            defaults: {
                tileLayer: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                maxZoom: 18,
                minZoom: 14,
                path: {
                    weight: 10,
                    color: '#800000',
                    opacity: 1
                },
                // -- buffer --
                edgeBufferTiles: 2,
            }
        });

        // Set event related to floating action button
        $scope.toggleFAB = function (e, floorsAvailable) {
            var fab = angular.element(document.getElementById(e));
            if (fab.hasClass("active")) {
                // Fab is currently active, make changes to deactivate
                fab.removeClass("active");
                angular.element(document.getElementsByTagName('tooltip')).removeClass("active");
                angular.element(document.getElementById(e + "-i")).addClass('ion-android-more-vertical');
                angular.element(document.getElementById(e + "-i")).removeClass('ion-android-close');
                for (var i = 0; i < floorsAvailable.length; i++) {
                    var fabContent = angular.element(document.getElementById("fab" + floorsAvailable[i]));
                    fabContent.removeClass('animated bounceIn');
                    fabContent.addClass('animated zoomOut');
                    fabContent.removeClass('visible');
                    fabContent.removeClass('UWSP-Gold');
                }
            }
            else {
                // FAB is currently not active, make changes to activate
                fab.addClass("active");
                angular.element(document.getElementsByTagName('tooltip')).addClass("active");
                angular.element(document.getElementById(e + "-i")).addClass('ion-android-close');
                angular.element(document.getElementById(e + "-i")).removeClass('ion-android-more-vertical');
                for (var i = 0; i < floorsAvailable.length; i++) {
                    var fabContent = angular.element(document.getElementById("fab" + floorsAvailable[i]));
                    fabContent.removeClass('animated zoomOut');
                    fabContent.addClass('animated bounceIn');
                    fabContent.addClass('visible');
                    if ($scope.floor == floorsAvailable[i]) {
                        fabContent.addClass('UWSP-Gold');
                    }
                }
            }
        }//end toggleFAB

        $scope.toggleCampusFAB = function (e) {
            var fab = angular.element(document.getElementById(e));
            angular.element(document.getElementsByTagName('tooltip')).removeClass("active");
            angular.element(document.getElementById(e + "-i")).addClass('ion-android-more-vertical');
            angular.element(document.getElementById(e + "-i")).removeClass('ion-android-close');
            var fabContent = angular.element(document.getElementsByClassName(e + "-content"));
            fabContent.removeClass('animated bounceIn');
            fabContent.addClass('animated zoomOut');
            fabContent.removeClass('visible');
            $scope.modalBuildingDropdown.show();
        }

        $scope.$on('$ionicView.beforeEnter', function () {
            pageActive = true;
            start();
        });

        $scope.$on('$ionicView.leave', function () {
            pageActive = false;
            // BuildingInfo modal
            $scope.modalBuildingInfo.remove();
            // BuildingInterior modal
            $scope.modalBuildingInterior.remove();
            // Dropdown modal
            $scope.modalBuildingDropdown.remove();
        });

        // Builds the Leaflet map after the GeoJson data is constructed
        function start(newBuildings) {
            if (!angular.isDefined(newBuildings)) {
                newBuildings = buildingGeoJsonFilePath;
            }
            getBuildingData(newBuildings).then(function () {
                leafletData.getMap('map').then(function (map) {
                    leafletMap = map;
                }).then(function () {
                    d3.json(buildingGeoJsonFilePath, function (collection) {
                        geojsoncollection = collection;
                        construct();
                    });
                });
            }
            , function (result) {
                alert('Woops! Something went wrong: ' + result);
            });
        }//end Start

        // Pulls the Geo data from the GeoJson file
        // defer holds execution until the data is available so the map is
        // not created until the data can be included
        function getBuildingData(newBuildings) {
            var deferred = $q.defer();
            $http.get(newBuildings).success(function (data) {
                deferred.resolve();
            })
            .error(function (response) {
                deferred.reject(response);
            });
            return deferred.promise;
        }//end getBuildingData

        // Construct the Map with all appropriate properties
        function construct() {
            svg = d3.select(leafletMap.getPanes().overlayPane).append("svg");
                        

            g = svg.append("g").attr("class", "leaflet-zoom-hide")
                .attr("width", "auto").attr("width", "auto");
            //g = svg.append("object").attr("class", "leaflet-zoom-hide")
            //    .attr("width", "auto").attr("width", "auto").attr("type", "image/svg+xml");


            // filters go in defs element
            var defs = svg.append("defs");
            // create filter with id #drop-shadow
            var filter = defs.append("filter")
            .attr("id", "drop-shadow") 
            .attr("height", "180%");
            // SourceAlpha refers to opacity of graphic that this filter will be applied to
            // convolve that with a Gaussian with standard deviation 2 and store result
            // in blur
                                //filter.append("feGaussianBlur")
                                //.attr("in", "SourceAlpha") //<------------------------------------- Commenting this out removes the blurriness
                                //.attr("stdDeviation", 2)
                                //.attr("result", "blur");
            // overlay original SourceGraphic over translated blurred opacity by using
            // feMerge filter. Order of specifying inputs is important!
            var feMerge = filter.append("feMerge");
            feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
            feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
            

            var fullBuildingData = geojsoncollection.features;

            buildings = g.selectAll("building")
              .data(fullBuildingData)
              .enter()
              .append("path")
              .attr("class", "building")
              .attr("id", function (d, i) { return fullBuildingData[i].properties.id; })
              .attr("name", function (d, i) { return fullBuildingData[i].properties.name; })
              .attr("address", function (d, i) { return fullBuildingData[i].properties.address; })
              .attr("imageUrl", function (d, i) { return fullBuildingData[i].properties.imageUrl; })
              .attr("center", function (d, i) { return fullBuildingData[i].properties.center; })
              .attr("entrance", function (d, i) { return fullBuildingData[i].properties.entrance; })
              .attr("maps", function (d, i) { return fullBuildingData[i].properties.maps; });
              //.style("filter", "url(#drop-shadow)");

            g.selectAll(".building").on("click", function (scope) {
                $scope.loadModal(this);
            });

            $scope.buildingList = buildings[0]; // add to scope for dropdown

            leafletMap.on("viewreset", redraw);
            redraw();
            loadLocationControl(leafletMap);

            // awesome marker icon settings
            var startIcon = L.AwesomeMarkers.icon({
                prefix: 'ion',
                icon: 'ion-arrow-down-a',
                markerColor: 'red'
            });

            var destinationIcon = L.AwesomeMarkers.icon({
                prefix: 'ion',
                icon: 'ion-star',
                markerColor: 'green'
            });

            // routing settings
            route = L.Routing.control({
                waypoints: [],
                router: L.Routing.mapzen(mapkey, { costing: 'pedestrian' }),
                id: "TheRoute",
                routeWhileDragging: false,
                draggableWaypoints: false,
                summaryTemplate: "",
                distanceTemplate: "",
                timeTemplate: "",
                show: false,
                createMarker: function (i, wp, n) {
                    if (i == 0) {
                        return L.marker(wp.latLng, {
                            draggable: false,
                            icon: startIcon
                        })
                    }
                    else {
                        return L.marker(wp.latLng, {
                            draggable: false,
                            icon: destinationIcon
                        })
                    }
                }
            }).addTo(leafletMap);

            // events for getting user position
            // function fired off when user's location is found
            function onLocationFound(pos) {
                currentPosition = pos.latlng;
            }

            // function fired off when user's location cannot be found
            // sometimes fires off even if user location is found
            function onFailedToFindLocation(e) {
                //alert(e.code + ": " + e.message);
            }

            leafletMap.on('locationfound', onLocationFound);
            leafletMap.on('locationerror', onFailedToFindLocation);


            fixWebkitBug();
        }//end construct()

        // Creates the BuildingInfo Modal and gets the appropriate variables for it's use
        $scope.loadModal = function (building) {
            // Centers the building that was interacted with to the center of the top half of the screen
            // above the half modal
            var coords = d3.select(building).attr("center").split(",");
            var target = new L.LatLng(coords[1], coords[0]);
            var targetPoint = leafletMap.project(target);
            targetPoint = L.point(targetPoint.x, (targetPoint.y + (leafletMap.getSize().y / 4)));
            var targetLatLng = leafletMap.unproject(targetPoint);
            leafletMap.panTo(targetLatLng);

            // Sets the variables used in the BuildingInfo modal
            $scope.building = {
                id: d3.select(building).attr("id"),
                name: d3.select(building).attr("name"),
                address: d3.select(building).attr("address"),
                imageUrl: d3.select(building).attr("imageUrl"),
                center: d3.select(building).attr("center")
            };

            $scope.modalBuildingInfo.show();
        }//end loadModal

        // used by dropdown to load modalBuildingInfo
        $scope.loadModalFromDropdown = function (id) {
            var myBuildings = buildings[0];
            var myBuilding;

            for (var i = 0; i < myBuildings.length; i++) {
                if (myBuildings[i].id == id) {
                    myBuilding = myBuildings[i];
                }
            }

            $scope.modalBuildingDropdown.hide();
            $scope.loadModal(myBuilding);
        }

        // Creates the BuildingInterial modal and gets the performs the appropriate changes to access the map files
        $scope.loadInteriorModal = function (id, floor) {
            var myFloor = floor;
            var floorsAvailable = new Array();
            var myBuildings = buildings[0];
            var myBuilding;
            var floorsAvailable;

            for (var i = 0; i < myBuildings.length; i++) {
                if (myBuildings[i].id == id) {
                    myBuilding = myBuildings[i];
                }
            }
            var floors = d3.select(myBuilding).attr("maps").split(",");

            // If a first floor map is not available, find the first available to set as default
            if (floor == null) {
                if (floors[1] != "") {
                    myFloor = 1; // first floor map is available, set that as default
                }
                else {
                    for (var i = 0; i < floors.length; i++) {
                        if (floors[i] != "") {
                            if (myFloor == null) {
                                myFloor = i;
                            }
                        }
                    }
                }
            }

            // get floors available
            for (var i = 0; i < floors.length; i++) {
                if (floors[i] != "") {
                    floorsAvailable.push(i);
                }
            }

            // Set scope variables from those calculated above
            $scope.floorsAvailable = floorsAvailable;
            $scope.floor = myFloor;
            $scope.modalBuildingInterior.show();
        }//end loadInteriorModal

        // Opens the map in an external browser.
        $scope.openFloorPlan = function (id, floor){
            var floorPath;

            var myBuildings = buildings[0];
            var myBuilding;

            for (var i = 0; i < myBuildings.length; i++) {
                if (myBuildings[i].id == id) {
                    myBuilding = myBuildings[i];
                }
            }

            floorPath = myBuilding.__data__.properties.maps[floor];
            $scope.closeModal(2);
            $scope.closeModal(1);

            window.open('https://campus.uwsp.edu/sites/facplan/campus/Evacuation%20Floor%20Plans/' + floorPath, '_system', 'location=yes');
        }

        // Redraws the map and building polygons when a map refresh is necessary
        function redraw() {
            if (pageActive) {
                var bounds = d3path.bounds(geojsoncollection),
                topLeft = bounds[0],
                bottomRight = bounds[1];
                //Here we set styles, width, height etc to the SVG.
                //Note that we're adding a little height and width so features don't get cut off
                buildings.attr("d", d3path)
                .style("fill", "#663ab6")
                .style("opacity", 1);

                // Setting the size and location of the overall SVG container
                svg.attr("width", bottomRight[0] - topLeft[0] + 120)
                .attr("height", bottomRight[1] - topLeft[1] + 120)
                .style("left", topLeft[0] - 50 + "px")
                .style("top", topLeft[1] - 50 + "px");

                g.attr("transform", "translate(" + (-topLeft[0] + 50) + "," + (-topLeft[1] + 50) + ")");
            }
        } // end redraw

        // Applies Geodata to latitude and longitude coordinates on the map
        function applyLatLngToLayer(d) {
            var y = d.geometry.coordinates[1]
            var x = d.geometry.coordinates[0]
            return leafletMap.latLngToLayerPoint(new L.LatLng(y, x))
        }//end applyLatLngToLayer

        // Use Leaflet to implement a D3 geometric transformation.
        function projectPoint(x, y) {
            //latLngToLayerPoint is a Leaflet conversion method:
            //Returns the map layer point that corresponds to the given geographical
            //coordinates (useful for placing overlays on the map).
            var point = leafletMap.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        } //end projectPoint

        // Defines the template for the BuildingInfo modal
        $ionicModal.fromTemplateUrl('js/campusmap/buildinginfo-modal.template.html', function ($ionicModal) {
            $scope.modalBuildingInfo = $ionicModal;
        }, {
            id: '1',
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-up'
        });

        // Defines the template for the BuildingInterior modal
        $ionicModal.fromTemplateUrl('js/campusmap/buildinginterior-modal.template.html', function ($ionicModal) {
            $scope.modalBuildingInterior = $ionicModal;
        }, {
            id: '2',
            // Use our scope for the scope of the modal to keep it simple
            scope: $scope,
            // The animation we want to use for the modal entrance
            animation: 'slide-in-right'
        });

        // drop down list of buildings modal
        $ionicModal.fromTemplateUrl('js/campusmap/buildingdropdown-modal.template.html', function ($ionicModal) {
            $scope.modalBuildingDropdown = $ionicModal;
        }, {
            id: '3',
            scope: $scope,
            animation: 'slide-in-up'
        });

        // Opens the specified modal
        $scope.openModal = function (index) {
            switch (index) {
                case 1:
                    $scope.modalBuildingInfo.show();
                    break;
                case 2:
                    $scope.modalBuildingInterior.show();
                    break;
                case 3:
                    $scope.modalBuildingDropdown.show();
                    break;
                default:
                    break;
            }
        };//end openModal

        // Closes the specified modal
        $scope.closeModal = function (index) {
            switch (index) {
                case 1:
                    $scope.modalBuildingInfo.hide();
                    $scope.floor = null;
                    break;
                case 2:
                    $scope.modalBuildingInterior.hide();
                    break;
                case 3:
                    $scope.modalBuildingDropdown.hide();
                    break;
                default:
                    break;
            }
        };//end closeModal

        // On Modal Load
        $scope.$on('modal.shown', function (event, modal) {
            if (modal.id == 1) {
                // Sets the address text block to the correct width and centers it on the page.
                // Small delay required because ionic doesn't immediately clear old modal data
                setTimeout(setWidth, 10);

            };
        }
        );

        // Sets the address text block to the correct width and centers it on the page.
        function setWidth() {
            var imageWidth = document.querySelector("#thumbnail").width;
            document.getElementById("addressText").style.width = imageWidth + "px";
        }

        // Modal destruction
        $scope.$on('$destroy', function () {
            $scope.modalBuildingInfo.remove();
            $scope.modalBuildingInterior.remove();
            $scope.modalBuildingDropdown.remove();
        }
        );

        // Creates the Location control with the approriate settings and adds it to the map
        function loadLocationControl(leafletMap) {
            if ($(".leaflet-bar-part-single").length == 0) {
                var locateControl = L.control.locate({
                    position: 'topleft',  // set the location of the control
                    layer: svg,  // use your own layer for the location marker
                    drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
                    follow: true,  // follow the user's location
                    setView: true, // automatically sets the map view to the user's location, enabled if `follow` is true
                    keepCurrentZoomLevel: true, // keep the current map zoom level when displaying the user's location. (if `false`, use maxZoom)
                    stopFollowingOnDrag: true, // stop following when the map is dragged if `follow` is true (deprecated, see below)
                    remainActive: false, // if true locate control remains active on click even if the user's location is in view.
                    markerClass: L.circleMarker, // L.circleMarker or L.marker
                    circleStyle: {},  // change the style of the circle around the user's location
                    markerStyle: {},
                    followCircleStyle: {},  // set difference for the style of the circle around the user's location while following
                    followMarkerStyle: {},
                    icon: 'fa fa-map-marker',  // class for icon, fa-location-arrow or fa-map-marker
                    iconLoading: 'fa fa-spinner fa-spin',  // class for loading icon
                    circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
                    metric: false,  // use metric or imperial units
                    onLocationError: function (err) { alert(err.message) },  // define an error callback function
                    onLocationOutsideMapBounds: function (context) { // called when outside map boundaries
                        alert(context.options.strings.outsideMapBoundsMsg);
                    },
                    showPopup: true, // display a popup when the user click on the inner marker
                    strings: {
                        title: "Show me where I am",  // title of the locate control
                        metersUnit: "meters", // string for metric units
                        feetUnit: "feet", // string for imperial units
                        popup: "You are within {distance} {unit} from this point",  // text to appear if user clicks on circle
                        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
                    },
                    locateOptions: { enableHighAccuracy: true }  // define location options e.g enableHighAccuracy: true or maxZoom: 10
                });

                locateControl.addTo(leafletMap);
            }
        };//end loadLocationControl


        // finds the building entrance closest to the user
        function findClosestEntrance(building) {
            var result = L.latLng();
            var distance = 0;

            if (currentPosition != null) {
                for (var i = 0; i < building.__data__.properties.entrance.length; i++) {
                    var x = currentPosition.lat - building.__data__.properties.entrance[i][1];
                    var y = currentPosition.lng - building.__data__.properties.entrance[i][0];

                    var newDistance = Math.sqrt(x * x + y * y);

                    if (newDistance < distance || distance == 0) {
                        distance = newDistance;
                        result = L.latLng(building.__data__.properties.entrance[i][1], building.__data__.properties.entrance[i][0]);
                    }
                }
            }

            return result;
        }

        // draws route from user's location to selected building
        $scope.routeToBuilding = function (id) {
            var myBuildings = buildings[0];
            var myBuilding;

            for (var i = 0; i < myBuildings.length; i++) {
                if (myBuildings[i].id == id) {
                    myBuilding = myBuildings[i];
                }
            }

            leafletMap.locate();
            var startingPoint;
            var buildingEntrance;

            function setStartingPoint() {
                var inBuilding = false;
                var buildingIndex;
                var x = currentPosition.lat;
                var y = currentPosition.lng;

                for (var i = 0; i < myBuildings.length; i++) {
                    var polyPoints = [];
                    for (var i2 = 0; i2 < myBuildings[i].__data__.geometry.coordinates[0].length; i2++) {
                        polyPoints[i2] = L.latLng(myBuildings[i].__data__.geometry.coordinates[0][i2][1], myBuildings[i].__data__.geometry.coordinates[0][i2][0]);
                    }
                    for (var i3 = 0, j = polyPoints.length - 1; i3 < polyPoints.length; j = i3++) {
                        var xi = polyPoints[i3].lat;
                        var yi = polyPoints[i3].lng;
                        var xj = polyPoints[j].lat;
                        var yj = polyPoints[j].lng;

                        var intersect = ((yi > y) != (yj > y))
                            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                        if (intersect) {
                            inBuilding = !inBuilding;
                        }
                    }

                    if (inBuilding) {
                        buildingIndex = i;
                        break;
                    }
                }

                if (inBuilding) {
                    startingPoint = findClosestEntrance(myBuildings[i]);
                }
                else {
                    startingPoint = currentPosition;
                }
            }

            function setBuildingEntrance() {
                buildingEntrance = findClosestEntrance(myBuilding);
            }

            function setWaypoints() {
                route.setWaypoints([
                    startingPoint,
                    buildingEntrance,
                ]);
            }

            setTimeout(setStartingPoint, 250);
            setTimeout(setBuildingEntrance, 250);
            setTimeout(setWaypoints, 250); // small delay required for user location to be found

            $scope.modalBuildingInfo.hide();
        }
    }//End Controller

    /*--MODULE GETTER/CONTROLLER FUNCTION CALL----------------------------------*/
    angular
    .module('campusmap')
    .controller('CampusMapController', CampusMapController);

})();


function fixWebkitBug() {

}