'use strict';

var value,
	html = document.documentElement,
	uri = 'org.chrome.cloud4chrome',
	npserver = 'http://flowmanager.gpii.net/',
	suffix = '/settings/%7B"OS":%7B"id":"web"%7D,"solutions":[%7B"id":"org.chrome.cloud4chrome"%7D]%7D',
	audio = new Audio("audio/beep-06.wav");


chrome.windows.onCreated.addListener(function() {
	audio.play();
});

// initialization when your extension is installed or upgraded	
chrome.runtime.onInstalled.addListener(function(details) {
	audio.play();
	chrome.storage.local.set({ "token" : "", "preferences" : {} });
});

chrome.runtime.onSuspend.addListener(function() {
  chrome.storage.local.clear();
}); 

// Receives a message from the popup with the token when the token form is submitted	
chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
  	
  	if (message.action == "token submitted") {
  		requestPreferences(message.token);
  	}
  }
);

function requestPreferences(token) {

	var xhr = new XMLHttpRequest();
	var url= npserver + token + suffix; 

	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if (this.readyState == 4) {

			if (this.status == 200) {

				processPreferences({ token : token, payloadJSON: this.response });

			// Got a different response (403, 404, 500)
			} else {

				console.log("Error downloading preferences");
				chrome.runtime.sendMessage({ action : "preferences downloaded", status: "error", message:xhr.statusText });
			
			}
		}
	};

	xhr.send(); 
}

function processPreferences(userPreferencesDownloaded) {

	try {
		var token = userPreferencesDownloaded.token, 
			payload = JSON.parse(userPreferencesDownloaded.payloadJSON);

		if (!(isEmpty(payload)) && (payload.hasOwnProperty(uri))) {
			chrome.storage.local.set({ token : token, preferences : payload[uri]}, function() {
				if (chrome.runtime.lastError) {
					console.log("Error storing preferences locally: " + chrome.runtime.lastError.message);
					chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : "Error storing preferences locally" });
				} else {
					console.log("Preferences saved locally");
					chrome.runtime.sendMessage({ action : "preferences downloaded", status : "success", message: "Preferences saved locally" });
				}
			});

		} else {
			chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : "Preferences set is empty"});	
		}

	// There has been an error processing preferences
	} catch (e) {
		chrome.runtime.sendMessage({ action : "preferences downloaded", status : "error", message : "Error processing preferences"});
	}
}

// New window has been activated
chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.storage.local.get({ 'token' : "", 'preferences' : {} }, function(results) {
		if (!(chrome.runtime.lastError)) {
			if (!(isEmpty(results['preferences']))) {
				setPreferences(results['preferences']);
			}
		}
	});
});


// Window has been updated
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		chrome.storage.local.get({'token' : "", "preferences" : {} }, function(results) {
			if (!(chrome.runtime.lastError)) {
				if (!(isEmpty(results['preferences']))) {
					setPreferences(results['preferences']);
				}
			}
		});
	}
});


// Preferences have changed
chrome.storage.onChanged.addListener(function(changes, local) {
	console.log("changes detected in background: " + changes);
	var newPrefs = changes.preferences.newValue,
	    oldPrefs = changes.preferences.oldValue;

	if (!(isEmpty(newPrefs))) {
		setPreferences(newPrefs);
	} else {
		if (oldPrefs != undefined) {
			var simplifierIsOn = oldPrefs['simplifier'] || false;
			console.log("SimplifierIsOn: " + simplifierIsOn);
			chrome.tabs.query({currentWindow : true} , function(tabs) {
				for (var i = 0; i < tabs.length; i++) {
					chrome.tabs.executeScript({ code : " document.documentElement.removeAttribute('zoom');document.documentElement.removeAttribute('hc');document.documentElement.removeAttribute('ic');[].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('ts');node.removeAttribute('hc'); });" });
				}
			});
			if (simplifierIsOn) {
				chrome.tabs.reload();
			}

		}
	}
});

function setPreferences(preferences) {

	// SCREEN READER ENABLED
	if (preferences.hasOwnProperty('screenReaderTTSEnabled')) {
		console.log("NEW screenReaderTTSEnabled: " + preferences['screenReaderTTSEnabled']);
	}

	// FONT SIZE
	if (preferences.hasOwnProperty('fontSize')) {
		switch (preferences['fontSize']) {
			case 'medium':
				chrome.tabs.executeScript({ code: "[].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('ts', 'medium'); });" });
			  	break;
			case 'large': 
				chrome.tabs.executeScript({ code: "[].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('ts', 'large'); });" });			  	
				break;
			case 'x-large':
				chrome.tabs.executeScript({ code: "[].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('ts', 'x-large'); });" });
				break;
			default:
				chrome.tabs.executeScript({ code: "[].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('ts'); });" });
		}
	} else {
		chrome.tabs.executeScript( {code: "[].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('ts'); });" }); 
	}

	// MAGNIFICATION
	if (preferences.hasOwnProperty('magnifierEnabled')) {
		if (preferences['magnifierEnabled']) {
		// magnifier is enabled
			if (preferences.hasOwnProperty('magnification')) {
			// magnifier is enabled and there is a value for magnification
				switch (preferences['magnification']) {
					case 1:
						chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("zoom");' });
						break;
					case 2:
						chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("zoom", "200%");' });
						break;
					case 3:
						chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("zoom", "300%");' });
						break;
				}
			} else {
			// magnifier is enabled but there is no value for magnification
				chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("zoom");' });
			}
		} else {
		// magnifier is not enabled
			chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("zoom");' });
		}
	} else {
		chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("zoom");' });
	}

	// HIGH CONTRAST
	if (preferences.hasOwnProperty('highContrastEnabled')) {
		if (preferences['highContrastEnabled']) {
		// high contrast is enabled
			if (preferences.hasOwnProperty('highContrastTheme')) {
			// high contrast is enabled and there is a high contrast
				switch (preferences['highContrastTheme']) {
					case 'black-white':
						chrome.tabs.executeScript( {code: "[].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('hc'); }); document.documentElement.setAttribute('hc', 'bw'); "});
						break;
					case 'white-black':
						chrome.tabs.executeScript( { code : "document.documentElement.removeAttribute('hc'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('hc', 'wb'); });" }); 
			 			break;
					case 'yellow-black':
						chrome.tabs.executeScript({code: "document.documentElement.removeAttribute('hc'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('hc', 'yb'); });" }); 
						break;
					case 'black-yellow':
						chrome.tabs.executeScript({code: "document.documentElement.removeAttribute('hc'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.setAttribute('hc', 'by'); });" });
						break;
					default:
						chrome.tabs.executeScript({code: "document.documentElement.removeAttribute('hc'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('hc'); });" });
						
				}
			}

		} else {
			// high contrast is not enabled
			chrome.tabs.executeScript({code: "document.documentElement.removeAttribute('hc'); [].forEach.call(document.querySelectorAll('body *'), function(node) { node.removeAttribute('hc'); });" });
		}
	} // End High Contrast


	//INVERT COLOURS
	if (preferences.hasOwnProperty('invertColours')) {
		if (preferences['invertColours']) {
			console.log("inverting colours");
			chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("ic", "invert");' });
		} else {
			chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("ic");' });
		}
	}

	// SIMPLIFIER
	if (preferences.hasOwnProperty('simplifier')) {
		if (preferences['simplifier']) {
			chrome.tabs.executeScript({ file : "js/simplifier.js" });
		}
	}
}

function installCV() {
	console.log("Inside installCV");
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.update(tabs[0].id, {url: "https://chrome.google.com/webstore/detail/chromevox/kgejglhpjiefppelpmljglcjbhoiplfn?hl=en"});
		self.close();
	}); 
}

function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
}	
  
