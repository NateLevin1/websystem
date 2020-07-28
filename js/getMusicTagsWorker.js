importScripts("thirdparty/jsmediatags/jsmediatags.min.js");
onmessage = (event)=>{
    let filedata = event.data;
    jsmediatags.read(filedata, {
        onSuccess: (tag)=>{
            let options = {};
            options.mediaTags = tag;
            postMessage(options);
        },
        onError: (e) =>{
            console.error("There was an error trying to find the tags.");
            console.error(e);
            postMessage({});
        }
    });
}