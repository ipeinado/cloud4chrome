var html = document.documentElement;
var waitDiv = document.createElement("div"); 
waitDiv.setAttribute("id", "waitId");
waitDiv.innerHTML = "<h1>Loading... Please wait</h1>";
var simpleContainer = document.createElement("div");
simpleContainer.setAttribute("id", "simpleContainer"); 


// This executes each time a web page is loaded
( function() {
	chrome.storage.sync.get({screenReader: "off", highContrast: "off", textSize: "normal", zoom: "100%", simplifier: "off"}, function(items) {
		for (key in items) {
			var value = items[key];
			
			if (key == "highContrast") {
				changeHighContrast(value);
				console.log("High Contrast initialized at script: " + value); 
			}
			if (key == "textSize") {
				changeTextSize(value);
				console.log("Text size initialized at script: "+ value); 
			}
			if (key == "zoom") {
				changeZoom(value);
				console.log("Zoom initialized at script: " + value); 
			}
			if (key == "simplifier" && value == "on") {
			    simplifyPage();
			}		
		}
	}); 
} ()); 

// The content script changes when a change in sync storage is detected
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		var value = storageChange.newValue;
		
		if (key == "screenReader") {
			changeScreenReaderValue(value);
			console.log("Screen reader changed in script");
		}
		
		if (key == "highContrast") {
			changeHighContrast(value);
			console.log("High contrast changed to " + value + " in script"); 
		}
		if (key == "textSize") {
		  changeTextSize(value);
		  console.log("Text size changed to " + value + " in script"); 
		}
		if (key == "zoom") {
		  changeZoom(value);
		  console.log("Zoom changed to " + value + " in script"); 
		}
		if (key == "simplifier") {
		  console.log("Simplifier activated");
		  window.location.reload();
		  if (value == "on") {
		    simplifyPage();
		  }
		} 
	}
}); 

// Change attribute 'ts' in HTML tag depending on the value of textSize in storage
function changeTextSize(value) {
  if (value == "normal") {
    html.removeAttribute("ts");
  } else if (value == "large") {
      html.setAttribute("ts", "large");
  } else if (value == "x-large") {
        html.setAttribute("ts", "x-large");
  }
}

// Change attribute 'zoom' in HTML tag depending on the value of zoom in storage
function changeZoom(value) {
  if (value == "100%") {
    html.removeAttribute("zoom");
  } else if (value == "200%") {
    html.setAttribute("zoom", "200%");
  } else if (value == "300%") {
          html.setAttribute("zoom", "300%");
  } 
}

// Change attribute 'hc' in HTML tag depending on the value of highContrast in storage
function changeHighContrast(value) {
	if (value == "on")  {
	  html.setAttribute("hc", "on");
	} else if (value == "off") {
		html.removeAttribute("hc"); 
	}
}

/* 	
v1 - Gets all nodes with text in the document (h1, h2, h3, h4, h5, p, ul, blockquote) and 
appends them to the body of the document, adding an incremental tabIndex
*/ 
function simplifyPage() {
	console.log("inside simplifypage");
	
	window.onload = function() {
		/*
		var title = document.getElementsByTagName('title')[0].innerHTML,
			titleElement = document.createElement('title'),
			index = 0;
	 */
	 
		var nodes = document.querySelectorAll("h1, h2, h3, p, blockquote");		
		var max = nodes.length;
		
/*		titleElement.innerText = "Simplified version of " + title; 
		document.head.appendChild(titleElement);
*/		
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
}

function changeScreenReaderValue(value) {
	if (value == "on") {
		console.log("before cvox api"); 
		cvox.Api.speak("ChromeVox has been activated"); 
	} else if (value == "off") {
		
	}
}
