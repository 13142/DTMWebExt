console.log("fewfwe");
window.onload = function WindowLoad(event) {
    console.log("333");
}
document.addEventListener('focus',FocusChange, true);
//document.addEventListener('focusin', FocusChange);

function FocusChange(e) {
    console.log(document.activeElement.innerHTML);
}
