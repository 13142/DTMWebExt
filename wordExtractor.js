const cheerio = require('cheerio');
const fs = require('fs');

let wordString = fs.readFileSync("wordList2.html", {
  encoding: "utf8"
});

const $ = cheerio.load(wordString);

let totalArr = [];
$("li:not([class])").each(function() {
  try {
    let thingy = $(this)[0].childNodes[0].nodeValue.toString().split("-");
    console.log(thingy);
    totalArr.push({
      correct: thingy[0],
      incorrect: thingy[1]
    });
  } catch (e) {
    console.log("once");
  }
  // totalArr.push({correct: $(this).find("a").map(function () {
  //   return $(this).text();
  // }).get().join(", "), incorrect: $(this).find("td").eq(2).text()});
});
console.log(totalArr);
fs.writeFileSync("commonlyMisspelt2.txt", totalArr.map(function(x) {
  return x.incorrect + ":" + x.correct;
}).join("\n"));