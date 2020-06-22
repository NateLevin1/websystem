// web worker
var loading;
//var deprecatedGetFileData = /\[([^\]]+)\]{([ \w+]*)([,* \w+]*)}/gi;
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
            folderObject.parentFolder;
            // folderObject.subFolders = [];
            // folderObject.loading = true;
            // element[0] = element[0].substring(element[0].indexOf("]"), element[0].length);
            // let subs = element[0].match(/,*[\w :.]+/g);
            // if(subs) {
            //     subs.forEach((element, index)=>{
            //         if(element.startsWith(",")) {
            //             subs[index] = subs[index].substring(1, subs[index].length);
            //         }
            //     });
            //     folderObject.subFolders.push(...subs);
            // }
            
            files.push(folderObject);
        });

        resultRegex.forEach((element,index) => {
            let folderObject = files[index];
            folderObject.subFolders = [];
            folderObject.loading = true;
            element[0] = element[0].substring(element[0].indexOf("]"), element[0].length);
            let subs = element[0].match(/,*[\w :.]+/g);
            if(subs) {
                subs.forEach((elem, index)=>{
                    if(elem.startsWith(",")) {
                        subs[index] = subs[index].substring(1, subs[index].length);
                    }
                    // for each subfolder, set its parent to the current folder
                    if(!subs[index].startsWith("file::")) { // only folders can have parents
                        let indexOfSub = -1;
                    files.forEach((el, ind)=>{
                        if(el.name == subs[index]) { // if the file's name is the current subfolder's name
                            indexOfSub = ind;
                        }
                    });
                    if(indexOfSub != -1) {
                        files[indexOfSub].parentFolder = element[1];
                    } else {
                        console.error("There was an issue processing your files. Could not find parent of folder "+subs[index]);
                    }
                    // find index of folder named subs[index] in files
                    // set value parentFolder of that index of files to element[1]
                    }
                    
                });
                folderObject.subFolders.push(...subs);
            }
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