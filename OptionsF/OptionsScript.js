async function loadAndSave() {
  let expandList = [];
  const acyStore = await browser.storage.sync.get("shortenedAcrynoms");
  if (jQuery.isEmptyObject(acyStore)) {
    var arr = await readTextFile(browser.extension.getURL("Wordlists/expandList.txt"));
    for (var i = 0; i < arr.length; i++) {
      var temp = arr[i].split(':');
      arr[i] = {
        acry: temp[0],
        expanded: temp[1]
      };
    }
    expandList = expandList.concat(arr);
    browser.storage.sync.set({
      shortenedAcrynoms: expandList
    });
    return expandList;
  } else {
    return acyStore.shortenedAcrynoms;
  }
}

async function readTextFile(file) {
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

$("#enableTextExpansion").change(function () {
    browser.storage.sync.set({
      enableTextExpansion: this.checked
    });
    browser.runtime.sendMessage({
     "requestType": "toggled",
  });
});

$("#enableSpellcheck").change(function () {
    browser.storage.sync.set({
      enableSpellcheck: this.checked
    });
    browser.runtime.sendMessage({
     "requestType": "toggled",
  });
});

$("#saveShortcutBtn").click(function () {
  var tempShortcutSet = {};
  tempShortcutSet.shiftModifier = $("#shortcutShift")[0].checked;
  tempShortcutSet.ctrlModifier = $("#shortcutCtrl")[0].checked;
  tempShortcutSet.altModifier = $("#shortcutAlt")[0].checked;
  tempShortcutSet.key = $("#shortcut-key-input").val();

    browser.storage.sync.set({
      shortcutSet: tempShortcutSet
    });
});

async function buildList() {
  let expandList = await loadAndSave();
  let selectList = $("#wordsThings");
  for (var i = 0; i < expandList.length; i++) {
    AddEntryToList(i, expandList, selectList);
  }

  selectList.on("click", ".entry", function() {
    if ($(this).hasClass("editing")) {
      return;
    }
    $(this).addClass("editing");

    $(this).children(".acrynoms.display").hide();
    $(this).children(".acrynoms.txtBox").val($(this).children(".acrynoms.display").text());

    $(this).children(".expanded.display").hide();
    $(this).children(".expanded.txtBox").val($(this).children(".expanded.display").text());

    $(this).children(".txtBox").show();

    $(this).children("span");
  });

  selectList.on("click", ".acrySubmitBtn", function(e) {
    var entry = $(this).parent();
    if (entry.children().hasClass("error")) {
      return;
    }
    entry.children(".acrynoms.display").text(entry.children(".acrynoms.txtBox").val());
    entry.children(".expanded.display").text(entry.children(".expanded.txtBox").val());

    expandList[entry.attr("data-target")].acry = entry.children(".acrynoms.txtBox").val();
    expandList[entry.attr("data-target")].expanded = entry.children(".expanded.txtBox").val();
    browser.storage.sync.set({
      shortenedAcrynoms: expandList
    });
    entry.children(".display").show();
    entry.children(".txtBox").hide();
    entry.removeClass("editing");
    e.stopPropagation();
  });

  selectList.on("click", ".acryCancelBtn", function(e) {
    var entry = $(this).parent();
    entry.children(".display").show();
    entry.children(".txtBox").hide();
    entry.removeClass("editing");
    entry.find(".confirm").children("span").hide();
    entry.find(".confirm").removeClass("confirm").children("i").show();
    entry.find(".error").removeClass("error").attr("title", "");;
    e.stopPropagation();
  });

  selectList.on("blur", ".acrynoms.txtBox", function() {
    if (/\s/.test($(this).val())) {
      $(this).addClass("error");
      $(this).attr("title", "Can not have spaces in the acrynom");
      return;
    }
    $(this).removeClass("error");
    $(this).attr("title", "");
  });

  selectList.on("click", ".acryDeleteBtn", function(e) {
    var entry = $(this).parent();
    if ($(this).hasClass("confirm")) {
      reorderTargets(entry.attr("data-target") + 1);
      expandList.splice(entry.attr("data-target"), 1);
      entry.remove();
      browser.storage.sync.set({
        shortenedAcrynoms: expandList
      });
    } else {
      $(this).addClass("confirm");
      $(this).children("span").show();
      $(this).children("i").hide();
    }
    e.stopPropagation();
  });

  $("#addEntryBtn").click(function() {
    expandList.push({
      acry: "----",
      expanded: "----"
    });
    AddEntryToList(i, expandList, selectList);
    selectList.animate({
      scrollTop: selectList.prop('scrollHeight') - selectList.innerHeight()
    }, 500);
  });
  $("#submitAllBtn").click(function() {
    $(".editing .acrySubmitBtn").click();
  });

  $("#cancelAllBtn").click(function() {
    $(".editing .acryCancelBtn").click();
  });
}

function AddEntryToList(i, expandList, selectList) {
  let thing = $("<div>", {
    class: "entry",
    "data-target": i
  });
  thing.append($("<span>", {
    class: "acrynoms display",
    text: expandList[i].acry
  }));
  thing.append($("<input>", {
    type: "text",
    class: "acrynoms txtBox"
  }).hide());
  thing.append($("<span>", {
    class: "expanded display",
    text: expandList[i].expanded
  }));
  thing.append($("<input>", {
    class: "expanded txtBox",
    type: "text"
  }).hide());
  thing.append($("<div>", {
    class: "acrySubmitBtn txtBox button",
    text: "Submit"
  }).hide());
  thing.append($("<div>", {
    class: "acryCancelBtn txtBox button",
    text: "Cancel"
  }).hide());
  thing.append($("<div>", {
    class: "acryDeleteBtn txtBox button",
  }).hide().append($("<i>", {
    class: "fa fa-trash"
  })).append($("<span>", {
    text: "Confirm?"
  }).hide()));

  selectList.append(thing);
}

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

  $("#enableTextExpansion").prop("checked", data.enableTextExpansion);
  $("#enableSpellcheck").prop("checked", data.enableSpellcheck);
  $("#shortcutShift").prop("checked", data.shortcutSet.shiftModifier);
  $("#shortcutCtrl").prop("checked", data.shortcutSet.ctrlModifier);
  $("#shortcutAlt").prop("checked", data.shortcutSet.altModifier);
  $("#shortcut-key-input").val(data.shortcutSet.key);
}

function reorderTargets(startTarget) {
  var allList = $("#wordsThings").children();
  for (var i = startTarget; i < allList.length; i++) {
    $(allList[i]).attr("data-target", i - 1);
  }
}
setSwitches();
buildList();
