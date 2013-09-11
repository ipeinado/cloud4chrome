var value,
	html = document.documentElement,
	uri = 'http://registry.gpii.org/applications/org.chrome.cloud4chrome',
	npserver = chrome.extension.getURL('/sampleProfiles/'),
	xhr = new XMLHttpRequest(),
	userprefs = { token: "", preferences: {} },
	npset,
	xhrstatus = { status: 0 };
	
chrome.runtime.onInstalled.addListener(function() {
	// initialization when your extension is installed or upgraded
}); 

chrome.runtime.onSuspend.addListener(function() {
  chrome.storage.local.clear();
}); 

chrome.storage.onChanged.addListener(function(objects) {
	console.log('There is a change');
}); 

	
chrome.runtime.onMessage.addListener(
  function(message, sender, sendResponse) {
    getNP(message);
    console.log('status at addlistener: ' + xhrstatus.status );
	if (xhrstatus.status == 1) {
	  console.log('NPSet has own property: ' + npset.hasOwnProperty(uri));
	  if (npset.hasOwnProperty(uri)) {
	   var preferences = npset[uri][0].value;
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
	sendResponse({ status: xhrstatus.status });
  }
);

function getNP(token) {
  try {
    xhr.open("GET", npserver + token + ".json", false);
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



// Executes every time the background loads

// ( function () {
	// chrome.storage.sync.get({screenReader: "off", highContrast: "off", textSize: "normal", zoom: "100%", simplifier: "off"}, function(items) {
		// initializePopup(); 
		// for (key in items) {
			// console.log(key + ": " + items[key] + " saved in background"); 
		// }
	// });
// }());	

// Function that sets up the values in the popup


// }

function installCVButtonClicked() {
	// chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		// console.log("button Clicked"); 
		// chrome.tabs.update(tabs[0].id, {url: "https://chrome.google.com/webstore/detail/chromevox/kgejglhpjiefppelpmljglcjbhoiplfn?hl=en"});
		// self.close();
	// }); 
}

function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
}	
  
