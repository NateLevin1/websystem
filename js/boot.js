document.body.onload = boot;
var bg;
var dialogboxcontainer;
/**
 * Begin boot sequence.
 * Runs on page onload.
 */
function boot() {
    let name = localStorage.getItem("name");
    if(!name) {
        // GUEST
        firstLogin = true;
        bg = document.createElement("img");
        bg.src = "assets/licensed/bg1.jpg";
        bg.classList.add("new-account-bg");
        document.body.appendChild(bg);
        // main box
        dialogboxcontainer = document.createElement("div");
        dialogboxcontainer.classList.add("dialog-container-container");
        // centered container
        let dialogbox = document.createElement("div");
        dialogbox.classList.add("dialog-container");
        // top text
        let header = document.createElement("a");
        header.innerText = "Login";
        header.classList.add("black", "bold", "big", "sans-serif", "unselectable");
        dialogbox.appendChild(header);

        // welcome text
        let welcome = document.createElement("h2");
        welcome.classList.add("black", "medium", "sans-serif", "regular", "unselectable", "welcome");
        welcome.innerText = "Welcome to WebSystem.";
        dialogbox.appendChild(welcome);

        // move google sing in button
        let sign = document.getElementById("sign-in");
        sign.style.display = "inline-block";
        dialogbox.appendChild(sign);


        // let inContainer = document.createElement("div");
        // inContainer.classList.add("in-container");
        // // create label
        let label = document.createElement("label");
        label.innerText = "Or";
        label.classList.add("black", "sans-serif", "normal", "fancy-input-label", "unselectable");
        dialogbox.appendChild(label);

        // create name input
        // let newAccountName = document.createElement("input");
        // newAccountName.classList.add("fancy-input");
        // newAccountName.placeholder = "John Doe";
        // inContainer.appendChild(newAccountName);
        // inContainer.appendChild(document.createElement("span")); // for ::after

        // dialogbox.appendChild(inContainer);

        // create create button
        let createButton = document.createElement("button");
        createButton.classList.add("form-button", "black", "sans-serif", "unselectable");
        createButton.textContent = "Login as Guest";
        dialogbox.appendChild(createButton);

        // create onclick of create button
        createButton.onclick = ()=>{
            initiateSignup("Guest");
        }

        let notice = document.createElement("p");
        notice.innerHTML = "By signing in you agree to our <a href=\"/privacy.html\">Privacy Policy</a>";
        notice.classList.add("privacy-notice");
        dialogbox.appendChild(notice);

        dialogboxcontainer.appendChild(dialogbox);
        document.body.appendChild(dialogboxcontainer);
    } else {
        // there is a name already, initiate desktop opening
        startDesktop();
    }
    
}
function setFileSystem() {
    return new Promise((resolve)=>{
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
                    fetch("../assets/logo.png")
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
    setFileSystem().then(async ()=>{
        isGuest = account["isGuest"];
        desktopBackground.onload = ()=>{
            let faders = document.querySelectorAll(".load-fade");
            faders.forEach(element =>{
                element.classList.remove("load-fade");
                setTimeout(()=>{
                    element.remove();
                }, 300);
            });
        }
        if(firstLogin && !isGuest) {
            // send data to server
            let formData = new FormData;
            formData.append("id_token", googleProfile["id_token"]);
            formData.append("json", JSON.stringify(folders).replace(/'/g, "\\\'").replace(/"/g, "\\\"").replace(/\\n/g, "\\\\n"));
            try {
                console.log( await ((await fetch('https://www.websystem.io/backend/php/set.php', {
                    method: 'POST',
                    body: formData
                })).text()) );
            } catch(e) {
                console.log("There was an issue sending your data to the server. Your data will be saved, but it will not be synced to your account until the server can be reached. Error: "+e);
                alert("There was an issue sending your data to the server. Your data will be saved, but it will not be synced to your account until the server can be reached. Error: "+e);
            }
        } 
    });
}

var firstLogin = false;
/**
 * Called on the document when the file system has been fully loaded.
 */
var fileSystemReady = new Event("file-system-ready");

var mainContent = document.createElement("div");

/**
 * The account object. Holds data about the account.
 * @property accounts - All accounts on this browser.
 * @property admin - The admin account on this browser.
 */
var account = {};

var isGuest = true;
var googleProfile = {};
// Google stuff
function onSignIn(googleUser) {
    isGuest = false;
    var profile = googleUser.getBasicProfile();
    var id_token = googleUser.getAuthResponse().id_token;

    // The following can change in between logins and so is not set to filesystem
    
    googleProfile["id"] = profile.getId(); // Do not send to backend. Use ID token instead.
    googleProfile["id_token"] = id_token;
    googleProfile["image"] = profile.getImageUrl();
    googleProfile["email"] = profile.getEmail();
    if(firstLogin) {
        initiateSignup(profile.getName());
    }
}
function initiateSignup(val) {
    localStorage.setItem("name", val);
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
            if(isGuest) {
                FileSystem.setAccountDetail("isGuest", isGuest);
            }
        }
    }
}