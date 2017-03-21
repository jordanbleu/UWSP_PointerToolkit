// Initialize all notes object
var notesLocation = "UWSP-Toolkit-Notes.json";
var notesContentCutPoint = 50;
var allNotes;
var originalNoteIndex;
var originalNoteTitle;
var originalNoteContent;

// This function processes the notes controller when its ready.
(function () {
	'use strict';

	function NotesController($scope, $ionicHistory,  $timeout, $state, $ionicPopup) {
		var abilityToStore;
		
		// Initialize neat popup system
		initializeNeatPopupSystem($scope, $ionicPopup);
		
		// Prepare for offline storage
		abilityToStore = initializeOfflineStorage();
		
		// If able, load all notes
		if (abilityToStore) {
			loadAllNotes();
		}// end if

		// Show note list and hide note editor
		$('#editNotes').hide();
		$('#notesFab').show();
		$('#noteList').show();
		
	}// end function

	angular
	.module('notes', [])
	.controller('NotesController', NotesController);
})();

// Function startNotes : This function starts a note for editing. This handles new notes, and editing existing notes.
// Parameter e: event arguments
function startNotes(e) {
	
   

	// Variables
	var srcId;
	var noteTitle;
	var noteContent;
	
	// Get trigger id
	srcId = (e.target) ? e.target : e.id;
	
	// If new note title and content
	if (srcId == "notesFab") {
		
		// Note original content as blank
		noteTitle = "";
		noteContent = "";
		originalNoteTitle = "";
		originalNoteContent = "";
		originalNoteIndex = -1;
		
		// Hide delete
		$("#btnDelete").hide();
		
	} else {
	// If existing note and content
	
		// Get title of note
		var noteIndex;
		var noteTitle;
		var noteContent;
		
		// Get note title
		noteTitle = $("#" + srcId).find(".noteTitle").html();
		
		// Get note content
		originalNoteIndex = 0;
		while ((originalNoteIndex < allNotes.length) && (allNotes[originalNoteIndex].title != noteTitle)) {
			originalNoteIndex++;			
		}// end each
		
		noteContent = allNotes[originalNoteIndex].content;
		
		// Record original note content
		originalNoteTitle = noteTitle;
		originalNoteContent = noteContent;
		
		// Show delete
		$("#btnDelete").show();
		
	}// end if
			
	// Set new note text
	$('#newTitle').val( htmlUnescape(noteTitle) );
	$('#newNote').val( htmlUnescape(noteContent) );

	// Show note list
	$('#editNotes').show();
	
	// Hide notes fab and list
	$('#notesFab').hide();
	$('#noteList').hide();

	//$("#newTitle").trigger("focus");
	document.getElementById("newTitle").focus();
	
}// end function

// Function endNotes : This function ends the note editing.
// Parameter saveNote : Should the currently being edited note be saved to the collection?
function endNotes(saveNote) {
	
	// Variables
	var newNoteTitle;
	var newNoteContent;
	var duplicates;
	var finished;
	
	// Assume finished unless otherwise shown
	finished = true;
	
	// If saving:
	if (saveNote) {
		
		// Get new note title and content
		newNoteTitle = htmlEscape( $('#newTitle').val().trim() );
		newNoteContent = htmlEscape( $('#newNote').val().trim() );
		
		// If new note does not have a title	
		if (newNoteTitle == "") {
			newNoteTitle = newNoteContent.substring(0, 25);
		}// end if
		
		// Check for duplicates
		duplicates = false;
		if (newNoteTitle != originalNoteTitle) {
			for (i in allNotes) {
				
				// If title exists, note as duplicate
				if (allNotes[i].title === newNoteTitle) {
					duplicates = true;
				}// end if
				
			}// end each
		}// end if
		
		// If title is already in use
		if (duplicates) {
			
			neatPopup("Duplicate Note","A note already has that title. Please choose another title.");
			finished = false;
			
		} else {
			
			// Delete any original note
			if (originalNoteIndex >= 0) {
				allNotes.splice(originalNoteIndex, 1);
				
			}// end if
						
			// If a title, save note
			if (newNoteTitle !== "") {
				
				// Add note
				addNote(newNoteTitle, newNoteContent);
				
				// Save all notes
				saveAllNotes();
				
			}// end if
			
		}// end if
		
	}// end if
	
	// Finish notes
	if (finished) {
		
		// Remake note page
		setupNotesFromObject();
		
		// Hide note editor
		$('#editNotes').hide();
		
		// Show note list
		$('#notesFab').show();
		$('#noteList').show();
		
	}// end if
	
}// end function

// Function addNote : This function adds a new note to the list with a given title and content.
function addNote(title, content) {
	
	// Variables
	var nextNoteObject;

	// Add new note object
	nextNoteObject = {};
	nextNoteObject.title = title;
	nextNoteObject.content = content;
	allNotes.unshift(nextNoteObject);
	
	// Update page
	setupNotesFromObject();
	
}// end function

// Function deleteNote : This function deletes a note.
function deleteNote() {

	// Confirm deletion of note
	neatPopup("Delete Confirmation", "Are you sure you want to delete this note?", [["Yes", deleteCurrentNote, true], ["No", null, false]]);
	
}// end function

// Function deleteCurrentNote : This function deletes the current note based upon the original note index.
function deleteCurrentNote() {
	
	// Clear content of note
	$('#newTitle').val("");
	$('#newNote').val("");
	
	// Delete note
	allNotes.splice(originalNoteIndex, 1);

	// End editing of note without saving new note
	endNotes(false);
	
	// Save note state
	saveAllNotes();
	
}// end function

// Function loadAllNotes : This function loads all notes from offline storage and displays them.
function loadAllNotes() {
	
	// Load all notes into object, defaulting with empty
	allNotes = loadObjectFromOfflineStorage(notesLocation, []);
	
	// Set up from the loaded notes
	setupNotesFromObject();
	
}// end function

// Function saveAllNotes : This function saves all notes to offline storage.
function saveAllNotes() {
	
	// Save object of notes
	saveObjectToOfflineStorage(notesLocation, allNotes);
	
}// end function

// Function setupNotesFromObject : This function sets up the page to match the object.
function setupNotesFromObject() {
	var title;
	var content;
	var contentExcerpt;
	var newNoteCard;
	
	// Clear page of notes
	$('#noteList').html("");
	
	// Clear null notes
	allNotes = clearArrayOfNulls(allNotes);
	
	// Add notes to page	
	for (var i in allNotes) {
		
		// Get note data
		title = allNotes[i].title;
		content = allNotes[i].content;
		
		// Determine content excerpt
		if (content.length < notesContentCutPoint) {
			contentExcerpt = content.slice(0, content.length);
		} else {
			contentExcerpt = content.slice(0, notesContentCutPoint) + "...";
		}// end if
		
		// Make new note card's HTML
		newNoteCard = "<div id=\"note" + i + "\" class=\"card\" onclick=\"startNotes(this)\"><div class=\"item item-text-wrap\"><h2 class='noteTitle'>" + title + "</h2><span class='noteContent'>" + contentExcerpt + "</span></div></div>";
		
		// Add new note to page
		$('#noteList').html($('#noteList').html() + newNoteCard);
		
	}// end for
	
}// end function
