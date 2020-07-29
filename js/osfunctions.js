// * The purpose of this file is to provide useful
// * functions good for general use in websystem.
// * More functions will be added here as needed.

// The NAME variable is used to get the current user's name.
var NAME = localStorage.getItem("name");

/**
 * The global clipboard object.
 * NOTE: If copying to the actual clipboard (for interaction with other websites) is desired, this is not the option.
 * This is used internally for copying and pasting of files. Everything else that can be represented as text should
 * go to the actual user's clipboard so WebSystem plays nice with other sites.
 * @property {any} contents - The contents of the clipboard. Alternative to using get() and set().
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
    }
}

Clipboard.contents = "";

/**
 * Returns true if the string is a number. Otherwise it returns false.
 * Example usage:
 * "5".isNumber() - true
 * "abc".isNumber() - false
 */
String.prototype.isNumber = function () {
    return !isNaN(parseFloat(this));
}

// appImagePaths: Add the name of the app to its prototype, equaling the path to the icon
var appImagePaths = {};

// 1em. Calculates the value in pixels of 1 em. Useful for many things. Notably, offsets where pixels are required but ems are given, and vice versa
// to convert pixels to em, do: pixels/em
var emDiv = document.createElement("div");
emDiv.style.width = "1em";
document.body.appendChild(emDiv);
var em = emDiv.clientWidth; // this is the useful property
document.body.removeChild(emDiv);

/**
 * Check if an element is being hovered. Used internally for right click menu and topbar,
 * though is available for its various uses.
 * From <a href="https://stackoverflow.com/a/14800287/">this</a> StackOverflow answer.
 * @param {HTMLElement} e - The element to check for being hovered on.
 */
const isHover = e => e.parentElement.querySelector(':hover') === e;

// makeFunctions
// The name of a custom app should be added to this. The value should be a function which makes an instance of the app's class.
makeFunctions = {};

// ! DEBUG ONLY
// ! THIS SHOULD BE REMOVED FOR RELEASE
function jsonEscapeNewlines(source) {
    source = source.toString();
    source = source.replace(/(?:\r\n|\r|\n)/g, '\\n');
    source = source.replace(/"/g, "\\\"");
    console.log(source);
}


// Via StackOverflow: https://stackoverflow.com/a/54095466/ Fabian von Ellerts
/**
 * Returns the element height * including margins *
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
var folders = {};
var files = {};

// Third party media tag getter
var jsmediatags = window.jsmediatags;