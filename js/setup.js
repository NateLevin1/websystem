// Should be run in worker
importScripts("thirdparty/localForage/localforage.js");
importScripts("instances.js");



onmessage = function (event) {
    localforage.clear().then(()=>{ // wait until cleared
    const NAME = event.data;
    filesystem.setItem("account", {accounts:[NAME], admin:NAME}).then(()=>{
        filesystem.getItem("account").then((result)=>{
            // console.log(result);
        });
    });
    let currentDate = Date.now();
    let folderMeta = {
        size:0,

        "creation-date": currentDate,
        "modified-date": currentDate,
        "last-opened-date": "Never",

        locked: false,

        "system-comments": [],
        "user-comments": [],

        hasTags: false,
        tags: []
    };

    filesystem.setItem("folders", {
            // Root Directory
            "/": {
                name: "~",
                kind: "Folder",
    
                subfolders: ["/usr/", "/etc/", "/Users/"],
                parent: undefined,
    
                meta: folderMeta
            },
    
            // Usr Directory
            "/usr/": {
                name: "usr",
                kind: "Folder",
    
                subfolders: ["/usr/include/"],
                parent: "/",
    
                meta: folderMeta
            },
            "/usr/include/": {
                name: "include",
                kind: "Folder",
    
                subfolders: [],
                parent: "/usr/",
    
                meta: folderMeta
            },
    
            // Etc Directory (config files)
            "/etc/": {
                name: "etc",
                kind: "Folder",
    
                subfolders: [],
                parent: "/",
    
                meta: folderMeta
            },
    
            // Users Directory
            "/Users/": {
                name: "Users",
                kind: "Folder",
    
                subfolders: ["/Users/"+NAME+"/"],
                parent: "/",
    
                meta: folderMeta
            },

            ["/Users/"+NAME+"/"]: { // current user's home directory
                name: NAME,
                kind: "Folder",
    
                subfolders: ["/Users/"+NAME+"/Applications/", "/Users/"+NAME+"/Desktop/", "/Users/"+NAME+"/Documents/", "/Users/"+NAME+"/Downloads/"],
                parent: "/Users/",
    
                meta: folderMeta
            },

            ["/Users/"+NAME+"/Applications/"]: { // Applications
                name: "Applications",
                kind: "Folder",
    
                subfolders: ["/Users/"+NAME+"/Applications/Calculator.app", "/Users/"+NAME+"/Applications/App Store.app", "/Users/"+NAME+"/Applications/Music.app", "/Users/"+NAME+"/Applications/Image Viewer.app"],
                parent: "/Users/"+NAME+"/",
    
                meta: folderMeta
            },

            ["/Users/"+NAME+"/Applications/Calculator.app"]: {
                isFile: true,
                name:"Calculator",
                kind:"App",
                extension:"app",

                parent: "/Users/"+NAME+"/Applications/",
                isBinary: false,
                content: "",

                meta: folderMeta
            },

            ["/Users/"+NAME+"/Applications/Music.app"]: {
                isFile: true,
                name:"Music",
                kind:"App",
                extension:"app",

                parent: "/Users/"+NAME+"/Applications/",
                isBinary: false,
                content: "",

                meta: folderMeta
            },

            ["/Users/"+NAME+"/Applications/App Store.app"]: {
                isFile: true,
                name:"App Store",
                kind:"App",
                extension:"app",

                parent: "/Users/"+NAME+"/Applications/",
                isBinary: false,
                content: "",

                meta: folderMeta
            },

            ["/Users/"+NAME+"/Applications/Image Viewer.app"]: {
                isFile: true,
                name:"Image Viewer",
                kind:"App",
                extension:"app",

                parent: "/Users/"+NAME+"/Applications/",
                isBinary: false,
                content: "",

                meta: folderMeta
            },

            ["/Users/"+NAME+"/Desktop/"]: { // Desktop
                name: "Desktop",
                kind: "Folder",
    
                subfolders: ["/Users/"+NAME+"/Desktop/WebSystem/", "/Users/"+NAME+"/Desktop/Trash Can/"],
                parent: "/Users/"+NAME+"/",
    
                meta: folderMeta
            },

            ["/Users/"+NAME+"/Desktop/WebSystem/"]: { // WebSystem
                name: "WebSystem",
                kind: "Folder",
    
                subfolders: ["/Users/"+NAME+"/Desktop/WebSystem/logo.png/"],
                parent: "/Users/"+NAME+"/Desktop/",
    
                meta: folderMeta
            },

            ["/Users/"+NAME+"/Desktop/Trash Can/"]: { // WebSystem
                name: "Trash Can",
                kind: "Folder",
                isTrash: true,
    
                subfolders: [],
                parent: "/Users/"+NAME+"/Desktop/",
    
                meta: folderMeta
            },

            ["/Users/"+NAME+"/Desktop/WebSystem/logo.png/"]: {
                isFile: true,
                name:"logo.png",
                kind:"Image",
                extension:".png",

                parent: "/Users/"+NAME+"/Desktop/WebSystem/",
                isBinary: true,
                content: {},

                meta: folderMeta
            },

            ["/Users/"+NAME+"/Documents/"]: { // Documents
                name: "Documents",
                kind: "Folder",
    
                subfolders: [],
                parent: "/Users/"+NAME+"/",
    
                meta: folderMeta
            },

            ["/Users/"+NAME+"/Downloads/"]: { // Downloads
                name: "Downloads",
                kind: "Folder",
    
                subfolders: [],
                parent: "/Users/"+NAME+"/",
    
                meta: folderMeta
            }
    
        }).then(()=>{
            // FILES
            if(!isSafari) {
                fetch("../assets/trash.png")
                .then(function(response) {
                   return response.blob();
                 })
                 .then(function(blob) { // below is a callback hell, but it works
                   // convert to file
                   let data = new File([blob], "logo.png", {lastModified: new Date(), type:"image/png"});
                   filesystem.setItem("/Users/"+NAME+"/Desktop/WebSystem/logo.png/", data).then(()=>{
                       filesystem.getItem("folders").then((result)=>{
                           postMessage(result);
                       });
                   });
                 });
            }
            
        });
    });
}
