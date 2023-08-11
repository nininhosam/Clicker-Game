function formatNumber(number) {
  if (number < Infinity) {
    const lookUp = ['', 'k', 'm', 'b', 't', 'q', 'Q', 's', 'S', 'o', 'n', 'd', 'u', 'D', 'T', 'q*', 'Q*'];
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
const achieveUnlockEvent = new Event("achievementUnlocked");
let sounds = {
  snack: new Audio('./assets/snack.mp3'),
  buy: new Audio('./assets/improvement-buy.mp3')
}
sounds.buy.volume = 0.2;
sounds.snack.playbackRate = 8;
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
let structureBar = document.querySelector('#structure-bar');
let buyBtn = document.querySelector('button#buy');
let sellBtn = document.querySelector('button#sell');

let defSPC = 1;
let defSPS = 0;
let storeMode = 1;
let structureList = [
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
    description: 'Get 100 Cursor structures',
  },
  {
    id: 5,
    name: 'Printer',
    description: 'Get 100 Printer structures',
  },
  {
    id: 6,
    name: 'Alchemy',
    description: 'Get 100 Alchemy structures',
  },
  {
    id: 7,
    name: 'Blanket',
    description: 'Get 100 Blanket structures',
  },
  {
    id: 8,
    name: 'MomNopoly',
    description: 'Get 100 Mother structures',
  },
  {
    id: 9,
    name: 'You know you can click, right?',
    description: 'Spend your first hour doing nothing',
  },
];
standardSave = `0|0${",0".repeat(structureList.length-1)}|0|0|0|0${",0".repeat(achievementsList.length-1)}`.split("|");

let saveData = localStorage.getItem("saveData")
saveData = saveData == null ? saveData = `0|0${",0".repeat(structureList.length-1)}|0|0|0|0${",0".repeat(achievementsList.length-1)}`.split("|") : saveData.split("|")
let sliceCount = parseInt(saveData[0]);
let ownedStructures = saveData[1].split(",").map(x=>parseInt(x));
let runtime = parseInt(saveData[2]);
let totalEarnings = parseInt(saveData[3]);
let totalClicks = parseInt(saveData[4]);
let ownedAchievements = saveData[5].split(",").map(x=>parseInt(x));
sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
buyBtn.style.borderColor = 'red';
let upAmount = ownedStructures.reduce((sum, a)=>sum+a, 0)

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
  let breadRadius = breadRect.width / 2; //center to border
  let breadXAxis = breadRect.x + breadRect.width / 2; 
  let breadYAxis = breadRect.y + breadRect.height / 2; 
  cursorWraps.style.left = `${breadXAxis - cursorRect.width / 2}px`; //Unnecessary?
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
function addStructure(structureId, structureAmount) {
  //visual representation of structures, like the cursors that spin around the bb slice
  switch (Number(structureId)) {
    case 0:
      addCursor();
      if (structureAmount == 100) {
        unlockAchievement(4);
      }
      break;
    case 1:
      if (structureAmount == 100) {
        unlockAchievement(5);
      }
      break;
    case 2:
      if (structureAmount == 100) {
        unlockAchievement(6);
      }
      break;
    case 3:
      if (structureAmount == 100) {
        unlockAchievement(7);
      }
      break;
    case 4:
      if (structureAmount == 100) {
        unlockAchievement(8);
      }
      break;
    default:
      console.log('Structure added');
    //insert structure into "to be completed" area
  }
}
function removeStructure(structureId, structureAmount) {
  switch (Number(structureId)) {
    case 0:
      removeCursor();
      break;
    default:
      console.log('Structure removed.');
    //insert structure into "to be completed" area
  }
}
function buy(structureId, btnEl) {
  let price = Math.floor(structureList[structureId].defaultPrice * 1.15 ** ownedStructures[structureId]);
  // If can afford:
  if (sliceCount >= price) {
    ownedStructures[structureId]++;
    upAmount = ownedStructures.reduce((sum, a)=>sum+a, 0)
    addStructure(structureId, ownedStructures[structureId]); // What each structure does. eg: cursor pops an additional cursor around the BB, if it can fit it.
    sliceCount -= price;
    sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
    sounds.buy.play()
    sps(); // Recalculates Slices Per Second
    btnEl.innerText = `x${ownedStructures[structureId]} ${structureList[structureId].name} 
    $${formatNumber(Math.floor(structureList[structureId].defaultPrice *1.15 ** ownedStructures[structureId]))}`;
  }
}
function sell(structureId, btnEl) {
  let price = Math.floor(structureList[structureId].defaultPrice * 1.15 ** ownedStructures[structureId]);
  if (ownedStructures[structureId] !== 0) {
    let lastPrice = price / 1.15;
    ownedStructures[structureId]--;
    upAmount = ownedStructures.reduce((sum, a)=>sum+a, 0)
    removeStructure(structureId, ownedStructures[structureId]);
    sliceCount += lastPrice / 2;
    sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
    sps(); // Recaulculates Slices Per Second
    btnEl.innerText = `x${ownedStructures[structureId]} ${structureList[structureId].name} 
    $${formatNumber(Math.floor(structureList[structureId].defaultPrice *1.15 ** ownedStructures[structureId]))}`;
  }
}
function save(){
  localStorage.setItem('saveData', `${sliceCount}|${ownedStructures}|${runtime}|${totalEarnings}|${totalClicks}|${ownedAchievements}`)
}


// Initialization: Create structure
for (let upLoop = 0; upLoop < structureList.length; upLoop++) {
  // Create the button
  let structureId = upLoop;
  let el = structureList[upLoop];
  let upButton = createTag('div', 'structure', `up-${structureId}`, structureBar);
  let upText = createTag('p', 'structure_text', `up-${structureId}-text`, upButton);
  // Calculate properties
  let amount = ownedStructures[structureId] != null ? ownedStructures[structureId] : 0;
  let priceMultiplier = isNaN(1.15 ** ownedStructures[structureId]) ? 1 : 1.15 ** ownedStructures[structureId];
  let price = Math.floor(structureList[structureId].defaultPrice * priceMultiplier);
  // Set Properties
  upText.innerText = `x${amount} ${el.name}
  $${formatNumber(price)}`;
  upButton.addEventListener('click', () => {
    switch (storeMode) {
      case 0:
        sell(structureId, upText);
        break;
      default:
        buy(structureId, upText);
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
if (ownedStructures.length != structureList.length){
  for (i in structureList){
    if (ownedStructures[i] == null){
      ownedStructures[i] = 0;
    }
  }
}
function sps() {
  clearInterval(spsTimer);
  defSPS = 0;
  for (let spsLoop = 0; spsLoop < ownedStructures.length; spsLoop++) {
    let elSpecs = structureList[spsLoop];
    let amount = ownedStructures[spsLoop];
    defSPS += elSpecs.spsVal * amount;
  } // Each structure's contribution
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
  ownedStructures = [0];
  save()
  location.reload();
}
function resetGame() {
  sliceCount = 0;
  ownedStructures = Array.apply(null, Array(structureList.length)).fill(0, 0, structureList.length);
  console.log(ownedStructures)
  runtime = 0;
  totalEarnings = 0;
  totalClicks = 0;
  ownedAchievements = Array.apply(null, Array(achievementsList.length)).fill(0, 0, achievementsList.length);
  save()
  location.reload();
}
function unlockAchievement(id) {
  document.dispatchEvent(achieveUnlockEvent)
  ownedAchievements[id] = 1;
}


// Event listeners && intervals
for (cursorLoop = 0; cursorLoop < ownedStructures[0]; cursorLoop++) {
  addCursor();
}
var spsTimer = setInterval(() => {}, 1000);
sps();
setInterval(() => {
  save()
}, 250);
window.onresize = () => {
  calcCursor();
};
bread.addEventListener('click', () => {
  sounds.snack.play()
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
  return [optionWindow, closeBtn];
};
let validateSave = (strNum)=>{
  //If it's NaN or Lower than zero or Infinity: it's false
  if (isNaN(parseInt(strNum)) || parseInt(strNum)<0 || strNum == "Infinity"){
    console.log(strNum)
    return false;
  } 
  else {
    if (typeof(strNum) == 'object' && !strNum.every(validateSave)){
      console.log(strNum)
      return false
    } 
    else {
      return true
    }

  }

}
statsOpt.addEventListener('click', () => {
  // Create html tags
  let statsWindow = menuWindow()[0];
  let statsTitle = createTag('div', 'optionTitle', 'stats-title', statsWindow);
  let statsArea = createTag('div', 'statsArea', 'stats-area', statsWindow);
  let current = createTag('p', 'statsText', 'current-slice-stat', statsArea);
  let total = createTag('p', 'statsText', 'total-slice-stat', statsArea);
  let runtimeStat = createTag('p', 'statsText', 'runtime', statsArea);
  let clickStat = createTag('p', "statsText", "click-stat", statsArea);
  let spsStat = createTag('p', 'statsText', 'sps-stat', statsArea);
  let spcStat = createTag('p', 'statsText', 'spc-stat', statsArea);
  let upAmountStat = createTag('p', 'statsText', 'owned-structures-stat', statsArea)

  
  // Set base text
  statsTitle.innerText = `Stats`;
  current.innerText = `You have ${sliceCount.toFixed(2)} slices of Banana Bread`;
  total.innerText = `You have earned ${totalEarnings.toFixed(2)} slices of Banana Bread in total.`;
  runtimeStat.innerText = `You have wasted ${runtime} seconds of your life here.`;
  clickStat.innerText = `You have clicked on the Banana Bread Slice ${totalClicks} times.`;
  spsStat.innerText = `You produce ${defSPS} every second.`;
  spcStat.innerText = `You produce ${defSPC} per click.`;
  upAmountStat.innerText = `You own ${upAmount} structures.`;
  
  // Update text constantly
  setInterval(() => {
    current.innerText = `You have ${sliceCount.toFixed(2)} slices of Banana Bread`;
    total.innerText = `You have earned ${totalEarnings.toFixed(2)} slices of Banana Bread in total.`;
    runtimeStat.innerText = `You have wasted ${runtime} seconds of your life here.`;
    clickStat.innerText = `You have clicked on the Banana Bread ${totalClicks} times.`;
    spsStat.innerText = `You produce ${defSPS} every second.`;
    spcStat.innerText = `You produce ${defSPC} per click.`;
    upAmountStat.innerText = `You own ${upAmount} structures.`;
  }, 500);
});
achieveOpt.addEventListener('click', () => {
  // Create html tags
  let createdWindow = menuWindow()
  let achieveWindow = createdWindow[0];
  let achieveTitle = createTag('div', 'optionTitle', 'achieve-title', achieveWindow)
  let achieveArea = createTag('div', 'achieveArea', 'achievements-area', achieveWindow);
  let achieveCloseButton = createdWindow[1];
  let createAchievements = () => {
    //Reset any content, start counting achievements, create achievement icons, set title percentage.
    achieveArea.innerText = ""
    let achieved = 0;
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
  }
  createAchievements()


  let updateAchievement = () => {
    setTimeout(() => {
      createAchievements()
    }, 1000);
  }
  document.addEventListener("achievementUnlocked", updateAchievement)
  achieveCloseButton.addEventListener("click", ()=>{
  document.removeEventListener("achievementUnlocked", updateAchievement)
  })
});
settingOpt.addEventListener('click', ()=>{
  let settingsWindow = menuWindow()[0]
  let settingsTitle = createTag('div', 'optionTitle', 'settings-title', settingsWindow)
  let settingsSaveArea = createTag('div', 'settingsSaveArea', 'settings-save-area', settingsWindow);
  let exportSaveBTN = createTag("input", "settingsButton", "export-save-btn", settingsSaveArea)
  let importSaveBTN = createTag("input", "settingsButton", "import-save-btn", settingsSaveArea)
  let reincarnateBTN = createTag("input", "settingsButton", "reincarnate-game-btn", settingsSaveArea)
  let resetGameBTN = createTag("input", "settingsButton dangerButton", "reset-game-btn", settingsSaveArea)
  
  settingsTitle.innerText = `Settings`;
  exportSaveBTN.setAttribute("type", "button")
  exportSaveBTN.setAttribute("value", "Export Save")
  importSaveBTN.setAttribute("type", "button")
  importSaveBTN.setAttribute("value", "Import Save")
  reincarnateBTN.setAttribute("type", "button")
  reincarnateBTN.setAttribute("value", "Reincarnate")
  resetGameBTN.setAttribute("type", "button")
  resetGameBTN.setAttribute("value", "Wipe Save")

  exportSaveBTN.addEventListener("click", ()=>{
    navigator.clipboard.writeText(`${sliceCount}|${ownedStructures}|${runtime}|${totalEarnings}|${totalClicks}|${ownedAchievements}`)
  })
  importSaveBTN.addEventListener("click", async ()=>{
    let imported = await navigator.clipboard.readText();
    let newSave = String(imported).split("|");
    newSave[1] = newSave[1].split(",").map(x=>parseInt(x));
    newSave[5] = newSave[5].split(",").map(x=>parseInt(x));
    console.log(newSave)
    if (  newSave.length == standardSave.length &&
          validateSave(newSave[0]) &&
          validateSave(newSave[1]) &&
          validateSave(newSave[2]) &&
          validateSave(newSave[3]) &&
          validateSave(newSave[4]) &&
          validateSave(newSave[5]) //If it's the correct length, and all numbers are valid:
    ){
      sliceCount = parseInt(newSave[0]);
      ownedStructures = newSave[1];
      runtime = parseInt(newSave[2]);
      totalEarnings = parseInt(newSave[3]);
      totalClicks = parseInt(newSave[4]);
      ownedAchievements = newSave[5];
      save()
      location.reload()
    } 
    
    else{
      alert("Clipboard invalid. please make sure you have a proper save on your clipboard.")
    }
  })
  reincarnateBTN.addEventListener("click", ()=>{
    alert("Function not added yet.")
    //Reset everything, keep track of reincarnations, add bonus.
  })
  resetGameBTN.addEventListener("click", ()=>{
    if(confirm("All your progress will be lost. are you sure?")){
      resetGame()
    }
  })
})

//Fix line 433: Validation should let Infinity pass through for sliceCount
//Fix line 433: parseInt("Infinity") == NaN, check for the string "Infinity" instead
//Review "achieveUnlockEvent" event
//Add upgrades for structures
//Volume sliders
//Rebirth?
//Redo localStorage save to enconde in base64
//Finish addStructure and removeStructure
//Beautify page with actual assets