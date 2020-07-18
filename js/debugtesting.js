// LocalForage Testing
// localforage.clear();
// var filesystem = localforage.createInstance({
//     name: "WebSystem",
//     description: "The main storage system for WebSystem"
// });

// filesystem.ready().then(function() {
//     if(filesystem.driver() == "LocalStorage") {
//         alert("The browser you are currently using will limit the amount of space you can use. This may cause data loss. Switching to a recent browser is highly recommended.");
//     }
// }).catch(function (e) {
//     console.log(e); // `No available storage method found.`
// });
// filesystem.setItem("account", {accounts:["Nate"], admin:"Nate"}).then(()=>{
//     filesystem.getItem("account").then((result)=>{
//         // console.log(result);
//     });
// });
// let currentDate = Date.now();
// filesystem.setItem("folders", {
//         // Root Directory
//         "/": {
//             name: "~",
//             kind: "Folder",

//             subfolders: ["/usr/", "/etc/", "/Users/"],
//             parent: undefined,

//             meta:
//             {
//                 size:0,
        
//                 "creation-date": currentDate,
//                 "modified-date": currentDate,
//                 "last-opened-date": "Never",
        
//                 locked: false,
        
//                 "system-comments": [],
//                 "user-comments": [],
        
//                 hasTags: false,
//                 tags: []
//             }
//         },

//         // Usr Directory
//         "/usr/": {
//             name: "usr",
//             kind: "Folder",

//             subfolders: ["/usr/include/"],
//             parent: "/",

//             meta:
//             {
//                 size:0,
        
//                 "creation-date": currentDate,
//                 "modified-date": currentDate,
//                 "last-opened-date": "Never",
        
//                 locked: false,
        
//                 "system-comments": [],
//                 "user-comments": [],
        
//                 hasTags: false,
//                 tags: []
//             }
//         },
//         "/usr/include/": {
//             name: "include",
//             kind: "Folder",

//             subfolders: [],
//             parent: "/usr/",

//             meta:
//             {
//                 size:0,
        
//                 "creation-date": currentDate,
//                 "modified-date": currentDate,
//                 "last-opened-date": "Never",
        
//                 locked: false,
        
//                 "system-comments": [],
//                 "user-comments": [],
        
//                 hasTags: false,
//                 tags: []
//             }
//         },

//         // Etc Directory (config files)
//         "/etc/": {
//             name: "etc",
//             kind: "Folder",

//             subfolders: [],
//             parent: "/",

//             meta:
//             {
//                 size:0,
        
//                 "creation-date": currentDate,
//                 "modified-date": currentDate,
//                 "last-opened-date": "Never",
        
//                 locked: false,
        
//                 "system-comments": [],
//                 "user-comments": [],
        
//                 hasTags: false,
//                 tags: []
//             }
//         },

//         // Users Directory
//         "/Users/": {
//             name: "Users",
//             kind: "Folder",

//             subfolders: [],
//             parent: "/",

//             meta:
//             {
//                 size:0,
        
//                 "creation-date": currentDate,
//                 "modified-date": currentDate,
//                 "last-opened-date": "Never",
        
//                 locked: false,
        
//                 "system-comments": [],
//                 "user-comments": [],
        
//                 hasTags: false,
//                 tags: []
//             }
//         }

//     }).then(()=>{
//     filesystem.getItem("folders").then((result)=>{
//         console.log(result);
//         console.log("Subfolder one of usr is "+result["/usr/"].subfolders[0]);
//     });
// });

/**
 * FILE SYSTEM STRUCTURE
 * / - {subfolders:[a, b]}
 * /a/ - {subfolders:[], parent:"/"}
 * /b/ = {subfolders:[c], parent:"/"}
 * /b/c/ = {subfolders:[d], parent:"/b/"}
 * /b/c/d/ = {subfolders:[], parent:"/b/c/"}
 */

 /**
  * EVERY FOLDER HAS OBJECT IN FORM:
  * {
  *     name: "Name",
  *     kind: "Unknown",
  *
  *     subfolders: [sub1, sub2],
  *     parent: "/path/to/parent/",
  *     meta:
  *     {
  *         size: Number (in bytes),
  * 
  *         creation-date: Date object,
  *         modified-date: Date object,
  *         last-opened-date: Date Object,
  * 
  *         locked: false,
  * 
  *         system-comments: [],
  *         user-comments: [],
  * 
  *         hasTags: false, // speeds up performance in big folders
  *         tags: []
  *     }
  * }
  */

  /**
    * EVERY FILE HAS OBJECT IN FILESYSTEM IN FORM:
    * {
    *    isFile: true,
    *    name: "Name",
    *    kind: "Unknown",
    *    extension:"",
    *   
    *    parent: "/path/to/parent/",
    *    isBinary: false,
    *    content: "",
    * 
    *    /// If isBinary is true, content should be empty. Else, content is the textual representation of something, e.g. txt/html/js etc files.
    *    
    *    meta:
    *    {
    *         size: Number (in bytes),
    * 
    *         creation-date: Date object,
    *         modified-date: Date object,
    *         last-opened-date: Date Object,
    * 
    *         locked: false,
    * 
    *         system-comments: [],
    *         user-comments: [],
    * 
    *         hasTags: false,
    *         tags: []
    *     }
    * }
   */