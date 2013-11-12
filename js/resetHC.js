var elements = document.getElementsByTagName("*"),
	max = elements.length;

resetTab();

function resetTab() {
	console.log("Resetting tab");

	for (var i = 0; i < max; i++) {
		elements[i].removeAttribute('hc');
	}	
}
