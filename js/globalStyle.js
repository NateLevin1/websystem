class GlobalStyle {
    static newClass(className, ...args) {
        let styles = document.getElementById("global-style");
        styles.innerHTML += "\n."+className+" {\n";
        args.forEach((arg)=>{
            styles.innerHTML += "\t"+arg+"\n";
            if(arg.indexOf(";") == -1) {
                console.error("Class "+className+" is missing a semicolon for argument: "+arg+".");
            }
        });
        styles.innerHTML += "}";
    }
}