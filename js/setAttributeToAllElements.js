console.log('inside setAttributeToAllElements with attributesJSON ' + attributes);

if (attributes.hasOwnProperty('ts')) {
 	for (var i = 0; i < max; i++) {
 		elements[i].setAttribute('ts', attributes['ts']);
	}
} else {
	for (var i = 0; i < max; i++) {
		elements[i].removeAttribute('ts');
	}
}

if (attributes.hasOwnProperty('hc')) {
	for (var i = 0; i < max; i++) {
		elements[i].setAttribute('hc', attributes['hc']);
	}
} else {
	for (var i = 0; i < max; i++) {
		elements[i].removeAttribute('hc');
	}
}
