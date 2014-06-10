// popup.js holds all the handlers for the interactive elements of popup.html.
// handlers store the value in sync storage and change aria values

// Set all handlers

"use strict";

var userToken = "",
    localPreferences = {},
    recognition;

$(document).ready(function(e) {

  $('#tokenForm').submit(onTokenFormSubmit);
  
  /* document.querySelector('#optionsLink').addEventListener('focus', function(e) { chrome.tts.speak('Click to edit your preferences');}); */
  $('#optionsLink').click(onOptionsClick);
  
 $('#screenReaderCheckBox').click(screenReaderCBClicked);
  $('#installCVButton').click(installCV);
  $('#NoHighContrastRB').click(noHighContrastClicked);
  $('#highContrastBlackWhite').click(highContrastBlackWhiteClicked);
  $('#highContrastWhiteBlack').click(highContrastWhiteBlackClicked);
  $('#highContrastYellowBlack').click(highContrastYellowBlackClicked);
  $('#highContrastBlackYellow').click(highContrastBlackYellowClicked);
  $('#invertColorsCheckbox').click(invertRBClicked);
  $('#zoom100').click(zoom100Clicked);
  $('#zoom200').click(zoom200Clicked);
  $('#zoom300').click(zoom300Clicked);
  $('#textSizeNormal').click(textSizeNormalClicked);
  $('#textSizeLarge').click(textSizeLargeClicked);
  $('#textSizeXLarge').click(textSizeXLargeClicked);
  $('#simplifierCheckBox').click(simplifierCheckBoxClicked);

  $('#seeallprefs').click(onOptionsClick);

  $('.signOutBtn').click(signOutBtnClicked);

  $('.signOutBtn').text(chrome.i18n.getMessage("signOutBtnText"));
  
  // Initialize all text to make the extension localizable
  $("#welcomeMessage").text(chrome.i18n.getMessage("welcomeMessage"));
  $('#tokenInput').attr('placeholder', chrome.i18n.getMessage("tokenInputPlaceholder"));
  $('#optionsLink').text(chrome.i18n.getMessage("optionsLinkText"));
  $('#configTitle').text(chrome.i18n.getMessage("configTitleText"));
  $('#configDescription').text(chrome.i18n.getMessage("configDescriptionText"));
  $('#seeallprefs').text(chrome.i18n.getMessage("seeAllPrefsText"));
  $('#screenReaderTitle').text(chrome.i18n.getMessage("screenReaderTitleText"));
  $('#screenReaderLabel').text(chrome.i18n.getMessage("screenReaderLabelText"));
  $('#chromeVoxNotInstalledWarning').text(chrome.i18n.getMessage("chromeVoxNotInstalledWarningText"));
  $('#installCVButton').text(chrome.i18n.getMessage("installCVButtonText"));
  $('#highContrastRgTitle').text(chrome.i18n.getMessage("highContrastRgTitleText"));
  $('#noHighContrastLabel').text(chrome.i18n.getMessage("NoHighContrastRB2Text"));
  $('#highContrastBlackWhiteLabel').text(chrome.i18n.getMessage("highContrastBlackWhiteLabelText"));
  $('#highContrastWhiteBlackLabel').text(chrome.i18n.getMessage("highContrastWhiteBlackLabelText"));
  $('#highContrastYellowBlackLabel').text(chrome.i18n.getMessage("highContrastYellowBlackLabelText"));
  $('#highContrastBlackYellowLabel').text(chrome.i18n.getMessage("highContrastBlackYellowLabelText"));
  $('#invertColoursTitle').text(chrome.i18n.getMessage("invertColoursTitleText"));
  $('#invertLabel').text(chrome.i18n.getMessage("invertLabelText"));
  $('#zoomRgTitle').text(chrome.i18n.getMessage("zoomRgTitleText"));
  $('#fontSizeRGTitle').text(chrome.i18n.getMessage("fontSizeRGTitleText"));
  $('#textSizeMediumLabel').text(chrome.i18n.getMessage("textSizeMediumLabelText"));
  $('#textSizeLargeLabel').text(chrome.i18n.getMessage("textSizeLargeLabelText"));
  $('#textSizeXLargeLabel').text(chrome.i18n.getMessage("textSizeXLargeLabelText"));
  $('#simplifierTitle').text(chrome.i18n.getMessage("simplifierTitleText"));
  $('#simplifierCheckBoxLabel').text(chrome.i18n.getMessage("simplifierCheckBoxLabelText"));  
  
  // if there is a configuration stored locally, we will load this 
  // set of needs and preferences
  chrome.storage.local.get({'token' : "" , 'preferences': {} }, function(results) {
    setPreferencesForm({token: results['token'], preferences: results['preferences']});
  }); 

});

chrome.runtime.onMessage.addListener(
	function(req, sen, sendResponse) {
		if (req.action == "preferences downloaded") {
			if (req.status == "success") {
				window.location.reload();
			} else {
				$('#results').html("<span class='warning'>" + req.message + "</span>").show();
			}
		}
	}
);

// Function to handle the token submission. It finally sends a message to
// the background page
function onTokenFormSubmit(e) {
  e.preventDefault();
  
  var token = $('#tokenInput').val();
  $('#tokenInput').val("");
  console.log('submitting token'); 
  $('#results').show();
  $('#results').html('<img src="/images/loading_icon_2_rev01.gif"> Loading');
  chrome.runtime.sendMessage({action: 'token submitted', token: token}, handleResponse);
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
  	$('#results').html('<span class="warning">' + errorMessage + '</span>').show();
  }
}

// Function that initializes the popup
function setPreferencesForm(npsetObject) {

  if (npsetObject.hasOwnProperty('token') && npsetObject.hasOwnProperty('preferences')) {
    // The needs and preferences object has a property 'token' and a property 'preferences'
  
	  if (isEmpty(npsetObject['preferences']) && npsetObject['token'] == "") {
	    // The preferences object is empty and the token is an empty string
	  
	    console.log('set of needs and preferences not stored locally');
	    $('#preferencesContainer').hide();
  	  	$('#tokenFormContainer').show();
	    $('#tokenInput').focus(); 
	    chrome.tts.speak("Welcome to Cloud For All. Press TAB for options.");

	  } else {
	    // Either the token is a valid string or there are actual preferences 
	    console.log('set of needs and preferences stored locally');
	    $('#tokenFormContainer').hide();
	    $('#preferencesContainer').show();
	    
	    if (npsetObject['token'] != "") {
	    	// The token is a valid string
		   	userToken = npsetObject['token'];
	      	$('#configTitle').text(chrome.i18n.getMessage("configTitleTextWithToken") + npsetObject['token']);
		    chrome.tts.speak( "Welcome to Cloud For All, " + npsetObject['token'] );
	    }
	  
	    if (isEmpty(npsetObject['preferences'])) {
	      // The preferences object is empty
	      console.log("Preferences object is empty");
		
	    } else {
	      // The preferences object is not empty
	      	localPreferences = npsetObject['preferences'];
		
		    // Initialize screenreader
	        chrome.management.get('kgejglhpjiefppelpmljglcjbhoiplfn', function(extInfo) {
		      try {
		        console.log(extInfo.name + " is installed.");

				if (localPreferences.hasOwnProperty('screenReaderTTSEnabled')) {
				  if (localPreferences['screenReaderTTSEnabled']) {
			        $('#screenReaderCheckBox').prop('checked', true);
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
				}	
		      } catch (e) {
		      	console.log('Error in screen reader management: ' + e.message);
			  	$('#screenReaderDivCVInstalled').hide();
			  	$('#screenReaderDivCVNotInstalled').show();
		      }
		    });

	     
		    // Initialize high contrast
		    if (localPreferences.hasOwnProperty('highContrastEnabled')) {
		    	if (localPreferences['highContrastEnabled']) {
		    		console.log("High Contrast is enabled");
		    		if (localPreferences.hasOwnProperty('highContrastTheme')) {
		    			console.log("there is a high contrast theme");
		    			switch (localPreferences['highContrastTheme']) {
		    				case 'black-white':
		    					$('#highContrastBlackWhite').prop('checked', true);
		    					$('html').attr('hc', 'bw');
		    					break;
		    				case 'white-black':
		    					$('#highContrastWhiteBlack').prop('checked', true);
		    					$('html').attr('hc', 'wb');
		    					break;
		    				case 'yellow-black':
		    					$('#highContrastYellowBlack').prop('checked', true);
		    					$('html').attr('hc', 'yb');
		    					break;
		    				case 'black-yellow':
		    					$('#highContrastBlackYellow').prop('checked', true);
		    					$('html').attr('hc', 'by');
		    					break;
		    				default:
		    					break;
		    			}
		    		// HighContrast is enabled but there is no highContrastTheme
		    		} else {
						$('#NoHighContrastRB').prop('checked', true);
		    			$('html').removeAttr('hc');
		    		}

		    	// if not highContrastEnabled
		    	} else {
		    		$('#NoHighContrastRB').prop('checked', true);
		    		$('html').removeAttr('hc');
		    	}
		    // there is no property highContrastEnabled
		    } else {
		    	$('#NoHighContrastRB').prop('checked', true);
		    	$('html').removeAttr('hc');
		    }

		    // Invert Colours
		    if (localPreferences.hasOwnProperty('invertColours')) {
		    	if (localPreferences['invertColours']) {
		    		$('#invertColorsCheckbox').prop('checked', true);
		    		$('html').attr('ic', 'invert');
		    	} else {
		    		$('#invertColorsCheckbox').prop('checked', false);
		    		$('html').removeAttr('ic');
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
		    					$('#zoom100').prop('checked', true);
			        			$('html').removeAttr('zoom');
		    					break;
		    				case 2:
		    				// Magnification 200%
		    					$('#zoom200').prop('checked', true);
			        			$('html').attr('zoom', '200%');
		    					break;
		    				case 3:
		    				// Magnification 300%
		          				$('#zoom300').prop('checked', true);
			        			$('html').attr('zoom', '300%');
		    					break;
		    				default:
		    					$('#zoom100').prop('checked', true);
			        			$('html').removeAttr('zoom');
		    					break;
		    			}

		    		} else {
		    		// magnifier is enabled but there is not a value for magnification
		    			$('#zoom100').prop('checked', true);
			        	$('html').removeAttr('zoom');
		    		}

		    	} else {
		    	// magnifier is no enabled
					$('#zoom100').prop('checked', true);
			        $('html').removeAttr('zoom');
		    	}
		    } // End of magnification if

	
	      	if (localPreferences.hasOwnProperty('fontSize')) {
		    // There is a property font Size
	        	switch (localPreferences['fontSize']) {
		        	case 'medium': 
		          		$('#textSizeNormal').prop('checked', true);
			        	$('html').removeAttr('ts');
		          		break;
		        	case 'large': 
		          		$('#textSizeLarge').prop('checked', true); 
			        	$('html').attr('ts', 'large');
		          		break;
		        	case 'x-large': 
		          		$('#textSizeXLarge').prop('checked', true);
			        	$('html').attr('ts', 'x-large');
		          	break;
		        	default:
		          		$('#textSizeNormal').prop('checked', true);
			        	$('html').removeAttr('ts');
	        	} 
	      	} // fontSize
		
		    // Initialize simplifier
		    if (localPreferences.hasOwnProperty('simplifier')) {
	        	if (localPreferences['simplifier']) {
		        	$('#simplifierCheckBox').prop('checked', true);
		          	console.log("Simplification set to true in background");
		      	} else {
		        	$('#simplifierCheckBox').prop('checked', false);
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
  document.documentElement.removeAttribute('ic');
  
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

