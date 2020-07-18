/**
 * Begin Boot Sequence
 * Runs after page has been loaded.
 */
function boot() {
    let name = localStorage.getItem("name");
    if(!name) {
        // main box
        let dialogboxcontainer = document.createElement("div");
        dialogboxcontainer.classList.add("small-window");
        dialogboxcontainer.style.overflow = "auto";
        // centered container
        let dialogbox = document.createElement("div");
        dialogbox.classList.add("centered");
        // top text
        let header = document.createElement("a");
        header.innerText = "Login";
        header.classList.add("black", "bold", "big", "sans-serif", "unselectable");
        dialogbox.appendChild(header);

        // username text
        let username = document.createElement("h2");
        username.classList.add("black", "medium", "sans-serif", "regular", "unselectable");
        dialogbox.appendChild(username);
        username.innerText = "Welcome to WebSystem. Create a new account?";
        // create label
        let label = document.createElement("label");
        label.innerText = "Name: ";
        label.classList.add("black", "sans-serif", "normal", "fancy-input-label", "unselectable");
        dialogbox.appendChild(label);

        // create name input
        let newAccountName = document.createElement("input");
        newAccountName.classList.add("fancy-input");
        dialogbox.appendChild(newAccountName);

        // create create button
        let createButton = document.createElement("div");
        createButton.classList.add("form-button", "black", "sans-serif", "unselectable");
        createButton.innerHTML = "Create!";
        dialogbox.appendChild(createButton);

        // create onclick of create button
        createButton.onclick = ()=>{
            // Set Name
            localStorage.setItem("name", newAccountName.value);
            // set global name value
            NAME = newAccountName.value;
            // Set Downloads
            localStorage.setItem('downloads', '');

            // Setup localforage file system
            if(window.Worker) {
                let setup = new Worker('js/setup.js');
                setup.postMessage(NAME);
                setup.onmessage = (event) => {
                    fadeAndRemove(dialogboxcontainer, true);
                }
            } else { // pseudo polyfill for browsers that don't support webworkers
                console.warn("No webworker support. May be buggy.");
                let loader = document.createElement("script");
                loader.src = "js/setup.js";
                document.body.appendChild(loader);
                setTimeout(()=>{
                    filesystem.getItem("folders").then((data)=>{
                        fadeAndRemove(dialogboxcontainer, true);
                    });
                }, 30);
            }
        }

        dialogboxcontainer.appendChild(dialogbox);
        document.body.appendChild(dialogboxcontainer);
    } else {
        // there is a name already, initiate desktop opening
        startDesktop();
    }
    
}
function showDesktopFolders() {
    // Set folders{} to correct value
    filesystem.getItem("folders").then((result)=>{
        folders = result;
        var yPos = 1;
        result["/Users/"+NAME+"/Desktop/"].subfolders.forEach(el =>{
            createDesktopFolder("1",yPos.toString(), result[el].name, el);
            yPos += 8;
        });
        // ! DEBUG
        // FileSystem.addFolderAtLocation("test", "/Users/"+NAME+"/Desktop/WebSystem/");
        console.log(folders);
        filesystem.iterate((value, key)=>{
            if(key != "folders") {
                files[key] = value;
            }
        });
        
    });
}
function fadeAndRemove(element, start=false) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.remove();
            if(start) {
                startDesktop();
            }
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 10);
}

function startDesktop() {
    // load screen cover
    var openBG = document.createElement("div");
    openBG.classList.add("screen-cover", "loading", "load-fade", "unselectable");
    document.body.appendChild(openBG);
    // spinner/loader
    let spinner = document.createElement("div");
    spinner.classList.add("spinner", "loading", "load-fade", "unselectable");
    document.body.appendChild(spinner);

    // text container
    let welcomeTextContainer = document.createElement("div");
    welcomeTextContainer.classList.add("spinner-text", "loading", "load-fade", "unselectable");

    // actual text
    let welcomeText = document.createElement("h1");
    welcomeText.classList.add("white", "bold", "big", "sans-serif", "unselectable");
    welcomeText.innerText = "Welcome, "+NAME+".";
    welcomeTextContainer.appendChild(welcomeText);
    document.body.appendChild(welcomeTextContainer);

    // Show desktop + set folders to correct value
    showDesktopFolders();
    

    // DOWNLOAD THINGS FROM DOWNLOAD LOCALSTORAGE
    // WAIT UNTIL WORKER IS DONE
    setTimeout(()=>{
        try{
            let downloads = localStorage.getItem('downloads');
            downloads = downloads.split(",");
            downloads.forEach((element)=>{
                if(element.startsWith("app::")) {
                    // search app store for app and download it
                    fetch("http://localhost:3000/applist/popular").then(function(response) { // TODO: CHANGE TO SEARCH
                        return response.json();
                    }).then(function(data) {
                        // get the data from server
                        // set the data to the app array
                        var apps = [];
                        for(const app in data) {
                            apps.push(data[app]);
                        }
                        apps.forEach((app)=>{
                            if(app.name == element.substring(5, element.length)) {
                                // download this one
                                Appstore.installApp(app.name, app.script);
                            }
                        });
                        
                        
                    }.bind(this));
                } // else {
                    // ? Download stuff from server
                // }
            });
        } catch(error) {
            alert("There was an issue processing your downloaded apps. Please restart your page.");
        }
    }, 80);
    

    setTimeout(()=>{
        let faders = document.querySelectorAll(".load-fade");
        faders.forEach(element =>{
            element.classList.remove("load-fade");
            setTimeout(()=>{
                element.remove();
            }, 300);
        });
    }, 500)
    
}

// * Debug
//localStorage.clear();
// FileSystem.clearAll();