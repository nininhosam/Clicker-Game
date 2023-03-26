Storage.prototype.setObj = function (key, obj) {
  return this.setItem(key, JSON.stringify(obj));
};
Storage.prototype.getObj = function (key) {
  return JSON.parse(this.getItem(key));
};
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

let mode = 1;
let saveData = localStorage.getObj('saveData');
if (saveData == null)
  saveData = {
    sliceCount: 0,
    upgrades: [0],
    totalCookiesEarned: 0,
    totalClicks: 0,
    achievements: [0],
  };
let sliceCount = saveData.sliceCount !== null ? saveData.sliceCount : 0;
let totalEarnings =
  saveData.totalCookiesEarned !== null ? saveData.totalCookiesEarned : 0;
let totalClicks = saveData.totalClicks !== null ? saveData.totalClicks : 0;
let ownedUpgrades = saveData.upgrades !== null ? saveData.upgrades : [0];
let ownedAchievements =
  saveData.achievements !== null ? saveData.achievements : [0];
sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
buyBtn.style.borderColor = 'red';

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
    unlocked: 0,
  },
  {
    id: 1,
    name: 'You never forget the first one.',
    description: 'Click on your first Slice',
    unlocked: 0,
  },
  {
    id: 2,
    name: 'Triple digit clicks!',
    description: 'Click a hundred times on the Slice',
    unlocked: 0,
  },
  {
    id: 3,
    name: '...are you okay?',
    description: 'Click a million times on the Slice',
    unlocked: 0,
  },
  {
    id: 4,
    name: 'MomNopoly',
    description: 'Get 100 Mother upgrades',
    unlocked: 0,
  },
];
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
    case 1:
      addCursor();
      break;
    case 5:
      if (upgradeAmount == 100) {
        unlockAchievement(4);
      }
      break;
    default:
      console.log('Structure added');
    //insert structure into "to be completed" area
  }
}
function removeStructure(upgradeId, upgradeAmount) {
  switch (Number(upgradeId)) {
    case 1:
      removeCursor();
      break;
    default:
      console.log('Structure removed.');
    //insert structure into "to be completed" area
  }
}
function buy(upgradeId, btnEl) {
  if (ownedUpgrades[upgradeId - 1] == null) ownedUpgrades[upgradeId - 1] = 0;
  let price = Math.floor(
    upgradeList[upgradeId - 1].defaultPrice *
      1.15 ** ownedUpgrades[upgradeId - 1]
  );
  // If can afford:
  if (sliceCount >= price) {
    ownedUpgrades[upgradeId - 1]++;
    addStructure(upgradeId, ownedUpgrades[upgradeId - 1]); // What each upgrade does. eg: cursor pops an additional cursor around the BB, if it can fit it.
    sliceCount -= price;
    sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
    sps(); // Recalculates Slices Per Second
    btnEl.innerText = `x${ownedUpgrades[upgradeId - 1]} ${
      upgradeList[upgradeId - 1].name
    } 
    $${formatNumber(
      Math.floor(
        upgradeList[upgradeId - 1].defaultPrice *
          1.15 ** ownedUpgrades[upgradeId - 1]
      )
    )}`;
  }
}
function sell(upgradeId, btnEl) {
  if (ownedUpgrades[upgradeId - 1] == null) ownedUpgrades[upgradeId - 1] = 0;
  let price = Math.floor(
    upgradeList[upgradeId - 1].defaultPrice *
      1.15 ** ownedUpgrades[upgradeId - 1]
  );
  if (ownedUpgrades[upgradeId - 1] !== 0) {
    let lastPrice = price / 1.15;
    ownedUpgrades[upgradeId - 1]--;
    removeStructure(upgradeId, ownedUpgrades[upgradeId - 1]);
    sliceCount += lastPrice / 2;
    sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
    sps(); // Recaulculates Slices Per Second
    btnEl.innerText = `x${ownedUpgrades[upgradeId - 1]} ${
      upgradeList[upgradeId - 1].name
    } 
    $${formatNumber(
      Math.floor(
        upgradeList[upgradeId - 1].defaultPrice *
          1.15 ** ownedUpgrades[upgradeId - 1]
      )
    )}`;
  }
}
// Initialization: Create upgrade | Mark achievements
for (let upLoop = 0; upLoop < upgradeList.length; upLoop++) {
  // Create the button
  let upgradeNum = upLoop + 1;
  let el = upgradeList[upLoop];
  let upButton = createTag('div', 'upgrade', `up-${upgradeNum}`, upgradeBar);
  let upText = createTag(
    'p',
    'upgrade_text',
    `up-${upgradeNum}-text`,
    upButton
  );
  // Calculate properties
  let amount =
    ownedUpgrades[upgradeNum - 1] != null ? ownedUpgrades[upgradeNum - 1] : 0;
  let priceMultiplier = isNaN(1.15 ** ownedUpgrades[upgradeNum - 1])
    ? 1
    : 1.15 ** ownedUpgrades[upgradeNum - 1];
  let price = Math.floor(
    upgradeList[upgradeNum - 1].defaultPrice * priceMultiplier
  );
  // Set Properties
  upText.innerText = `x${amount} ${el.name}
  $${formatNumber(price)}`;
  upButton.addEventListener('click', () => {
    switch (mode) {
      case 0:
        sell(upgradeNum, upText);
        break;
      default:
        buy(upgradeNum, upText);
        break;
    }
  });
}
for (
  let achieveLoop = 0;
  achieveLoop < achievementsList.length;
  achieveLoop++
) {
  if (ownedAchievements[achieveLoop] == 1) {
    achievementsList[achieveLoop].unlocked = 1;
  }
}
// Calculate Slices Per Second
function sps() {
  clearInterval(spsTimer);
  let defSPS = 0;
  for (let spsLoop = 0; spsLoop < ownedUpgrades.length; spsLoop++) {
    let elSpecs = upgradeList[spsLoop];
    let amount =
      ownedUpgrades[spsLoop] == undefined ? 0 : ownedUpgrades[spsLoop];
    defSPS += elSpecs.spsVal * amount;
  }
  sliceSPS.innerText = `${
    defSPS % 1 >= 0.1 ? defSPS.toFixed(1) : defSPS.toFixed()
  } Slices/Second`;
  spsTimer = setInterval(() => {
    gainSlices(defSPS);
  }, 1000);
}
// Commands || cheats
function gainSlices(num) {
  if (sliceCount + num <= 9007199254740990) {
    sliceCount += Number(num);
    sliceCounter.innerText = `${formatNumber(sliceCount)} Slices`;
    totalEarnings += Number(num);
  } else {
    sliceCount = Infinity;
    sliceCounter.innerText = `∞ Slices`;
  }
}
function resetSlices() {
  sliceCount = 0;
  totalEarnings = 0;
  totalClicks = 0;
  sliceCounter.innerText = `0 Slices`;
}
function resetBuildings() {
  ownedUpgrades = [0];
  localStorage.setObj('saveData', {
    sliceCount: sliceCount,
    upgrades: ownedUpgrades,
    totalCookiesEarned: totalEarnings,
    totalClicks: totalClicks,
    achievements: ownedAchievements,
  });
  location.reload();
}
function resetGame() {
  localStorage.setObj('saveData', {
    sliceCount: 0,
    upgrades: [0],
    totalCookiesEarned: 0,
    totalClicks: 0,
    achievements: [0],
  });
  location.reload();
}
function unlockAchievement(id) {
  achievementsList[id].unlocked = 1;
  ownedAchievements[id] = 1;
}
// Event listeners && intervals
for (cursorLoop = 0; cursorLoop < ownedUpgrades[0]; cursorLoop++) {
  addCursor();
}
var spsTimer = setInterval(() => {}, 1000);
sps();
calcCursor();
setInterval(() => {
  let slices = sliceCount == Infinity ? 'Infinity' : sliceCount;
  localStorage.setObj('saveData', {
    sliceCount: slices,
    upgrades: ownedUpgrades,
    totalCookiesEarned: totalEarnings,
    totalClicks: totalClicks,
    achievements: ownedAchievements,
  });
  if (slices == 'Infinity') {
    unlockAchievement(0);
  }
}, 250);

window.onresize = () => {
  calcCursor();
};
bread.addEventListener('click', () => {
  gainSlices(1);
  totalClicks = totalClicks !== null ? totalClicks + 1 : 0;
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
  mode = 1;
});
sellBtn.addEventListener('click', () => {
  buyBtn.style.borderColor = null;
  sellBtn.style.borderColor = 'red';
  mode = 0;
});
// Dealing with menus and options
let menuWindow = () => {
  let overlay = document.createElement('div');
  overlay.setAttribute('class', 'overlay');
  overlay.setAttribute('id', 'overlay');
  center.insertBefore(overlay, optionsBar);
  let optionWindow = createTag('div', 'optionMenu', 'option-menu', overlay);
  let closeBtn = createTag(
    'input',
    'closeButton',
    'close-button',
    optionWindow
  );
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('value', 'X');
  closeBtn.addEventListener('click', () => {
    overlay.remove();
  });
  return optionWindow;
};
statsOpt.addEventListener('click', () => {
  let statsWindow = menuWindow();
  let current = createTag('p', 'statsText', 'current-slice-stat', statsWindow);
  let total = createTag('p', 'statsText', 'total-slice-stat', statsWindow);
  current.innerText = `You have ${sliceCount.toFixed(2)} Slices`;
  total.innerText = `You have earned ${totalEarnings.toFixed(
    2
  )} Slices in total.`;

  setInterval(() => {
    current.innerText = `You have ${sliceCount.toFixed(2)} Slices`;
    total.innerText = `You have earned ${totalEarnings.toFixed(
      2
    )} Slices in total.`;
  }, 500);
});
achieveOpt.addEventListener('click', () => {
  let achieveWindow = menuWindow();
  let achieveArea = createTag(
    'div',
    'achieveArea',
    'achievements-area',
    achieveWindow
  );
  for (i in achievementsList) {
    let achieveBox = createTag(
      'div',
      'achieveBox',
      `achieve-${achievementsList[i].id}`,
      achieveArea
    );
    if (achievementsList[i].unlocked == 0) {
      achieveBox.classList.add('achLocked');
    } else {
      achieveBox.classList.add('achUnlocked');
      achieveBox.classList.add('tooltip');
      let tooltip = createTag(
        'span',
        'tooltiptext',
        `tooltip-${achievementsList[i].id}`,
        achieveBox
      );
      tooltip.innerText = achievementsList[i].name;
      let desc = createTag(
        'p',
        'tooltipDesc',
        `tooltip-desc-${achievementsList[i].id}`,
        tooltip
      );
      desc.innerText = achievementsList[i].description;
    }
  }
});
//Add other stats for the stats tab
