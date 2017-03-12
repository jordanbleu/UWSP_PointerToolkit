//OnLoad
(function () {
    'use strict';

    function AboutController($scope, $ionicHistory, $timeout, $state) {
        $timeout(function () {
            $("#aboutcontent").children().each(function (index) { $(this).hide(); });
            $("#aboutcontent").children().each(function (index) {
                $(this).delay(100 * index).fadeIn(600);
            });
        });
    }



    angular
      .module('about', [])
      .controller('AboutController', AboutController);
})();

//Sets up the content for each of the food locations
//function updateOpenOrClosed() {
//    //Determines the Current Day
//    determineDay();

//    //Sets the Locations to open/closed as well as their inner information
//    for (var i = 0; i < diningLocations.length; i++) {
//        openOrClosed(diningLocations[i][0], diningLocations[i][1], diningLocations[i][2], diningLocations[i][3]);
//    }
//}

//Finds the day based off of the date grabbed
function determineDay() {
    //Full date
    currentdate = new Date();

    //Grabs day
    dayOfWeek = (currentdate.getDay());

    //Grabs hour
    currentTimeHours = currentdate.getHours();

    //Grabs minutes
    currentTimeMinutes = currentdate.getMinutes();

    //Converts hours to minutes to get total minutes
    currentTimeTotalMinutes = currentTimeHours * 60 + currentTimeMinutes;

    //Determine which day it is and sets today
    switch (dayOfWeek) {
        case 0:
            today = "Sunday";
            break;
        case 1:
            today = "Monday";
            break;
        case 2:
            today = "Tuesday";
            break;
        case 3:
            today = "Wednesday";
            break;
        case 4:
            today = "Thursday";
            break;
        case 5:
            today = "Friday";
            break;
        case 6:
            today = "Saturday";
    }
}

//Looks through each location array to determine whether it is open or closed
function openOrClosed(id, array, sayings, weekTimes) {
    var isOpen = false;

    for (var i = 0; i < array.length; i++) {
        if (array[i][0] === dayOfWeek) {
            if (currentTimeTotalMinutes >= (array[i][1] * 60) && currentTimeTotalMinutes < (array[i][2] * 60)) {
                isOpen = true;
            }
        }
    }

    //When open show the gold star
    if (isOpen) {
        document.getElementById(id + "Open").innerHTML = "<object data=\"assets/img/checkmark-circled-green.svg\" type=\"image/svg+xml\" class=\"open\" style=\"height: 24px;\"></object>";
    }
    else {
        document.getElementById(id + "Open").innerHTML = "<object data=\"assets/img/close-circled-red.svg\" type=\"image/svg+xml\" class=\"closed\" style=\"height: 24px;\"></object>";
    }

    //Displays the day and the time a location is open
    document.getElementById(id + "Today").innerHTML = "Today: " + today + "<br />" + sayings[dayOfWeek];

    //Displays the times for the week a location is open
    document.getElementById(id + "Week").innerHTML = weekTimes;
}

//Shows all the content within the clicked dining location
function changeViewDining(id) {
    var id = id;
    if ($('#' + id + ':visible').length === 0) {
        document.getElementById(id).style.display = "inline";
        //Sets the location of the open/closed icon so that it appears to be in the same location when open and closed.
        switch (id) {
            case "foodCourt":
                document.getElementById(id + "Open").style.top = "-37%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -37%; font-size: 20px;\"></i>";
                break;
            case "redVest":
                document.getElementById(id + "Open").style.top = "-34%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -35%; font-size: 20px;\"></i>";
                break;
            case "homegrown":
                document.getElementById(id + "Open").style.top = "-38%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -40%; font-size: 20px;\"></i>";
                break;
            case "foodForThought":
                document.getElementById(id + "Open").style.top = "-38%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -40%; font-size: 20px;\"></i>";
                break;
            case "upperDebot":
                document.getElementById(id + "Open").style.top = "-44%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -44%; font-size: 20px;\"></i>";
                break;
            case "lowerDebot":
                document.getElementById(id + "Open").style.top = "-39%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -40%; font-size: 20px;\"></i>";
                break;
            case "cpsCafe":
                document.getElementById(id + "Open").style.top = "-32%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -32%; font-size: 20px;\"></i>";
                break;
            case "brewhaus":
                document.getElementById(id + "Open").style.top = "-32%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -32%; font-size: 20px;\"></i>";
                break;
            default:
                document.getElementById(id + "Open").style.top = "-32%";
                document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -40%; font-size: 20px;\"></i>";
                break;
        }
    }
    else {
        document.getElementById(id).style.display = "none";
        document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-down\" style=\"right: 1%; font-size: 20px;\"></i>";
        document.getElementById(id + "Open").style.top = "-4%";
    }
}