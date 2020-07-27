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
     * Add a new css rule by an identifier.
     * The difference between this and newClass 
     * is that newClass must be class.
     * This method allows for things based on element type
     * and id (although id should not be used as multiple instances of a window may cause issues)
     * @param {String} identifierName - The name of the identifier. e.g. 'div' or #abc
     * @param  {...String} args 
     */
    static newRuleByIdentifier(identifierName, ...args) {
        let styles = document.getElementById("global-style");
        styles.innerHTML += "\n"+identifierName+" {\n";
        this.addArgumentsAsRules(args);
        styles.innerHTML += "}";
    }
    /**
     * Add arguments as rules
     * @param {Array} args - The arguments from the ...args parameter
     */
    addArgumentsAsRules(args) {
        args.forEach((arg)=>{
            styles.innerHTML += "\t"+arg+"\n";
            if(arg.indexOf(";") == -1) {
                console.error("Class "+ruleName+" is missing a semicolon for argument: "+arg+".");
            }
        });
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