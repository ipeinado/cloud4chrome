// popup.js holds all the handlers for the interactive elements of popup.html.
// handlers store the value in sync storage and change aria values

// Set all handlers

var userToken = "",
    localPreferences = {},
	  preferencesPort;

document.addEventListener("DOMContentLoaded", function(e) {

  document.querySelector('#tokenForm').addEventListener('submit', onTokenFormSubmit);
  document.querySelector('#tokenInput').addEventListener('focus', function(e) { chrome.tts.speak('Insert your token and press Enter'); });
  
  document.querySelector('#optionsLink').addEventListener('focus', function(e) { chrome.tts.speak('Click to edit your preferences');});
  document.querySelector('#optionsLink').addEventListener('click', onOptionsClick);
  
  document.querySelector('#screenReaderCheckBox').addEventListener('click', screenReaderCBClicked);
  document.querySelector('#installCVButton').addEventListener('click', installCV);
  document.querySelector('#NoHighContrastRB').addEventListener('click', noHighContrastClicked);
  document.querySelector('#highContrastBlackWhite').addEventListener('click', highContrastBlackWhiteClicked);
  document.querySelector('#highContrastWhiteBlack').addEventListener('click', highContrastWhiteBlackClicked);
  document.querySelector('#highContrastYellowBlack').addEventListener('click', highContrastYellowBlackClicked);
  document.querySelector('#highContrastBlackYellow').addEventListener('click', highContrastBlackYellowClicked);
  document.querySelector('#invertColorsCheckbox').addEventListener('click', invertRBClicked);
  document.querySelector('#zoom100').addEventListener('click', zoom100Clicked);
  document.querySelector('#zoom200').addEventListener('click', zoom200Clicked);
  document.querySelector('#zoom300').addEventListener('click', zoom300Clicked);
  document.querySelector('#textSizeNormal').addEventListener('click', textSizeNormalClicked);
  document.querySelector('#textSizeLarge').addEventListener('click', textSizeLargeClicked);
  document.querySelector('#textSizeXLarge').addEventListener('click', textSizeXLargeClicked);
  document.querySelector('#simplifierCheckBox').addEventListener('click', simplifierCheckBoxClicked);

  document.querySelector('#seeallprefs').addEventListener('click', onOptionsClick);
  [].forEach.call(document.querySelectorAll('.signOutBtn'), function(button) {
  	button.addEventListener('click', signOutBtnClicked);
  	button.innerText = chrome.i18n.getMessage("signOutBtnText");

  }); 

  // Initialize all text to make the extension localizable
  document.querySelector("#welcomeMessage").innerText = chrome.i18n.getMessage("welcomeMessage");
  document.querySelector('#tokenInput').setAttribute('placeholder', chrome.i18n.getMessage("tokenInputPlaceholder"));
  document.querySelector('#optionsLink').innerText = chrome.i18n.getMessage("optionsLinkText");
  document.querySelector('#configTitle').innerText = chrome.i18n.getMessage("configTitleText");
  document.querySelector('#configDescription').innerText = chrome.i18n.getMessage("configDescriptionText");
  document.querySelector('#seeallprefs').innerText = chrome.i18n.getMessage("seeAllPrefsText");
  document.querySelector('#screenReaderTitle').innerText = chrome.i18n.getMessage("screenReaderTitleText");
  document.querySelector('#screenReaderLabel').innerText = chrome.i18n.getMessage("screenReaderLabelText");
  document.querySelector('#chromeVoxNotInstalledWarning').innerText = chrome.i18n.getMessage("chromeVoxNotInstalledWarningText");
  document.querySelector('#installCVButton').innerText = chrome.i18n.getMessage("installCVButtonText");
  document.querySelector('#highContrastRgTitle').innerText = chrome.i18n.getMessage("highContrastRgTitleText");
  document.querySelector('#noHighContrastLabel').innerText = chrome.i18n.getMessage("NoHighContrastRB2Text");
  document.querySelector('#highContrastBlackWhiteLabel').innerText = chrome.i18n.getMessage("highContrastBlackWhiteLabelText");
  document.querySelector('#highContrastWhiteBlackLabel').innerText = chrome.i18n.getMessage("highContrastWhiteBlackLabelText");
  document.querySelector('#highContrastYellowBlackLabel').innerText = chrome.i18n.getMessage("highContrastYellowBlackLabelText");
  document.querySelector('#highContrastBlackYellowLabel').innerText = chrome.i18n.getMessage("highContrastBlackYellowLabelText");
  document.querySelector('#invertColoursTitle').innerText = chrome.i18n.getMessage("invertColoursTitleText");
  document.querySelector('#invertLabel').innerText = chrome.i18n.getMessage("invertLabelText");
  document.querySelector('#zoomRgTitle').innerText = chrome.i18n.getMessage("zoomRgTitleText");
  document.querySelector('#fontSizeRGTitle').innerText = chrome.i18n.getMessage("fontSizeRGTitleText");
  document.querySelector('#textSizeMediumLabel').innerText = chrome.i18n.getMessage("textSizeMediumLabelText");
  document.querySelector('#textSizeLargeLabel').innerText = chrome.i18n.getMessage("textSizeLargeLabelText");
  document.querySelector('#textSizeXLargeLabel').innerText = chrome.i18n.getMessage("textSizeXLargeLabelText");
  document.querySelector('#simplifierTitle').innerText = chrome.i18n.getMessage("simplifierTitleText");
  document.querySelector('#simplifierCheckBoxLabel').innerText = chrome.i18n.getMessage("simplifierCheckBoxLabelText");  
  // if there is a configuration stored locally, we will load this 
  // set of needs and preferences
  chrome.storage.local.get({'token' : "" , 'preferences': {} }, function(results) {
    setPreferencesForm({token: results['token'], preferences: results['preferences']});
  }); 
 	
});

// Function to handle the token submission. It finally sends a message to
// the background page
function onTokenFormSubmit(e) {
  e.preventDefault();
  
  var token = document.querySelector('#tokenInput').value;
  document.querySelector('#tokenInput').value = "";
  console.log('submitting token'); 
  chrome.runtime.sendMessage({'token': token}, handleResponse);
}

// Actions to respond to the receipt of a set of needs and preferences 
// from the web
function handleResponse(response) {
  var status = response.status,
      isError = response.isError,
      errorMessage = response.errorMessage;
  if (status == 1) {
  	console.log("succesfully logged in");
  	chrome.storage.local.get({'token': "", 'preferences': {}}, function(results) {
  		window.location.reload();
  	});
  } else {
  	document.querySelector('#results').style.display = 'block';
    document.querySelector('#results').innerHTML = '<span class="warning">' + errorMessage + '</span>';
  }
}

// Function that initializes the popup
function setPreferencesForm(npsetObject) {

  if (npsetObject.hasOwnProperty('token') && npsetObject.hasOwnProperty('preferences')) {
    // The needs and preferences object has a property 'token' and a property 'preferences'
  
	  if (isEmpty(npsetObject['preferences']) && npsetObject['token'] == "") {
	    // The preferences object is empty and the token is an empty string
	  
	    console.log('set of needs and preferences not stored locally');
	    document.querySelector('#preferencesContainer').style.display = 'none';
  	  	document.querySelector('#tokenFormContainer').style.display = 'block';
	    document.querySelector('#tokenInput').focus(); 
	    chrome.tts.speak("Welcome to Cloud For All. Press TAB for options.");
	
	  } else {
	    // Either the token is a valid string or there are actual preferences 
	    console.log('set of needs and preferences stored locally');
	    document.querySelector('#tokenFormContainer').style.display = 'none';
	    document.querySelector('#preferencesContainer').style.display = 'block';
	    
	    if (npsetObject['token'] != "") {
	      // The token is a valid string
		    userToken = npsetObject['token'];
	      document.querySelector('#configTitle').innerText = chrome.i18n.getMessage("configTitleTextWithToken") + npsetObject['token'];
		    chrome.tts.speak( "Welcome to Cloud For All, " + npsetObject['token'] );
	    }
	  
	    if (isEmpty(npsetObject['preferences'])) {
	      // The preferences object is empty
	      console.log("Preferences object is empty");
		
	    } else {
	      // The preferences object is not empty
	      	localPreferences = npsetObject['preferences'];
		
		    // Initialize screenreader
		    if (localPreferences.hasOwnProperty('screenReaderTTSEnabled')) {
	        	chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
		       		try {
		         			console.log(extInfo.name + " is installed.");
			
			        	if (localPreferences['screenReaderTTSEnabled']) {
			        		document.querySelector('#screenReaderCheckBox').checked = true;
			        		console.log("Screen reader checkbox initialized to true in background");
			  
			        		if (!extInfo.enabled) {
			           			chrome.management.setEnabled(extInfo.id, true, function() {
				           			console.log("ChromeVox has been enabled in initialization");
				       			}); 
			        		}
		          		} else {
			        		document.querySelector('#screenReaderCheckBox').checked = false;
			        		console.log("Screen reader checkbox initializated to false in background");
			  
			        		if (extInfo.enabled) {
			          			chrome.management.setEnabled(extInfo.id, false, function() {
			           				console.log("ChromeVox has been disabled in initialization");
			           			}); 
			        		}
		          		}
		        	} catch (e) {
		          		console.log('Error in screen reader management: ' + e.message);
			      		document.querySelector('#screenReaderDivCVInstalled').style.display = 'none';
			      		document.querySelector('#screenReaderDivCVNotInstalled').style.display = 'block';
		        	}
		      	});
	      	} // if screenreader

	     
		    // Initialize high contrast
		    if (localPreferences.hasOwnProperty('highContrastEnabled')) {
		    	if (localPreferences['highContrastEnabled']) {
		    		console.log("High Contrast is enabled");
		    		if (localPreferences.hasOwnProperty('highContrastTheme')) {
		    			console.log("there is a high contrast theme");
		    			switch (localPreferences['highContrastTheme']) {
		    				case 'black-white':
		    					document.querySelector('#highContrastBlackWhite').checked = true;
		    					document.documentElement.setAttribute('hc', 'bw');
		    					break;
		    				case 'white-black':
		    					document.querySelector('#highContrastWhiteBlack').checked = true;
		    					document.documentElement.setAttribute('hc', 'wb');
		    					break;
		    				case 'yellow-black':
		    					document.querySelector('#highContrastYellowBlack').checked = true;
		    					document.documentElement.setAttribute('hc', 'yb');
		    					break;
		    				case 'black-yellow':
		    					document.querySelector('#highContrastBlackYellow').checked = true;
		    					document.documentElement.setAttribute('hc', 'by');
		    					break;
		    				default:
		    					break;
		    			}
		    		// HighContrast is enabled but there is no highContrastTheme
		    		} else {
						document.querySelector('#NoHighContrastRB').checked = true;
		    			document.documentElement.removeAttribute('hc');
		    		}

		    	// if not highContrastEnabled
		    	} else {
		    		document.querySelector('#NoHighContrastRB').checked = true;
		    		document.documentElement.removeAttribute('hc');
		    	}
		    // there is no property highContrastEnabled
		    } else {
		    	document.querySelector('#NoHighContrastRB').checked = true;
		    	document.documentElement.removeAttribute('hc');
		    }

		    // Invert Colours
		    if (localPreferences.hasOwnProperty('invertColours')) {
		    	if (localPreferences['invertColours']) {
		    		document.querySelector('#invertColorsCheckbox').checked = true;
		    		document.documentElement.setAttribute('ic', 'invert');
		    	} else {
		    		document.querySelector('#invertColorsCheckbox').checked = false;
		    		document.documentElement.removeAttribute('ic');
		    	}
		    } // end of if Invert Colours

		    // magnification
		    if (localPreferences.hasOwnProperty('magnifierEnabled')) {
		    	if (localPreferences['magnifierEnabled']) {
		    	// magnifier is enabled
		    		if (localPreferences.hasOwnProperty('magnification')) {
		    		// magnifier is enabled and there is a value for magnification
		    			switch (localPreferences['magnification']) {
		    				case 1:
		    				// Magnification 100%
		    					document.querySelector('#zoom100').checked = true;
			        			document.documentElement.removeAttribute('zoom');
		    					break;
		    				case 2:
		    				// Magnification 200%
		    					document.querySelector('#zoom200').checked = true;
			        			document.documentElement.setAttribute('zoom', '200%');
		    					break;
		    				case 3:
		    				// Magnification 300%
		          				document.querySelector('#zoom300').checked = true;
			        			document.documentElement.setAttribute('zoom', '300%');
			        			console.log("Zoom initilialized to 300% in background");
		    					break;
		    				default:
		    					document.querySelector('#zoom100').checked = true;
			        			document.documentElement.removeAttribute('zoom');
		    					break;
		    			}

		    		} else {
		    		// magnifier is enabled but there is not a value for magnification
		    			document.querySelector('#zoom100').checked = true;
			        	document.documentElement.removeAttribute('zoom');
		    		}

		    	} else {
		    	// magnifier is no enabled
					document.querySelector('#zoom100').checked = true;
			        document.documentElement.removeAttribute('zoom');
		    	}
		    } // End of magnification if

	
	      	if (localPreferences.hasOwnProperty('fontSize')) {
		    // There is a property font Size
	        	console.log(localPreferences['fontSize']);
	        	switch (localPreferences['fontSize']) {
		        	case 'medium': 
		          		document.querySelector('#textSizeNormal').checked = true;
			        	document.documentElement.removeAttribute('ts');
			        	console.log("Text size initialized to normal in background");
		          		break;
		        	case 'large': 
		          		document.querySelector('#textSizeLarge').checked = true; 
			        	document.documentElement.setAttribute('ts', 'large');
			        	console.log("Text size initialized to large in background"); 
		          		break;
		        	case 'x-large': 
		          		document.querySelector('#textSizeXLarge').checked = true;
			        	document.documentElement.setAttribute('ts', 'x-large');
			        	console.log("Text size initializated to x-large in background");
		          	break;
		        	default:
		          		document.querySelector('#textSizeNormal').checked = true;
			        	document.documentElement.removeAttribute('ts');
	        	} 
	      	} // fontSize
		
		    // Initialize simplifier
		    if (localPreferences.hasOwnProperty('simplifier')) {
	        	if (localPreferences['simplifier']) {
		        	document.querySelector('#simplifierCheckBox').checked = true;
		          	console.log("Simplification set to true in background");
		      	} else {
		        	document.querySelector('#simplifierCheckBox').checked = false;
		        	console.log("Simplification set to false in background");
		      	}
	      	} // end if simplifier
		
	    } // The preferences object is empty ifelse
	  } // The preferences object is empty and the token is an empty string
  } else {
    // The preferences object lacks the token property or the preferences property
    console.log('The JSON object is not well built');
  }  
}	
	
function onOptionsClick() {
  chrome.tabs.create({ url: 'options.html' }); 
	window.close();
}



function signOutBtnClicked(e) {
  e.preventDefault();
  chrome.storage.local.clear();
  
  setPreferencesForm({ token: "", preferences: {} }); 
  
  document.documentElement.removeAttribute('hc');
  document.documentElement.removeAttribute('ts');
  document.documentElement.removeAttribute('zoom');
  
  chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
	if (extInfo.enabled) {
	  chrome.management.setEnabled(extInfo.id, false, function() {
	    console.log("ChromeVox has been deactivated"); 
	  });
	}
  });
  
}


function screenReaderCBClicked() {
  if (this.checked == true) {
    localPreferences['screenReaderTTSEnabled'] = true;
    chrome.storage.local.set({ token: userToken, preferences: localPreferences});   
    chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
      if (!extInfo.enabled) {
        chrome.management.setEnabled(extInfo.id, true, function() {
          chrome.tts.speak('ChromeVox has been activated');
          console.log('ChromeVox has been activated');
        });
      }
    });
  } else {
    localPreferences['screenReaderTTSEnabled'] = false;
    chrome.storage.local.set({ token: userToken, preferences: localPreferences});   
    chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
      if (extInfo.enabled) {
        chrome.management.setEnabled(extInfo.id, false, function() {
          chrome.tts.speak('ChromeVox has been deactivated');
          console.log('ChromeVox activated from popup');
        });
      }
    });
  }
}

function zoom100Clicked() {
  localPreferences['magnifierEnabled'] = false;
  localPreferences['magnification'] = 1;
  chrome.storage.local.set({ token: userToken, preferences: localPreferences}); 
  //preferencesPort.postMessage({ magnifierEnabled : false, magnification : 1 }); 
  document.documentElement.removeAttribute('zoom');
}

function zoom200Clicked() {
  localPreferences['magnifierEnabled'] = true;
  localPreferences['magnification'] = 2;
  chrome.storage.local.set({ token: userToken, preferences: localPreferences});
  //preferencesPort.postMessage({ magnifierEnabled : true, magnification : 2 });   
  document.documentElement.setAttribute('zoom', '200%'); 
}

function zoom300Clicked() {
  localPreferences['magnifierEnabled'] = true;
  localPreferences['magnification'] = 3;
  chrome.storage.local.set({ token: userToken, preferences: localPreferences});
  // preferencesPort.postMessage({ magnifierEnabled : true, magnification : 3 }); 
  document.documentElement.setAttribute('zoom', '300%');
  // chrome.storage.sync.set({zoom: "300%"}, function() {
    // document.documentElement.setAttribute("zoom", "300%");
  // });
}

function textSizeNormalClicked() {
  localPreferences['fontSize'] = 'medium';
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  //preferencesPort.postMessage({ fontSize : 'medium' }); 
  document.documentElement.removeAttribute('ts');
}

function textSizeLargeClicked() {
  localPreferences['fontSize'] = 'large';
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  //preferencesPort.postMessage({ fontSize : 'large' }); 
  document.documentElement.setAttribute("ts", "large");
}

function textSizeXLargeClicked() {
  localPreferences['fontSize'] = 'x-large';
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  //preferencesPort.postMessage({ fontSize : 'x-large' }); 
  document.documentElement.setAttribute("ts", "x-large");
	// chrome.storage.sync.set({textSize: "x-large"}, function() {
	  // document.documentElement.setAttribute("ts", "x-large");
	// });
}

function noHighContrastClicked() {
  localPreferences['highContrastEnabled'] = false;
  localPreferences['highContrastTheme'] = "none";
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  //preferencesPort.postMessage({ highContrast : 'none' }); 
  document.documentElement.removeAttribute("hc");
}

function highContrastBlackWhiteClicked() {
	localPreferences['highContrastTheme'] = 'black-white';
	localPreferences['highContrastEnabled'] = true;
    chrome.storage.local.set({ token: userToken, preferences: localPreferences });
	document.documentElement.setAttribute('hc', 'bw');
	console.log("Black on white");
}

function highContrastWhiteBlackClicked() {
	localPreferences['highContrastTheme'] = 'white-black';
	localPreferences['highContrastEnabled'] = true;
    chrome.storage.local.set({ token: userToken, preferences: localPreferences });
	document.documentElement.setAttribute('hc', 'wb');
	console.log("White on Black");
}

function highContrastYellowBlackClicked() {
	localPreferences['highContrastEnabled'] = true;
	localPreferences['highContrastTheme'] = 'yellow-black';
    chrome.storage.local.set({ token: userToken, preferences: localPreferences });
	document.documentElement.setAttribute('hc', 'yb');
	console.log("Yellow on Black");
}

function highContrastBlackYellowClicked() {
	localPreferences['highContrastEnabled'] = true;
	localPreferences['highContrastTheme'] = 'black-yellow';
    chrome.storage.local.set({ token: userToken, preferences: localPreferences });
	document.documentElement.setAttribute('hc', 'by');
	console.log("Black on Yellow");
}

function invertRBClicked() {
	if (this.checked) {
		localPreferences['invertColours'] = true;
		chrome.storage.local.set({ token: userToken, preferences: localPreferences });
		document.documentElement.setAttribute('ic', 'invert');
	} else {
		localPreferences['invertColours'] = false;
		chrome.storage.local.set({ token: userToken, preferences: localPreferences });
		document.documentElement.removeAttribute('ic');
	}
}

function simplifierCheckBoxClicked() {
	if (this.checked) {
		localPreferences['simplifier'] = true;
		chrome.storage.local.set({ token : userToken, preferences : localPreferences });
		document.getElementById("simplifierCheckBox").setAttribute("aria-checked", "true"); 
		// preferencesPort.postMessage({ simplifier : true }); 
	} else {
	  localPreferences['simplifier'] = false;
	chrome.storage.local.set({ token : userToken, preferences : localPreferences });
		document.getElementById("simplifierCheckBox").setAttribute("aria-checked", "false");
		chrome.tabs.reload();
		// preferencesPort.postMessage({ simplifier : false }); 
	}
}


