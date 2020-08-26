/**
 * The class which allows apps to add custom CSS to the document.
 */
class GlobalStyle {
    /**
     * Create a new CSS class.
     * @param {String} className - The name of the new CSS class
     * @param  {...String} args - The CSS rules to be put in the class
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
     * Add new CSS rules by an identifier.
     * The difference between this and newClass 
     * is that newClass must be class.
     * This method allows for things based on element type
     * and id (although id should not be used as multiple instances of a window may cause issues)
     * @param {String} identifierName - The name of the identifier. e.g. 'div' or '#abc'
     * @param  {...String} args - The CSS rules to be added
     */
    static newRulesByIdentifier(identifierName, ...args) {
        let styles = document.getElementById("global-style");
        styles.innerHTML += "\n"+identifierName+" {\n";
        GlobalStyle._addArgumentsAsRules(args, styles);
        styles.innerHTML += "}";
    }
    /**
     * Add arguments as rules. Only used internally, will cause issues if used outside of this class.
     * @ignore
     * @private
     * It has to be static so other static functions can access it.
     * @param {Array} args - The arguments from the ...args parameter
     * @param {HTMLElement} styles - The global-style element
     */
    static _addArgumentsAsRules(args, styles) {
        args.forEach((arg)=>{
            styles.innerHTML += "\t"+arg+"\n";
            if(arg.indexOf(";") == -1) {
                console.error("Class "+ruleName+" is missing a semicolon for argument: "+arg+".");
            }
        });
    }
    /**
     * Add raw CSS to the global style. To allow for multiple lines, instead of single or double quotes use backticks (``). See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals">MDN</a>.
     * @param {String} css - The css to be added.
     */
    static addRaw(css) {
        let styles = document.getElementById("global-style");
        styles.innerHTML += "\n"+css;
    }
}