var allWordlistDataMain = [];
var miniWordlist = [];
var expandList = [];
var commonlyMisspelt = [];

var enableSpellCheck;
var enableTextExpansion;

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

readTextFile(browser.extension.getURL("Wordlists/wordlist2.txt"), function(arr) {
  allWordlistDataMain = arr;
});
readTextFile(browser.extension.getURL("Wordlists/20k.txt"), function(arr) {
  miniWordlist = arr;
});

// readTextFile(browser.extension.getURL("Wordlists/expandList.txt"), function(arr) {
//   for (var i = 0; i < arr.length; i++) {
//     var temp = arr[i].split(':');
//     arr[i] = {
//       acry: temp[0],
//       expanded: temp[1]
//     };
//   }
//   expandList = expandList.concat(arr);
// });

async function loadAndSave() {
  let expandList2 = [];
  const acyStore = await browser.storage.sync.get("shortenedAcrynoms");
  if (Object.keys(acyStore).length === 0) {
    var arr = await readTextFile(browser.extension.getURL("Wordlists/expandList.txt"));
    for (var i = 0; i < arr.length; i++) {
      var temp = arr[i].split(':');
      arr[i] = {
        acry: temp[0],
        expanded: temp[1]
      };
    }
    expandList2 = expandList2.concat(arr);
    browser.storage.sync.set({
      shortenedAcrynoms: expandList
    });

    return expandList2;
  } else {
    return acyStore.shortenedAcrynoms;
  }
}

async function loadingExpand() {
  expandList = (await loadAndSave());
}
loadingExpand();

async function setSwitches() {
  var data = await browser.storage.sync.get(["enableSpellcheck", "enableTextExpansion", "shortcutSet"]);
  if (data.enableTextExpansion == null || data.enableSpellcheck == null || data.shortcutSet == null) {
    browser.storage.sync.set({
      enableTextExpansion: true,
      enableSpellcheck: true,
      shortcutSet: {shiftModifier: false, ctrlModifier: true, altModifier: true, key: "M"},
    });
    setSwitches();
    return;
  }
  enableTextExpansion = data.enableTextExpansion;
  enableSpellCheck = data.enableSpellcheck;
}
setSwitches();
async function toggleSwitches() {
  var data = await browser.storage.sync.get(["enableSpellcheck", "enableTextExpansion"]);

  enableTextExpansion = data.enableTextExpansion;
  enableSpellCheck = data.enableSpellcheck;
  console.log(data);

}

async function readTextFileAsync(file) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);

  var temp = new Promise(function(resolve, reject) {
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4) {
        if (rawFile.status === 200 || rawFile.status === 0) {
          var allText = rawFile.responseText;
          resolve(allText.split(/\r?\n/))
        }
      }
    };
  });
  rawFile.send(null);
  return temp;
}
readTextFile(browser.extension.getURL("Wordlists/commonlyMisspelt.txt"), function(arr) {
  for (var i = 0; i < arr.length; i++) {
    var temp = arr[i].split(':');
    arr[i] = {
      acry: temp[0],
      expanded: temp[1]
    };
  }
  commonlyMisspeltArr = arr;
});

function readTextFile(file, finFunc) {
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function() {
    if (rawFile.readyState === 4) {
      if (rawFile.status === 200 || rawFile.status === 0) {
        var allText = rawFile.responseText;

        finFunc(allText.split(/\r?\n/));
      }
    }
  };
  rawFile.send(null);
}
browser.runtime.onMessage.addListener(notify);
console.log("Listenner added");

String.prototype.removePunc = function() {
  return this.replace(/^[\.\;\,\?\!]|[\.\;\,\?\!]$/, "");
};

function notify(request, sender, sendResponse) {
  let requestType = request.requestType;
  if (requestType === "fullCorrection") {
     var rawData = request.textBoxData;
    if (enableTextExpansion) {
      rawData = ExpandStuff(rawData, expandList);
    }
    if (enableSpellCheck) {

      rawData = ExpandStuff(rawData, commonlyMisspeltArr);

      var data = rawData.match(/(\!\!\-)?[a-zA-Z]+/g);
      rawData = rawData.replace(/[a-zA-Z]+/g, "*<!#^!>*");

      for (var i = 0; i < data.length; i++) {
        rawData = GetCorrection(data[i], rawData);
      }
    }
    console.log(enableTextExpansion);
    sendResponse(rawData);
  } else if (requestType === "loaded") {
    loadingExpand();
  }else if (requestType === "toggled") {
    toggleSwitches();
  }
}

function ExpandStuff(rawData, listThing) {
  var data = rawData.match(/[a-zA-Z\d]+/g);
  rawData = rawData.replace(/[a-zA-Z\d]+/g, "*<!#^!>*");
  for (var i = 0; i < data.length; i++) {
    let success = false;
    let capatalizeOutput = false;
    if (data[i][0] === data[i][0].toUpperCase()) {
      capatalizeOutput = true;
    }
    for (var ii = 0; ii < listThing.length; ii++) {
      if (listThing[ii].acry == data[i].toLowerCase()) {
        if (capatalizeOutput) {
          rawData = rawData.replace("*<!#^!>*", "!!-" + capitalizeFirstLetter(listThing[ii].expanded));
        } else {
          rawData = rawData.replace("*<!#^!>*", "!!-" + listThing[ii].expanded);
        }
        success = true;
        break;
      }
    }
    if (!success) {
      rawData = rawData.replace("*<!#^!>*", data[i]);
    }
  }
  return rawData;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function GetCorrection(data, rawData) {
  if (/^!!-/.test(data)) {
    return rawData.replace("!!-*<!#^!>*", data.replace(/^!!-/, ""));
  }
  if (/^[A-Z]/.test(data)) {
    return rawData.replace("*<!#^!>*", data);
  }
  var answer = binarySearch(allWordlistDataMain, data.trim().toLowerCase(), function(a, b) {
    if (a == b) {
      return 0;
    } else if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    }
  });
  if (answer > 0) {
    return rawData.replace("*<!#^!>*", data);
  }
  let trimedData = data;
  let currentMax = 100;
  let maxIndex = "";
  for (let ii = 0; ii < miniWordlist.length; ii++) {
    currentDistance = levDist(trimedData, miniWordlist[ii]) + (ii / 7500);
    if (currentDistance < currentMax) {
      currentMax = currentDistance;
      maxIndex = ii;
    }
  }
  return rawData.replace("*<!#^!>*", miniWordlist[maxIndex]);
}

function binarySearch(ar, el, compFunc) {
  var m = 0;
  var n = ar.length - 1;
  while (m <= n) {
    var k = (n + m) >> 1;
    var cmp = compFunc(el, ar[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      //console.log(ar[k]);
      return k;
    }
  }
  return -m - 1;
}

function itemFinder(item, array, secondArray) {
  for (var i = 0; i < array.length; i++) {
    for (var ii = 0; ii < array[i].length; ii++) {
      if (array[i][ii] == item) {
        return {
          "y": i,
          "x": ii
        };
      }
    }
  }
  if (secondArray) {
    for (var i = 0; i < secondArray.length; i++) {
      for (var ii = 0; ii < secondArray[i].length; ii++) {
        if (secondArray[i][ii] == item) {
          return {
            "y": i,
            "x": ii
          };
        }
      }
    }
  }
  return NULL;
}

function levDist(s, t) {
  var d = []; //2d matrix
  // Step 1
  var n = s.length;
  var m = t.length;

  if (n === 0) return m;
  if (m === 0) return n;

  //Create an array of arrays in javascript (a descending loop is quicker)
  for (var i = n; i >= 0; i--) d[i] = [];

  // Step 2
for (var i = n; i >= 0; i--) d[i][0] = i;
  for (var j = m; j >= 0; j--) d[0][j] = j;

  // Step 3
for (var i = 1; i <= n; i++) {
  var s_i = s.charAt(i - 1);

    // Step 4
    for (var j = 1; j <= m; j++) {

      //Check the jagged ld total so far
      if (i == j && d[i][j] > 4) return n;

      var t_j = t.charAt(j - 1);
      var cost = (s_i == t_j) ? 0 : 1; // Step 5

      //Calculate the minimum
      var delCost = 2.3;
      var insCost = 2.3;

      var mi = d[i - 1][j] + delCost;
      var b = d[i][j - 1] + insCost;
      //      console.log(s_i + "  " + t_j);
      var c = d[i - 1][j - 1] + distanceFinder(s_i, t_j);

      if (b < mi) mi = b;
      if (c < mi) mi = c;

      d[i][j] = mi; // Step 6

      //Damerau transposition
      if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
      }
    }
  }

  // Step 7
  return d[n][m];
}

function distanceFinder(firstChar, secondChar) {
  var firstKey = itemFinder(firstChar, qwertyKeyboardArray, qwertyShiftedKeyboardArray);
  var secondKey = itemFinder(secondChar, qwertyKeyboardArray, qwertyShiftedKeyboardArray);

  return Math.pow(Math.pow(firstKey.x - secondKey.x, 2) + Math.pow(firstKey.y - secondKey.y, 2), 0.5);
}

toggleSwitches();