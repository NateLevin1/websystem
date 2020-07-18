// LocalForage Testing
localforage.clear();
var filesystem = localforage.createInstance({
    name: "WebSystem",
    description: "The main storage system for WebSystem"
});
var binaryData = localforage.createInstance({
    name: "WebSystem Binary Data",
    description: "The place to store all binary data in WebSystem. All paths that have isBinary set to true will have a corresponding path in this database which has its binary data."
});

filesystem.ready().then(function() {
    if(filesystem.driver() == "LocalStorage") {
        alert("The browser you are currently using will limit the amount of space you can use. This may cause data loss. Switching to a recent browser is highly recommended.");
    }
}).catch(function (e) {
    console.log(e); // `No available storage method found.`
});
filesystem.setItem("account", {accounts:["Nate"], admin:"Nate"}).then(()=>{
    filesystem.getItem("account").then((result)=>{
        console.log(result);
    });
});

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
    *    name: "Name",
    *    kind: "Unknown",
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