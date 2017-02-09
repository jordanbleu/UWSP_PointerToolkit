// Initialize all athletic events variables
var allEventsData;
var allStarData;
var queryEventItemData;
var xmlDocStart = "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
var xmlItemStart = "<item>";
var xmlItemEnd = "</item>";
var localEventsLocation = "UWSP-Toolkit-Sports.json";
var localEventsStarInformationLocation = "UWSP-Toolkit-Sports-StarInfo.json";
var remoteEventsLocation = "http://athletics.uwsp.edu/calendar.ashx/calendar.rss";
var starAbsentURL = "assets/img/starOutline.svg";
var starPresentURL = "assets/img/star.svg";
var rectEnforcementCode = "<rect class=\"btn\" x=\"0\" y=\"0\" width=\"24\" height=\"24\" />";
var unacceptableTitleComponentRegexWhitespace = /(\s)/g;
var unacceptableTitleComponentRegexBracketedLetter = /(\[{1}[A-Za-z]{1}\]{1})/g;
var unacceptableTitleComponentRegexDate = /\d{1,2}\/{1}\d{1,2}\/{0,1}\d{0,4}/g;
var unacceptableTitleComponentRegexTime = /(\d{1,2}[:]{0,1}\d{0,2})/g;
var unacceptableTitleComponentAMPM = ["am", "pm", "a.m.", "p.m."];
var toastTimer;
var filterPopupCount;
var filterBeforeDateDayOfWeek = 6;
var filterShowStarred;
var filterShowUnstarred;
var filterStarState;
var filterAfterTheDateYMD;
var filterBeforeTheDateYMD;
var filterEventDate;
var filterSportsOptionsDisplay = ["All", "Baseball", "Basketball", "Cross Country", "Diving", "Football", "Hockey", "Soccer", "Swimming", "Track", "Wrestling"];
var filterSportsOptionsQuery = ["", "baseball", "basketball", "cross country", "diving", "football", "hockey", "soccer", "swimming", "track", "wrestling"];// case insensitve
var filterSportsOptionsStoreAs = ["any", "baseball", "basketball", "crossCountry", "diving", "football", "hockey", "soccer", "swimming", "track", "wrestling"];
var filterSportsPrefix = "involvesSport_";
var filterSportsSportSelection;
var filterGenderOptionsDisplay = ["All", "Female", "Male"];
var filterGenderOptionsQuery = ["", "Women's", "Men's"];// case sensitive
var filterGenderOptionsStoreAs = ["any", "female", "male"];
var filterGenderPrefix = "involvesGender_";
var filterGenderGenderSelection;

// This function processes the sports controller when its ready.
(function () {
  'use strict';
   
  function SportsController($scope, $ionicHistory, $timeout, $state, $ionicPopup) {
		
		var abilityToStore;
		
		// Initialize neat popup system
		initializeNeatPopupSystem($scope, $ionicPopup);
		
		// Prepare for offline storage
		abilityToStore = initializeOfflineStorage();
		
		// If able, load all notes
		if (abilityToStore) {
			
			// Load star data
			allStarData = loadObjectFromOfflineStorage(localEventsStarInformationLocation, []);
		
			// Load all events if can
			Sports_loadAllEvents();
			
		}// end if
		
		// Hide toast message
		Sports_hideToast();
		
		// Close filter popup
		Sports_filterPopupFinish();
		
  }

  angular
    .module('sports', [])
    .controller('SportsController', SportsController);
})();

// Function showToast : This function shows the toast with a specific HTML message.
function Sports_showToast(message) {
	
	// Clear any previous timer
	window.clearTimeout(toastTimer);
	
	// Set timer
	toastTimer = window.setTimeout(Sports_hideToast, 3000);
	
	// Show message
	$("#sportsToast").show();
	$("#sportsToast").html(message);
	
}// end function

// Function hideToast : This function hides the toast.
function Sports_hideToast() {

	// Clear any previous timer
	window.clearTimeout(toastTimer);
	
	// Hide toast
	$("#sportsToast").hide();
	
}// end function

// Function loadAllEvents : This function attempts to load all of the event informatin from the remote events.
// If it fails, it loads from the local location and notifies the user it is doing so.
function Sports_loadAllEvents() {

	// Attempt loading data from online source
	$.ajax({
			url: remoteEventsLocation,
			data: "",
			crossDomain: true,
			
			dataType: "xml",
			timeout: 5000,
			success: function(data, textStatus) {
				
				var xmlString;
				
				// Save data
				allEventsData = data;
				
				// Get event data as XML string
				xmlString = (new XMLSerializer()).serializeToString(data);

				// Save local copy
				saveObjectToOfflineStorage(localEventsLocation, xmlString);
				
				// Initialize filters and load data
				Sports_initializeFilters();	
				
			},
			error: function(xhr, textStatus, errorThrown) {
				
				// Load from local storage
				allEventsData = $.parseXML( loadObjectFromOfflineStorage(localEventsLocation, null) );
				
				// Notify user of failure to load data so using local
				neatPopup("Event Load Failure", "The latest athletic events could not be loaded. The shown events might not be current and are based upon the last successful connection.");	
				
				// Initialize filters and load data
				Sports_initializeFilters();	
			}
		}
	);
	
}// end function

// Function initializeFilters : This function initializes all filters.
function Sports_initializeFilters() {
	
	var startDate;
	var endDate;
	
	// Initialize start and end date
	startDate = new Date();
	endDate = null;
	
	// Initialize filters
	filterShowStarred = true;
	filterShowUnstarred = true;
	filterStarState = "rdoStarAny";
	filterAfterTheDateYMD = formatDateToYMD(startDate);
	filterBeforeTheDateYMD = formatDateToYMD(endDate);
	filterEventDate = "rdoEventDateAny";
	filterSportsSportSelection = "any";
	filterGenderGenderSelection = "any";

	// Update event list with these settings
	Sports_updateEventData();
	
}// end function

// Function updateEventData : This function updates the query of events with the currently loaded data and filters.
function Sports_updateEventData() {
	var remainingXml;											// The XML remaining of the entirety for individual processing
	var innerXml;												// The XML for one item, not counting document, and sometimes ending item tag
	var thisXml;												// The XML for one item with document start, header, and footer
	var itemIndex;												// The index of the item within the query for identification. Not the game id
	var itemHeaderIndex;										// The index in the item XML as a string where the header begins
	var itemFooterIndex;										// The index in the item XML as a string where the footer begins
	var titleComponents;										// The componenets of the title
	var thisComponenet;											// The component to check for parsing the title unnecessary pieces
	var addThisItem;											// Should this item be added to the list? Flag for filters met
	var thisItem;												// The current item in XML document form
	var thisItemDetails;										// An object that stores the item's details in parsed form with corrected data types
	
	// Reset items array
	queryEventItemData = [];
	
	// If no data loaded and not first time, show error mesage
	if (!allEventsData) {
		
		neatPopup("Event Load Failure", "The event data could not be loaded.");
	
	} else {
		
		// Go through items, and generate list in HTML
		remainingXml = (new XMLSerializer()).serializeToString(allEventsData).trim();
		
		// Get item place and ending item place
		itemHeaderIndex = remainingXml.indexOf("<item>");
		itemFooterIndex = remainingXml.indexOf("</item>");
		
		// Initialize item index
		itemIndex = 0;
		
		// Go through all
		while (itemHeaderIndex >= 0) {
			
			// Get item XML
			innerXml = remainingXml.substring(itemHeaderIndex, itemFooterIndex).trim();
			thisXml = xmlDocStart + innerXml;
			
			// If doesn't end with item ending, add it
			if (!thisXml.endsWith(xmlItemEnd)) {
				thisXml += xmlItemEnd;
			}// end if
			
			// Replace colons with dashes on elements
			thisXml = thisXml.split("<s:").join("<s--").split("<ev:").join("<ev--").split("</s:").join("</s--").split("</ev:").join("</ev--");
			
			// If this XML has content
			if (innerXml) {
				
				// Generate this item as XML
				thisItem = $.parseXML(thisXml);
				
				// Get this item's details
				thisItemDetails = {};
				thisItemDetails.index = itemIndex;
				thisItemDetails.title = thisItem.getElementsByTagName("title")[0].childNodes[0].nodeValue;
				thisItemDetails.desc = thisItem.getElementsByTagName("description")[0].childNodes[0].nodeValue;
				thisItemDetails.startDate = new Date(thisItem.getElementsByTagName("s--localstartdate")[0].childNodes[0].nodeValue);
				thisItemDetails.endDate = new Date(thisItem.getElementsByTagName("s--localenddate")[0].childNodes[0].nodeValue);
				thisItemDetails.gameId = thisItem.getElementsByTagName("s--gameid")[0].childNodes[0].nodeValue;
				
				// Initialize sports indicators as indicating not found until otherwise shown
				for (var i in filterSportsOptionsStoreAs) {
					thisItemDetails[filterSportsPrefix + filterSportsOptionsStoreAs[i]] = false;
				}// end for
				
				// Initialize gender indicators as indicating not found until otherwise shown
				for (var i in filterGenderOptionsStoreAs) {
					thisItemDetails[filterGenderPrefix + filterGenderOptionsStoreAs[i]] = false;
				}// end for
				
				// Get this item's title formatted
				thisItemDetails.titleFormat = "";
				titleComponents = thisItemDetails.title.split(" ");
				for (var p = 0; p < titleComponents.length; p++) {
					
					// Get this componenet
					thisComponenet = titleComponents[p].trim();
					
					// Check componenet for sports keywords
					for (var s in filterSportsOptionsStoreAs) {
						
						// If the lower case version of component contains sport name, add as found in it
						if (thisComponenet.toLowerCase().indexOf(filterSportsOptionsQuery[s]) >= 0) {
							thisItemDetails[filterSportsPrefix + filterSportsOptionsStoreAs[s]] = true;
						}// end if
						
					}// end for
					
					// Check componenet for gender keywords
					for (var s in filterGenderOptionsStoreAs) {
						
						// If the lower case version of component contains sport name, add as found in it
						if (thisComponenet.indexOf(filterGenderOptionsQuery[s]) >= 0) {
							thisItemDetails[filterGenderPrefix + filterGenderOptionsStoreAs[s]] = true;
						}// end if
						
					}// end for
					
					// If not date, time, empty string, or [] marker, add it and space
					if ((thisComponenet != "") &&
						(!unacceptableTitleComponentRegexWhitespace.test(thisComponenet)) && 
						(!unacceptableTitleComponentRegexBracketedLetter.test(thisComponenet)) &&
						(!unacceptableTitleComponentRegexWhitespace.test(thisComponenet)) &&
						(!unacceptableTitleComponentRegexTime.test(thisComponenet)) &&
						(unacceptableTitleComponentAMPM.indexOf(thisComponenet.toLowerCase()) == -1)
					) {
						
						// Add component
						thisItemDetails.titleFormat += thisComponenet + " ";
						
					}// end if
					
				}// end for
				
				// Determine this item's base date for comparisons
				thisItemDetails.startDateYMD = formatDateToYMD(thisItemDetails.startDate);
				thisItemDetails.endDateYMD = formatDateToYMD(thisItemDetails.endDate);
				
				// Determine this item's formatted date and time
				thisItemDetails.startDateFormat = formatDateNeat(thisItemDetails.startDate);
				thisItemDetails.endDateFormat = formatDateNeat(thisItemDetails.endDate);

				// Format time
				thisItemDetails.startTimeFormat = formatTime(thisItemDetails.startDate);
				thisItemDetails.endTimeFormat = formatTime(thisItemDetails.endDate);
				
				// If different dates, use date range
				if (thisItemDetails.endDate.getDate() > thisItemDetails.startDate.getDate() || thisItemDetails.endDate.getMonth() > thisItemDetails.startDate.getMonth() || thisItemDetails.endDate.getFullYear() > thisItemDetails.startDate.getFullYear()) {
					thisItemDetails.dateRange = thisItemDetails.startDateFormat + " - " + thisItemDetails.endDateFormat;
					thisItemDetails.timeRange = "";
				} else {
				// If same date, use time range
					thisItemDetails.dateRange = thisItemDetails.endDateFormat;					
					thisItemDetails.timeRange = thisItemDetails.startTimeFormat + " - " + thisItemDetails.endTimeFormat;
				}// end if
				
				// Determine this item's star code
				thisItemDetails.starState = allStarData.indexOf(thisItemDetails.gameId) > -1;
				thisItemDetails.starCode = Sports_getStarSource(thisItemDetails.starState);

				// If should add this item, add it to query array
				if (Sports_testEventAgainstFilters(thisItemDetails)) {
					
					// Store event as XML document
					queryEventItemData[itemIndex] = thisItemDetails;
					
					// Increment index
					itemIndex++;
					
				}// end if
				
			}// end if
			
			// Get newest remaining XML
			remainingXml = remainingXml.substring(itemFooterIndex).trim();
			
			// Get next item indices
			itemHeaderIndex = remainingXml.indexOf(xmlItemStart);
			itemFooterIndex = remainingXml.indexOf(xmlItemEnd) + 7;
			
		}// end while
		
	}// end if
	
	// Update display
	Sports_updateEventList();
	
}// end function

// Function updateEventsList : This function updates the events list to be based upon the current query data.
function Sports_updateEventList() {
	var thisHtml;												// The current item in HTML document form to be added to the page
	var allHtmlNonStarred;										// The comprehensive summary of HTML being added to the page for all non-starred events listed
	var allHtmlStarred;											// The comprehensive summary of HTML being added to the page for all starred events listed
	
	// Initialize HTML
	allHtmlStarred = "";
	allHtmlNonStarred = "";
	
	// Clear divs
	$("#eventListStarredDiv").html("");
	$("#eventListNonStarredDiv").html("");
	
	// Go through query items, and make HTML for it
	for (var i = 0; i < queryEventItemData.length; i++) {
		
		// Get event information
		thisItemDetails = queryEventItemData[i];
		
		// Generate event's HTML based upon it
		thisHtml = "<div id=\"eventID" + thisItemDetails.index + "\" onmousedown=\"Sports_changeView('eventID" + thisItemDetails.index + "')\">" +
					"<a class=\"item item-icon-left item-icon-right\" href=\"#\">" +
						"<i class=\"icon eventStarIcon\" style=\"top: -8%;\" id=\"eventID" + thisItemDetails.index + "Open\" onclick=\"Sports_star(" + thisItemDetails.index + ")\">" +
						"<object id=\"eventID" + thisItemDetails.index + "star\" data='" + thisItemDetails.starCode + "' type=\"image/svg+xml\" class=\"starIconArea " +
						( thisItemDetails.starState ? "starIconStarred" : "starIconNonStarred" ) +
						"\"></object></i>" +
						"<span id=\"eventID" + thisItemDetails.index + "Title\" class=\"wrap\"> " + thisItemDetails.titleFormat + "</span>" +
						"<div class=\"hideContent\" id=\"eventID" + thisItemDetails.index + "Hide\">" +
						"<br/><span id=\"eventID" + thisItemDetails.index + "Date\">" + thisItemDetails.dateRange + "</span>" +
						"<br/><span id=\"eventID" + thisItemDetails.index + "Time\">" + thisItemDetails.timeRange + "</span>" +
						"</div><br>" +
						"<div class=\"openCloseArrow\" id=\"eventID" + thisItemDetails.index + "Btn\">" +
						  "<i class=\"icon ion-chevron-down\" style=\"right: 1%; font-size: 20px;\"></i>" +
						"</div>" +
					"</a></div>";
					
		// Append resulting HTML
		if (thisItemDetails.starState) {
			allHtmlStarred += thisHtml;
		} else {
			allHtmlNonStarred += thisHtml;
		}// end if

	}// end for
	
	// Show all HTML
	$("#eventListStarredDiv").html(allHtmlStarred);
	$("#eventListNonStarredDiv").html(allHtmlNonStarred);
		
	// Add rectangles to localize clicking
	$(".starIconArea").find("svg").html( $(".starIconArea").find("svg").html() + rectEnforcementCode);
	
}// end function

// Function changeView : This function hides or shows the details of a item in the view.
function Sports_changeView(id) {
	
	if($('#'+id +"Hide"+':visible').length == 0)
	{
		document.getElementById(id + "Hide").style.display = "inline";
		document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -21%; font-size: 20px;\"></i>";
		document.getElementById(id + "Open").style.top= "-23%";
	}
	else
	{
		document.getElementById(id + "Hide").style.display = "none";
		document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-down\" style=\"right: 1%; font-size: 20px;\"></i>";
		document.getElementById(id + "Open").style.top= "-8%";
	}// end if
}// end if

// Function filter : This function launches a screen to allow the user to filter out events by given categories.
function Sports_filter() {
	
	// Set timer to reset popup count in case of problem loading
	window.setTimeout(Sports_filterPopupFinish, 10000);

	// If no filter popup present:
	if (filterPopupCount === 0) {
		
		// Increment filter popup count
		filterPopupCount++;
		
		// Load filter form
		$.get("js/sports/sports.filter.form.html", function(result) {
			
			// Prepare variables
			var sportsTemplateStartIndex;
			var sportsTemplateEndIndex;
			var sportsTemplateOne;
			var sportsTemplateThis;
			var sportsResult;
			var genderTemplateStartIndex;
			var genderTemplateEndIndex;
			var genderTemplateOne;
			var genderTemplateThis;
			var genderResult;
			
			// Set dates in advance notes
			result = result.replace("%eventDateToday%", formatDateNeat(new Date()));
			result = result.replace("%eventDateThisWeek%", formatDateNeat(getNextDateThatHasDayOfWeekOf(filterBeforeDateDayOfWeek)));
			result = result.replace("%eventDateNextSevenDays%", formatDateNeat(getTodayPlusDays(8)));// + 1 from it being a before check
			result = result.replace("%eventDateThisMonth%", formatDateNeat(getFirstDateOfNextMonth()));
			result = result.replace("%eventDateNextThirtyDays%", formatDateNeat(getTodayPlusDays(31)));// + 1 from it being a before check
			result = result.replace("%eventDateThisYear%", (new Date().getFullYear()));
			
			// Set radio button selections
			result = result.replace("id=\"" + filterStarState + "\" ", "id=\"" + filterStarState + "\" checked='checked'");
			result = result.replace("id=\"" + filterEventDate + "\" ", "id=\"" + filterEventDate + "\" checked='checked'");
			
			// Get sports template
			sportsTemplateStartIndex = result.indexOf("<label id=\"sportsItem_%sportsStoreAs%\">");
			sportsTemplateEndIndex = result.indexOf("</label id=\"sportsItem_%sportsStoreAs%\">");
			sportsTemplateOne = result.substring(sportsTemplateStartIndex, sportsTemplateEndIndex);
			sportsResult = "";
			
			// Build radio buttons
			for (var t in filterSportsOptionsDisplay) {
				
				// Get new instance of template ready
				sportsTemplateThis = sportsTemplateOne + "</label>\r\n";
				
				// Replace codes
				sportsTemplateThis = sportsTemplateThis.split("%sportsDisplayName%").join(filterSportsOptionsDisplay[t]);
				sportsTemplateThis = sportsTemplateThis.split("%sportsQuery%").join(filterSportsOptionsQuery[t]);
				sportsTemplateThis = sportsTemplateThis.split("%sportsStoreAs%").join(filterSportsOptionsStoreAs[t]);
				sportsTemplateThis = sportsTemplateThis.split("%sportsChecked%").join(
					(filterSportsOptionsStoreAs[t] === filterSportsSportSelection ? "checked='checked'" : " ")
				);
				
				// Add to result
				sportsResult += sportsTemplateThis;
				
			}// end foreach
			
			// Replace sports template with result
			result = result.replace(sportsTemplateOne, sportsResult);
			
			// Get gender template
			genderTemplateStartIndex = result.indexOf("<label id=\"genderItem_%genderStoreAs%\">");
			genderTemplateEndIndex = result.indexOf("</label id=\"genderItem_%genderStoreAs%\">");
			genderTemplateOne = result.substring(genderTemplateStartIndex, genderTemplateEndIndex);
			genderResult = "";
			
			// Build radio buttons
			for (var t in filterGenderOptionsDisplay) {
				
				// Get new instance of template ready
				genderTemplateThis = genderTemplateOne + "</label>\r\n";
				
				// Replace codes
				genderTemplateThis = genderTemplateThis.split("%genderDisplayName%").join(filterGenderOptionsDisplay[t]);
				genderTemplateThis = genderTemplateThis.split("%genderQuery%").join(filterGenderOptionsQuery[t]);
				genderTemplateThis = genderTemplateThis.split("%genderStoreAs%").join(filterGenderOptionsStoreAs[t]);
				genderTemplateThis = genderTemplateThis.split("%genderChecked%").join(
					(filterGenderOptionsStoreAs[t] === filterGenderGenderSelection ? "checked='checked'" : " ")
				);
				
				// Add to result
				genderResult += genderTemplateThis;
				
			}// end foreach
			
			// Replace gender template with result
			result = result.replace(genderTemplateOne, genderResult);
			
			// Initialize button info array for future popup
			buttonInfo = [];
			
			// Add button for save		
			buttonInfo.push(["Apply", Sports_applyFilter, true]);
			
			// Add button for cancel
			buttonInfo.push(["Cancel", Sports_filterPopupFinish, false]);
			
			// Show popup, and process user response
			neatPopup("Filter Events", result, buttonInfo);
			
			// Add event handlers for filter updating
			window.setTimeout(
				(function() {
					Sports_updateFilterExplanation();
					$(".rdoFilter").change(
						function() {
							Sports_updateFilterExplanation()
						}
					);
				})
			, 2 );
		});
		
	}// end if
	
}// end function

// Function applyFilter : This function applies the filter based upon the dialog's settings.
function Sports_applyFilter() {
	
	var filterBeforeTheDate;
	
	// Get radio buttons selected
	filterStarState = $(".rdoStar:checked").get(0).id;
	filterEventDate = $(".rdoEventDate:checked").get(0).id;
	
	// Set star state filter variables for it
	switch (filterStarState) {
		case "rdoStarAny":
			filterShowStarred = true;
			filterShowUnstarred = true;
			break;
		case "rdoStarStarred":
			filterShowStarred = true;
			filterShowUnstarred = false;
			break;
		case "rdoStarNonStarred":
			filterShowStarred = false;
			filterShowUnstarred = true;
			break;
	}// end switch
	
	// Show or hide starred and unstarred lists
	if (filterShowStarred) {
		$("#eventListStarredDiv").show();
	} else {
		$("#eventListStarredDiv").hide();
	}// end if
	
	if (filterShowUnstarred) {
		$("#eventListNonStarredDiv").show();
	} else {
		$("#eventListNonStarredDiv").hide();
	}// end if
	
	// Set date filter variable for it
	switch (filterEventDate) {
		case "rdoEventDateAny":
			filterBeforeTheDate = null;
			break;
		case "rdoEventDateToday":
			filterBeforeTheDate = getTodayPlusDays(1);// + 1 from it being a before check
			break;
		case "rdoEventDateThisWeek":
			filterBeforeTheDate = getNextDateThatHasDayOfWeekOf(filterBeforeDateDayOfWeek);
			break;
		case "rdoEventDateNextSevenDays":
			filterBeforeTheDate = getTodayPlusDays(8);// + 1 from it being a before check
			break;
		case "rdoEventDateThisMonth":
			filterBeforeTheDate = getFirstDateOfNextMonth();
			break;
		case "rdoEventDateNextThirtyDays":
			filterBeforeTheDate = getTodayPlusDays(31);// + 1 from it being a before check
			break;
		case "rdoEventDateThisYear":
			filterBeforeTheDate = getFirstDateOfNextYear();
			break;
		default:
			filterBeforeTheDate = null;
			break;
	}// end switch
	
	// Set YMD values
	filterAfterTheDateYMD = formatDateToYMD(new Date());
	filterBeforeTheDateYMD = formatDateToYMD(filterBeforeTheDate);
	
	// Set filter for sports and gender
	filterSportsSportSelection = $("#" + $(".rdoSports:checked").get(0).id ).val().trim();
	filterGenderGenderSelection = $("#" + $(".rdoGender:checked").get(0).id ).val().trim();
	
	// Update event list with these settings
	Sports_updateEventData();
	
	// Finish popup
	Sports_filterPopupFinish();
	
}// end function

// Function filterPopupFinish : This function finishes up the pop up for the filter.
function Sports_filterPopupFinish() {
	
	// Reset popup count
	filterPopupCount = 0;
	
}// end function

// Function star : This function toggles a star on a given item.
function Sports_star(eventIndex)
{
	var thisGameId;
	var thisGameIdStarsIndex;
	var previouslyStarred;
	var theItemElementCode;
	var theItemElement;
	var previousElement;
	
	// Get game id of clicked item
	thisGameId = queryEventItemData[eventIndex].gameId;
	
	// Get index of game id within stars
	thisGameIdStarsIndex = allStarData.indexOf(thisGameId);
	
	// Record whether or not previously starred
	previouslyStarred = (thisGameIdStarsIndex >= 0);
	
	// Update star array
	if (previouslyStarred) {
		allStarData.splice(thisGameIdStarsIndex, 1);
		
	} else {
		allStarData.push(thisGameId);
		
	}// end if
	
	// Save star statuses
	queryEventItemData[eventIndex].starState = !previouslyStarred;
	queryEventItemData[eventIndex].starCode = Sports_getStarSource(queryEventItemData[eventIndex].starState);
	
	// Update star image
	$("#eventID" + eventIndex + "star").attr("data", Sports_getStarSource(!previouslyStarred));
	
	// Re-add click enforcement rectangle
	$("#eventID" + eventIndex + "star").find("svg").html( $("#eventID" + eventIndex + "star").find("svg").html() + "<rect class=\"btn\" x=\"0\" y=\"0\" width=\"24\" height=\"24\" />");
	
	// Save star data offline
	saveObjectToOfflineStorage(localEventsStarInformationLocation, allStarData);
	
	// Retrieve the element for moving
	theItemElementCode = "#eventID" + eventIndex;
	theItemElement = $(theItemElementCode);
	
	// Dependigng on star state, move appropiately
	if (queryEventItemData[eventIndex].starState) {
		
		// Move to starred area on top
		$("#eventListNonStarredDiv").remove(theItemElementCode);
		$("#eventListStarredDiv").prepend(theItemElement);
		
		// Toast movement
		Sports_showToast("The event has been starred and moved.");
		
	} else {
		
		// Move to non-starred area
		$("#eventListStarredDiv").remove(theItemElementCode);
		$("#eventListNonStarredDiv").prepend(theItemElement);
		
		// Toast movement
		Sports_showToast("The event has been unstarred and moved.");
		
	}// end if
	
}// end function

// Function getStarSource : This function returns the source of the star image corresponding to a starring status.
function Sports_getStarSource(present) {
	return (present ? starPresentURL : starAbsentURL);
}// end function

// Function testEventAgainstFilters : This function takes an event details object and returns whether or not the current filter allows it.
// Available event details are : index, title, desc, startDate, endDate, gameId, titleFormat, startDateFormat, endDateFormat, dateRange,
// startTimeFormat, endTimeFormat, timeRange, starState, starCode, startDateYMD, endDateYMD
function Sports_testEventAgainstFilters(eventDetails) {
	
	var allow;

	// If event start date is after the filter after the date
	if ((filterAfterTheDateYMD == null) || (eventDetails.startDateYMD >= filterAfterTheDateYMD)) {
		
		// If filter before the date not provided
		if (!filterBeforeTheDateYMD) {
			allow = true;
		
		// If event is before the filter before the date 
		} else if (eventDetails.startDateYMD < filterBeforeTheDateYMD) {
			
			allow = true;
		
		} else {
		// If event is after the filter or on the before the date
			
			allow = false;
			
		}// end if
		
		// If currently allowing, test sport filter
		if (allow && filterSportsSportSelection) {
			allow = eventDetails[filterSportsPrefix + filterSportsSportSelection];
		}// end if
		
		// If currently allowing, test gender filter
		if (allow && filterGenderGenderSelection) {
			allow = eventDetails[filterGenderPrefix + filterGenderGenderSelection];
		}// end if
		
	} else {
		allow = false;
	}// end if
	
	return allow;
}// end function

// Function changeFilterView : This function changes the drop down area visibility for the filters.
function Sports_changeFilterView(id) {

	if($('#'+id+'Inner:visible').length == 0) {
		
		document.getElementById(id + "Inner").style.display = "inline";
	
		//Sets the location of the open/closed icon so that it appears to be in the same location when open and closed.
		switch(id) {
			case "starred":
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -32%; font-size: 20px;\"></i>";		
				break;
			case "date":
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -36%; font-size: 20px;\"></i>";		
				break;
			case "sport":
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -43%; font-size: 20px;\"></i>";		
				break;
			case "gender":
				document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-up\" style=\"right: 1%; top: -31%; font-size: 20px;\"></i>";		
				break;
		}// end switch
		
	} else {
		
		document.getElementById(id + "Inner").style.display = "none";
		document.getElementById(id + "Btn").innerHTML= "<i class=\"icon ion-chevron-down\" style=\"right: 1%; font-size: 20px;\"></i>";
		document.getElementById(id + "Open").style.top= "-30%";
		
	}// end if
	
}// end function

// Function updateFilterExplanation : This function updates the filter explanation based upon the currently checked radio button.
function Sports_updateFilterExplanation() {
	
	// Update filter explanation areas to reflect urrently checked radio button's display attribute
	$("#starredFilter").html( $(".rdoStar:checked").attr("display") );
	$("#dateFilter").html( $(".rdoEventDate:checked").attr("display") );
	$("#sportFilter").html( $(".rdoSports:checked").attr("display") );
	$("#genderFilter").html( $(".rdoGender:checked").attr("display") );
	
}// end function