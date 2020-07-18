// ! THIS FILE IS NO LONGER IN USE AS THE TERMINAL HAS BEEN PULLED FROM PRODUCTION

// // STYLES
// GlobalStyle.newClass("terminal-commandLineDiv", "display: flex;");
// GlobalStyle.newClass("terminal-commandLine", "color: rgb(0,200,0); font-family: monospace; padding-top:0.1em; font-size:1.2em; margin-left: 0.2em;");
// GlobalStyle.newClass("terminal-commandLineInput", "color: rgb(0,200,0); vertical-align: top; flex-grow: 1; caret-color: rgb(0,200,0); color: rgb(0,200,0); font-family: monospace; font-size:1em; height: calc(1em + 3px); margin-top:2px;");
// GlobalStyle.newClass("terminal-select::selection", "background-color:rgb(255,255,255); color:black;");
// GlobalStyle.newClass("terminal-unstyledTextarea", "border: none; overflow:none; outline: none; -webkit-box-shadow: none; -moz-box-shadow:none; box-shadow:none; resize:none; background-color:transparent;");
// GlobalStyle.newClass("terminal-log", "color: rgb(0,230,0); font-family:monospace; margin:0.2em; font-size:1.1em;");
// GlobalStyle.newClass("terminal-input", "color: rgb(0,200,0); font-family:monospace; margin:0.2em; font-size:1.2em;");
// GlobalStyle.newClass("terminal-input-textarea", "font-size:0.85em; margin-left:3px;");
// GlobalStyle.newClass("terminal-error", "color: rgb(250,0,0); font-family:monospace; margin:0.2em; font-size:1.1em;");


// class Terminal {
//     constructor(path="/", access="root") {
//         this.path = path;
//         this.currentFolder = folders[path].name;
//         this.access = access;
        

//         let win = new Window(315, 200, "Terminal", 30,23,20,2.2);
//         this.window = win.getWindow();
//         this.header = win.getHeader();
//         this.win = win;
//         this.win.setBackgroundColor("rgb(0,0,0)");
//         this.win.setHeaderColor("rgb(200,200,200)");
//         this.win.setHeaderTextColor("black");

//         // screen container for overflow
//         this.screenContainer = document.createElement("div");
//         this.screenContainer.style.overflow = "auto";
//         this.screenContainer.style.height = "calc(100% - 1em)";
//         this.window.appendChild(this.screenContainer);

//         // COMMAND LINE
//         this.commandLine = document.createElement("div");
//         this.commandLine.classList.add("terminal-commandLineDiv", "terminal-select");


//         this.pathText = document.createElement("a");
//         this.updatePathText();
//         this.pathText.classList.add("terminal-commandLine", "terminal-select");
//         this.commandLine.appendChild(this.pathText);

//         this.commandLineInput = document.createElement("textarea");
//         this.commandLineInput.classList.add("terminal-commandLineInput", "terminal-unstyledTextarea", "terminal-select");

//         this.commandLineInput.oninput = (event) => {
//             this.commandLineInput.style.height = "";
//             this.commandLineInput.style.height = this.commandLineInput.scrollHeight + "px";
//         }
//         this.commandLineInput.onkeydown = (event) => {
            
//             if(event.key == "Enter") {
//                 event.preventDefault();
//                 this.runLine();
//             }
//         }
//         this.commandLine.appendChild(this.commandLineInput);

//         this.screenContainer.appendChild(this.commandLine);

//         // wait for load
//         setTimeout(()=>{
//             this.commandLineInput.focus(); // focus input
//         }, 20);



//         // KEYBOARD SHORTCUTS
//         document.body.addEventListener("keydown", (event)=>{
//             if(this.win.focused()) { // Todo depend on mac vs windows for keybindings
//                 if(event.ctrlKey || event.metaKey) {
//                     if(event.key == "k") {
//                         // clear screen
//                         this.screenContainer.innerText = "";
//                         this.screenContainer.appendChild(this.commandLine);
//                         this.commandLineInput.focus();
//                     }
//                 }
//             }
//         });


        
//     }

//     runLine() {
//         let val = this.commandLineInput.value;

//         // ! PREVENT XSS
//         val = val.replace(/(<script(\s|\S)*?<\/script>)|(<style(\s|\S)*?<\/style>)|(<!--(\s|\S)*?-->)|(<\/?(\s|\S)*?>)/gi, "xss-protection");

//         // validate val
//         val = val.replace(/ {2,}/g, " ");
//         while(val.startsWith(" ")) {
//             val = val.substring(1);
//         }
//         this.commandLineInput.value = "";

//         let input = document.createElement("p");
//         input.classList.add("terminal-input", "terminal-select");
//         input.innerText = this.getPathText();
//         let valSpan = document.createElement("span");
//         valSpan.innerText = val;
//         valSpan.classList.add("terminal-input-textarea", "terminal-select");
//         input.appendChild(valSpan);

//         this.screenContainer.insertBefore(input, this.commandLine);

//         this.scrollView();

//         if(val.startsWith("cd ")) { // change directory
//             let newPath = val.substring(3);
//             if(!this.hasSpaces(newPath)) { // does not have spaces
//                 let findings = this.getFolderFromPath(newPath);
//                 if(findings) {
//                     this.currentFolder = findings["landingFolder"];
//                     this.path = findings["path"];
//                     this.updatePathText();
//                 }
//             } else {
//                 this.error("Path cannot contain spaces");
//             }
//         } else if(val == "pwd") {// print current path
//             this.log(this.path);
//         } else if(val == "ls") {// print current path
//             let subs = folders[this.currentFolder];
//             if(subs.length != 0) {
//                 subs.forEach((element)=>{
//                     if(element.startsWith("file::")) {
//                         element = element.substring(6);
//                     }
//                     this.log(element);
//                 });
//             } else {
//                 this.log("[No files in current directory]");
//             }
//         } else if(val.startsWith("ls ")) {// print current path
//             let newPath = val.substring(3);
//             if(!this.hasSpaces(newPath)) { // does not have spaces
//                 let findings = this.getFolderFromPath(newPath);
//                 if(findings) {
//                     let subs = folders[findings["landingFolder"]];
//                     if(subs.length != 0) {
//                         subs.forEach((element)=>{
//                             if(element.startsWith("file::")) {
//                                 element = element.substring(6);
//                             }
//                             this.log(element);
//                         });
//                     } else {
//                         this.log("[No files in directory]");
//                     }
//                 }
//             } else {
//                 this.error("Path cannot contain spaces");
//             }
//         } else if(this.getFolderFromPath(val, false)) { // is directory
//             this.log(this.getFolderFromPath(val)["path"]+": is a directory");
//         } else if(val.startsWith("/")) {
//             // check if directory
//             let findings = this.getFolderFromPath(val, false);
//             if(findings) {
//                 this.log(findings["path"]+": is a directory");
//             } else {
//                 this.log(val+": No such file or directory.");
//             }
//         } else if(val.startsWith("mkdir ")) {
//             // make folder with name
//             let name = val.substring(6);
//             name = name.split(" ");
//             name = [...name];
//             name.forEach((element)=>{
//                 if(element.startsWith("file::")||Object.keys(folders).includes(element)) {
//                     // illegal name
//                     this.error("Unable to create folder. Reason: Invalid name "+element+".");
//                 } else {
//                     FileSystem.addFolderAtLocation(element, this.currentFolder);
//                 }
//             });
//         } else if(val.startsWith("mv ")) {
//             // rename - in the form mv old new
//             let content = val.substring(3);
//             content = content.split(" ");
//             if(content.length != 2) {
//                 this.error("Usage:<br>&nbsp;&nbsp;&nbsp;&nbsp;mv old new");
//             } else {
//                 let old = content[0];
//                 let newName = content[1];
//                 let oldParent = folders["parent-"+old];
//                 // add new name
//                 folders[newName] = folders[old];
//                 folders["parent-"+newName] = oldParent;
//                 folders[oldParent].push(newName);
//                 // delete old name
//                 folders[old] = undefined;
//                 folders["parent-"+old] = undefined;
//                 folders[oldParent] = folders[oldParent].filter((value)=>{ if( value!=old ){ return true } return false });
//             }
//             // TODO reload + make this work with localForage
//         } else if(val.startsWith("cp ")) {
//             // TODO Make this work
//             this.error("Use the file viewer to copy files.");
//         } else {
//             this.error("Unknown command "+val);
//         }
//     }

//     error(message) {
//         let errMessage = document.createElement("p");
//         errMessage.classList.add("terminal-error", "terminal-select");
//         errMessage.innerText = "Error: "+message;
//         this.screenContainer.insertBefore(errMessage, this.commandLine);
//         this.scrollView();
//     }
//     log(message) {
//         let logMessage = document.createElement("p");
//         logMessage.classList.add("terminal-log", "terminal-select");
//         logMessage.innerText = message;
//         this.screenContainer.insertBefore(logMessage, this.commandLine);
//         this.scrollView();
//     }
//     warn(message) {
//         this.scrollView();
//     }
//     scrollView() {
//         this.screenContainer.scrollTop = this.screenContainer.scrollHeight - this.screenContainer.clientHeight;
//     }
//     updatePathText() {
//         this.pathText.innerText = NAME+":"+this.currentFolder+" "+this.access+"$> ";
//     }
//     getPathText() { // note that it is not necessarily what is shown to user
//         return NAME+":"+this.currentFolder+" "+this.access+"$>";
//     }
//     hasSpaces(str) {
//         if(/[^\\] /.test(str)) {
//             return true;
//         }
//         return false;
//     }
//     /**
//      * Get the folder given an array split at slashes.
//      * @param {String} newPath - String representing the path
//      * @param {Boolean} showErrors - Boolean telling whether or not to show errors
//      * @returns {Object} - Returns an object if a folder was found, else returns undefined. Object has a value 'landingFolder' (the final folder went through) and 'path' all places travelled. 
//      */
//     getFolderFromPath(newPath, showErrors=true) {
//         if(!newPath.endsWith("/")) {
//             newPath += "/";
//         }
//         let curFolder = this.path;
//         if(newPath.startsWith("/")) {
//             if(newPath == "/") {
//                 let out = {};
//                 out["landingFolder"] = "/";
//                 out["path"] = "/";
//                 return out;
//                 // below code isn't run if this is true because of how return works
//             }
//         }

//         // newPath = newPath.split("/"); // split at slash
//         // name = [...name];
        

//         // newPath.forEach((element)=>{
//         //     if(element) { // prevents empty strings from being processed
//         //         // // travel to folder
//         //         // if(curFolder !== false) {
//         //         //     if(folders[lastStableFolder].subfolders.includes(element)) {
//         //         //         // element is in current directory
//         //         //         curFolder += "/"+element;
//         //         //         lastStableFolder = element;
//         //         //     } else if(folders[this.currentFolder].parent == element) {
//         //         //         curFolder = curFolder.substring(0, curFolder.length-this.currentFolder.length-1);
//         //         //     } else if(element == "..") { // ../ - parent
//         //         //         curFolder = curFolder.substring(0, curFolder.length-lastStableFolder.length);
//         //         //         if(curFolder.endsWith("/")) { // this code breaks without this if statement
//         //         //             curFolder = curFolder.substring(0, curFolder.length-1);
//         //         //         }
//         //         //     } else if(element == ".") { // ./ - current
//         //         //         // do nothing
//         //         //     } else {
//         //         //         if(showErrors) {
//         //         //             this.error("Folder "+element+" is not in the directory "+curFolder);
//         //         //         }
//         //         //         curFolder = false;
//         //         //     }
//         //         // }
//         //     }
//         // });

//         if(folders[curFolder+newPath]) {
//             let out = {};
//             out["landingFolder"] = curFolder.substring(curFolder.lastIndexOf("/")+1); // Todo update this for backslashes
//             out["path"] = curFolder;
//             return out;
//         } else if(folders[newPath]) {
//             let out = {};
//             out["landingFolder"] = curFolder.substring(curFolder.lastIndexOf("/")+1); // Todo update this for backslashes
//             out["path"] = curFolder;
//             return out;
//         }
        
//         if(curFolder !== false) {
            
//         } else {
            
//         }
//         return undefined;
//     }
// }

// appImagePaths["Terminal"] = "assets/terminal.png";
// makeFunctions["Terminal"] = ()=>{ 
//     new Terminal;
// };
// makeFunctions["Terminal-Path"] = (path)=>{ 
//     new Terminal(path);
// };

// // makeFunctions["Terminal"]();