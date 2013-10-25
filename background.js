var value,
	html = document.documentElement,
	uri = 'http://registry.gpii.org/applications/org.chrome.cloud4chrome',
	npserver = 'http://preferences.gpii.net/user/',
	xhr = new XMLHttpRequest(),
	userprefs = { token: "", preferences: {} },
	npset,
	xhrstatus = { status: 0, isError: true };
	
chrome.runtime.onInstalled.addListener(function() {
	// initialization when your extension is installed or upgraded
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


chrome.storage.onChanged.addListener(function(changes, local) {
	console.log("changes detected in background: " + changes);
	var newPrefs = changes.preferences.newValue,
	    oldPrefs = changes.preferences.oldValud;

	if (typeof newPrefs != 'undefined') {
		setPreferences(newPrefs);
	} else {
		console.log("Pues que no, oiga");
	}
});

function setPreferences(preferences) {
	if (preferences.hasOwnProperty('screenReaderTTSEnabled')) {
		console.log("NEW screenReaderTTSEnabled: " + preferences['screenReaderTTSEnabled']);
	}

	if (preferences.hasOwnProperty('fontSize')) {
		switch (preferences['fontSize']) {
			case 'medium':
				chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("ts");' });
			  	break;
			case 'large': 
				chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("ts", "large");' });
			  	break;
			case 'x-large':
				chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("ts", "x-large");' });
				break;
			default:
			  	break;
		}
	}

	if (preferences.hasOwnProperty['magnification']) {
		switch (preferences['magnification']) {
			case 1:
				chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("zoom");' });
				break;
			case 2:
				chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("zoom", "100%");' });
				break;
			case 3:
				chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("zoom", "200%");' });
				break;
			default:
				break;
		}
	}

	if (preferences.hasOwnProperty('highContrast')) {
		if (preferences['highContrast'] == 'none') {
			chrome.tabs.executeScript({ code : 'document.documentElement.removeAttribute("hc");' });
		} else {
			if (preferences['highContrast'] == 'invert') {
				chrome.tabs.executeScript({ code : 'document.documentElement.setAttribute("hc", "invert");' });
			}
		}
	}

	if (preferences.hasOwnProperty('simplifier')) {
		console.log("NEW simplification: " + preferences['magnification']);
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
  
