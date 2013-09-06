var value,
	html = document.documentElement;

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
// function initializePopup() {
	// chrome.storage.sync.get({screenReader: "off", highContrast: "off", textSize: "normal", zoom: "100%", simplifier: "off"}, function(items) {
	  // for (key in items) {

	    // if (key == "highContrast") {
			// value = items[key];
		    // if (value == "off") {
				// document.getElementById("NoHighContrastRB").checked = true;
				// html.removeAttribute("hc"); 
			// } else if (value == "invert") {
			  // document.getElementById("invertRB").checked = true;
			  // html.setAttribute("hc", "invert"); 
			  // console.log("Invert initializated in background"); 
			// }
		// }
		
		
		// if (key == "textSize") {
			// value = items[key];
			// if (value == "normal") {
				// document.getElementById("textSizeNormal").checked = true;
				// html.removeAttribute("ts");
				// console.log("Text size initilialized to large in background"); 
			// } else if (value == "large") {
				// document.getElementById("textSizeLarge").checked = true;
				// document.documentElement.setAttribute("ts", "large");
				// console.log("Text size initilialized to large in background"); 
			// } else if (value == "x-large") {
        // document.getElementById("textSizeXLarge").checked = true;
        // html.setAttribute("ts", "x-large");
			  // console.log("Text size initilialized to x-large in background"); 
      // }
    // }
  
		// if (key == "zoom") {
			// value = items[key];
			// if (value == "100%") {
				// document.getElementById("zoom100").checked = true;
				// html.removeAttribute("zoom");
				// console.log("Zoom initilialized to 100% in background"); 
			// } else if (value == "200%") {
				// document.getElementById("zoom200").checked = true;
				// html.setAttribute("zoom", "200%");
				// console.log("Zoom initilialized to 200% in background"); 
			// } else if (value == "300%") {
				// document.getElementById("zoom300").checked = true;
				// html.setAttribute("zoom", "300%");
				// console.log("Zoom initilialized to 300% in background"); 
      // }
    // }
		
		// if (key == "screenReader") {
			// var srvalue = items[key];
			// chrome.management.get("kgejglhpjiefppelpmljglcjbhoiplfn", function(extInfo) {
				// try {
					// console.log(extInfo.name + " is installed"); 
					 
					// if (srvalue == "off") {
						// document.getElementById("screenReaderCheckBox").checked = false; 
						// document.getElementById("screenReaderCheckBox").setAttribute("aria-checked", "false");
						// console.log("Screenreader checkbox initializated to false in background"); 
						// if (extInfo.enabled) {
							// chrome.management.setEnabled(extInfo.id, false, function() {
								// console.log("ChromeVox has been disabled in initialization"); 
							// }); 
						// }
							
					// } else if (srvalue == "on") {
						// document.getElementById("screenReaderCheckBox").checked = true; 
						// document.getElementById("screenReaderCheckBox").setAttribute("aria-checked", "true");
						// console.log("Screenreader checkbox initializated to true in background"); 
						// if (!extInfo.enabled) {
							// chrome.management.setEnabled(extInfo.id, true, function() {
								// console.log("ChromeVox has been enabled in initialization"); 
							// }); 
						// }
					// }
				// } catch (e) {
					// console.log("Exception thrown");
					// document.getElementById("screenReaderDivCVInstalled").style.display = "none"; 
					// document.getElementById("screenReaderDivCVNotInstalled").style.display = "block";
				// }
			// });
		// }
	  
	  // if (key == "simplifier") {
	    // value = items[key];
	    // if (value == "on") {
			  // document.getElementById("simplifierCheckBox").checked = true;
			  // document.getElementById("simplifierCheckBox").setAttribute("aria-checked", "true"); 
			  // console.log("Simplification checkbox initialized to true in background"); 
		  // } else if (value == "off") {
		    // document.getElementById("simplifierCheckBox").checked = false;
			// document.getElementById("simplifierCheckBox").setAttribute("aria-checked", "false"); 
		    // console.log("Simplification checkbox initialized to false in background"); 
		  // }
	  // }
	// }
	  
	// }); 
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
  
