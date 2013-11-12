var value,
	html = document.documentElement,
	uri = 'http://registry.gpii.org/applications/org.chrome.cloud4chrome',
	npserver = 'http://preferences.gpii.net/user/',
	xhr = new XMLHttpRequest(),
	userprefs = { token: "", preferences: {} },
	npset,
	xhrstatus = { status: 0, isError: true },
	audio = new Audio("audio/beep-06.wav"),
	attributes = {};

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
	
chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    var isError = true;
    getNP(message);
    console.log('status at addlistener: ' + xhrstatus.status );
	  if (xhrstatus.status == 1) {
	    if (npset.hasOwnProperty(uri)) {
	      var preferences = npset[uri][0].value;
	      isError = false;
	      chrome.storage.local.set(
	        {
		        token: message,
		        preferences: preferences
		      },
		      function() {
		        if (chrome.runtime.lastError) {
		          console.log('Error storing preferences locally');
		        } else {
		          console.log('Preferences saved locally');
		        }
		      }
	      );
	    } 
	  }
	  sendResponse({ status: xhrstatus.status, isError: isError });
  }
);

function getNP(token) {
  try {
    xhr.open("GET", npserver + token , false);
    xhr.send();
  } catch (e) {
    console.log("Error: " + e.message);
  }
}

xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    if (xhr.status == 200) {
	  console.log("code 200");
	  try {
		npset = JSON.parse(xhr.response);
		xhrstatus.status = 1;
  	  } catch (e) {
		console.log('JSON file is not valid');
		xhrstatus.status = 2;
		npset = undefined;
	  }
	} else {
	  console.log("no code 200");
	  xhrstatus.status = 0;
	  npset = undefined;
	}
	console.log(npset);
  }
}

chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.storage.local.get({ 'token' : "", 'preferences' : {} }, function(results) {
		if (!(chrome.runtime.lastError)) {
			if (!(isEmpty(results['preferences']))) {
				setPreferences(results['preferences']);
			}
		}
	});
});

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
					chrome.tabs.executeScript( 	tabs[i].id, 
												{ 	file : 'js/resetTab.js' }
											  );
				}
			});
			if (simplifierIsOn) {
				chrome.tabs.reload();
			}

		}
	}
});

function setPreferences(preferences) {
	if (preferences.hasOwnProperty('screenReaderTTSEnabled')) {
		console.log("NEW screenReaderTTSEnabled: " + preferences['screenReaderTTSEnabled']);
	}

	// FONT SIZE
	if (preferences.hasOwnProperty('fontSize')) {
		switch (preferences['fontSize']) {
			case 'medium':
				attributes['ts'] = 'medium';
				chrome.tabs.executeScript( {code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
					    					function() {
												chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
											}
										  );
			  	break;
			case 'large': 
				attributes['ts'] = 'large';
				chrome.tabs.executeScript( {code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
					    					function() {
												chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
											}
										  );			  	
				break;
			case 'x-large':
				attributes['ts'] = 'x-large';
				chrome.tabs.executeScript( {code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
					    					function() {
												chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
											}
										  );
				break;
			default:
				delete attributes['ts'];
				chrome.tabs.executeScript( {code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
					    					function() {
												chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
											}
										  );
		}
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
	}

	// HIGH CONTRAST
	if (preferences.hasOwnProperty('highContrastEnabled')) {
		if (preferences['highContrastEnabled']) {
		// high contrast is enabled
			if (preferences.hasOwnProperty('highContrastTheme')) {
			// high contrast is enabled and there is a high contrast theme
				switch (preferences['highContrastTheme']) {
					case 'black-white':
						attributes['hc'] = 'bw';
						chrome.tabs.executeScript( {code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
													function() {
														chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
													}
												  );
						break;
					case 'white-black':
						attributes['hc'] = 'wb';
						console.log('inside white-black');
						chrome.tabs.executeScript( { code : 'var attributes = ' + JSON.stringify(attributes) + ';' }, 
												   function() {
												   		chrome.tabs.executeScript( { file : "js/setAttributeToAllElements.js" } );
												   }); 
			 			break;
					case 'yellow-black':
						attributes['hc'] = 'yb';
						chrome.tabs.executeScript({code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
													function() {
														chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
													}); 
						break;
					case 'black-yellow':
						attributes['hc'] = 'by';
						chrome.tabs.executeScript({code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
													function() {
														chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
													});
						break;
					default:
						delete attributes['hc'];
						chrome.tabs.executeScript({code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
													function() {
														chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
													});
						
				}
			}

		} else {
		// high contrast is not enabled
			delete attributes['hc'];
			chrome.tabs.executeScript({code: 'var attributes = ' + JSON.stringify(attributes) + ';' } ,
													function() {
														chrome.tabs.executeScript( { file: 'js/setAttributeToAllElements.js' } );
													});
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
			chrome.tabs.executeScript(null, { file : "js/simplifier.js "});
		}
	}
}

function installCVButtonClicked() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		console.log("button Clicked"); 
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
  
