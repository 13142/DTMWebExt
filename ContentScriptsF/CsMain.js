// window.onload = function WindowLoad(event) {}
// document.addEventListener('focus', FocusChange, true);
// document.addEventListener('focusin', FocusChange);

var allWordlistData = [];


window.addEventListener("click", notifyExtension);

function notifyExtension(e) {

  if (e.target.tagName != "A") {
    return;
  }
  console.log("Stuff happened");
}

function handleResponse(message) {
  document.activeElement.innerText = message;
}

function handleSpacedResponse(message) {
  //console.log(message);
  //message = JSON.parse(message);
  var newWord = message.pop();
  message = message.join(' ');
  var pattern = "^" + message + "\s?[a-zA-Z]+";
  var re = new RegExp(pattern, "g");
  var temp = savedRange.endOffset;
  document.activeElement.innerText = document.activeElement.innerText.replace(re, message + ' ' + newWord);
  document.activeElement.innerHTML += "&nbsp;";
  savedRange.setEnd(document.activeElement, temp);
  savedRange.collapse(false);
  restoreSelection();
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
  if (zEvent.ctrlKey && zEvent.altKey && zEvent.code === "KeyM") {
    var innerString = document.activeElement.innerText;
    var selectedText;
    // if (selectedText == '') {
    //   var frames = window.frames;
    //   for (var i = 0; i < frames.length; i++) {
    //     if (selectedText == '') {
    //       selectedText = frames[i].document.getSelection().getRangeAt(0);
    //       console.log("Yes  " + frames[i].document.getSelection().getRangeAt(0));
    //     } else {
    //       break;
    //     }
    //   }
    // }
    console.log(selectedText);
    var sending = browser.runtime.sendMessage({
      "textBoxData": innerString,
      "requestType": "fullCorrection"
    });
    sending.then(handleResponse);
  } else if (zEvent.code === "Space") {
    console.log(doGetCaretPosition(document.activeElement));
    saveSelection();
    var sending = browser.runtime.sendMessage({
      "textBoxData": getWordPrecedingCaret(document.activeElement),
    //  "textboxPosition": doGetCaretPosition(document.activeElement),
      "requestType": "spaceCorrection"
    });

    //  var latestWord =
    // var sending = browser.runtime.sendMessage({
    //   "textBoxData": latestWord,
    //   "requestType": "spaceCorrection"
    // });
    sending.then(handleSpacedResponse);

  }
}
var savedRange,isInFocus;
function saveSelection() {
  if (window.getSelection) //non IE Browsers
  {
    savedRange = window.getSelection().getRangeAt(0);
  } else if (document.selection) //IE
  {
    savedRange = document.selection.createRange();
  }
}

function restoreSelection() {
  isInFocus = true;
//  document.getElementById("area").focus();
  if (savedRange != null) {
    if (window.getSelection) //non IE and there is already a selection
    {
      var s = window.getSelection();
      if (s.rangeCount > 0)
        s.removeAllRanges();
      s.addRange(savedRange);
    } else if (document.createRange) //non IE and no selection
    {
      window.getSelection().addRange(savedRange);
    } else if (document.selection) //IE
    {
      savedRange.select();
    }
  }
}
//this part onwards is only needed if you want to restore selection onclick
var isInFocus = false;

function onDivBlur() {
  isInFocus = false;
}

function cancelEvent(e) {
  if (isInFocus == false && savedRange != null) {
    if (e && e.preventDefault) {
      //alert("FF");
      e.stopPropagation(); // DOM style (return false doesn't always work in FF)
      e.preventDefault();
    } else {
      window.event.cancelBubble = true; //IE stopPropagation
    }
    restoreSelection();
    return false; // false = IE style
  }
}

function doGetCaretPosition(oField) {

  // Initialize
  var iCaretPos = 0;

  // IE Support
  if (window.getSelection) {

    // Set focus on the element
    //  oField.focus();
    //var temp = window.getSelection();
    // To get cursor position, get empty selection range
    var oSel = window.getSelection().getRangeAt(0).cloneRange();

    // Move selection start to 0 position
    oSel.setStart(oField, 0);
    //    oSel.moveStart('character', -oField.value.length);

    // The caret position is selection length
    iCaretPos = oSel.endOffset;
  }

  // Firefox support
  else if (oField.selectionStart || oField.selectionStart == '0')
    iCaretPos = oField.selectionStart;

  // Return results
  return iCaretPos;
}

function getWordPrecedingCaret(containerEl) {
  var precedingChar, sel, range, precedingRange;
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.rangeCount > 0) {
      range = sel.getRangeAt(0).cloneRange();
      range.collapse(true);
      range.setStart(containerEl, 0);
      precedingChar = range.toString().trim();
    }
  } else if ((sel = document.selection) && sel.type != "Control") {
    range = sel.createRange();
    precedingRange = range.duplicate();
    precedingRange.moveToElementText(containerEl);
    precedingRange.setEndPoint("EndToStart", range);
    precedingChar = precedingRange.text.trim();
  }
  return precedingChar;

}
// function ReturnWord(text, caretPos) {
//   var index = text.indexOf(caretPos);
//   var preText = text.substring(0, caretPos);
//   if (preText.indexOf(" ") > 0) {
//     var words = preText.split(" ");
//     return words[words.length - 1]; //return last word
//   } else {
//     return preText;
//   }
// }
//
// function GetCaretPosition(ctrl) {
//   var CaretPos = 0; // IE Support
//   if (document.selection) {
//     ctrl.focus();
//     var Sel = document.selection.createRange();
//     Sel.moveStart('character', -ctrl.value.length);
//     CaretPos = Sel.text.length;
//   }
//   // Firefox support
//   else if (ctrl.selectionStart || ctrl.selectionStart == '0')
//     CaretPos = ctrl.selectionStart;
//   return (CaretPos);
// }
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
