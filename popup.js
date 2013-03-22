// popup.js holds all the handlers for the interactive elements of popup.html.
// handlers store the value in sync storage and change aria values

// Set all handlers
document.addEventListener("DOMContentLoaded", function() {
	document.getElementById("configTitle").focus(); 
	document.getElementById("installCVButton").addEventListener("click", installCVButtonClicked); 
	document.getElementById("screenReaderCheckBox").addEventListener("click", screenReaderClicked);
	document.getElementById("NoHighContrastRB").addEventListener("click", noHighContrastClicked);
	document.getElementById("invertRB").addEventListener("click", invertRBClicked);  
	document.getElementById("textSizeNormal").addEventListener("click", textSizeNormalClicked);
	document.getElementById("textSizeLarge").addEventListener("click", textSizeLargeClicked);
	document.getElementById("textSizeXLarge").addEventListener("click", textSizeXLargeClicked);
	document.getElementById("zoom100").addEventListener("click", zoom100Clicked);
	document.getElementById("zoom200").addEventListener("click", zoom200Clicked);
	document.getElementById("zoom300").addEventListener("click", zoom300Clicked);
	document.getElementById("simplifierCheckBox").addEventListener("click", simplifierCheckBoxClicked);

}); 

function screenReaderClicked() {
	if (this.checked == true) {
		chrome.storage.sync.set({screenReader: "on"}, function() {
			document.getElementById("screenReaderCheckBox").setAttribute("aria-checked", "true");
			
			// Activate chromevox if not activated
			chrome.management.get("kgejglhpjiefppelpmljglcjbhoiplfn", function(extInfo) {
				if (!extInfo.enabled)  {
					chrome.management.setEnabled(extInfo.id, true, function() {
						console.log("ChromeVox Enabled activated from popup"); 
					}); 
				} 
			}); 
		}); 
	
	} else {
		chrome.storage.sync.set({screenReader: "off"}, function() {
			document.getElementById("screenReaderCheckBox").setAttribute("aria-checked", "false");
			
			// Deactivate chromevox if activated
			chrome.management.get("kgejglhpjiefppelpmljglcjbhoiplfn", function(extInfo) {
				if (extInfo.enabled) {
					chrome.management.setEnabled(extInfo.id, false, function() {
						console.log("ChromeVox Enabled deactivated from popup"); 
					}); 
				}
			});
		}); 
	}
}

function zoom100Clicked() {
  chrome.storage.sync.set({zoom: "100%"}, function() {
    document.documentElement.removeAttribute("zoom");
  })
}

function zoom200Clicked() {
  chrome.storage.sync.set({zoom: "200%"}, function() {
    document.documentElement.setAttribute("zoom", "200%");
  });
}

function zoom300Clicked() {
  chrome.storage.sync.set({zoom: "300%"}, function() {
    document.documentElement.setAttribute("zoom", "300%");
  });
}

function textSizeNormalClicked() {
	chrome.storage.sync.set({textSize: "normal"}, function() {
		document.documentElement.removeAttribute("ts"); 
	}); 
}

function textSizeLargeClicked() {
  chrome.storage.sync.set({textSize: "large"}, function() {
    document.documentElement.setAttribute("ts", "large");
  });
}

function textSizeXLargeClicked() {
	chrome.storage.sync.set({textSize: "x-large"}, function() {
	  document.documentElement.setAttribute("ts", "x-large");
	});
}

function noHighContrastClicked() {
	chrome.storage.sync.set({highContrast: "off"}, function() {
		document.documentElement.removeAttribute("hc");
	}); 
}

function invertRBClicked() {
	chrome.storage.sync.set({highContrast: "invert"}, function() {
		document.documentElement.setAttribute("hc", "invert"); 
	}); 
}

function simplifierCheckBoxClicked() {
	if (this.checked) {
		chrome.storage.sync.set({simplifier: "on"}, function() {
			document.getElementById("simplifierCheckBox").setAttribute("aria-checked", "true");
		}); 
	} else {
		chrome.storage.sync.set({simplifier: "off"}, function() {
			document.getElementById("simplifierCheckBox").setAttribute("aria-checked", "false");
		}); 
	}
}
