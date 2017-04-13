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
                template: 'This will run a Wireless Report to be emailed to UWSP IT for troubleshooting.'
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
        checkConnectionDone = false;
        getConnectionDone = false;
        getGPSCoordsDone = false;
        composeEmailDone = false; 
    }
})();

//variables to hold device and access point information to be converted to csv
var deviceInfoCSV = 'Device Platform, Device UUID, Device Version, Connection Type, ' +
                    'Latitude, Longitude, Accuracy, Timestamp\n';

var wapInfoCSV = 'Level, SSID, BSSID, Frequency';

var date = new Date();
var deviceInfoFileName = 'deviceInfo-' + formatDateToYMDHMS(date);
var wapInfoFileName = 'wapInfo-' + formatDateToYMDHMS(date);

var checkConnectionDone = false;
var getConnectionDone = false;
var getGPSCoordsDone = false;
var composeEmailDone = false;
var composeEmailInterval;


function getDeviceInfo() {
    var element = document.getElementById('deviceProperties');
    element.innerHTML = 'Device Platform: ' + device.platform + '<br />' +
                        'Device UUID: ' + device.uuid + '<br />' +
                        'Device Version: ' + device.version + '<br />';

    deviceInfoCSV += device.platform + ', ' + device.uuid + ', ' + device.version + ', ';

    if (device.platform === "Android") {
        androidCommands();
    }
    else if (device.platform === "iOS") {
        appleCommands();
    }
    else {
        alert('This feature is not supported on this platform.')
        $ionicHistory.goBack();
    }
}

function androidCommands() {
    checkConnection();
    getConnectionInfo();
    getGPSCoords();

    composeEmailInterval = window.setInterval(checkIfReadyToEmail, 100);
}

function appleCommands() {
    checkConnection();
    getConnectionInfo();
    getGPSCoords();

    composeEmailInterval = window.setInterval(checkIfReadyToEmail, 100);
}

function checkIfReadyToEmail() {
    if (checkConnectionDone && getConnectionDone && getGPSCoordsDone && !composeEmailDone) {
        composeEmail();
        window.clearInterval(composeEmailInterval);
    }
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

    deviceInfoCSV += states[networkState] + ', ';

    checkConnectionDone = true;
}

function getGPSCoords() {

    var onSuccess = function (position) {
        var GPSlocation = ('Latitude: ' + position.coords.latitude + '<br />' +
         'Longitude: ' + position.coords.longitude + '<br />' +
         'Accuracy: ' + position.coords.accuracy + '<br />' +
         'Timestamp: ' + new Date(position.timestamp) + '<br />');

        var element = document.getElementById('GPSCoords');
        element.innerHTML = 'GPS Information: <br />' + GPSlocation;

        deviceInfoCSV += position.coords.latitude + ', ' + position.coords.longitude + ', ' +
                         position.coords.accuracy + ', ' + formatDateToYMDHMS(date) + ', ';

        getGPSCoordsDone = true;
    };
    var onFailure = function () {
        var element = document.getElementById('GPSCoords');
        element.innerHTML = 'GPS Location: Failed';

        deviceInfoCSV += 'null, null, null, null, null, ' + formatDateToYMDHMS(date);

        getGPSCoordsDone = true;
    }

    var GPSLocation = navigator.geolocation.getCurrentPosition(onSuccess, onFailure, { timeout: 10000 });
}

//function getSignalStrength() {
//    window.SignalStrength.dbm(
//        function (measuredDbm) {
//            var element = document.getElementById('signalStrength');
//            element.innerHTML = 'Signal Strength: ' + measuredDbm;

//            deviceInfoCSV += measuredDbm;
//        })
//}

function composeEmail() {

    var deviceInfoAtt = btoa(deviceInfoCSV);
    var wapInfoAtt = btoa(wapInfoCSV);
    composeEmailDone = true;

    cordova.plugins.email.open({
        to: 'mbuta331@uwsp.edu',
        //cc: '',
        //bcc: ['john@doe.com', 'jane@doe.com'],
        subject: 'Test',
        body: 'Test',
        attachments: [
            'base64:' + deviceInfoFileName + '.csv//' + deviceInfoAtt,
            'base64:' + wapInfoFileName + '.csv//' + wapInfoAtt
            ]
    })
}

function getConnectionInfo() {

    function listHandler(resultsList) {

        var element = document.getElementById('connectionInfo');
        element.innerHTML = "";

        for (var i=0; i < resultsList.length; i++)
        {
            wapInfoCSV += '\n' + resultsList[i].level + ',' +
                                 resultsList[i].SSID + ',' +
                                 resultsList[i].BSSID + ',' +
                                 resultsList[i].frequency;

            if (i != resultsList.length - 1)
            {
                wapInfoCSV += ',';
            }
        }

        element.innerHTML = "Wireless Information Loaded";
        getConnectionDone = true;
    }

    WifiWizard.getScanResults(listHandler);

}