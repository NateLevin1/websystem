(function () {
    class FlyingFish {
        constructor() {
            let win = new Window(250, 352, "Flying Fish", 27, 37, {
                x: 15,
                y: 2.2,
                topBarCreator: this.createTopBar,
                thisContext: this,
                pathToApp: "/Users/" + NAME + "/Applications/FlyingFish.app/",
            });
            this.window = win.getWindow();
            this.header = win.getHeader();
            this.win = win;
            this.win.setBackgroundColor("black");

            let iframe = document.createElement("iframe");
            iframe.src = "https://natelev.in/portfolio/flying-fish/";
            iframe.style.height = "calc(100% - 1.2em)";
            iframe.style.width = "100%";
            iframe.style.margin = "0";
            iframe.style.border = "none";
            iframe.innerText =
                "Loading Flying Fish from https://natelev.in/portfolio/flying-fish/";
            this.window.appendChild(iframe);
        }

        createTopBar() {
            TopBar.addToTop("File", "file");
            TopBar.addToMenu("Close Window", "file", () => {
                this.win.close();
            });

            TopBar.addToTop("Help", "help");
            TopBar.addToMenu("About Flying Fish", "help", () => {
                About.newWindow(
                    "Flying Fish",
                    "Avoid the obstacles in this arcade game with controls unlike anything you've played before.",
                    "1.0",
                    "assets/flying-fish.png"
                );
            });
        }
    }

    appImagePaths["FlyingFish"] = "assets/flying-fish.png";
    makeFunctions["FlyingFish"] = () => {
        new FlyingFish();
    };

    document.addEventListener(
        "file-system-ready",
        () => {
            if (!folders["/Users/" + NAME + "/Applications/FlyingFish.app/"]) {
                delete makeFunctions["FlyingFish"];
                delete appImagePaths["FlyingFish"];
            }
        },
        { once: true }
    );
})();
