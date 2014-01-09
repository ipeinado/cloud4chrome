var elements = document.querySelectorAll("*"),
	max = elements.length;

document.documentElement.removeAttribute('hc');
document.documentElement.removeAttribute('ts');
document.documentElement.removeAttribute('ic');
document.documentElement.removeAttribute('zoom');

for (var i = 0; i < max; i++) {
	elements[i].removeAttribute('hc');
	elements[i].removeAttribute('ts');
}	