// web worker
var loading;
var deprecatedGetFileData = /\[([^\]]+)\]{([ \w+]*)([,* \w+]*)}/gi;
var getFileData = /\[([^\]]+)\]{(?:[\w,:. ]*)*}/gi;
onmessage = (event) => {
    let data = event.data;
    if(loading == true) {
        let resultRegex = data.matchAll(getFileData);
        resultRegex = Array.from(resultRegex);
        let files = [];
        resultRegex.forEach((element) => {
            let folderObject = {};
            folderObject.name = element[1];
            folderObject.subFolders = [];
            folderObject.loading = true;
            element[0] = element[0].substring(element[0].indexOf("]"), element[0].length);
            let subs = element[0].match(/,*[\w :.]+/g);
            if(subs) {
                subs.forEach((element, index)=>{
                    if(element.startsWith(",")) {
                        subs[index] = subs[index].substring(1, subs[index].length);
                    }
                });
                folderObject.subFolders.push(...subs);
            }
            
            files.push(folderObject);
        });
        postMessage(files);
        // ! Below has been deprecated
        // resultRegex = Array.from(resultRegex);
        // let files = [];
        // resultRegex.forEach(element => {
        //     let folderObject = {};
        //     folderObject.name = element[1];
        //     folderObject.subFolders = [];
        //     folderObject.loading = true;
        //     let i = 2;
        //     while(element[i]) { // while group exists
        //         if(element[i].startsWith(",")) {
        //             element[i] = element[i].substring(1, element[i].length);
        //         }
        //         element[i]=element[i].split(",");
        //         folderObject.subFolders.push(...element[i]);
        //         i++;
        //     }
        //     files.push(folderObject);
        
        //postMessage(data);
    } else if(data == "load") {
        loading = true;
    }
}