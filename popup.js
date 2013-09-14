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
  document.querySelector('#NoHighContrastRB').addEventListener('click', noHighContrastClicked);
  document.querySelector('#invertRB').addEventListener('click', invertRBClicked);
  document.querySelector('#zoom100').addEventListener('click', zoom100Clicked);
  document.querySelector('#zoom200').addEventListener('click', zoom200Clicked);
  document.querySelector('#zoom300').addEventListener('click', zoom300Clicked);
  document.querySelector('#textSizeNormal').addEventListener('click', textSizeNormalClicked);
  document.querySelector('#textSizeLarge').addEventListener('click', textSizeLargeClicked);
  document.querySelector('#textSizeXLarge').addEventListener('click', textSizeXLargeClicked);
  document.querySelector('#simplifierCheckBox').addEventListener('click', simplifierCheckBoxClicked);

  document.querySelector('#seeallprefs').addEventListener('click', onOptionsClick); 
  document.querySelector('#signOutBtn').addEventListener('click', signOutBtnClicked);
    
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  preferencesPort = chrome.tabs.connect(tabs[0].id, { name : 'preferencesPort' } ); 	
  }); 
  
  // if there is a configuration stored locally, we will load this 
  // set of needs and preferences
  chrome.storage.local.get({'token' : "" , 'preferences': {} }, function(results) {
    setPreferencesForm({token: results['token'], preferences: results['preferences']});
  }); 
 	
}); 

function onTokenFormSubmit(e) {
  e.preventDefault();
  
  var token = document.querySelector('#tokenInput').value;
  document.querySelector('#tokenInput').value = "";
  console.log('submitting token'); 
  chrome.runtime.sendMessage(token, handleResponse);
}

function handleResponse(response) {
  var status = response.status,
      isError = response.isError;
  console.log('status: ' + status + ',isError: ' + isError);
  // status 0 means the request could not be complete
  if (status == 0) {
    document.querySelector('#results').style.display = 'block';
    document.querySelector('#results').innerHTML = '<span class="warning">A network error ocurred</span>';
	  console.log('network error');
  } else {
	  // status 1 means the request was successfully complete
	  if (status == 1) {
	    if (isError) {
	      document.querySelector('#results').style.display = 'block';
        document.querySelector('#results').innerHTML = '<span class="warning">sorry, there are no users with this token</span>';  
	    } else {
	      console.log('succesfully logged in');
	      chrome.storage.local.get({'token' : "" , 'preferences': {} }, function(results) {
          preferencesPort.postMessage(results['preferences']);
        });
  	    window.location.reload();
	    }
	  
	  } else {
	    if (status == 2) {
		    document.querySelector('#results').style.display = 'block';
		    document.querySelector('#results').innerHTML = '<span class="warning">The file is not valid<span>';
		    console.log('JSON file is no valid'); 
	    }
	  }
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
	      document.querySelector('#configTitle').innerText = "Welcome, " + npsetObject['token'];
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
		    if (localPreferences.hasOwnProperty('highContrast')) {
	        switch (localPreferences['highContrast']) {
		        case 'none': 
		          document.querySelector('#NoHighContrastRB').checked = true;
			        document.documentElement.removeAttribute('hc');
			        console.log('High contrast initialized to none in popup');
		          break;
		        case 'invert': 
		          document.querySelector('#invertRB').checked = true;
			        document.documentElement.setAttribute('hc', 'invert');
			        console.log('High contrast initialized to invert in popup');
		          break;
			      default:
			        document.querySelector('#NoHighContrastRB').checked = true;
			        document.documentElement.removeAttribute('hc');
		      }
		    } // if high contrast
		
		    if (localPreferences.hasOwnProperty('magnification')) {
          switch (localPreferences['magnification']) {
		        case 1: 
			        // Magnification 100%
		          document.querySelector('#zoom100').checked = true;
			        document.documentElement.removeAttribute('zoom');
			        console.log("Zoom initilialized to 100% in background");
		          break;
		        case 2: 
			        // Magnification 200%
		          document.querySelector('#zoom200').checked = true;
			        document.documentElement.setAttribute('zoom', '200%');
			        console.log("Zoom initilialized to 200% in background");
		          break;
		        case 3: 
			        // Magnification 300%
		          document.querySelector('#zoom300').checked = true;
			        document.documentElement.setAttribute('zoom', '300%');
			        console.log("Zoom initilialized to 300% in background");
		          break;
		        default:
			        // No correct value of magnification selected
		          document.querySelector('#zoom100').defaultChecked;
			        console.log("Not valid value for magnification");
          } 		  
	      } // if magnification
		
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
		          console.log('text size value is not properly defined');
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
  
  preferencesPort.postMessage({ fontSize : 'medium', highContrast: 'none', magnifierEnabled: false, magnification: 1});
  
  document.documentElement.removeAttribute('hc');
  document.documentElement.removeAttribute('ts');
  document.documentElement.removeAttribute('zoom');
  
}


function screenReaderCBClicked() {
  // if (this.checked == true) {
	// chrome.storage.sync.set({screenReader: "on"}, function() {
	  // document.getElementById("screenReaderCheckBox").setAttribute("aria-checked", "true");
			
	  // Activate chromevox if not activated
	  // chrome.management.get("kgejglhpjiefppelpmljglcjbhoiplfn", function(extInfo) {
		// if (!extInfo.enabled)  {
		  // chrome.management.setEnabled(extInfo.id, true, function() {
			// console.log("ChromeVox Enabled activated from popup"); 
		  // }); 
		// } 
	  // }); 
	// }); 
	
  // } else {
	// chrome.storage.sync.set({screenReader: "off"}, function() {
	  // document.getElementById("screenReaderCheckBox").setAttribute("aria-checked", "false");
			
	  // Deactivate chromevox if activated
		// chrome.management.get("kgejglhpjiefppelpmljglcjbhoiplfn", function(extInfo) {
		// if (extInfo.enabled) {
		  // chrome.management.setEnabled(extInfo.id, false, function() {
			// console.log("ChromeVox Enabled deactivated from popup"); 
		  // }); 
		// }
	  // });
	// }); 
  // }
}

function zoom100Clicked() {
  localPreferences['magnifierEnabled'] = false;
  localPreferences['magnification'] = 1;
  chrome.storage.local.set({ token: userToken, preferences: localPreferences}); 
  preferencesPort.postMessage({ magnifierEnabled : false, magnification : 1 }); 
  document.documentElement.removeAttribute('zoom');
}

function zoom200Clicked() {
  // chrome.storage.sync.set({zoom: "200%"}, function() {
    // document.documentElement.setAttribute("zoom", "200%");
  // });
  localPreferences['magnifierEnabled'] = true;
  localPreferences['magnification'] = 2;
  chrome.storage.local.set({ token: userToken, preferences: localPreferences});
  preferencesPort.postMessage({ magnifierEnabled : true, magnification : 2 });   
  document.documentElement.setAttribute('zoom', '200%'); 
}

function zoom300Clicked() {
  localPreferences['magnifierEnabled'] = true;
  localPreferences['magnification'] = 3;
  chrome.storage.local.set({ token: userToken, preferences: localPreferences});
  preferencesPort.postMessage({ magnifierEnabled : true, magnification : 3 }); 
  document.documentElement.setAttribute('zoom', '300%');
  // chrome.storage.sync.set({zoom: "300%"}, function() {
    // document.documentElement.setAttribute("zoom", "300%");
  // });
}

function textSizeNormalClicked() {
  localPreferences['fontSize'] = 'medium';
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  preferencesPort.postMessage({ fontSize : 'medium' }); 
  document.documentElement.removeAttribute('ts');
}

function textSizeLargeClicked() {
  localPreferences['fontSize'] = 'large';
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  preferencesPort.postMessage({ fontSize : 'large' }); 
  document.documentElement.setAttribute("ts", "large");
}

function textSizeXLargeClicked() {
  localPreferences['fontSize'] = 'x-large';
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  preferencesPort.postMessage({ fontSize : 'x-large' }); 
  document.documentElement.setAttribute("ts", "x-large");
	// chrome.storage.sync.set({textSize: "x-large"}, function() {
	  // document.documentElement.setAttribute("ts", "x-large");
	// });
}

function noHighContrastClicked() {
  localPreferences['highContrast'] = 'none';
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  preferencesPort.postMessage({ highContrast : 'none' }); 
  document.documentElement.removeAttribute("hc");
}

function invertRBClicked() {
  localPreferences['highContrast'] = 'invert';
  chrome.storage.local.set({ token: userToken, preferences: localPreferences });
  preferencesPort.postMessage({ highContrast : 'invert' }); 
  document.documentElement.setAttribute("hc", "invert"); 
}

function simplifierCheckBoxClicked() {
	if (this.checked) {
		localPreferences['simplifier'] = true;
		chrome.storage.local.set({ token : userToken, preferences : localPreferences });
		document.getElementById("simplifierCheckBox").setAttribute("aria-checked", "true"); 
		preferencesPort.postMessage({ simplifier : true }); 
	} else {
	  localPreferences['simplifier'] = false;
		chrome.storage.local.set({ token : userToken, preferences : localPreferences });
		document.getElementById("simplifierCheckBox").setAttribute("aria-checked", "false");
		preferencesPort.postMessage({ simplifier : false }); 
	}
}


