
var openOptionsBtn = document.getElementById("openOptionsBtn");
var enableTextExpansionBtn = document.getElementById("enableTextExpansion")
var enableSpellcheckBtn = document.getElementById("enableSpellcheck");

enableSpellcheckBtn.addEventListener('click', enableSpellcheckFunc);
openOptionsBtn.addEventListener('click', OpenOptionsMenu);
enableTextExpansionBtn.addEventListener('click', enableTextExpansionFunc);

function OpenOptionsMenu()
{
	browser.runtime.openOptionsPage();
}

function enableTextExpansionFunc () {
    browser.storage.sync.set({
      enableTextExpansion: this.checked
    });
    browser.runtime.sendMessage({
     "requestType": "toggled",
  });
};

function enableSpellcheckFunc () {
    browser.storage.sync.set({
      enableSpellcheck: this.checked
    });
    browser.runtime.sendMessage({
     "requestType": "toggled",
  });
};

async function setSwitches() {
  var data = await browser.storage.sync.get(["enableSpellcheck", "enableTextExpansion"]);
  if (data.enableTextExpansion == null || data.enableSpellcheck == null || data.shortcutSet == null) {
    browser.storage.sync.set({
      enableTextExpansion: true,
      enableSpellcheck: true,
      shortcutSet: {shiftModifier: false, ctrlModifier: true, altModifier: true, key: "M"},
    });
    setSwitches();
    return;
  }
  // enableTextExpansion = data.enableTextExpansion;
  //enableSpellCheck = data.enableSpellcheck;
  enableTextExpansionBtn.checked = data.enableTextExpansion;
  enableSpellcheckBtn.checked = data.enableSpellcheck;
}

setSwitches();