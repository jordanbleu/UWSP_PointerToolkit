// This function processes the controller when its ready.
(function () {
    'use strict';

    angular
		.module('wirelessReport', [])
		.controller('WirelessReportController', WirelessReportController);

    function WirelessReportController($scope, $ionicHistory, $timeout, $state, $ionicPopup) {
        $scope.data = {};
        $scope.showConfirm = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Wireless Diagnostics',
                template: 'This will run a Wireless Report to be emailed to UWSP for troubleshooting. ' +
                    'Are you sure you would like to continue?'
            });

            confirmPopup.then(function (res) {
                if (res) {
                    getDeviceInfo();
                } else {
                    $ionicHistory.goBack();
                }
            });
        };
        $scope.showConfirm();
    }
})();

//variable to hold device information later to be converted to csv
var WifiReportCSV = 'Device Platform, Device UUID, Device Version, Connection Type, ' +
                    'Latitude, Longitude, Accuracy, Timestamp, Signal Strength';
var date = new Date();
var logFileName = 'wifiReport-' + formatDateToYMDHMS(date);

function getDeviceInfo() {
    var element = document.getElementById('deviceProperties');
    element.innerHTML = 'Device Platform: ' + device.platform + '<br />' +
                        'Device UUID: ' + device.uuid + '<br />' +
                        'Device Version: ' + device.version + '<br />';

    if (device.platform === "Android") {
        androidCommands();
    }
    else if (device.platform === "iOS") {
        appleCommands();
    }
    else {
        alert('This feature is not supported on this platform.')
    }

    WifiReportCSV = WifiReportCSV + device.platform + ', ' + device.uuid + ', ' + device.version + ', ';
}

function androidCommands() {
    checkConnection();
    getGPSCoords();
    getSignalStrength();
    getConnectionInfo();
    composeEmail();
}

function appleCommands() {
    checkConnection();
    getGPSCoords();
    getSignalStrength();
}

function checkConnection() {

    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN] = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI] = 'WiFi connection';
    states[Connection.CELL_2G] = 'Cell 2G connection';
    states[Connection.CELL_3G] = 'Cell 3G connection';
    states[Connection.CELL_4G] = 'Cell 4G connection';
    states[Connection.CELL] = 'Cell generic connection';
    states[Connection.NONE] = 'No network connection';

    var element = document.getElementById('connectionType');
    element.innerHTML = 'Connection type: ' + states[networkState];

    WifiReportCSV = WifiReportCSV + states[networkState] + ', ';
}

function getGPSCoords() {
    var onSuccess = function (position) {
        var GPSlocation = ('Latitude: ' + position.coords.latitude + '<br />' +
         'Longitude: ' + position.coords.longitude + '<br />' +
         'Accuracy: ' + position.coords.accuracy + '<br />' +
         'Timestamp: ' + new Date(position.timestamp) + '<br />');

        var element = document.getElementById('GPSCoords');
        element.innerHTML = 'GPS Information: <br />' + GPSlocation;

        WifiReportCSV = WifiReportCSV + position.coords.latitude + ', ' + position.coords.longitude + ', ' +
                                        position.coords.accuracy + ', ' + formatDateToYMDHMS(date) + ', ';
    };
    var onFailure = function (position) {
        var element = document.getElementById('GPSCoords');
        element.innerHTML = 'GPS Location: Failed';

        WifiReportCSV = WifiReportCSV + 'null, null, null, null, null, ' + formatDateToYMDHMS(date);
    }
    var GPSLocation = navigator.geolocation.getCurrentPosition(onSuccess, onFailure);
}

function getSignalStrength() {
    window.SignalStrength.dbm(
        function (measuredDbm) {
            var element = document.getElementById('signalStrength');
            element.innerHTML = 'Signal Strength: ' + measuredDbm;

            WifiReportCSV = WifiReportCSV + measuredDbm;
        })
}

function composeEmail() {
    var att = btoa(WifiReportCSV);
    cordova.plugins.email.open({
        to: 'mbuta331@uwsp.edu',
        //cc: '',
        //bcc: ['john@doe.com', 'jane@doe.com'],
        subject: 'Test',
        body: 'Test',
        attachments: 'base64:' + logFileName + '.csv//' + att
    })
}

function getConnectionInfo() {
    var results = AccessPoon
}

//function getConnectionInfo() {
//    startScan();
//    function startScan() {
//        WifiWizard.startScan(success, fail);
//        var element = document.getElementById('connectionInfo');
//        element.innerHTML = 'Started scan...';
//    }

//    function success() {
//        getScanResult();
//    }

//    getScanResult();

//    function getScanResult() {
//        WifiWizard.getScanResults(listHandler(results), fail);
//    }

//    function listHandler(results) {
//        alert(results);
//        var element = document.getElementById('connectionInfo');
//        element.innerHTML = 'Connection Info: ' + results;
//    }

//    function fail() {
//        //meh
//    }
//}