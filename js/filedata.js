// web worker
var getFullDef = /\[([^\]]+)\]{([^}]+)}/gi;

onmessage = (event) => {
    let data = event.data;
    var files = data.matchAll(getFullDef);
    files = Array.from(files);
    files.forEach((element) => { 
        // element is an array containing [0] the full match [1] the name and [2] the data
        let name = element[1];
        let elementData = element[2];
        var response = {};
        response.name = name;
        response.data = elementData;
        postMessage(response);
    });
}