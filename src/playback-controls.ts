import { render, loadObj, stats } from './audio-visualizer.ts'
import { OBJECT_COUNT } from './obj-config.ts';

let isPlaying = true;
let isClearing = false;
// let prevScene: Array<any> = [];
let key: string;
let hideTimeout: number;
let currentObj = 0;

function toggleStats(e: Event) {
   handleFocusOnClick(key, e);
   stats.dom.classList.add('transition');
   stats.dom.style.opacity = stats.dom.style.opacity === '0.9' ? '0' : '0.9';
}

function handleFocusOnClick(key: string, e: Event) {
   //console.log(e)
   if (key !== 'Enter' && key !== 'Space') {
      (e.currentTarget as HTMLElement).blur();
   }
}

function play(e: Event) {
   handleFocusOnClick(key, e)
   if (isPlaying) return;
   // if (prevScene && !scene.children.length) {
   //    prevScene.forEach((child: any) => scene.add(child));
   // }
   isPlaying = true;
   //console.log("Playback state:", isPlaying);
   requestAnimationFrame(render)
}

function pause(e: Event) {
   handleFocusOnClick(key, e)
   if (!isPlaying || isClearing) return;
   isPlaying = false;
   //console.log("Playback state:", isPlaying);
}

// function stop() {
//    prevScene = [...scene.children];
//    scene.clear();
//    isClearing = true;
//    setTimeout(() => {
//       isClearing = false;
//       isPlaying = false;
//    }, 1000) // fade out ~1000ms
//    console.log("Playback state:", isPlaying);
// }

function changeObj(e: Event) {
   handleFocusOnClick(key, e)
   isPlaying = false;
   currentObj = currentObj < OBJECT_COUNT - 1 ? currentObj + 1 : 0;
   //console.log('object changed to', currentObj)
   loadObj(currentObj);
   isPlaying = true;
}

function showControls() {
   clearTimeout(hideTimeout);
   controlWrapper.style.opacity = '1';
}

function hideControls() {
   if (!controlWrapper.contains(document.activeElement)) {
      hideTimeout = setTimeout(() => {
         controlWrapper.style.opacity = '0';
      }, 2000);
   }
}

const controlWrapper = document.createElement('div');
controlWrapper.className = 'flex transition border border-[#1EE3CF]/10  duration-500 opacity-0 fixed bottom-5 px-3 py-2 gap-x-3 z-10 bg-[#111] justify-center items-center  rounded-full playback-controls w-fit left-1/2 -translate-x-1/2';

const buttonClassList = 'text-[#1EE3CF]/40 rounded-full outline-none ring-1 ring-transparent focus-visible:ring-[#1EE3CF] transition hover:text-[#1EE3CF]/80';

const playButton = document.createElement('button');
playButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE --><path fill="currentColor" d="M12 20c4.41 0 8-3.59 8-8s-3.59-8-8-8s-8 3.59-8 8s3.59 8 8 8M10 7.5l6 4.5l-6 4.5z" opacity=".3"/><path fill="currentColor" d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2S2 6.48 2 12s4.48 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8s-8-3.59-8-8s3.59-8 8-8m-2 3.5v9l6-4.5z"/></svg>';
playButton.className = buttonClassList;
playButton.onclick = play;

const pauseButton = document.createElement('button');
pauseButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE --><path fill="currentColor" d="M12 4c-4.41 0-8 3.59-8 8s3.59 8 8 8s8-3.59 8-8s-3.59-8-8-8m-1 12H9V8h2zm4 0h-2V8h2z" opacity=".3"/><path fill="currentColor" d="M13 8h2v8h-2zM9 8h2v8H9z"/><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8"/></svg>';
pauseButton.className = buttonClassList;
pauseButton.onclick = pause;

// const stopButton = document.createElement('button');
// stopButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE --><path fill="currentColor" d="M12 4c-4.42 0-8 3.58-8 8s3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8m4 12H8V8h8z" opacity=".3"/><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8s8 3.58 8 8s-3.58 8-8 8m4-4H8V8h8z"/></svg>';
// stopButton.className = buttonClassList;
// stopButton.onclick = stop;

const changeButton = document.createElement('button');
changeButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE --><path fill="currentColor" d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8s-8-3.59-8-8s3.59-8 8-8m.06 9.34v2.14a3.46 3.46 0 0 1-2.54-1.01c-1.12-1.12-1.3-2.8-.59-4.13l-1.1-1.1c-1.28 1.94-1.07 4.59.64 6.29A4.95 4.95 0 0 0 12 17h.06v2l2.83-2.83zm3.48-4.88c-.99-.99-2.3-1.46-3.6-1.45V5L9.11 7.83l2.83 2.83V8.51H12c.9 0 1.79.34 2.48 1.02c1.12 1.12 1.3 2.8.59 4.13l1.1 1.1a5.03 5.03 0 0 0-.63-6.3" opacity=".3"/><path fill="currentColor" d="M12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8s-8-3.59-8-8s3.59-8 8-8m0-2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m.06 11.34v2.14a3.46 3.46 0 0 1-2.54-1.01c-1.12-1.12-1.3-2.8-.59-4.13l-1.1-1.1c-1.28 1.94-1.07 4.59.64 6.29A4.95 4.95 0 0 0 12 17h.06v2l2.83-2.83zm3.48-4.88c-.99-.99-2.3-1.46-3.6-1.45V5L9.11 7.83l2.83 2.83V8.51H12c.9 0 1.79.34 2.48 1.02c1.12 1.12 1.3 2.8.59 4.13l1.1 1.1a5.03 5.03 0 0 0-.63-6.3"/></svg>';
changeButton.className = buttonClassList;
changeButton.onclick = changeObj;

const ghLink = document.createElement('a');
ghLink.setAttribute('href', 'https://github.com/joosia/audio-visualizer')
ghLink.setAttribute('target', '_blank')
ghLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 24 24"><!-- Icon from All by undefined - undefined --><path fill="currentColor" fill-opacity="0" d="M15 4.5c-0.39 -0.1 -1.33 -0.5 -3 -0.5c-1.67 0 -2.61 0.4 -3 0.5c-0.53 -0.43 -1.94 -1.5 -3.5 -1.5c-0.34 1 -0.29 2.22 0 3c-0.75 1 -1 2 -1 3.5c0 2.19 0.48 3.58 1.5 4.5c1.02 0.92 2.11 1.37 3.5 1.5c-0.65 0.54 -0.5 1.87 -0.5 2.5v4h6v-4c0 -0.63 0.15 -1.96 -0.5 -2.5c1.39 -0.13 2.48 -0.58 3.5 -1.5c1.02 -0.92 1.5 -2.31 1.5 -4.5c0 -1.5 -0.25 -2.5 -1 -3.5c0.29 -0.78 0.34 -2 0 -3c-1.56 0 -2.97 1.07 -3.5 1.5Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.8s" dur="0.15s" values="0;0.3"/></path><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="32" stroke-dashoffset="32" d="M12 4c1.67 0 2.61 0.4 3 0.5c0.53 -0.43 1.94 -1.5 3.5 -1.5c0.34 1 0.29 2.22 0 3c0.75 1 1 2 1 3.5c0 2.19 -0.48 3.58 -1.5 4.5c-1.02 0.92 -2.11 1.37 -3.5 1.5c0.65 0.54 0.5 1.87 0.5 2.5c0 0.73 0 3 0 3M12 4c-1.67 0 -2.61 0.4 -3 0.5c-0.53 -0.43 -1.94 -1.5 -3.5 -1.5c-0.34 1 -0.29 2.22 0 3c-0.75 1 -1 2 -1 3.5c0 2.19 0.48 3.58 1.5 4.5c1.02 0.92 2.11 1.37 3.5 1.5c-0.65 0.54 -0.5 1.87 -0.5 2.5c0 0.73 0 3 0 3"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.7s" values="32;0"/></path><path stroke-dasharray="10" stroke-dashoffset="10" d="M9 19c-1.41 0 -2.84 -0.56 -3.69 -1.19c-0.84 -0.63 -1.09 -1.66 -2.31 -2.31"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="10;0"/></path></g></svg>';
ghLink.className = buttonClassList;
ghLink.classList.add('border-[3px]', 'bg-[#1EE3CF]/10', 'hover:bg-[#1EE3CF]/20', 'hover:border-[#1EE3CF]/80', 'inline-flex', 'p-1', 'h-[28px]', 'w-[28px]', 'items-center', 'justify-center', 'border-[#1EE3CF]/40')

const statsButton = document.createElement('button');
statsButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full" viewBox="0 0 24 24"><!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE --><path fill="currentColor" d="M8 17c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1s1 .45 1 1v5c0 .55-.45 1-1 1m4 0c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v8c0 .55-.45 1-1 1m4 0c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1m2 2H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1m1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2"/></svg>'
statsButton.className = buttonClassList;
statsButton.classList.add('border-[3px]', 'bg-[#1EE3CF]/10', 'hover:bg-[#1EE3CF]/20', 'hover:border-[#1EE3CF]/80', 'inline-flex', 'p-1', 'h-[28px]', 'w-[28px]', 'items-center', 'justify-center', 'border-[#1EE3CF]/40');
statsButton.onclick = toggleStats;


controlWrapper.appendChild(ghLink);
controlWrapper.appendChild(statsButton);
controlWrapper.appendChild(changeButton);
// controlWrapper.appendChild(stopButton);
controlWrapper.appendChild(pauseButton);
controlWrapper.appendChild(playButton);

document.body.appendChild(controlWrapper);

const controls = controlWrapper.childNodes;
controls.forEach((button) => {
   button.addEventListener('focus', showControls);
   button.addEventListener('blur', () => {
      setTimeout(() => {
         if (!controlWrapper.contains(document.activeElement)) {
            hideControls();
         }
      }, 0);
   });
});

window.addEventListener('keypress', (e) => key = e.code)
window.addEventListener('mousemove', () => {
   showControls();
   if (!controlWrapper.contains(document.activeElement)) {
      hideControls();
   }
});
export { isPlaying, currentObj };