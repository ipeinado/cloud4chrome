var simpleContainer = document.createElement("div"),
preferencesPort;
	
simpleContainer.setAttribute("id", "simpleContainer"); 


document.addEventListener('DOMContentLoaded', function(e) {
  
  chrome.storage.local.get({ 'token' : "", 'preferences': {} }, function(results) {
    if (chrome.runtime.lastError) {
	} else {
	  console.log(results['preferences']);
	  activatePreferences(results['preferences']); 
	}
  }); 
});

chrome.runtime.onConnect.addListener(function(port) {
  console.log("Connection port: " + port.name);
  port.onMessage.addListener(function(preferences) {
	console.log(preferences); 
    activatePreferences(preferences); 
  }); 
}); 

function activatePreferences(preferences)  {
  if (!isEmpty(preferences)) {
  
    if (preferences.hasOwnProperty('highContrast')) {
	  switch (preferences['highContrast']) {
	    case 'none': 
		  document.documentElement.removeAttribute('hc');
		  break;
		case 'invert': 
		  document.documentElement.setAttribute('hc', 'invert');
		  break;
		default:
		  document.documentElement.removeAttribute('hc'); 
	  }
	}
	
	if (preferences.hasOwnProperty('magnifierEnabled')) {
	  if (preferences['magnifierEnabled']) {
	  	if (preferences.hasOwnProperty('magnification')) {
	      switch (preferences['magnification']) {
	        case 1: 
		      document.documentElement.removeAttribute('zoom'); 
		      break;
		    case 2:
		      document.documentElement.setAttribute('zoom', '200%');
		      break;
		    case 3: 
		      document.documentElement.setAttribute('zoom', '300%'); 
		      break;
		    default:
		      document.documentElement.removeAttribute('zoom'); 
		  }
	    } 
	  } else {
	    document.documentElement.removeAttribute('zoom'); 
	  }
	}
	
	if (preferences.hasOwnProperty('fontSize')) {
	  switch (preferences['fontSize']) {
	    case 'medium':
          document.documentElement.removeAttribute('ts');		
		  break;
		case 'large': 
		  document.documentElement.setAttribute('ts', 'large');
		  break;
		case 'x-large':
		  document.documentElement.setAttribute('ts', 'x-large');
		  break;
		default: 
		  document.documentElement.removeAttribute('ts');
	  }
	}
	
	if (preferences.hasOwnProperty('simplifier')) {
	  if (preferences['simplifier']) {
	    console.log('Simplifier has been activated'); 
		  simplifyPage(); 
	  }
	}
    
  }
}

/* 	
v1 - Gets all nodes with text in the document (h1, h2, h3, h4, h5, p, ul, blockquote) and 
appends them to the body of the document, adding an incremental tabIndex
*/ 

function simplifyPage() {
  console.log("inside simplifypage");

	 
	var nodes = document.querySelectorAll("h1, h2, h3, p, blockquote");		
	var max = nodes.length;
		
	document.body.setAttribute("simp", "true");
	
		
	document.documentElement.innerHTML = "";
	document.body.setAttribute("simp", "true");
	document.body.appendChild(simpleContainer);

	var divArticle = document.createElement("div");
	divArticle.setAttribute("class", "article");
	for (var i = 0; i < max; i++) {
	  if (nodes[i].nodeName == "H1") {
	    if ((divArticle.childElementCount > 0) && (divArticle.querySelectorAll("h1, h2").length > 0) && (divArticle.querySelectorAll("p").length > 0)) {
	      document.getElementById("simpleContainer").appendChild(divArticle.cloneNode(true));
	    }
	    divArticle.innerHTML = "";
	    divArticle.appendChild(nodes[i]);
	  } else if (nodes[i].nodeName == "H2") {
	    if ((divArticle.childElementCount > 0) && (divArticle.querySelectorAll("h2").length > 0) && (divArticle.querySelectorAll("p").length > 0)) {
 		  document.getElementById("simpleContainer").appendChild(divArticle.cloneNode(true));
 		  divArticle.innerHTML = "";
     	}
  		divArticle.appendChild(nodes[i]);
		} else {
		  divArticle.appendChild(nodes[i]);
		}
      }
    
	  if ((divArticle.childElementCount > 0) && (divArticle.querySelectorAll("h1, h2").length > 0) && (divArticle.querySelectorAll("p").length > 0)) {
	    document.getElementById("simpleContainer").appendChild(divArticle);
	  }
}

// function changeScreenReaderValue(value) {
	// if (value == "on") {
		// console.log("before cvox api"); 
		// cvox.Api.speak("ChromeVox has been activated"); 
	// } else if (value == "off") {
		
	// }
// }
function isEmpty(obj) {
  for(var key in obj) {
    if(obj.hasOwnProperty(key))
      return false;
  }
  return true;
}	
