/**
 * The interface for adding and removing files in WebSystem.
 */
class FileSystem {
    /**
     * Add a new folder as a subfolder of <code>parentPath</code>
     * @param {String} name - The name of the folder to be added.
     * @param {String} parentPath - The path to the parent of the folder to be added. *Must* end in a slash ('/').
     * @returns {Promise} Returns the localForage setItem promise. Resolves once item has been added to localForage.
     */
    static addFolderAtLocation(name, parentPath) {
        let path = parentPath+name+"/";

        let num = 2;
        let oldPath = path;
        let oldName = name;
        while(folders[path]) { // already exists
            console.warn("There is already a folder with path "+path);
            path = oldPath+" "+num;
            name = oldName+" "+num;
            num++;
        }
        // Set new folder as subfolder of parent
        folders[parentPath].subfolders.unshift(path);

        // Set up metadata
        let currentDate = Date.now();

        // update folders{}
        folders[path] = {
            "name": name,
            kind: "Folder",
    
            subfolders: [],
            parent: parentPath,
    
            meta: {
                size:0,

                "creation-date": currentDate,
                "modified-date": currentDate,
                "last-opened-date": "Never",

                locked: false,

                "system-comments": [],
                "user-comments": [],

                hasTags: false,
                tags: []
            }
        };
        this.dispatchUpdate(parentPath, { type: "add", pathAffected: path });
        // update system
        return filesystem.setItem("folders", folders);
    }
    /**
     * Add a file with the parent <code>parentPath</code>.
     * @param {String} name - The name of the new folder.
     * @param {(Blob|String)} data - The data of the new file. If string, the file will not be stored as binary.
     * @param {String} kind - The kind of the data. E.g. "Image" or "App"
     * @param {String} parentPath - The path to the parent of the new file.
     * @param {JSON} options - The options to pass in.
     * @param {String} options.alias - A name to be set instead of the given name. May cause issues.
     * @returns {Promise[]} [0] == folder promise. [1] == file promise (if any). Returns the localForage setItem promises. Resolves once item has been added to localForage.
     */
    static addFileAtLocation(name, data, kind, parentPath, options={}) {
        let path = parentPath+name+"/";
        var extension;
        if(kind != "App") { // app files don't have extensions in their names
            extension = name.match(/\.[^.]+$/)[0];
        } else {
            extension = ".app";
        }
        let binary = true;
        let content = "";
        let num = 2;
        let oldPath = path;
        let oldName = name;
        let resultArray = [];
        while(folders[path]) { // already exists
            path = oldPath.substring(0,oldPath.length-1)/*<- Remove ending '/'*/+" "+num+"/";
            name = oldName+" "+num;
            console.warn("There is already a file with path. Changed to "+path+". New name is "+name);
            num++;
        }

        if(typeof data == "string") { // text encoded file
            binary = false;
            content = data;
            // don't set binaries
        } else {
            // update files
            files[path] = data;
            // update storage
            resultArray[1] = filesystem.setItem(path, data);
            content = options;
        }

        if(options.alias) {
            name = options.alias;
        }

        // Set new folder as subfolder of parent
        folders[parentPath].subfolders.unshift(path);

        // Set up metadata
        let currentDate = Date.now();

        // update folders{}
        folders[path] = {
            isFile: true,
            "name":name,
            "kind":kind,
            extension:extension,

            parent: parentPath,
            isBinary: binary,
            "content": content,

            meta: {
                size:0,

                "creation-date": currentDate,
                "modified-date": currentDate,
                "last-opened-date": "Never",

                locked: false,
                
                "system-comments": [],
                "user-comments": [],

                hasTags: false,
                tags: []
            }
        };
        this.dispatchUpdate(parentPath, { type: "add", pathAffected: path });
        // update system
        resultArray[0] = filesystem.setItem("folders", folders);
        return resultArray;
    }
    static deleteFolderAtLocation(path) {
        let shouldDelete = FileSystem.recurseThroughSubfolders(path);
        shouldDelete.forEach((path)=>{
            let par = folders[path].parent;
            FileSystem.deleteAnyAtLocation(path);
        });
    }
    static deleteAnyAtLocation(path) {
        let fRefParent = folders[path].parent;
        if(folders[path].isFile) {// is file, delete from folders{} and files{}
            if(folders[path].isBinary) {
                delete files[path];
                filesystem.removeItem(path).catch((e)=>{
                    console.error("Error deleting file "+path, e);
                });
            }

            delete folders[path];
            filesystem.setItem("folders", folders);
        } else { // is folder, delete normally
            delete folders[path];
            filesystem.setItem("folders", folders);
        }
        this.dispatchUpdate(fRefParent, { type: "remove", pathAffected: path });
    }
    static recurseThroughSubfolders(path) {
        let subs = [path];
        if(!folders[path].isFile) {
            folders[path].subfolders.forEach((element)=>{
                subs.push(...FileSystem.recurseThroughSubfolders(element));
            });
        }
        return subs;
    }
    /**
     * Move a file
     * @param {String} oldPath - The path of the file to be moved
     * @param {String} newParentPath - The new parent of the file
     * @returns {Boolean} Whether or not the moving is possible. Note that this has nothing to do with whether it actually succeeded. False is returned if the old folder is a parent of the new one (which would otherwise cause an infinite loop) or if the folder already has the desired parent.
     */
    static moveFile(oldPath, newParentPath) {
        if(folders[oldPath].parent == newParentPath) {
            return false;
        }

        let name = folders[oldPath].name;
        let kind = folders[oldPath].kind;
        let path = newParentPath+name+"/";
        let num = 2;
        let oldName = name;
        while(folders[path]) { // already exists
            name = oldName+" "+num;
            path = newParentPath+name+"/";
            console.warn("There is already a file with path. Changed to "+path+". New name is "+name);
            num++;
        }

        // make sure is not own parent, if it is then just stop the function
        let curParent = folders[newParentPath].parent;
        while(curParent != "/") { // go to highest up
            if(curParent == oldPath) {
                return false; // stop execution of the rest of the function
            }
            curParent = folders[curParent].parent;
        }


        if(folders[oldPath].isFile) { // is file
            // remove as subfile
            FileSystem.removeAsSubfolder(folders[oldPath].parent, oldPath);
            // add as an actual file
            if(folders[oldPath].isBinary) {
                FileSystem.addFileAtLocation(name, files[oldPath], kind, newParentPath)[1].catch((err)=>{
                    console.error("There was an error adding the file to the new location. Error: "+err);
                });
                delete files[oldPath];
                filesystem.removeItem(oldPath).catch((e)=>{
                        console.error("Error deleting file "+path, e);
                    });
            } else {
                FileSystem.addFileAtLocation(name, folders[oldPath].content, kind, newParentPath);
            }
            // delete old file in folders{}
            let fRefParent = folders[oldPath].parent;
            delete folders[oldPath];
            this.dispatchUpdate(fRefParent, { type: "remove", pathAffected: oldPath });
            // set filesystem to correct value
            filesystem.setItem("folders", folders);
        } else { // is not file
            FileSystem.addFolderAtLocation(name, newParentPath);
            // remove oldPath as a subfolder of its parent
            FileSystem.removeAsSubfolder(folders[oldPath].parent, oldPath);
            FileSystem.moveWithSubfolders(oldPath, newParentPath+name+"/");
            // only setItem after everything is done
            filesystem.setItem("folders", folders);
        }

        return true;
    }
    static moveWithSubfolders(recreationPath, newParent) {
        let subs = folders[recreationPath].subfolders;
        if(subs) {
            subs.forEach((element)=>{
                let fRef = folders[element];
                if(fRef.isFile) {
                    if(fRef.isBinary) {
                        FileSystem.addFileAtLocation(fRef.name, files[element], fRef.kind, newParent);
                        delete files[element];
                        delete folders[element];
                        filesystem.removeItem(element).catch((e)=>{
                                console.error("Error deleting file "+element, e);
                            });
                    } else {
                        FileSystem.addFileAtLocation(fRef.name, fRef.content, fRef.kind, newParent);
                        delete folders[element];
                    }
                    this.dispatchUpdate(fRef.parent, { type: "remove", pathAffected: element });
                } else {
                    FileSystem.addFolderAtLocation(fRef.name, newParent);
                    FileSystem.moveWithSubfolders(element, newParent+fRef.name+"/");
                }
            });
        }
        let fRefParent = folders[recreationPath].parent;
        delete folders[recreationPath];
        this.dispatchUpdate(fRefParent, { type: "remove", pathAffected: recreationPath });
    }

    static removeAsSubfolder(parentPath, removePath, replacementPath=undefined) {
        let oldParentSubs = folders[parentPath].subfolders;
        if(replacementPath) {
            folders[parentPath].subfolders.splice(oldParentSubs.indexOf(removePath), 1, replacementPath);
            this.dispatchUpdate(parentPath, { type: "add", pathAffected: replacementPath });
        } else {
            folders[parentPath].subfolders.splice(oldParentSubs.indexOf(removePath), 1);
        }
        // this.dispatchUpdate(parentPath, { type: "remove", pathAffected: removePath }); // this causes double removing
    }

    static renameAny(oldPath, newPath, newName) {
        let fRef = folders[oldPath];
        if(fRef.isFile) { // changing a file does not require recursion so it is separated
            FileSystem.renameFile(oldPath, newPath, newName, fRef.parent);
        } else {
            FileSystem.recursiveRenameFolder(oldPath, newPath, fRef.parent, newName);
            FileSystem.removeAsSubfolder(fRef.parent, oldPath, newPath);
            // this.dispatchUpdate(fRef.parent, { type: "rename", pathAffected: newPath, renameOldPath: oldPath }); // TODO add this? this causes a double event, but might be necessary
        }
        filesystem.setItem("folders", folders);
    }
    /**
     * Rename a folder and its subfolders. Use renameAny() instead of this because this function won't update the filesystem.
     * @param {String} oldPath - The path to the folder before it is renamed
     * @param {String} newPath - The path the folder should be at after the folder is renamed
     */
    static recursiveRenameFolder(oldPath, newPath, newParent, newName=null) {
        folders[newPath] = folders[oldPath];
        folders[newPath].name = newName ? newName : folders[oldPath].name;
        folders[newPath].parent = newParent;
        folders[newPath].subfolders.forEach((path, index)=>{
            let fRef = folders[path];
            if(fRef.isFile) {
                FileSystem.renameFile(path, newPath+fRef.name+"/", fRef.name, newPath);
            } else {
                FileSystem.recursiveRenameFolder(path, newPath+fRef.name+"/", newPath);
            }
            folders[newPath].subfolders[index] = newPath+fRef.name+"/";
        });
        delete folders[oldPath];
        this.dispatchUpdate(newParent, { type: "rename", pathAffected: newPath, renameOldPath: oldPath });
    }

    static renameFile(oldPath, newPath, newName, newParent) {
        FileSystem.removeAsSubfolder(folders[oldPath].parent, oldPath, newPath);
        let fRef = folders[oldPath];
        folders[newPath] = folders[oldPath];
        folders[newPath].name = newName;
        folders[newPath].parent = newParent;
        delete folders[oldPath];
        if(fRef.isBinary) {
            files[newPath] = files[oldPath]; // set new item as a copy of old one
            filesystem.setItem(newPath, files[oldPath]).then(()=>{ // add new item
                filesystem.removeItem(oldPath).catch((e)=>{ // remove old item
                    console.error("Error deleting file "+oldPath, e);
                });
            });
            delete files[oldPath]; // remove old item
        }
        this.dispatchUpdate(newParent, { type: "rename", pathAffected: newPath, renameOldPath: oldPath });
    }
    /**
     * Change the name of a file or folder. Note that this does not change its path, it only changes the name that is displayed.
     * To actually rename a file look into the <code>renameAny()</code> function.
     * @param {String} path - The path of the file for the display name to be changed
     * @param {String} newName - The new name for the file
     */
    static changeDisplayName(path, newName) {
        // since all that is happening is changing the name (and not the path) this is pretty simple
        folders[path].name = newName;
        this.dispatchUpdate(folders[path].parent, { type: "rename", pathAffected: path, renameOldPath: path });
        return filesystem.setItem("folders", folders);
    }

    /**
     * Dispatch a fileSystemUpdate event. Used internally every time the filesystem changes, so this method should not ever have to be called by an app.
     * @param {String} parentPath - The value to be passed for the property parentPath
     * @param {Object} actions - The value to be passed for the property path
     * @param {String} actions.type - The type of action. Possible values are: "remove", "add", and "rename".
     * @param {String} actions.pathAffected - The path that has been changed. This is the new path in case of rename.
     * @param {String} [actions.renameOldPath] - The path that was removed during rename. This is the old path.
     */
    static dispatchUpdate(parentPath, actions) {
        fileSystemUpdate.parentPath = parentPath;
        fileSystemUpdate.actions = actions;
        document.dispatchEvent(fileSystemUpdate);
    }

    /**
     * Update folders[path].content. Note that this will not do what is expected if it is a binary file.
     * @param {String} path 
     * @param {Any} newContent 
     * @returns {Promise} The setItem promise
     */
    static updateContent(path, newContent) {
        folders[path].content = newContent;
        return filesystem.setItem("folders", folders);
    }

    // ! DEBUG DO NOT INCLUDE BELOW IN PRODUCTION
    static clearAll() {
        localStorage.clear();
        filesystem.clear();
    }

    /**
     * Set a value at specified key and save it to the account.
     * @param {String} key 
     * @param {Any} newValue 
     */
    static setAccountDetail(key, newValue) {
        account[key] = newValue;
        return filesystem.setItem("account", account);
    }
}

// The path to the trash. May become an array later.
var trashPath = "/Users/"+NAME+"/Desktop/Trash Can/";

// The event that tells fileViewer windows to update their display
var fileSystemUpdate = new Event("file-system-update"); // dispatched on the document whenever there is a change to the filesystem. The 