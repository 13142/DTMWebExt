window.onload = function WindowLoad(event) {}
document.addEventListener('focus', FocusChange, true);
//document.addEventListener('focusin', FocusChange);
var allWordlistData = [];
var qwertyKeyboardArray = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    ['', '', ' ', ' ', ' ', ' ', ' ', '', '']
];

var qwertyShiftedKeyboardArray = [
    ['~', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '+'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}', '|'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?'],
    ['', '', ' ', ' ', ' ', ' ', ' ', '', '']
];

function readTextFile(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                allWordlistData = allText.split(/\r?\n/);
            }
        }
    };
    rawFile.send(null);
}
readTextFile(browser.extension.getURL("Wordlists/words.txt"));

function FocusChange(e) {
    if (allWordlistData.length == 0) {
        return;
    }
    var innerString = document.activeElement.innerText;
    var splitString = innerString.split(' ');
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

        console.log(distanceFinder("R","A"));
}

function distanceFinder(firstChar, secondChar) {
    var firstKey = itemFinder(firstChar, qwertyKeyboardArray, qwertyShiftedKeyboardArray);
    var secondKey = itemFinder(secondChar, qwertyKeyboardArray, qwertyShiftedKeyboardArray);

    return Math.pow(Math.pow(firstKey.x - secondKey.x, 2) + Math.pow(firstKey.y - secondKey.y, 2), 0.5);
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
            //        console.log(ar[k]);
            return k;
        }
    }
    return -m - 1;
}

// var keyboardLayoutLookup = {
//     "QWERTY": {
//         qwertyKeyboardArray,
//         qwertyShiftedKeyboardArray
//     }
// };

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
var levDist = function(s, t) {
    var d = []; //2d matrix
    // Step 1
    var n = s.length;
    var m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

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
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

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
