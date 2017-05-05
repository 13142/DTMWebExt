// window.onload = function WindowLoad(event) {}
// document.addEventListener('focus', FocusChange, true);
// document.addEventListener('focusin', FocusChange);

var allWordlistData = [];
var qwertyKeyboardArray = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', ' ', 'p', '[', ']', '\\'],
  ['', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ' ', ';', '\''],
  ['', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
  ['', '', '', ' ', ' ', ' ', ' ', ' ', '', '']
];

var qwertyShiftedKeyboardArray = [
  ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+'],
  ['', 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', '', 'P', '{', '}', '|'],
  ['', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '', ':', '"'],
  ['', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?'],
  ['', '', ' ', ' ', ' ', ' ', ' ', '', '']
];

window.addEventListener("click", notifyExtension);

function notifyExtension(e) {

  if (e.target.tagName != "A") {
    return;
  }
  console.log("Stuff happened");
}

function handleResponse(message) {
  console.log('background script sent a response: ' + message.response[50]);
}

function handleError(error) {
  console.log('Error: ' + error);
}

// var stdin = process.openStdin();
// console.log("ready: ");
// stdin.addListener("data", function(d) {
//     // note:  d is an object, and when converted to a string it will
//     // end with a linefeed.  so we (rather crudely) account for that
//     // with toString() and then trim()
//     d = d.toString().replace(/\r?\n|\r/g, "");
//     var dif = d.split(' ');
//     console.log(dif);
//     console.log("difference: " + levDist(dif[0], dif[1]));
// });
function isEmptyOrSpaces(str) {
  return str === null || str.match(/^ *$/) !== null;
}

function keyDown(zEvent) {
  console.log(zEvent.code);
  if (zEvent.ctrlKey && zEvent.altKey && zEvent.code === "KeyM") {
    var innerString = document.activeElement.innerText;
    var splitString = innerString.split(/\s+/);
    for (var i = 0; i < splitString.length; i++) {
      if (isEmptyOrSpaces(splitString[i])) {
        splitString.splice(i,1);
        i--;
        continue;
      }
      splitString[i] = splitString[i].replace(/[\.\;\,\?\!]+/, "");
    }
    var sending = browser.runtime.sendMessage({
      "textBoxData": splitString
    });
    sending.then(handleResponse);
  }
}

// function keyDown(e) {console.log(e.which);}; // Test
// function keyUp(e) {console.log(e);}; // Test
(function checkForNewIframe(doc) {
  if (!doc) return; // document does not exist. Cya

  // Note: It is important to use "true", to bind events to the capturing
  // phase. If omitted or set to false, the event listener will be bound
  // to the bubbling phase, where the event is not visible any more when
  // Gmail calls event.stopPropagation().
  // Calling addEventListener with the same arguments multiple times bind
  // the listener only once, so we don't have to set a guard for that.
  doc.addEventListener('keydown', keyDown, true);
  //    doc.addEventListener('keyup', keyUp, true);
  doc.hasSeenDocument = true;
  for (var i = 0, contentDocument; i < frames.length; i++) {
    try {
      contentDocument = iframes[i].document;
    } catch (e) {
      continue; // Same-origin policy violation?
    }
    if (contentDocument && !contentDocument.hasSeenDocument) {
      // Add poller to the new iframe
      checkForNewIframe(iframes[i].contentDocument);
    }
  }
  setTimeout(checkForNewIframe, 250, doc); // <-- delay of 1/4 second
})(document); // Initiate recursive function for the document.

function FocusChange(e) {

  // for (var i = 0; i < splitString.length; i++) {
  //     console.log(binarySearch(allWordlistData, splitString[i].trim(), function(a, b) {
  //         if (a == b) {
  //             return 0;
  //         } else if (a < b) {
  //             return -1;
  //         } else if (a > b) {
  //             return 1;
  //         }
  //     }));
  // }

  //  console.log(distanceFinder("R", "A"));
}


// var keyboardLayoutLookup = {
//     "QWERTY": {
//         qwertyKeyboardArray,
//         qwertyShiftedKeyboardArray
//     }
// };
