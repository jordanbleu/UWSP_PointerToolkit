// This function processes the controller when its ready.
(function () {
    'use strict';

    angular
		.module('wirelessReport', [])
		.controller('WirelessReportController', WirelessReportController);

    function WirelessReportController($scope, $ionicHistory, $timeout, $state, $ionicPopup) {

        $scope.showConfirm = function () {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Attention',
                template: 'This will run a Wireless Report to be emailed to UWSP IT.'
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

        //reset these two variables to avoid data duplication when navigating to this page multiple times
        deviceInfoCSV = 'Device Platform, Device UUID, Device Version, ' +
                        'Connection Type, Latitude, Longitude, Timestamp\n';

        wapInfoCSV = 'Level, SSID, BSSID, Frequency';

        checkConnectionDone = false;
        getConnectionDone = false;
        getGPSCoordsDone = false;
        checkIfWifiIsOn = false;
        composeEmailDone = false;
    }
})();

//variables to hold device and access point information to be converted to csv
var deviceInfoCSV = 'Device Platform, Device UUID, Device Version, ' +
                    'Connection Type, Latitude, Longitude, Timestamp\n';

var wapInfoCSV = 'Level, SSID, BSSID, Frequency';

var date = new Date();
var deviceInfoFileName = 'deviceInfo-' + formatDateToYMDHMS(date);
var wapInfoFileName = 'wapInfo-' + formatDateToYMDHMS(date);

var checkConnectionDone = false;
var getConnectionDone = false;
var getGPSCoordsDone = false;
var checkIfWifiIsOn = false;
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
        alert('This feature is currently in development for iOS devices.');
        $ionicHistory.goBack();
        //appleCommands();
    }
    else {
        alert('This feature is not supported on this platform.')
        $ionicHistory.goBack();
    }
}

function androidCommands() {
    checkIfWifiEnabled();

    composeEmailInterval = window.setInterval(checkIfReadyToEmail, 1000);
}

function appleCommands() {
    getConnectionDone = true; //not supported in iOS
    checkIfWifiIsOn = true; //not supported in iOS
    checkConnection();
    getGPSCoords();

    composeEmailInterval = window.setInterval(checkIfReadyToEmail, 1000);
}

function checkIfReadyToEmail() {
    console.log(checkConnectionDone);
    console.log(getConnectionDone);
    console.log(getGPSCoordsDone);
    console.log(checkIfWifiIsOn);
    if (checkConnectionDone && getConnectionDone && getGPSCoordsDone && checkIfWifiIsOn && !composeEmailDone) {
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

    getGPSCoords();
}

function getGPSCoords() {

    var onSuccess = function (position) {
        getGPSCoordsDone = true;

        var GPSlocation = 'Latitude: ' + position.coords.latitude + '<br />' +
                          'Longitude: ' + position.coords.longitude + '<br />';
                          //'Accuracy: ' + position.coords.accuracy + '<br />' +
                          //'Timestamp: ' + new Date(position.timestamp) + '<br />';

        var element = document.getElementById('GPSCoords');
        element.innerHTML = 'GPS Information: <br />' + GPSlocation;

        deviceInfoCSV += position.coords.latitude + ', ' + position.coords.longitude +
                        ', ' + formatDateToYMDHMS(date);
    };
    var onFailure = function () {
        var element = document.getElementById('GPSCoords');
        element.innerHTML = 'GPS Location Failed To Load';

        deviceInfoCSV += 'null, null, null, ' + formatDateToYMDHMS(date);

        getGPSCoordsDone = true;
    }

    var GPSLocation = navigator.geolocation.getCurrentPosition(onSuccess, onFailure, { timeout: 10000 });
}

function composeEmail() {
    var deviceInfoAtt = btoa(deviceInfoCSV);
    var wapInfoAtt = btoa(wapInfoCSV);

    cordova.plugins.email.open({
        to: 'tooncall@uwsp.edu',
        //cc: '',
        //bcc: ['john@doe.com', 'jane@doe.com'],
        subject: 'UWSP Wireless Troubleshooting Report',
        body: 'This is an auto-generated report from the Pointer Toolkit app (version 1.0).',
        attachments: [
            'base64:' + deviceInfoFileName + '.csv//' + deviceInfoAtt,
            'base64:' + wapInfoFileName + '.csv//' + wapInfoAtt
        ]
    })
    composeEmailDone = true;
}

function getConnectionInfo() {

    checkIfWifiIsOn = true;

    var element = document.getElementById('connectionInfo');
    element.innerHTML = "";

    function listHandler(resultsList) {

        for (var i = 0; i < resultsList.length; i++) {
            wapInfoCSV += '\n' + resultsList[i].level + ',' +
                                 resultsList[i].SSID + ',' +
                                 resultsList[i].BSSID + ',' +
                                 resultsList[i].frequency;

            if (i != resultsList.length - 1) {
                wapInfoCSV += ',';
            }
        }

        element.innerHTML = "Wireless Information Loaded";
        getConnectionDone = true;

        //wait five seconds to give wireless time to connect to remembered networks
        window.setTimeout(checkConnection, 5000);
    }

    function fail() {
        element.innerHTML = "Wireless Information Failed To Load";
        getConnectionDone = true;
        //wait five seconds to give wireless time to connect to remembered networks
        window.setTimeout(checkConnection, 5000);
    }

    WifiWizard.getScanResults(listHandler, fail);

}

function checkIfWifiEnabled() {

    function result(isEnabled) {
        if (isEnabled) {
            getConnectionInfo();
        }
        else {
            enableWifi();
        }
    }

    function fail() {
        checkConnection();
        getConnectionInfo();
    }

    WifiWizard.isWifiEnabled(result, fail);
}

function enableWifi() {

    function turnWifiOn() {
        //wait two seconds to give wireless time to turn on fully
        window.setTimeout(getConnectionInfo, 2000);
    }

    function fail() {
        alert('Failed to turn on Wifi.');
        getConnectionInfo();
    }

    WifiWizard.setWifiEnabled(true, turnWifiOn, fail);
}

//function getConnectedBSSID() {
//    function gotBSSID(bssid) {
//        deviceInfoCSV += bssid;
//    }

//    WifiWizard.getCurrentBSSID(gotBSSID, fail);
//}

function sendLogButton() {
    composeEmailDone = false;
    checkIfReadyToEmail();
}