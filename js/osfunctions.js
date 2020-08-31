// * The purpose of this file is to provide useful
// * functions good for general use in websystem.
// * More functions will be added here as needed.

/**
 * The NAME variable is used to get the current user's name.
 */
var NAME = localStorage.getItem("name");

/**
 * Used to determine whether the user can access the internet. Re-evaluated every 15 seconds in 'constantUpdates.js'
 */
var OFFLINE = !navigator.onLine;

/**
 * The global clipboard object.
 * NOTE: If copying to the actual clipboard (for interaction with other websites) is desired, this is not the option.
 * This is used internally for copying and pasting of files. Everything else that can be represented as text should
 * go to the actual user's clipboard so WebSystem plays nice with other sites.
 * @property {any} contents - The contents of the clipboard. Alternative to using get() and set(), though does <strong>not</strong> store in sessionStorage.
 */
class Clipboard {
    /**
     * Get the contents of the clipboard.
     * Alternative: Clipboard.contents
     * @returns {any} - Returns whatever is in the clipboard.
     */
    static get() {
        return Clipboard.contents;
    }
    /**
     * Sets the contents of the clipboard and adds to the clipboard history.
     * Alternative: Clipboard.contents = item
     * @param {any} item - An item to be set as the clipboard's value
     */
    static set(item) {
        Clipboard.contents = item;
        if(typeof Clipboard.contents == "object") {
            sessionStorage.setItem("clipboard", "JSON-"+JSON.stringify(Clipboard.contents));
        } else {
            sessionStorage.setItem("clipboard", Clipboard.contents);
        }
    }
}
let clip = sessionStorage.getItem("clipboard");
Clipboard.contents = clip ? clip : "";
if(Clipboard.contents.startsWith("JSON-")) {
    Clipboard.contents = JSON.parse(clip.substring(5));
}


/**
 * Returns true if the string is a number. Otherwise it returns false.
 * Example usage:
 * "5".isNumber() - true
 * "abc".isNumber() - false
 */
String.prototype.isNumber = function () {
    return !isNaN(parseFloat(this));
}

/**
 * Add the name of the app to its prototype, equaling the path to the icon
 */
var appImagePaths = {};

// 1em. Calculates the value in pixels of 1 em. Useful for many things. Notably, offsets where pixels are required but ems are given, and vice versa
// to convert pixels to em, do: pixels/em
var emDiv = document.createElement("div");
emDiv.style.width = "1em";
document.body.appendChild(emDiv);
/**
 * The value of 1 em, calculated on page load
 */
var em = emDiv.clientWidth; // this is the useful property
document.body.removeChild(emDiv);

/**
 * Check if an element is being hovered. Used internally for right click menu and topbar,
 * though is available for its various uses.
 * From <a href="https://stackoverflow.com/a/14800287/">this</a> StackOverflow answer.
 * @param {HTMLElement} e - The element to check for being hovered on.
 */
const isHover = e => e.parentElement.querySelector(':hover') === e;

/**
 * The name of a custom app should be added to this. The value should be a function which makes an instance of the app's class.
 */
makeFunctions = {};

/**
 * All apps that can open a file type should be added to this. The keys are a filekind (e.g. "Image" or "Text") and the value is a function that has its first argument as the name of the opened file and its second as the path to the opened file
 */
openPossibilities = {};

// Via StackOverflow: https://stackoverflow.com/a/54095466/ Fabian von Ellerts
/**
 * Returns the element height <strong>including margins</strong>
 * If margins aren't required, use <a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetHeight">offsetHeight</a>
 * @param {HTMLElement} element - The element to get the height
 * @returns {number} - in pixels
 */
function outerHeight(element) {
    const height = element.offsetHeight,
        style = window.getComputedStyle(element)
    return ['top', 'bottom']
        .map(side => parseInt(style[`margin-${side}`]))
        .reduce((total, side) => total + side, height)
}

// See Above
function outerWidth(element) {
    const width = element.offsetWidth,
        style = window.getComputedStyle(element)

    return ['left', 'right']
        .map(side => parseInt(style[`margin-${side}`]))
        .reduce((total, side) => total + side, width)
}

// Initialized in boot.

/**
 * The way to read data from the file system. Key is path to a file or folder, value is an object with properties:
 * <ul>
 * <li><code>name</code></li>
 * <li><code>kind</code> - The kind of the item. E.g. "Image" or "Text"</li>
 * <li><code>parent</code></li>
 * <li><code>meta</code> - various metadata about the item.</li>
 * </ul>
 * If it is a file, the following properties are added:
 * <ul>
 * <li><code>isFile</code></li>
 * <li><code>isBinary</code></li>
 * <li><code>extension</code> - The extension of the file. Does not include the "."</li>
 * <li><code>content</code> - The content of the file. Only used if the file is not binary.</li>
 * </ul>
 * If it is a folder, the <code>subfolders</code> property is added. This property contains all files and folders that are inside the folder.
 */
var folders = {};
/**
 * The way to see the content of binary files. Key is file path, value is a Blob
 */
var files = {};

// Third party media tag getter
var jsmediatags = window.jsmediatags;

class viewport {
    // from https://stackoverflow.com/a/44109531/13608595
    static get vh() {
        return window.innerHeight / 100;
    }
    static get vw() {
        return window.innerWidth / 100;
    }
}