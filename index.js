let sliceCounter = document.querySelector('#counter-num');
let bread = document.querySelector('#banana-bread-item');
let left = document.querySelector('div#click-area');
let sliceSign = document.querySelector('div#counter');
let footer = document.querySelector('div#click-footer');
let sliceCount = localStorage.getItem('SliceCount');
let cursorWraps = document.querySelector('div#cursor-wrap');
let upgradeButtons = document.getElementsByClassName('upgrade');

if (sliceCount == 'null') sliceCount = 0;
sliceCounter.innerText = `${sliceCount} Slices`;

//functions
function calcCursor() {
  let breadRect = bread.getBoundingClientRect();
  let cursorRect = cursorWraps.getBoundingClientRect();
  let breadRadius = breadRect.width / 2;
  let breadXAxis = breadRect.x + breadRect.width / 2;
  let breadYAxis = breadRect.y + breadRect.height / 2;
  cursorWraps.style.left = `${breadXAxis - cursorRect.width / 2}px`;
  cursorWraps.style.top = `${breadYAxis - cursorRect.height / 2}px`;

  let cursors = document.getElementsByClassName('cursor');
  let angleDiff = 360 / ((breadRadius * 2 * Math.PI) / 25); //angle between each cookie
  let maxCirc = Math.floor(360 / Math.floor(angleDiff)); //maximum clicks around a cookie


  for (i = 0; i < cursors.length; i++) {
    if (i <= maxCirc) {
      let currentDiff = i * Math.floor(angleDiff);
      let angleSin = Math.sin((currentDiff * Math.PI) / 180);
      let angleCos = Math.cos((currentDiff * Math.PI) / 180);

      let transX = (15 + breadRadius) * angleCos; // dislocate the cursor by the radius+it's own width from
      let transY = (15 + breadRadius) * angleSin; // the center but at an angle, determined by currentDiff (angleDiff * cursor number)
      let rotDeg = currentDiff;

      cursors[i].style.removeProperty('display');
      cursors[i].style.translate = `${transX}px  ${transY}px`;
      cursors[i].style.rotate = `${rotDeg}deg`;
    } else {
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
function buy(upgradeId) {
  console.log(upgradeId)
}

//event listeners && intervals
calcCursor();
for (upI = 0; upI < upgradeButtons.length; upI++) {
  let uId = upgradeButtons[upI].id.split('-')[1];
  
  switch (Number(uId)) {
    case 1:
      upgradeButtons[upI].addEventListener("click", ()=>{
        addCursor()
      })
      break;
    default:
      upgradeButtons[upI].addEventListener("click", ()=>{
        buy(uId)
      })
  }
}
setInterval(() => {
  localStorage.setItem('SliceCount', sliceCount);
}, 500);

window.onresize = () => {
  calcCursor();
};
bread.addEventListener('click', () => {
  sliceCount++;
  sliceCounter.innerText = `${sliceCount} Slices`;
});

