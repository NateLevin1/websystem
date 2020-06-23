// * The purpose of this file is to provide useful
// * functions good for general use in websystem.
// * More functions will be added here as needed.

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

// isHover(element)
// Check if an element is being hovered. Used internally for right click menu
// though is available for its various uses.
// From this answer: https://stackoverflow.com/a/14800287/ 
const isHover = e => e.parentElement.querySelector(':hover') === e;
