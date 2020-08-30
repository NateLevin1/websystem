(function () {
    document.body.onload = boot;
/**
 * Begin boot sequence.
 * Runs on page onload.
 */
function boot() {
    let name = localStorage.getItem("name");
    if(!name) {
        // GUEST
        firstLogin = true;
        let bg = document.createElement("img");
        bg.src = "assets/licensed/bg1.jpg";
        bg.classList.add("new-account-bg");
        document.body.appendChild(bg);
        // main box
        let dialogboxcontainer = document.createElement("div");
        dialogboxcontainer.classList.add("dialog-container-container");
        // centered container
        let dialogbox = document.createElement("div");
        dialogbox.classList.add("dialog-container");
        // top text
        let header = document.createElement("a");
        header.innerText = "Login";
        header.classList.add("black", "bold", "big", "sans-serif", "unselectable");
        dialogbox.appendChild(header);

        // username text
        let username = document.createElement("h2");
        username.classList.add("black", "medium", "sans-serif", "regular", "unselectable");
        username.style.width = "75%";
        username.innerText = "Welcome to WebSystem.";
        dialogbox.appendChild(username);

        // google sing in button
        let sign = document.createElement("div");
        sign.classList.add("g-signin2");
        sign.setAttribute("data-onsuccess", "userSignIn");
        console.log(sign.outerHTML);
        dialogbox.appendChild(sign);


        let inContainer = document.createElement("div");
        inContainer.classList.add("in-container");
        // create label
        let label = document.createElement("label");
        label.innerText = "Name: ";
        label.classList.add("black", "sans-serif", "normal", "fancy-input-label", "unselectable");
        inContainer.appendChild(label);

        // create name input
        let newAccountName = document.createElement("input");
        newAccountName.classList.add("fancy-input");
        newAccountName.placeholder = "John Doe";
        inContainer.appendChild(newAccountName);
        inContainer.appendChild(document.createElement("span")); // for ::after

        dialogbox.appendChild(inContainer);

        // create create button
        let createButton = document.createElement("button");
        createButton.classList.add("form-button", "black", "sans-serif", "unselectable");
        createButton.textContent = "Create!";
        dialogbox.appendChild(createButton);

        newAccountName.onkeyup = ()=>{
            if(newAccountName.classList.contains("invalid-name")) {
                newAccountName.style.borderBottom = "";
                newAccountName.classList.remove("invalid-name");
            }
        }
        newAccountName.onkeydown = (event)=>{
            if(event.key == "Enter") {
                createButton.click();
            }
        }

        // create onclick of create button
        createButton.onclick = ()=>{
            let val = newAccountName.value;
            console.log();
            if(val && (val.length != 1 || (val.length == 1 && val[0].toUpperCase() != val[0].toLowerCase()))) {
                // Set Name
                localStorage.setItem("name", val);
                // set global name value
                NAME = val;

                // Setup localforage file system
                if(window.Worker) {
                    let setup = new Worker('js/setup.js');
                    setup.postMessage(NAME);
                    setup.onmessage = ()=>{
                        dialogboxcontainer.style.animation = "fade-out 0.3s";
                        setTimeout(()=>{
                            dialogboxcontainer.remove();
                            bg.remove();
                            startDesktop();
                        }, 290);
                    }
                }
            } else {
                newAccountName.style.borderBottom = "4px solid rgb(230,0,0)";
                newAccountName.classList.add("invalid-name");
            }
        }

        dialogboxcontainer.appendChild(dialogbox);
        document.body.appendChild(dialogboxcontainer);
    } else {
        // there is a name already, initiate desktop opening
        startDesktop();
    }
    
}
function setFileSystem() {
    return new Promise((resolve, reject)=>{
        mainContent.classList.add("main-content");
        document.body.appendChild(mainContent);
        // Set folders{} to correct value
        filesystem.getItem("folders").then((result)=>{
            folders = result;
    
            // add all app scripts to the document
            for(const val in folders) {
                let file = folders[val];
                if(file.kind == "App" && !makeFunctions[file.name]) { // if is an app and not installed by default
                    if(typeof file.content == "string") { // scripts must be strings, this prevents not apps from erroring
                        Appstore.installApp(file.name, file.content);
                    }
                }
            }
    
            filesystem.iterate((value, key)=>{
                if(key != "folders") {
                    if(key != "account") {
                        files[key] = value;
                    } else {
                        account = value;
                    }
                }
            }).then(()=>{
                if(isSafari && firstLogin) { // add the websystem logo.png file
                    FileSystem.deleteAnyAtLocation("/Users/"+NAME+"/Desktop/WebSystem/logo.png/");
                    fetch("../assets/trash.png")
                    .then(function(response) {
                        return response.blob();
                    })
                    .then(function(blob) {
                        // convert to file
                        let data = new File([blob], "logo.png", {lastModified: new Date(), type:"image/png"});
                        FileSystem.addFileAtLocation("logo.png", data, "Image", "/Users/"+NAME+"/Desktop/WebSystem/");
                    });
                }
                document.dispatchEvent(fileSystemReady);
                // add desktop once folders and files is done
                new Desktop;

                resolve();
            });
        });
    });
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

    // Add top bar
    new TopBar;
    // Show desktop + set folders to correct value
    setFileSystem().then(()=>{
        desktopBackground.onload = ()=>{
            let faders = document.querySelectorAll(".load-fade");
            faders.forEach(element =>{
                element.classList.remove("load-fade");
                setTimeout(()=>{
                    element.remove();
                }, 300);
            });
        }
    });
}

function userSignIn(user) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
}


var firstLogin = false;
/**
 * Called on the document when the file system has been fully loaded.
 */
var fileSystemReady = new Event("file-system-ready");
}());

var mainContent = document.createElement("div");

/**
 * The account object. Holds data about the account.
 * @property accounts - All accounts on this browser.
 * @property admin - The admin account on this browser.
 */
var account = {};

