console.log('inside setAttributeToAllElements with attributesJSON ' + attributes);
var elements = document.querySelectorAll('*');

if (attributes.hasOwnProperty('ts')) {
 	[].forEach.call(elements, function(element) { element.setAttribute('ts', attributes['ts']) }); 
} else {
	[].forEach.call(elements, function(element) { element.removeAttribute('ts'); });
}

if (attributes.hasOwnProperty('hc')) {
 	[].forEach.call(elements, function(element) { element.setAttribute('hc', attributes['hc']) }); 
} else {
	[].forEach.call(elements, function(element) { element.removeAttribute('hc'); });
}
