var query_uri= "http://en.wikipedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=Albert%20Einstein";


$(document).dblclick(function(e) {
    var t = get_selection();

    var xhr = new XMLHttpRequest();
    xhr.open("GET", query_uri, true);
    xhr.setRequestHeader('Content-Type','application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            console.log(xhr.responseText);
        }
    };
    xhr.send();
    console.log(t);
});

function get_selection() {
    var txt = '';
    if (window.getSelection) {
        txt = window.getSelection();
    } else if (document.getSelection) {
        txt = document.getSelection();
    } else if (document.selection) {
        txt = document.selection.createRange().text;
    }
    return $.trim(txt.toString());
}
