// Initialize all quick links variables
var linksLocation = "UWSP-Toolkit-Links.json";
var allLinks;
var originalLinkIndex;
var originalLinkTitle;
var originalLinkContent;
var currentLinkIndex;
var originalLinkStar;
var currentLinkTitle;
var currentLinkContent;
var currentLinkStar;
var errorMessage;
var activeEdit;
var activeDelete;
var popupSafetyCount;

// This function processes the quick links controller when its ready.
(function () {
	'use strict';
	
	function QuickLinksController($scope, $ionicHistory, $timeout, $state, $ionicPopup) {
		
		var abilityToStore;
		
		// Initialize neat popup system
		initializeNeatPopupSystem($scope, $ionicPopup);
		
		// Initialize variables about option activity
		activeEdit = false;
		activeDelete = false;
		
		// Prepare for offline storage
		abilityToStore = initializeOfflineStorage();
		
		// If able, load all links
		if (abilityToStore) {
			QuickLinks_loadAllLinks();
		}// end if

		// Show link list and hide link editor
		$('#editLinks').hide();
		$('#linksList').show();
		
		// Update looks for link buttons
		QuickLinks_updateLooksForEditAndDelete();
		
		// Note popup safety count as zero
		popupSafetyCount = 0;
	}
	
	angular
		.module('quickLinks', [])
		.controller('QuickLinksController', QuickLinksController);
})();

// This function toggles the edit function activity.
function QuickLinks_toggleEdit() {
	
	// Toggle edit
	activeEdit = !activeEdit;
	
	// End deleting if in use
	activeDelete = false;
	
	// Update looks for edit and delete
	QuickLinks_updateLooksForEditAndDelete();
	
}// end function

// This function toggles the delete function activity.
function QuickLinks_toggleDelete() {
	var amountDeleting;
	var deleteMessage;
	
	amountDeleting = $(".preparingForDelete").length;
	
	// If there are links that are requested to be deleted
	if (amountDeleting > 0) {
		
		// Determine delete message
		if (amountDeleting == 1) {
			deleteMessage = "Are you sure you want to delete this link?";
		} else {
			deleteMessage = "Are you sure you want to delete the selected links?";
		}// end if
		
		// Confirm delete
		confirmDelete = neatPopup("Delete Confirmation", deleteMessage, [["Yes", QuickLinks_deleteSelectedLinks, true], ["No", QuickLinks_deleteRemoveDeletionSelection, false]]);
		
	} else {
		
		// Toggle delete
		activeDelete = !activeDelete;

		// End editing if in use
		activeEdit = false;

		// Update looks for edit and delete
		QuickLinks_updateLooksForEditAndDelete();
		
	}// end if
	
}// end function

// This function updates the look of the edit and delete buttons based upon their current activity.
function QuickLinks_updateLooksForEditAndDelete() {
	
	// Update links list
	QuickLinks_setupLinksFromObject();
	
	// If there are links
	if (allLinks.length > 0) {
		
		// Remove active and inactive classes for both
		$("#btnEdit").css("display", "inline");
		$("#btnDelete").css("display", "inline");
		$(".iconActive").removeClass("iconActive");
		$(".iconInactive").removeClass("iconInactive");
		
		// Add appropiate class to show buttons as active or inactive
		if (activeEdit) {
			$("#btnEdit").addClass("iconActive");
		} else {
			$("#btnEdit").addClass("iconInactive");
		}// end if
		
		if (activeDelete) {
			$("#btnDelete").addClass("iconActive");
		} else {
			$("#btnDelete").addClass("iconInactive");
			$(".preparingForDelete").removeClass("preparingForDelete");
		}// end if
	
	} else {
	// If no links, hide buttons

		$("#btnEdit").css("display", "none");
		$("#btnDelete").css("display", "none");
		
	}// end if
	
}// end function

// Function startLinks : This function starts a new link for editing.
// Param e : The event which triggered the starting of the links.
function QuickLinks_startLinks(e) {
	
	// Variables
	var srcId;
	var index;
	
	// Clear error message
	errorMessage = "";
	
	// Get trigger id
	srcId = (e.target) ? e.target : e.id;
	
	// If editing or new link
	if ((activeEdit) || (srcId == "linksFab")) {

		// Turn off active edit
		activeEdit = false;
		QuickLinks_updateLooksForEditAndDelete();
		
		// If new note title and content
		if (srcId == "linksFab") {
			
			// Note new current content as blank
			currentLinkTitle = "";
			currentLinkContent = "";
			currentLinkStar = false;
			currentLinkIndex = -1;
			
			// Note original content as matching it and index of -1 to indicate new
			originalLinkTitle = currentLinkTitle;
			originalLinkContent = currentLinkContent;
			originalLinkStar = currentLinkStar;
			originalLinkIndex = currentLinkIndex;
				
		} else {
		// If existing link and content from storage
			
			// Get link index
			originalLinkIndex = parseInt( srcId.replace("link","") );
			
			// Get link content information
			currentLinkIndex = originalLinkIndex;
			currentLinkTitle = allLinks[originalLinkIndex].title;
			currentLinkContent = allLinks[originalLinkIndex].content;
			currentLinkStar = allLinks[originalLinkIndex].starred;
			
			// Record original note content escaped
			originalLinkTitle = currentLinkTitle;
			originalLinkContent = currentLinkContent;
			originalLinkStar = currentLinkStar;
			
		}// end if
		
		// Set new link text
		currentLinkTitle = htmlUnescape( currentLinkTitle );
		currentLinkContent = htmlUnescape( currentLinkContent );

		// Show quick links editor
		QuickLinks_loadEditor();
	
	} else if (activeDelete) {
	// If deleting
		
		// Set for deletion
		$("#" + srcId).toggleClass("preparingForDelete");
		
	}// end if
	
}// end function

// returns true if the URL only has good characters
function urlHasGoodChars(url) {
    var res = url.match(/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/);
    if(res == null)
        return false;
    else
        return true;
}

// Function endLinkEdit : This function ends the link editing.
// Parameter saveLinks : Should the currently being edited link be saved to the collection?
function QuickLinks_endLinkEdit(saveLinks, skipVerification) {

	// Variables
	var newLinkTitle;
	var newLinkURL;
	var newLinkStarred;
	var attemptedBestURL;
	var removedLink;
	var duplicates;
	var finished;
	var verificationSuccess;
	
	// Check popup safety count
	if (popupSafetyCount == 0) {
		popupSafetyCount = 1;
		
		// Initialize error message
		errorMessage = "";
		
		// Assume finished unless otherwise shown
		finished = true;
		
		// Assume verified unless otherwise shown
		verificationSuccess = true;
		
		// If not saving:
		if (!saveLinks) {
			
			// Revert star status
			QuickLinks_star(originalLinkIndex, originalLinkStar);
		
		// If saving:
		} else {
			
			// Get new link title and content
			if ( $('#newLinkTitle').length == 0 ) {
				newLinkTitle = currentLinkTitle;
				newLinkURL = currentLinkContent;
				
			} else {
				newLinkTitle = htmlEscape ( $('#newLinkTitle').val().trim() );
				newLinkURL = $('#newLinkURL').val().trim().replace(" ", "");

                


                // if the user left off the 'http://' from the URL, add it for them
				if (newLinkURL.substr(0, 7) != "http://" && newLinkURL.substr(0, 8) != "https://") {
				    newLinkURL = "http://" + newLinkURL; // this makes a big assumption that the URL starts with that 
				}                                           // but in most cases it does so its okay
                                
			}// end if
			
			// Set new content
			currentLinkTitle = newLinkTitle;
			currentLinkContent = newLinkURL;
			
			// If no title but content, make title match content even though it might be altered later
			if (newLinkTitle == "") {
				newLinkTitle = newLinkURL;
			}// end if
			


			// Check for duplicates
			duplicates = false;
			if (newLinkTitle != originalLinkTitle) {
				for (i in allLinks) {
					
					// If title exists, note as duplicate
					if (allLinks[i].title === newLinkTitle) {
						duplicates = true;
					}// end if
					
				}// end each
			}// end if
			
			// If title is already in use
			if (duplicates) {

			    // Note duplicate link
			    errorMessage += "Duplicate Link Title: A link already has that title. Please choose another title.<br>";
			    finished = false;
			// if the URL is not valid
			} else if (!isValidURL(newLinkURL)) {
			    // Note bad URL
			    errorMessage += "Invalid URL: The URL you entered is not valid.  Please try again.<br/>";
			    finished = false;
			} else if (!urlHasGoodChars(newLinkURL)){
			    // we've got some bad characters in there
			    errorMessage += "Invalid characters:  The URL you entered has some invalid characters.  Please make sure you've typed it correctly.";
			    finished = false;
			
			} else {

			    // Get new starred status
			    newLinkStarred = currentLinkStar;

			    // If link has title and URL:
			    if ((newLinkTitle != "") && (newLinkURL != "")) {

			        // If cannot connect to internet
			        if ((window.Connection) && (navigator.connection.type == Connection.NONE)) {

			            // Add to errors lack of internet connection
			            errorMessage += "Could not test URL. No internet connection detected. Please connect before adding this link.<br>";
			            finished = false;

			        } else {

			            // Get best URL possible
			            if (!skipVerification) {

			                // Get attempted best URL
			                attemptedBestURL = getBestURL(newLinkURL);
			                if (attemptedBestURL != null) {
			                    newLinkURL = attemptedBestURL;
			                } else {
			                    finished = false;
			                    newLinkURL = null;
			                    verificationSuccess = false;
			                }// end if

			            }// end if

			        }// end if

			        // If usable URL or no internet connection present:
			        if (newLinkURL != null) {

			            // If any original link:
			            if (originalLinkIndex >= 0) {

			                // Remove link from all links
			                removedLink = allLinks[originalLinkIndex];
			                allLinks.splice(originalLinkIndex, 1);

			            }// end if

			            // Add new link
			            QuickLinks_addLink(newLinkTitle, newLinkURL, newLinkStarred);

			            // Save all links
			            QuickLinks_saveAllLinks();

			        } else {

			            // Notify of invalid URL, and don't progress
			            errorMessage += "Invalid URL: The URL could not be verified. Make sure there are no typos.<br>";
			            finished = false;

			        }// end if

			    }// end if

			}// end if
			
		}// end if
		
		// Finish links editing?
		if (finished) {
			
			// Done: Update looks and remake links list
			QuickLinks_updateLooksForEditAndDelete();
			
		} else {
			
			// Surround existing error messages with paragraph
			if (errorMessage != "") {
				errorMessage = "<p>" + errorMessage + "</p>";
			}// end if
			
			// Not done: Load next popup
			if (verificationSuccess) {
				QuickLinks_loadEditor();
			} else {
				QuickLinks_loadVerificationFailurePopup();
			}// end if			
			
		}// end if
	
		// Add timer to reset popup safety count
		window.setTimeout(
			function() {
				popupSafetyCount = 0;
			}, 100
		);
		
	}// end if
	
}// end function

// Function star : This function sets the starred status of a link given an index, and new status: true, false, or other. Other means toggle.
function QuickLinks_star(index, newStatus) {
	
	// If index for new link
	if (index == -1) {
		
		// Process based upon new status. Either set or swap
		if (typeof(newStatus) === "boolean") {
			currentLinkStar = newStatus;
		} else {
			currentLinkStar = !currentLinkStar;
		}// end if
		
	}// end if

	// If index for existing link
	if ((index >= 0) && (index < allLinks.length)) {
		
		// Process based upon new status. Either set or swap
		if (typeof(newStatus) === "boolean") {
			allLinks[index].starred = newStatus;
		} else {
			allLinks[index].starred = !allLinks[index].starred;
		}// end if
		
	}// end if
	
	// Update editor link to reflect status
	if (currentLinkStar) {
		$(".iconStarForEditor").addClass("iconStarStarred");
		$(".iconStarForEditor").addClass("ion-android-star");
		$(".iconStarForEditor").removeClass("iconStarNonStarred");
		$(".iconStarForEditor").removeClass("ion-android-star-outline");
	} else {
		$(".iconStarForEditor").removeClass("iconStarStarred");
		$(".iconStarForEditor").removeClass("ion-android-star");
		$(".iconStarForEditor").addClass("iconStarNonStarred");
		$(".iconStarForEditor").addClass("ion-android-star-outline");
		
	}// end if
	
}// end function

// Function addLink : This function adds a new link to the list with a given title, content, and starred status. The date is automatically determined. No escaping is done here.
function QuickLinks_addLink(title, content, starred) {
	
	// Variables
	var currentDateForSorting;
	var nextLinkObject;
	
	// Get current date and time for sorting
	currentDateForSorting = formatDateToYMDHMS(new Date()); // Not formatted due to never being shown 

	// Create new link object
	nextLinkObject = {};
	nextLinkObject.title = title;
	nextLinkObject.content = content;
	nextLinkObject.lastEditDate = currentDateForSorting;
	nextLinkObject.starred = starred;
	
	// Add new link object
	allLinks.unshift(nextLinkObject);
	
	// Update page
	QuickLinks_setupLinksFromObject();
	
}// end function

// Function prepareToDeleteLink : This function waits a millisecond and prepares to delete a link.
function QuickLinks_prepareToDeleteLink() {
	
	// Mark current for deletion
	$("#link" + currentLinkIndex).addClass("preparingForDelete");
	
	// Wait a millisecond before starting the delete process
	window.setTimeout(QuickLinks_toggleDelete, 1);
	
}// end function

// Function deleteRemoveDeletionSelection : This function unselects all items for deletion.
function QuickLinks_deleteRemoveDeletionSelection() {
	
	// De-select the ones marked for deletion
	$(".preparingForDelete").removeClass("preparingForDelete");
	
	// End deletion
	activeDelete = false;
	
	// Update looks
	QuickLinks_updateLooksForEditAndDelete();
	
}// end function

// Function deleteSelectedLinks : This function deletes all currently marked for deletion links.
function QuickLinks_deleteSelectedLinks() {
	var deleteItems;
	var subtractionOffset;
	var confirmDelete;
	
	// Count to be deleted items
	deleteItems = $(".preparingForDelete");
	
	// Initialize subtraction offset as splice removes item altogether
	subtractionOffset = 0;
	
	// Delete each from object
	deleteItems.each(function() {
		
		// Get index of item accounting for already deleted items
		index = parseInt(this.id.replace("link", "")) - subtractionOffset;
		
		// Remove from all links object
		allLinks.splice(index, 1);
		
		// Update subtraction index
		subtractionOffset += 1;
		
	});
	
	// Save links
	QuickLinks_saveAllLinks();
	
	// End editing and deleting
	activeEdit = false;
	activeDelete = false;

	// Update looks for edit and delete while remaking list
	QuickLinks_updateLooksForEditAndDelete();
	
}// end function

// Function loadAllLinks : This function loads all links from offline storage and displays them.
function QuickLinks_loadAllLinks() {
	
	// Load all links into object, defaulting with empty
	allLinks = loadObjectFromOfflineStorage(linksLocation, []);
	
	// Set up from the loaded links
	QuickLinks_setupLinksFromObject();
	
}// end function

// Function saveAllLinks : This function saves all links to offline storage.
function QuickLinks_saveAllLinks() {
	
	// Save object of links
	saveObjectToOfflineStorage(linksLocation, allLinks);
	
}// end function

// Function setupLinksFromObject : This function sets up the links list to match the object.
function QuickLinks_setupLinksFromObject() {
	var title;
	var content;
	var newLinksCard;
	var starredIndices;
	var nonStarredIndices;
	
	// Clear page of links
	$('#myLinksMainLinks').html("");
	
	// Clear null links
	allLinks = clearArrayOfNulls(allLinks);
	
	// Initialize arrays for starred and non-starred
	starredIndices = [];
	nonStarredIndices = [];
	
	// Sort indices into starred and non-starred
	for (var i in allLinks) {
		
		// If starred link
		if (allLinks[i].starred) {
			starredIndices.push(i);
		} else {
			nonStarredIndices.push(i);
		}// end if
		
	}// end for
	
	// Add links to page, starting with starred, and then doing the non-starred
	for (var i in starredIndices) {
		QuickLinks_setupLinksFromObjectAddFromIndex(starredIndices[i]);
	}// end for
	for (var i in nonStarredIndices) {
		QuickLinks_setupLinksFromObjectAddFromIndex(nonStarredIndices[i]);
	}// end for
	
}// end function

// Function setupLinksFromObjectAtIndex :	This function sets up the links list to match the object at a particular index.
function QuickLinks_setupLinksFromObjectAddFromIndex(index) {
	
	var title;
	var content;
	var newLinksCard;
	
	// Get links data
	title = allLinks[index].title;
	content = allLinks[index].content;
	
	// Make new link card's HTML
	if ((activeEdit) || (activeDelete)) {
		newLinksCard = "<div";
		newLinksCard += " onclick=\"QuickLinks_startLinks(this)\"";
	} else {
		newLinksCard = "<a onclick=\"navigateToURL('";
		newLinksCard += content;
		newLinksCard += "'); return false;\"";
	}// end if
	
	newLinksCard += " id=\"link" + index + "\" class=\"linkCard\" ";
	newLinksCard += "><h2 class=\"item item-text-wrap\ linkTitle\">" + title;
	newLinksCard += "<span class=\"rightAlign icon icon ";
	if (allLinks[index].starred) {
		newLinksCard += "ion-android-star iconStarStarred";
	} else {
		newLinksCard += "ion-android-star-outline iconStarNonStarred";
	}// end if
	newLinksCard += " iconStarForList\"></span></h2>";
	
	if ((activeEdit) || (activeDelete)) {
		newLinksCard += "</div>";
	} else {
		newLinksCard += "</a>";
	}// end if
	
	// Add new link to page
	$('#myLinksMainLinks').html(
		$('#myLinksMainLinks').html() + newLinksCard
	);
	
}// end function

// Function loadEditor : This function launches the quick links editor form.
function QuickLinks_loadEditor() {	
	var result;
	var findingIndex;
	var buttonInfo;
	
	$.get("js/quicklinks/quicklinks.editor.form.html", function(result) {
		var starCode;
		
		// Add title and content
		result = result.replace("%newLinkTitle%", currentLinkTitle);
		result = result.replace("%newLinkURL%", currentLinkContent);
		
		// Generate star code
		starCode = "<span class=\"rightAlign icon icon ";
		if (currentLinkStar) {
			starCode += "ion-android-star iconStarStarred";
		} else {
			starCode += "ion-android-star-outline iconStarNonStarred";
		}// end if
		starCode += " iconStarForEditor\" onclick=\"";
		starCode += "QuickLinks_star(-1, null)";
		starCode += "\"></span>";
		
		// Add star
		result = result.replace("%newLinkStar%", starCode);
		
		// Add error message
		result = result.replace("%linkError%", errorMessage);
		
		// Initialize button info array for future popup
		buttonInfo = [];
		
		// Add button for save		
		buttonInfo.push(["Save", function() { QuickLinks_endLinkEdit(true, false); }, true]);
		
		// Add button for delete if editing existing link
		if (currentLinkIndex >= 0) {
			buttonInfo.push(["Delete", QuickLinks_prepareToDeleteLink, false]);
		}// end if		
		
		// Add button for cancel
		buttonInfo.push(["Cancel", function() { QuickLinks_endLinkEdit(false, false); }, false]);
		
		// Show popup, and process user response
		neatPopup("Quick Links Editor", result, buttonInfo);
	});
	
}// end function

// Function loadVerificationFailurePopup : This function launches the quick links verification failure pop-up form.
function QuickLinks_loadVerificationFailurePopup() {

	$.get("js/quicklinks/quicklinks.verification.failure.html", function(result) {
	
		// Initialize button info array for future popup
		buttonInfo = [];
		
		// Add buttons
		buttonInfo.push(["Yes", function() { window.setTimeout(function(){QuickLinks_endLinkEdit(true, true);}, 2) }, true]);
		buttonInfo.push(["No", function() { window.setTimeout(function(){ QuickLinks_loadEditor() }, 2) }, false]);
		
		// Show popup, and process user response
		neatPopup("URL Verification Failure", result, buttonInfo);
	});
	
}// end function
