var preferences = {},
    xhrupload = new XMLHttpRequest(),
	uploadserver = 'http://preferences.gpii.net/user/',
	preferencesFormatObject = { 'http://registry.gpii.org/applications/org.chrome.cloud4chrome' : [] };

window.onload = function() {
  document.querySelector('#screenReaderCheckBoxOP').addEventListener('click', screenReaderCheckBoxOPClicked); 
  document.querySelector('#noHighContrastRBOP').addEventListener('click', noHighContrastRBOPClicked); 
  document.querySelector('#invertRBOP').addEventListener('click', invertRBOPClicked);
  document.querySelector('#zoom100OP').addEventListener('click', zoom100OPClicked);
  document.querySelector('#zoom200OP').addEventListener('click', zoom200OPClicked);
  document.querySelector('#zoom300OP').addEventListener('click', zoom300OPClicked);
  document.querySelector('#textSizeNormalOP').addEventListener('click', textSizeNormalOPClicked);
  document.querySelector('#textSizeLargeOP').addEventListener('click', textSizeLargeOPClicked); 
  document.querySelector('#textSizeXLargeOP').addEventListener('click', textSizeXLargeOPClicked);
  document.querySelector('#simplifierCheckBoxOP').addEventListener('click', simplifierCheckBoxOPClicked);
  
  document.querySelector('#preferencesFormOP').addEventListener('submit', formPreferenceSubmit);
  
  xhrupload.upload.addEventListener('load', transferComplete, false);
  xhrupload.upload.addEventListener('error', transferFailed, false);
  xhrupload.upload.addEventListener('abort', transferCanceled, false); 
} 

function transferComplete(e) {
  console.log("the transfer is complete");
}

function transferFailed(e) {
  console.log("An error occurred while transferring the file " + e.message); 
}

function transferCanceled(evt) {
  console.log("The transfer has been cancelled by the user"); 
}

function screenReaderCheckBoxOPClicked() {
  console.log('screen reader clicked');
  if (document.querySelector('#screenReaderCheckBoxOP').checked) {
    chrome.tts.speak("ChromeVox has been activated");
  }
}

function noHighContrastRBOPClicked() {
  document.documentElement.removeAttribute('hc'); 
  preferences['highContrast'] = 'none';
}

function invertRBOPClicked() {
  document.documentElement.setAttribute('hc', 'invert'); 
  preferences['highContrast'] = 'invert';
}

function zoom100OPClicked() {
  document.documentElement.removeAttribute('zoom'); 
  preferences['magnification'] = 1;
}

function zoom200OPClicked() {
  document.documentElement.setAttribute('zoom', '200%');
  preferences['magnification'] = 2;
}

function zoom300OPClicked() {
  document.documentElement.setAttribute('zoom', '300%'); 
  preferences['magnification'] = 3;
}

function textSizeNormalOPClicked() {
  document.documentElement.removeAttribute('ts'); 
  preferences['fontSize'] = 'medium';
}

function textSizeLargeOPClicked() {
  document.documentElement.setAttribute('ts', 'large'); 
  preferences['fontSize'] = 'large';
}

function textSizeXLargeOPClicked() {
  document.documentElement.setAttribute('ts', 'x-large'); 
  preferences['fontSize'] = 'x-large';
}

function simplifierCheckBoxOPClicked() {
   console.log('Simplifier clicked');
   preferences['simplifier'] = false;
}

function formPreferenceSubmit(e) {
  e.preventDefault(); 
  console.log('submitting form'); 
  if (document.querySelector('#newTokenInputOP').value == "") {
    document.querySelector('.formWarning').style.display = 'block';
	document.querySelector('#tokenTitle').style.color = 'red';
  } else {
    if (isEmpty(preferences)) {
	  document.querySelector('.formWarning').innerText = "Please select some options";
	  document.querySelector('.formWarning').style.display = 'block';
	} else {
	  var npObject = {
	    token: document.querySelector('#newTokenInputOP').value,
		preferences: preferences
	  }
	  
	  chrome.storage.local.set(npObject); 
	  
	  preferencesFormatObject['http://registry.gpii.org/applications/org.chrome.cloud4chrome'][0] = { value : preferences };
	  
  	  var npJSON = JSON.stringify(preferencesFormatObject);
	  
	  console.log(npJSON); 
	  
	  
	  // SAVING LOCALLY DOES NOT WORK
	  xhrupload.open(
	    "POST",
		uploadserver + npObject['token'], 
		true
	  ); 
	  xhrupload.setRequestHeader('Content-Type', 'application/json;charset=utf-8'); 
	  xhrupload.send(npJSON); 
	}
  }
  
}


