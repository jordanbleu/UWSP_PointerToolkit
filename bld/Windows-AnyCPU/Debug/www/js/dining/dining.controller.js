//Today is string based on the dayOfWeek
var today="";

/****Food Court****/
var foodCourtDaysTimes = [
							[1, 8, 10],
							[1, 11, 14],
							[2, 8, 10],
							[2, 11, 14],
							[3, 8, 10],
							[3, 11, 14],
							[4, 8, 10],
							[4, 11, 14],
							[5, 8, 10],
							[5, 11, 14]
						];
						
var foodCourtDaySayings = 
						["Sorry, we are closed today", 
						"8:00AM to 10:00AM<br />11:00AM to 2:00PM", 
						"8:00AM to 10:00AM<br />11:00AM to 2:00PM", 
						"8:00AM to 10:00AM<br />11:00AM to 2:00PM", 
						"8:00AM to 10:00AM<br />11:00AM to 2:00PM", 
						"8:00AM to 10:00AM<br />11:00AM to 2:00PM", 
						"Sorry, we are closed today"];

var foodCourtWeekTimes="Monday to Friday<br />8:00AM to 10:00AM<br/>11:00AM to 2:00PM";						

/****The Red Vest****/				
var redVestDaysTimes = [
							[1, 15, 19],
							[2, 15, 19],
							[3, 15, 19],
							[4, 15, 19],
						];
						
var redVestDaySayings = 
						["Sorry, we are closed today", 
						"3:00PM to 7:00PM", 
						"3:00PM to 7:00PM", 
						"3:00PM to 7:00PM", 
						"3:00PM to 7:00PM", 
						"Sorry, we are closed today", 
						"Sorry, we are closed today"];	

var redVestWeekTimes="Monday to Thursday<br />3:00PM to 7:00PM";

/****Homegrown****/			
var homegrownDaysTimes = [
							[1, 7.5, 17],
							[2, 7.5, 17],
							[3, 7.5, 17],
							[4, 7.5, 17],
							[5, 7.5, 14]
						];
						
var homegrownDaySayings = 
						["Sorry, we are closed today", 
						"7:30AM to 5:00PM", 
						"7:30AM to 5:00PM", 
						"7:30AM to 5:00PM", 
						"7:30AM to 5:00PM", 
						"7:30AM to 2:00PM", 
						"Sorry, we are closed today"];	

var homegrownWeekTimes="Monday to Thursday<br />7:30AM to 5:00PM<br /><br />Friday<br />7:30AM to 2:00PM";

/****Food for Thought****/				
var foodForThoughtDaysTimes = [
							[1, 8, 16],
							[2, 8, 16],
							[3, 8, 16],
							[4, 8, 16],
							[5, 8, 14]
						];
						
var foodForThoughtDaySayings = 
						["Sorry, we are closed today", 
						"8:00AM to 4:00PM", 
						"8:00AM to 4:00PM", 
						"8:00AM to 4:00PM", 
						"8:00AM to 4:00PM", 
						"8:00AM to 2:00PM", 
						"Sorry, we are closed today"];	
			
var foodForThoughtWeekTimes="Monday to Thursday<br />8:00AM to 4:00PM<br /><br />Friday<br />8:00AM to 2:00PM";

/****Upper Debot****/
var upperDebotDaysTimes = [
							[0, 8.5, 10],
							[0, 10.5, 13],
							[1, 7, 10],
							[1, 10.5, 14],
							[1, 16, 19.5],
							[2, 7, 10],
							[2, 10.5, 14],
							[2, 16, 19.5],
							[3, 7, 10],
							[3, 10.5, 14],
							[3, 16, 19.5],
							[4, 7, 10],
							[4, 10.5, 14],
							[4, 16, 19.5],
							[5, 7, 10],
							[5, 10.5, 14],
							[5, 16, 18.5],
							[6, 8.5, 10],
							[6, 10.5, 13]
						];			
			
var upperDebotDaySayings = 
						["8:30AM to 10:00AM and 10:30AM to 1:00PM", 
						"7:00AM to 10:00AM<br />10:30AM to 2:00PM<br />4:00PM to 7:30PM",  
						"7:00AM to 10:00AM<br />10:30AM to 2:00PM<br />4:00PM to 7:30PM", 
						"7:00AM to 10:00AM<br />10:30AM to 2:00PM<br />4:00PM to 7:30PM",  
						"7:00AM to 10:00AM<br />10:30AM to 2:00PM<br />4:00PM to 7:30PM", 
						"7:00AM to 10:00AM<br />10:30AM to 2:00PM<br />4:00PM to 6:30PM", 
						"8:30AM to 10:00AM and 10:30AM to 1:00PM"];	

var upperDebotWeekTimes="Monday to Thursday<br />7:30AM to 10:00AM<br />10:30AM to 2:00PM<br />4:00PM to 7:30PM<br /><br />Friday<br />7:30AM to 10:00AM<br />10:30AM to 2:00PM<br />4:00PM to 6:30PM<br /><br />Saturday and Sunday<br />8:30AM to 10:00AM<br />10:30AM to 1:00PM";

/****Lower Deobot****/						
var lowerDebotDaysTimes = [
							[0, 11, 23],
							[1, 7.5, 23],
							[2, 7.5, 23],
							[3, 7.5, 23],
							[4, 7.5, 23],
							[5, 7.5, 23],
							[6, 11, 23],
						];											
						
var lowerDebotDaySayings = 
						["11:00AM to 11:00PM", 
						"7:30AM to 11:00PM", 
						"7:30AM to 11:00PM", 
						"7:30AM to 11:00PM", 
						"7:30AM to 11:00PM", 
						"11:00AM to 11:00PM", 
						"11:00AM to 11:00PM"];	
						
var lowerDebotWeekTimes = "Monday to Friday<br />7:30AM to 11:00PM<br /><br />Saturday and Sunday<br />11:00AM to 11:00PM";

/****CPS Cafe****/
var cpsCafeDaysTimes = [
                        [1, 7.75, 14.5],
                        [2, 7.75, 14.5],
                        [3, 7.75, 14.5],
                        [4, 7.75, 14.5],
                        [5, 7.75, 14]
                       ];

var cpsCafeDaySayings = ["Sorry, we are closed today",
                         "7:45AM to 2:30PM",
                         "7:45AM to 2:30PM",
                         "7:45AM to 2:30PM",
                         "7:45AM to 2:30PM",
                         "7:45AM to 2:00PM",
                         "Sorry, we are closed today"];

var cpsCafeWeekTimes = "Monday to Thursday<br />7:45AM to 2:30PM<br /><br />Friday<br />7:45AM t0 2:00PM<br /><br />Saturday and Sunday<br />Closed";

//Stores all array and string names to call and loop through to display content correctly.
var diningLocations = [
				["foodCourt", foodCourtDaysTimes, foodCourtDaySayings, foodCourtWeekTimes],
				["redVest", redVestDaysTimes, redVestDaySayings, redVestWeekTimes],
				["homegrown", homegrownDaysTimes, homegrownDaySayings, homegrownWeekTimes],
				["foodForThought", foodForThoughtDaysTimes, foodForThoughtDaySayings, foodForThoughtWeekTimes],
				["upperDebot", upperDebotDaysTimes, upperDebotDaySayings, upperDebotWeekTimes],
				["lowerDebot", lowerDebotDaysTimes, lowerDebotDaySayings, lowerDebotWeekTimes],
                ["cpsCafe", cpsCafeDaysTimes, cpsCafeDaySayings, cpsCafeWeekTimes]];

				
//OnLoad
(function () {
  'use strict';
  
  function DiningController($scope, $ionicHistory,  $timeout, $state) {
  //OnLoad displays information
  updateOpenOrClosed();
  
  //Refreshes the page every half minute.
  window.setInterval(updateOpenOrClosed, 30000);
	
  }

  angular
    .module('dining', [])
    .controller('DiningController', DiningController);	
})();

//Sets up the content for each of the food locations
function updateOpenOrClosed()
{
	//Determines the Current Day
	determineDay();
	
	//Sets the Locations to open/closed as well as their inner information
	for(var i=0; i<diningLocations.length; i++)
	{
		openOrClosed(diningLocations[i][0], diningLocations[i][1], diningLocations[i][2], diningLocations[i][3]);
	}
}

//Finds the day based off of the date grabbed
function determineDay()
{
	//Full date
	currentdate = new Date(); 

	//Grabs day
	dayOfWeek =  (currentdate.getDay());

	//Grabs hour
	currentTimeHours = currentdate.getHours();

	//Grabs minutes
	currentTimeMinutes = currentdate.getMinutes();

	//Converts hours to minutes to get total minutes
	currentTimeTotalMinutes=currentTimeHours*60 + currentTimeMinutes;

	//Determine which day it is and sets today
	switch (dayOfWeek)
	{
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
function openOrClosed(id, array, sayings, weekTimes)
{
	var isOpen=false;

	for(var i=0; i<array.length; i++)
	{
		if(array[i][0]===dayOfWeek)
		{
			if(currentTimeTotalMinutes>=(array[i][1]*60)&& currentTimeTotalMinutes<(array[i][2]*60))
			{
				isOpen=true;
			}
		}
	}
	
	//When open show the gold star
	if(isOpen)
	{
		document.getElementById(id + "Open").innerHTML= "<object data=\"assets/img/silverwareGold.svg\" type=\"image/svg+xml\" class=\"open\"></object>";
	}
	else
	{
		document.getElementById(id + "Open").innerHTML= "<object data=\"assets/img/silverwareGrey.svg\" type=\"image/svg+xml\" class=\"closed\"></object>";
	}
	
	//Displays the day and the time a location is open
	document.getElementById(id + "Today").innerHTML="Today: " +today + "<br />" + sayings[dayOfWeek];
	
	//Displays the times for the week a location is open
	document.getElementById(id + "Week").innerHTML= weekTimes;
}

//Shows all the content within the clicked dining location
function changeViewDining(id)
{
	var id = id;
	if($('#'+id+':visible').length === 0)
	{
		document.getElementById(id).style.display = "inline";	
		//Sets the location of the open/closed icon so that it appears to be in the same location when open and closed.
		switch(id) {
			case "foodCourt":
				document.getElementById(id + "Open").style.top= "-37%";
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -37%; font-size: 20px;\"></i>";
				break;
			case "redVest":
				document.getElementById(id + "Open").style.top= "-34%";
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -35%; font-size: 20px;\"></i>";
				break;
			case "homegrown":
				document.getElementById(id + "Open").style.top= "-38%";
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -40%; font-size: 20px;\"></i>";
				break;
			case "foodForThought":
				document.getElementById(id + "Open").style.top= "-38%";
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -40%; font-size: 20px;\"></i>";
				break;
			case "upperDebot":
				document.getElementById(id + "Open").style.top= "-44%";
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -44%; font-size: 20px;\"></i>";
				break;
			case "lowerDebot":
				document.getElementById(id + "Open").style.top= "-39%";
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -40%; font-size: 20px;\"></i>";
				break;
		    case "cpsCafe":
		        document.getElementById(id + "Open").style.top= "-32%";
		        document.getElementById(id + "Btn").innerHTML = "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -32%; font-size: 20px;\"></i>";
		        break;
            default:
				document.getElementById(id + "Open").style.top= "-32%";
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -40%; font-size: 20px;\"></i>";
				break;
		} 
	}
	else
	{
		document.getElementById(id).style.display = "none";
		document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-down\" style=\"right: 1%; font-size: 20px;\"></i>";
		document.getElementById(id + "Open").style.top= "-4%";
	}
}