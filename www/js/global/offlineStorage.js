// Function initializeOfflineStorage : This function prepares the offline data storage.
function initializeOfflineStorage() {
	var ability;
	
	// Test ability
	ability = (typeof(Storage) !== "undefined");
	
	// If storage is not available, alert it
	if (!ability) {
		alert("Warning: There was an error preparing the offline storage system. Saving won't work on this device.");
	}// end if
	
	return ability;
}// end function

// Function saveObjectToOfflineStorage : This function saves something to storage. If the key name ends with .json, it saves an object as a JSON stringified object.
function saveObjectToOfflineStorage(key, content) {
	var actualSaveContent;
	
	// Prepare actual save content
	if (key.toLowerCase().endsWith(".json")) {
		actualSaveContent = JSON.stringify(content);
	} else {
		actualSaveContent = content;
	}// end if
	
	// Save it
	localStorage.setItem(key, actualSaveContent);
	
}// end function

// Function loadObjectFromOfflineStorage : This function loads something from storage. If the key name ends with .json, it returns it as an parsed JSON object.
function loadObjectFromOfflineStorage(key, defaultReturn) {
	var result;
	
	// Get result
	result = localStorage.getItem(key);
	
	// Parse result as object if JSON, or regular if not
	if (key.toLowerCase().endsWith(".json")) {
		result = JSON.parse(result);
	}// end if
	
	// If null, set as default
	if (result == null) {		
		result = defaultReturn;
	}// end if
	
	return result;
}// end function
