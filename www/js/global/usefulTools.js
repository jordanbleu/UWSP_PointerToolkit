var scope;
var ionicPopup;
var lastPopupExisting;
var regexURL = /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i;// Source: http://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
var lastTestPass;
var monthNames = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

// Function htmlEscape : This function translates a unsafe string into HTML safe text.
// Source: http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
function htmlEscape(str) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}// end function

// Function htmlUnescape : This function translates HTML safe text string into a unsafe string.
// Source: http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
function htmlUnescape(str){
	return str
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}// end function

// Function initializeNeatPopupSystem : This function initializes a page to allow it to use neatPopup.
function initializeNeatPopupSystem($scope, $ionicPopup) {
	
	scope = $scope;
	ionicPopup = $ionicPopup;
	
}// end function

// Function neatPopup: This function builds a neat dialog box.
function neatPopup(pTitle, pInnerContent, pButtonSettings) {
	var buttons = [];
	var thisText;
	var thisCallback;
	var thisPositive;
	
	// If no button settings, use OK
	if ((pButtonSettings == undefined) || (pButtonSettings == null)) {
		pButtonSettings = [["OK", null, true]];
	}// end if
	
	// Build buttons
	for (var i = 0; i < pButtonSettings.length; i++) {
		
		// Get this button's settings
		thisText = pButtonSettings[i][0];
		thisCallback = pButtonSettings[i][1];
		thisPositive = (pButtonSettings[i][2] ? "button-positive" : "button-neutral");
		
		// Add button in Ionic format
		buttons.push(
			{
				text: thisText,
				type: thisPositive,
				onTap: thisCallback
			}
		)// end push
		
	}// end for
	
	// Make popup
	lastPopupExisting = ionicPopup.show({
		title: pTitle,
		template: pInnerContent,
		scope: scope,
		buttons: buttons
	});
	
}// end function

// Function clearArrayOfNulls : This function clears an array of null data.
// Source: http://tutorialsplane.com/remove-empty-null-undefined-values-from-javascript-array/
// Param content : The array with nulls to clean
function clearArrayOfNulls(content) {
	return content.filter(function(e){return e});
}// end function

// Function isValidURL : This function checks if a URL is in a valid format.
// Param URL : The URL to test
function isValidURL(URL) {
	return regexURL.test(URL);
}// end function

// Function directlyTestURL : This function directly tests a URL for existence. A cached URL is also accepted.
// Source: http://stackoverflow.com/questions/3646914/how-do-i-check-if-file-exists-in-jquery-or-javascript
// Param URL : The URL to test
function directlyTestURL(URL) {

	// Initialize variables
	var acceptable;
	var http;
	var resultCode;

	// Note acceptable status codes
	acceptable = [200, 304];

	// Test URL with HTTP head request
	try {	
		http = new XMLHttpRequest();	
		http.open('HEAD', URL, false);
		http.send();
		
		// Get result code
		resultCode = http.status;
	} catch (ex) {
		resultCode = 0;
	}// end try
	
	// Return whether or not returned status is acceptable - indexOf is used due to contains not being available to all browsers
    return (acceptable.indexOf(resultCode) != -1);
}// end function

// Function getBestURL : This function returns the best URL variant for a given URL. If nothing makes sense, it returns null.
// Param preURL : The URL before testing
function getBestURL(preURL) {
	var bestURL;
	var testURL;
	var testIndex;
	var testPrefixes;
	var lookingForBest;
	
	// If valid URL structure:
	if (isValidURL(preURL)) {
		
		// Remove any leading https:// to account for http only sites
		preURL = preURL.replace("https://", "");
		
		// Initialize testing data
		testIndex = 0;
		lookingForBest = true;
		testPrefixes = ["", "https://", "https://www.", "http://", "http://www.", "www."];
		
		// Test URLs
		while ((lookingForBest) && (testIndex < testPrefixes.length)) {
			
			// Set test URL
			testURL = testPrefixes[testIndex] + preURL;
			
			// If valid URL, save it, and finish
			if (directlyTestURL(testURL)) {
				bestURL = testURL;
				lookingForBest = false;
				
			} else {
			// If invalid URL, try next one
				testIndex++;
				
			}// end if
			
		}// end while
		
		// If still looking for best now, that means no good match was found
		if (lookingForBest) {
			bestURL = null;
		}// end if
		
	} else {
	// If invalid URL:
		bestURL = null;
		
	}// end if
	
	return bestURL;
	
}// end function

// Function formatTime : This function formats a time of a date object into a neat string.
// Source: http://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
function formatTime(time) {
	var hours = time.getHours();
	var minutes = time.getMinutes();
	var ampm = hours >= 12 ? 'PM' : 'AM';
	 
	hours = hours % 12;
	hours = hours ? hours : 12; // the hour '0' should be '12'
	minutes = minutes < 10 ? '0' + (minutes.toString()) : (minutes.toString());
	
	var strTime = hours + ':' + minutes + ' ' + ampm;
	
	return strTime;
}// end function

// Function formatDateToYMD : This function takes a date object and makes it into a string with YMD (no dashes) format.
function formatDateToYMD(date) {
	var yearPart;
	var monthPart;
	var dayPart;
	var full;
	
	// If null, full is null
	if (!date) {
		full = null;
		
	} else {
	// Otherwise, process
		
		// Get parts
		yearPart = date.getFullYear().toString();
		monthPart = (date.getMonth()+1).toString();
		dayPart = date.getDate().toString();
		
		// Add leading zeroes where appropiate
		if (monthPart.length == 1) {
			monthPart = "0" + monthPart;
		}// end if
		if (dayPart.length == 1) {
			dayPart = "0" + dayPart;
		}// end if
		
		// Concatenate all
		full = yearPart + monthPart + dayPart;
		
	}// end if
	
	return full;
}// end function'

// Function formatDateToYMDHMS : This function takes a date object and makes it into a string with YMDHMS (no other symbols) format.
function formatDateToYMDHMS(date) {
	var hourPart;
	var minutePart;
	var secondPart;
	var full;
	
	// If null, full is null
	if (!date) {
		full = null;
		
	} else {
	// Otherwise, process
		
		// Get parts
		hourPart = (date.getHours().toString());
		minutePart = (date.getMinutes().toString());
		secondPart = (date.getSeconds().toString());
		
		// Add leading zeroes where appropiate
		if (hourPart.length == 1) {
			hourPart = "0" + hourPart;
		}// end if
		if (minutePart.length == 1) {
			minutePart = "0" + minutePart;
		}// end if
		if (secondPart.length == 1) {
			secondPart = "0" + secondPart;
		}// end if
		
		// Concatenate all
		full = formatDateToYMD(date) + hourPart + minutePart + secondPart;
		
	}// end if
	
	return full;
}// end function'

// Function formatDateNeat : This function takes a date object and formats it into a neat long form. For example, 2010-10-10 would be October 10, 2010.
function formatDateNeat(date) {
	return monthNames[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}// end function

// Function getTodayPlusDays : This function returns today plus or minus some number of days into the future.
function getTodayPlusDays(numberOfDays) {
	var theDate = new Date();
	
	theDate.setTime(theDate.getTime()+(86400000*numberOfDays));//86400000 from ticks per day (hours, minues, seconds, milliseconds)
	
	return theDate;
}// end function

// Function getNextDateThatHasDayOfWeekOf : This function returns the first future date that has a day of week of the provided. Invalid records will return null.
function getNextDateThatHasDayOfWeekOf(seekingDayOfWeek) {
	var result;
	var todayDayOfWeek;
	var daysLater;
	
	// Validate for null
	if (seekingDayOfWeek != null) {
		
		// Validate for between 0 and 6
		seekingDayOfWeek = Math.round(seekingDayOfWeek);
		
		if ((seekingDayOfWeek >= 0) && (seekingDayOfWeek <= 6)) {
			
			// Get today's day of week
			todayDayOfWeek = (new Date()).getDay();
			
			// Calculate how many days later it should be
			if (todayDayOfWeek >= seekingDayOfWeek) {
				daysLater = seekingDayOfWeek - todayDayOfWeek + 7;
			} else {
				daysLater =	seekingDayOfWeek - todayDayOfWeek;
			}// end if
			
			// Get that date
			result = getTodayPlusDays(daysLater);
			
		} else {
			
			// Error result: null
			result = null;
			
		}// end if
		
	} else {
		
		// Error result: null
		result = null;
	}// end if
	
	return result;
}// end function

// Function getFirstDateOfNextMonth : This function returns the date that is the first of the following month.
function getFirstDateOfNextMonth() {
	var testDate = new Date();
	var day;
	var month;
	var year;
	
	// Set day to 1 as its always first day
	day = 1;
	
	// Get month and year
	month = testDate.getMonth();
	year = testDate.getFullYear();
	
	// Add one with cycling
	month = (month + 1) % 12;
	
	// Update year
	if (month == 0) {
		year++;
	}// end if
	
	// Create new date
	testDate = new Date(year, month, day);
	
	return testDate;
}// end function

// Function getFirstDateOfNextYear : This function returns the date that is the first day of the next year
function getFirstDateOfNextYear() {
	var testDate = new Date();
	var nextYear
	
	// Get next year
	nextYear = (testDate.getFullYear() + 1);
	
	// Create new date
	testDate = new Date(nextYear, 0, 1);
	
	return testDate;
}// end function

// Function navigateToURL : This function hopefully navigates to a given URL in an external browser.
function navigateToURL(destination) {
	window.open(destination, '_system', 'location=yes');
}// end function
