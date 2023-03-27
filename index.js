function formatNumber(number) {
  if (number < Infinity) {
    const lookUp = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S'];
    let length = number.toFixed(1).length - 2; // 1=1; 10=2; 100=3; 1000=4; [...]
    let magnitude = Math.floor((length - 1) / 3); // thousand=1; million=2; billion=3; [...]
    let baseLength = Math.floor((length - 1) % 3); // 1=1; 10=2; 100=3; //// 1k=1; 10k=2; 100k=3; /// [...]
    let intPart = String(number).slice(0, baseLength + 1); // 1.2m=1; 12.4m=12; 120m=120; //// [...]
    let floatPart =
      String(number).slice(baseLength + 1, 4) == '0' ||
      String(number).slice(baseLength + 1, baseLength + 2) == ''
        ? '' // 12k = "", 120k = ""
        : `.${String(number).slice(baseLength + 1, 4)}`; //120.4k=".4"; 8.2k=".2";
    if (number < 1000) {
      return number % 1 >= 0.1 ? number.toFixed(1) : number.toFixed(); // turns 1.008 = 1 and 1.32333 = 1.3
    } else {
      return `${intPart}${floatPart}${lookUp[magnitude]}`;
    }
  } else {
    return `∞`;
  }
}
let sliceCounter = document.querySelector('#counter-num');
let sliceSPS = document.querySelector('#counter-sps');
let bread = document.querySelector('#banana-bread-item');
let left = document.querySelector('div#click-area');
let sliceSign = document.querySelector('div#counter');
let footer = document.querySelector('div#click-footer');
let cursorWraps = document.querySelector('div#cursor-wrap');
let center = document.querySelector('div#center-piece');
let optionsBar = document.querySelector('div#opt-bar');
let statsOpt = document.querySelector('div#stats-opt');
let achieveOpt = document.querySelector('div#achieve-opt');
let settingOpt = document.querySelector('div#setting-opt');
let upgradeBar = document.querySelector('#upgrade-bar');
let buyBtn = document.querySelector('button#buy');
let sellBtn = document.querySelector('button#sell');

let defSPC = 1;
let defSPS = 0;
let storeMode = 1;
let upgradeList = [
  {
    name: 'cursor',
    defaultPrice: 15,
    spsVal: 0.1,
  },
  {
    name: 'printer',
    defaultPrice: 100,
    spsVal: 1,
  },
  {
    name: 'alchemy',
    defaultPrice: 720,
    spsVal: 6,
  },
  {
    name: 'blanket',
    defaultPrice: 1800,
    spsVal: 12,
  },
  {
    name: 'mother',
    defaultPrice: 9600,
    spsVal: 50,
  },
];
let achievementsList = [
  {
    id: 0,
    name: 'secret.',
    description: 'You little cheater...',
  },
  {
    id: 1,
    name: 'You never forget the first one.',
    description: 'Click on your first Slice',
  },
  {
    id: 2,
    name: 'Triple digit clicks!',
    description: 'Click a hundred times on the Slice',
  },
  {
    id: 3,
    name: '...are you okay?',
    description: 'Click a million times on the Slice',
  },
  {
    id: 4,
    name: 'Cursor',
    description: 'Get 100 Cursor upgrades',
  },
  {
    id: 5,
    name: 'Printer',
    description: 'Get 100 Printer upgrades',
  },
  {
    id: 6,
    name: 'Alchemy',
    description: 'Get 100 Alchemy upgrades',
  },
  {
    id: 7,
    name: 'Blanket',
    description: 'Get 100 Blanket upgrades',
  },
  {
    id: 8,
    name: 'MomNopoly',
    description: 'Get 100 Mother upgrades',
  },
  {
    id: 9,
    name: 'You know you can click, right?',
    description: 'Spend your first hour doing nothing',
  },
];
standardSave = `0|0${",0".repeat(upgradeList.length-1)}|0|0|0|0${",0".repeat(achievementsList.length-1)}`.split("|");

let saveData = localStorage.getItem("saveData")
saveData = saveData == null ? saveData = `0|0${",0".repeat(upgradeList.length-1)}|0|0|0|0${",0".repeat(achievementsList.length-1)}`.split("|") : saveData.split("|")
let sliceCount = parseInt(saveData[0]);
let ownedUpgrades = saveData[1].split(",").map(x=>parseInt(x));
let runtime = parseInt(saveData[2]);
let totalEarnings = parseInt(saveData[3]);
let totalClicks = parseInt(saveData[4]);
let ownedAchievements = saveData[5].split(",").map(x=>parseInt(x));
sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
buyBtn.style.borderColor = 'red';
let upAmount = ownedUpgrades.reduce((sum, a)=>sum+a, 0)

// Functions
function createTag(type, className, id, parent) {
  let x = document.createElement(`${type}`);
  x.setAttribute('class', `${className}`);
  x.setAttribute('id', `${id}`);
  parent.appendChild(x);
  return x;
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
  let maxCirc = Math.floor(360 / Math.floor(angleDiff) - 1); //maximum clicks around a cookie -(the -1 is a temporary fix for an overlapping cursor. redo the math.)

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
  let cursor = document.createElement('img');
  cursor.setAttribute('src', './assets/cursor.png');
  cursor.setAttribute('class', 'cursor');
  cursor.setAttribute('id', 'cursor');
  cursorWraps.appendChild(cursor);
  calcCursor();
}
function removeCursor() {
  cursorWraps.removeChild(cursorWraps.lastChild);
}
function addStructure(upgradeId, upgradeAmount) {
  //visual representation of upgrades, like the cursors that spin around the bb slice
  switch (Number(upgradeId)) {
    case 0:
      addCursor();
      if (upgradeAmount == 100) {
        unlockAchievement(4);
      }
      break;
    case 1:
      if (upgradeAmount == 100) {
        unlockAchievement(5);
      }
      break;
    case 2:
      if (upgradeAmount == 100) {
        unlockAchievement(6);
      }
      break;
    case 3:
      if (upgradeAmount == 100) {
        unlockAchievement(7);
      }
      break;
    case 4:
      if (upgradeAmount == 100) {
        unlockAchievement(8);
      }
      break;
    default:
      console.log('Structure added');
    //insert structure into "to be completed" area
  }
}
function removeStructure(upgradeId, upgradeAmount) {
  switch (Number(upgradeId)) {
    case 0:
      removeCursor();
      break;
    default:
      console.log('Structure removed.');
    //insert structure into "to be completed" area
  }
}
function buy(upgradeId, btnEl) {
  let price = Math.floor(upgradeList[upgradeId].defaultPrice * 1.15 ** ownedUpgrades[upgradeId]);
  // If can afford:
  if (sliceCount >= price) {
    ownedUpgrades[upgradeId]++;
    upAmount = ownedUpgrades.reduce((sum, a)=>sum+a, 0)
    addStructure(upgradeId, ownedUpgrades[upgradeId]); // What each upgrade does. eg: cursor pops an additional cursor around the BB, if it can fit it.
    sliceCount -= price;
    sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
    sps(); // Recalculates Slices Per Second
    btnEl.innerText = `x${ownedUpgrades[upgradeId]} ${upgradeList[upgradeId].name} 
    $${formatNumber(Math.floor(upgradeList[upgradeId].defaultPrice *1.15 ** ownedUpgrades[upgradeId]))}`;
  }
}
function sell(upgradeId, btnEl) {
  let price = Math.floor(upgradeList[upgradeId].defaultPrice * 1.15 ** ownedUpgrades[upgradeId]);
  if (ownedUpgrades[upgradeId] !== 0) {
    let lastPrice = price / 1.15;
    ownedUpgrades[upgradeId]--;
    upAmount = ownedUpgrades.reduce((sum, a)=>sum+a, 0)
    removeStructure(upgradeId, ownedUpgrades[upgradeId]);
    sliceCount += lastPrice / 2;
    sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
    sps(); // Recaulculates Slices Per Second
    btnEl.innerText = `x${ownedUpgrades[upgradeId]} ${upgradeList[upgradeId].name} 
    $${formatNumber(Math.floor(upgradeList[upgradeId].defaultPrice *1.15 ** ownedUpgrades[upgradeId]))}`;
  }
}
function save(){
  localStorage.setItem('saveData', `${sliceCount}|${ownedUpgrades}|${runtime}|${totalEarnings}|${totalClicks}|${ownedAchievements}`)
}
// Initialization: Create upgrade
for (let upLoop = 0; upLoop < upgradeList.length; upLoop++) {
  // Create the button
  let upgradeId = upLoop;
  let el = upgradeList[upLoop];
  let upButton = createTag('div', 'upgrade', `up-${upgradeId}`, upgradeBar);
  let upText = createTag('p', 'upgrade_text', `up-${upgradeId}-text`, upButton);
  // Calculate properties
  let amount = ownedUpgrades[upgradeId] != null ? ownedUpgrades[upgradeId] : 0;
  let priceMultiplier = isNaN(1.15 ** ownedUpgrades[upgradeId]) ? 1 : 1.15 ** ownedUpgrades[upgradeId];
  let price = Math.floor(upgradeList[upgradeId].defaultPrice * priceMultiplier);
  // Set Properties
  upText.innerText = `x${amount} ${el.name}
  $${formatNumber(price)}`;
  upButton.addEventListener('click', () => {
    switch (storeMode) {
      case 0:
        sell(upgradeId, upText);
        break;
      default:
        buy(upgradeId, upText);
        break;
    }
  });
}
if (ownedAchievements.length != achievementsList.length){
  for (i in achievementsList){
    if (ownedAchievements[i] == null){
      ownedAchievements[i] = 0;
    }
  }
}
if (ownedUpgrades.length != upgradeList.length){
  for (i in upgradeList){
    if (ownedUpgrades[i] == null){
      ownedUpgrades[i] = 0;
    }
  }
}
// Calculate Slices Per Second
function sps() {
  clearInterval(spsTimer);
  defSPS = 0;
  for (let spsLoop = 0; spsLoop < ownedUpgrades.length; spsLoop++) {
    let elSpecs = upgradeList[spsLoop];
    let amount = ownedUpgrades[spsLoop];
    defSPS += elSpecs.spsVal * amount;
  } // Each upgrade's contribution
  sliceSPS.innerText = `${defSPS % 1 >= 0.1 ? defSPS.toFixed(1) : defSPS.toFixed()} Slices/Second`;
  spsTimer = setInterval(() => {
    gainSlices(defSPS); //Gain slice every second
    runtime++; //Add a second to timer
    if (runtime == 3600 && totalClicks == 0) {unlockAchievement(9);}
  }, 1000);
}
// Commands || cheats
function gainSlices(num) {
  if (sliceCount + num <= Number.MAX_VALUE) {
    sliceCount += Number(num);
    sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
    totalEarnings += Number(num);
  } else {
    sliceCount = Infinity;
    sliceCounter.innerText = `∞ Slices`;
    unlockAchievement(0)
  }
}
function resetSlices() {
  sliceCount = 0;
  totalEarnings = 0;
  totalClicks = 0;
  sliceCounter.innerText = `0 Slices`;  
  save()
}
function resetBuildings() {
  ownedUpgrades = [0];
  save()
  location.reload();
}
function resetGame() {
  sliceCount = 0;
  ownedUpgrades = Array.apply(null, Array(upgradeList.length)).fill(0, 0, upgradeList.length);
  console.log(ownedUpgrades)
  runtime = 0;
  totalEarnings = 0;
  totalClicks = 0;
  ownedAchievements = Array.apply(null, Array(achievementsList.length)).fill(0, 0, achievementsList.length);
  save()
  location.reload();
}
function unlockAchievement(id) {
  ownedAchievements[id] = 1;
}
// Event listeners && intervals
for (cursorLoop = 0; cursorLoop < ownedUpgrades[0]; cursorLoop++) {
  addCursor();
}
var spsTimer = setInterval(() => {}, 1000);
sps();
// calcCursor(); Unneeded? :351 already calls at the end of addCursor()
setInterval(() => {
  save()
}, 250);
window.onresize = () => {
  calcCursor();
};
bread.addEventListener('click', () => {
  gainSlices(defSPC);
  totalClicks++
  switch (totalClicks) {
    case 1:
      unlockAchievement(1);
      break;
    case 100:
      unlockAchievement(2);
      break;
    case 1000000:
      unlockAchievement(3);
      break;
    default:
      break;
  }
});
buyBtn.addEventListener('click', () => {
  sellBtn.style.borderColor = null;
  buyBtn.style.borderColor = 'red';
  storeMode = 1;
});
sellBtn.addEventListener('click', () => {
  buyBtn.style.borderColor = null;
  sellBtn.style.borderColor = 'red';
  storeMode = 0;
});
// Dealing with menus and options
let menuWindow = () => {
  let overlay = document.createElement('div');
  overlay.setAttribute('class', 'overlay');
  overlay.setAttribute('id', 'overlay');
  center.insertBefore(overlay, optionsBar);
  center.style.overflowY = "hidden";
  let optionWindow = createTag('div', 'optionMenu', 'option-menu', overlay);
  let closeBtn = createTag('input', 'closeButton', 'close-button', optionWindow);
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('value', 'X');
  closeBtn.addEventListener('click', () => {
    overlay.remove();
    center.style.overflowY = "scroll";
  });
  return optionWindow;
};
let isPositiveNumber = (num)=>{
  if (isNaN(parseInt(num)) || parseInt(num)<0 || parseInt(num) == Infinity){
    console.log('failed.' + `${num}`)
    return false;
  } else {
    return true
  }
}
statsOpt.addEventListener('click', () => {
  // Create html tags
  let statsWindow = menuWindow();
  let statsTitle = createTag('div', 'optionTitle', 'stats-title', statsWindow);
  let statsArea = createTag('div', 'statsArea', 'stats-area', statsWindow);
  let current = createTag('p', 'statsText', 'current-slice-stat', statsArea);
  let total = createTag('p', 'statsText', 'total-slice-stat', statsArea);
  let runtimeStat = createTag('p', 'statsText', 'runtime', statsArea);
  let clickStat = createTag('p', "statsText", "click-stat", statsArea);
  let spsStat = createTag('p', 'statsText', 'sps-stat', statsArea);
  let spcStat = createTag('p', 'statsText', 'spc-stat', statsArea);
  let upAmountStat = createTag('p', 'statsText', 'owned-upgrades-stat', statsArea)

  
  // Set base text
  statsTitle.innerText = `Stats`;
  current.innerText = `You have ${sliceCount.toFixed(2)} slices of Banana Bread`;
  total.innerText = `You have earned ${totalEarnings.toFixed(2)} slices of Banana Bread in total.`;
  runtimeStat.innerText = `You have wasted ${runtime} seconds of your life here.`;
  clickStat.innerText = `You have clicked on the Banana Bread Slice ${totalClicks} times.`;
  spsStat.innerText = `You produce ${defSPS} every second.`;
  spcStat.innerText = `You produce ${defSPC} per click.`;
  upAmountStat.innerText = `You own ${upAmount} upgrades.`;
  
  // Update text constantly
  setInterval(() => {
    current.innerText = `You have ${sliceCount.toFixed(2)} slices of Banana Bread`;
    total.innerText = `You have earned ${totalEarnings.toFixed(2)} slices of Banana Bread in total.`;
    runtimeStat.innerText = `You have wasted ${runtime} seconds of your life here.`;
    clickStat.innerText = `You have clicked on the Banana Bread ${totalClicks} times.`;
    spsStat.innerText = `You produce ${defSPS} every second.`;
    spcStat.innerText = `You produce ${defSPC} per click.`;
    upAmountStat.innerText = `You own ${upAmount} upgrades.`;
  }, 500);
});
achieveOpt.addEventListener('click', () => {
  // Create html tags
  let achieved = 0;
  let achieveWindow = menuWindow();
  let achieveTitle = createTag('div', 'optionTitle', 'achieve-title', achieveWindow)
  let achieveArea = createTag('div', 'achieveArea', 'achievements-area', achieveWindow);
  for (i in achievementsList) {
    let achieveBox = createTag('div', 'achieveBox', `achieve-${achievementsList[i].id}`, achieveArea);
    if (ownedAchievements[i] == 0) {
      achieveBox.classList.add('achLocked');
    } else {
      achieveBox.classList.add('achUnlocked');
      achieveBox.classList.add('tooltip');
      let tooltip = createTag('span', 'tooltiptext', `tooltip-${achievementsList[i].id}`, achieveBox);
      tooltip.innerText = achievementsList[i].name;
      let desc = createTag('p', 'tooltipDesc', `tooltip-desc-${achievementsList[i].id}`, tooltip);
      desc.innerText = achievementsList[i].description;
      achieved++
    }
  }
  achieveTitle.innerText = `Achievements (${(100*achieved/achievementsList.length).toFixed(2)}%)`;
});
settingOpt.addEventListener('click', ()=>{
  let settingsWindow = menuWindow()
  let settingsTitle = createTag('div', 'optionTitle', 'settings-title', settingsWindow)
  let settingsSaveArea = createTag('div', 'settingsSaveArea', 'settings-save-area', settingsWindow);
  let exportSaveBTN = createTag("input", "settingsButton", "export-save-btn", settingsSaveArea)
  let importSaveBTN = createTag("input", "settingsButton", "import-save-btn", settingsSaveArea)
  let ReincarnateBTN = createTag("input", "settingsButton", "reincarnate-game-btn", settingsSaveArea)
  let resetGameBTN = createTag("input", "settingsButton dangerButton", "reset-game-btn", settingsSaveArea)
  
  settingsTitle.innerText = `Settings`;
  exportSaveBTN.setAttribute("type", "button")
  exportSaveBTN.setAttribute("value", "Export Save")
  importSaveBTN.setAttribute("type", "button")
  importSaveBTN.setAttribute("value", "Import Save")
  ReincarnateBTN.setAttribute("type", "button")
  ReincarnateBTN.setAttribute("value", "Reincarnate")
  resetGameBTN.setAttribute("type", "button")
  resetGameBTN.setAttribute("value", "Wipe Save")

  exportSaveBTN.addEventListener("click", ()=>{
    navigator.clipboard.writeText(`${sliceCount}|${ownedUpgrades}|${runtime}|${totalEarnings}|${totalClicks}|${ownedAchievements}`)
  })
  importSaveBTN.addEventListener("click", async ()=>{
    let imported = await navigator.clipboard.readText()
    let newSave = String(imported).split("|")
    if (  newSave.length == standardSave.length &&
          isPositiveNumber(saveData[0]) &&
          //test ownedupgrades //// maybe count(0)+count(1)==arr.length ?????
          isPositiveNumber(saveData[2]) &&
          isPositiveNumber(saveData[3]) &&
          isPositiveNumber(saveData[4]) /* && */
          //test ownedachievements 
    ){
      sliceCount = parseInt(newSave[0]);
      ownedUpgrades = newSave[1].split(",").map(x=>parseInt(x));
      runtime = parseInt(newSave[2]);
      totalEarnings = parseInt(newSave[3]);
      totalClicks = parseInt(newSave[4]);
      ownedAchievements = newSave[5].split(",").map(x=>parseInt(x));
      save()
      location.reload()
    } else{
      alert("Clipboard invalid. please make sure you have a proper save on your clipboard.")
    }
  })
  ReincarnateBTN.addEventListener("click", ()=>{
    alert("Function not added yet.")
    //Reset everything, keep track of reincarnations, add bonus.
  })
  resetGameBTN.addEventListener("click", ()=>{
    if(1==false){
      resetGame()
    } //replace "if" statemente to -> confirmation from user 
    alert("Function not added yet.")
  })
})
//Fix lines 507 and 511 (Test for ownedUpgrades and ownedAchievements)
//Fix line 510 (prooceding even if it returns false)
//Sound effects | Consequently, volume sliders
//Rebirth?
//Make achievements tab update if achievement is unlocked while open
//Redo localStorage save to enconde in base64
//Finish addStructure and removeStructure
//Beautify page with actual assets