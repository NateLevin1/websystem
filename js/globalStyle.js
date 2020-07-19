class GlobalStyle {
    /**
     * Create a new css class.
     * @param {String} className - The name of the new css class
     * @param  {...String} args - The css rule to be put in the class
     */
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
    /**
     * Add raw css to the global style.
     * @param {String} css - The css to be added.
     */
    static addRaw(css) {
        let styles = document.getElementById("global-style");
        styles.innerHTML += "\n"+css;
    }
}