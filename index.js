Storage.prototype.setObj = function(key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
  return JSON.parse(this.getItem(key))
}
function formatNumber(number) {
  return number%1 >= 0.1? number.toFixed(1): number.toFixed()
}
let sliceCounter = document.querySelector('#counter-num');
let sliceSPS = document.querySelector('#counter-sps');
let bread = document.querySelector('#banana-bread-item');
let left = document.querySelector('div#click-area');
let sliceSign = document.querySelector('div#counter');
let footer = document.querySelector('div#click-footer');
let cursorWraps = document.querySelector('div#cursor-wrap');
let upgradeBar = document.querySelector('#upgrade-bar');

let saveData = localStorage.getObj('saveData');
if (saveData == null) saveData = {sliceCount: 0, upgrades: [0]} 
let sliceCount = saveData.sliceCount !== null ? saveData.sliceCount : 0
let ownedUpgrades = saveData.upgrades
sliceCounter.innerText = `${sliceCount.toFixed()} Slices`;

let upgradeList = [
  {
    name: "cursor",
    defaultPrice: 15,
    spsVal: 0.1
  },
  {
    name: "printer",
    defaultPrice: 100,
    spsVal: 1
  },
  {
    name: "alchemy",
    defaultPrice: 720,
    spsVal: 6
  },
  {
    name: "blanket",
    defaultPrice: 1800,
    spsVal: 12
  },
  {
    name: "mother",
    defaultPrice: 9600,
    spsVal: 50
  }
]
//functions
function createTag(type, className, id, parent) {
  let x = document.createElement(`${type}`)
  x.setAttribute("class", `${className}`)
  x.setAttribute("id", `${id}`)
  parent.appendChild(x)
  return x
}
function calcCursor() {
  // Find the exact center of the banana bread to position cursorWraps at
  let breadRect = bread.getBoundingClientRect();
  let cursorRect = cursorWraps.getBoundingClientRect();
  let breadRadius = breadRect.width / 2;
  let breadXAxis = breadRect.x + breadRect.width / 2;
  let breadYAxis = breadRect.y + breadRect.height / 2;
  cursorWraps.style.left = `${breadXAxis - cursorRect.width / 2}px`;
  cursorWraps.style.top = `${breadYAxis - cursorRect.height / 2}px`;

  // Positioning the cursors
  let cursors = document.getElementsByClassName('cursor');
  let angleDiff = 360 / ((breadRadius * 2 * Math.PI) / 25); //angle between each cookie
  let maxCirc = Math.floor(360 / Math.floor(angleDiff)); //maximum clicks around a cookie

  for (i = 0; i < cursors.length; i++) {
    if (i <= maxCirc) {
      // If there's space for a cursor around the banana bread, calculate it's position
      let currentDiff = i * Math.floor(angleDiff);
      let angleSin = Math.sin((currentDiff * Math.PI) / 180);
      let angleCos = Math.cos((currentDiff * Math.PI) / 180);

      let transX = (15 + breadRadius) * angleCos; // dislocate the cursor by the radius+it's own width from the center 
      let transY = (15 + breadRadius) * angleSin; // but at an angle, determined by currentDiff (angleDiff * cursor number)
      let rotDeg = currentDiff;

      cursors[i].style.removeProperty('display');
      cursors[i].style.translate = `${transX}px  ${transY}px`;
      cursors[i].style.rotate = `${rotDeg}deg`;
    } else {
      // Excess cursors get hidden
      cursors[i].style.translate = `0 0`;
      cursors[i].style.rotate = `0deg`;
      cursors[i].style.display = 'none';
    }
  }
}
function addCursor() {
  let wrapper = document.querySelector('#cursor-wrap');
  let cursor = document.createElement('img');
  cursor.setAttribute('src', './assets/cursor.png');
  cursor.setAttribute('class', 'cursor');
  cursor.setAttribute('id', 'cursor');
  wrapper.appendChild(cursor);
  calcCursor();
}
function addStructure(upgradeId) {
  //visual representation of upgrades, like the cursors that spin around the bb slice
  switch (Number(upgradeId)) {
    case 1:
      addCursor()
    default:
      console.log("Structure added")
      //insert structure into "to be completed" area
  }
}
function buy(upgradeId, btnEl) {
  if(ownedUpgrades[upgradeId-1] == null) ownedUpgrades[upgradeId-1] = 0;
  let price = Math.floor(upgradeList[upgradeId-1].defaultPrice * (1.15**ownedUpgrades[upgradeId-1]));
  // If can afford:
  if(sliceCount >= price){
    addStructure(upgradeId); // What each upgrade does. eg: cursor pops an additional cursor around the BB, if it can fit it.
    ownedUpgrades[upgradeId-1]++;
    sliceCount -= price;
    sliceCounter.innerText = `${ sliceCount.toFixed()} Slices`;
    sps() // Recalculates Slices Per Second
    btnEl.innerText = `x${ownedUpgrades[upgradeId-1]} ${upgradeList[upgradeId-1].name} $${Math.floor(upgradeList[upgradeId-1].defaultPrice * (1.15**ownedUpgrades[upgradeId-1]))}`
  }
}
// Initialization: Create upgrade list
for (let upLoop = 0; upLoop < upgradeList.length; upLoop++) {
  // Create the button
  let upgradeNum = upLoop+1
  let el = upgradeList[upLoop]
  let upButton = createTag("div", "upgrade", `up-${upgradeNum}`, upgradeBar);
  // Calculate properties
  let amount = ownedUpgrades[upgradeNum-1] != null ? ownedUpgrades[upgradeNum-1] : 0;
  let priceMultiplier = isNaN(1.15**ownedUpgrades[upgradeNum-1]) ? 1 : (1.15**ownedUpgrades[upgradeNum-1]);
  let price = Math.floor(upgradeList[upgradeNum-1].defaultPrice * priceMultiplier);
  // Set Properties
  upButton.innerHTML = `x${amount} ${el.name} $${price}`;
  upButton.addEventListener("click",()=>{
    buy(upgradeNum, upButton);
  })
}
// Calculate Slices Per Second
function sps(){
  clearInterval(spsTimer)
  let defSPS = 0;
  for (let spsLoop = 0; spsLoop<ownedUpgrades.length; spsLoop++) {
    let elSpecs = upgradeList[spsLoop]
    let amount = ownedUpgrades[spsLoop] == undefined ? 0 : ownedUpgrades[spsLoop]
    defSPS += elSpecs.spsVal*amount
  }
  sliceSPS.innerText= `${formatNumber(defSPS)} Slices/Second`
  spsTimer = setInterval(()=>{gainSlices(defSPS)}, 1000)
}
// commands || cheats
function gainSlices(num){
  sliceCount+=Number(num)
  sliceCounter.innerText = `${ sliceCount.toFixed()} Slices`;
}
function resetSlices() {
  sliceCount = 0;
  sliceCounter.innerText = `0 Slices`;
}
function resetBuildings(){
  ownedUpgrades = [0]
  localStorage.setObj('saveData', {
    sliceCount: sliceCount,
    upgrades: ownedUpgrades
  });
  location.reload()
}
//event listeners && intervals
for (cursorLoop = 0; cursorLoop < ownedUpgrades[0]; cursorLoop++) {
  addCursor()
}
var spsTimer = setInterval(() => {}, 1000);
sps()
calcCursor();
setInterval(() => {
  localStorage.setObj('saveData', {
    sliceCount: sliceCount,
    upgrades: ownedUpgrades
  });
}, 500);

window.onresize = () => {
  calcCursor();
};
bread.addEventListener('click', () => {
  sliceCount++;
  sliceCounter.innerText = `${ sliceCount.toFixed()} Slices`;
});

