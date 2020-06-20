class Calculator {
    constructor() {
        let win = new Window(100,100, "Calculator", 20,35,20,2.2);
        this.window = win.getWindow();
        this.header = win.getHeader();
        this.win = win;
        this.win.setBackgroundColor("rgb(40,40,40)");
        
        // CSS Definitions
        new CSSClass("calc-screen-container", "background-color: #8c8c8c;", "width:100%;", "height: 30%;");
        new CSSClass("calc-screen", "position: absolute;", "top: 10%;", "width: 99%;", "font-size: 4em;", "text-align: right;");

        let screenContainer = document.createElement("div");
        screenContainer.classList.add("calc-screen-container");

        let screen = document.createElement("div"); // display text
        screenContainer.appendChild(screen);
        screen.innerHTML = "1,000";
        screen.classList.add("calc-screen");
        

        this.window.appendChild(screenContainer);
        this.screen = screen;
    }
    updateScreen(text="") {
        if(text) {
            this.screen.innerHTML = text;
        }
    };
}

function makeCalculator() {
    new Calculator;
}