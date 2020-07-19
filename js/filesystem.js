class FileSystem {
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
        // update system
        filesystem.setItem("folders", folders);
    }
    /**
     * 
     * @param {String} name - The name of the new folder.
     * @param {Blob} data - The data of the new file.
     * @param {String} kind - The kind of the data. E.g. "Image" or "App"
     * @param {String} parentPath - The path to the parent of the new file.
     * @param {JSON} options - The options to pass in.
     */
    static addFileAtLocation(name, data, kind, parentPath, options={}) {
        let path = parentPath+name+"/";
        let extension = name.match(/\.[^.]+$/)[0];
        let binary = true;
        let content = "";
        let num = 2;
        let oldPath = path;
        let oldName = name;
        while(folders[path]) { // already exists
            console.warn("There is already a file with path "+path);
            path = oldPath+" "+num;
            name = oldName+" "+num;
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
            filesystem.setItem(path, data);
            content = options;
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
        
        // update system
        filesystem.setItem("folders", folders);
    }

    // ! DEBUG DO NOT INCLUDE BELOW IN PRODUCTION
    static clearAll() {
        localStorage.clear();
        localforage.clear();
    }
}