import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { vertexShader, fragmentShader } from './shaders.ts';
import { objs } from './obj-config.ts';
import Sparkle from './Sparkle.ts';
import { Microphone } from './Microphone.ts';
import { isPlaying, currentObj } from './playback-controls.ts';

// Init mic
const mic = new Microphone();

// Get the canvas element
const canvas = document.querySelector('#c') as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Renderer and camera setup
const RESOLUTION_SCALE = 1; // 0-1, Render at 100% resolution
const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
const renderWidth = Math.floor(viewportWidth * RESOLUTION_SCALE);
const renderHeight = Math.floor(viewportHeight * RESOLUTION_SCALE);

// Create scene, camera, and renderer
let scene = new THREE.Scene();
scene.background = new THREE.Color(0x080808);

const camera = new THREE.PerspectiveCamera(75, viewportWidth / viewportHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
   canvas,
   powerPreference: 'high-performance',
   antialias: false,
});

// const pixelRatio = 1; 
const pixelRatio = window.devicePixelRatio; // Can be heavy on HDPI displays
renderer.setPixelRatio(pixelRatio);
renderer.setSize(renderWidth, renderHeight, false);

// Position camera
camera.position.set(0, 0, 3);

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
   new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2), // Half resolution for better performance
   1.5, // Strenght
   1, // Radius
   0 // Threshold
);

// Add light trails fx
const afterimagePass = new AfterimagePass(0.9); // Value between 0-1, higher = longer trails

const composer = new EffectComposer(renderer);
composer.setPixelRatio(pixelRatio);
composer.addPass(renderScene);
composer.addPass(bloomPass);
composer.addPass(afterimagePass)


// Add OrbitControls
new OrbitControls(camera, renderer.domElement)

// Stats meter 
const stats = new Stats()
document.body.appendChild(stats.dom)

// Add axes helper to visualize center
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// Setup rendered lines and dots. Group = .obj
const group = new THREE.Group();
scene.add(group);

const sparkles: Sparkle[] = [];
const sparklesGeometry = new THREE.BufferGeometry();
const sparklesMaterial = new THREE.ShaderMaterial({
   uniforms: {
      pointTexture: {
         value: new THREE.TextureLoader().load(
            "textures/dotTexture.png"
         )
      }
   },
   vertexShader: vertexShader,
   fragmentShader: fragmentShader,
   blending: THREE.AdditiveBlending,
   alphaTest: 1.0,
   transparent: true
});
const points = new THREE.Points(sparklesGeometry, sparklesMaterial);
group.add(points);

let sampler: MeshSurfaceSampler;

interface CustomLine extends THREE.Line {
   coordinates: number[];
   previous: THREE.Vector3 | null;
}
const lines: THREE.Line[] = [];

let colors: THREE.Color[] = [
   new THREE.Color("#CFD6DE"),
   new THREE.Color("#1EE3CF"),
   new THREE.Color("#6B48FF"),
   new THREE.Color("#125D98")
];



let loadedObj: THREE.Object3D;
// Function to load .obj model
function loadObj(i: number) {
   // console.log(i)
   const { path, pos, scale } = objs[i];
   // Position object properly
   group.scale.set(scale.x, scale.y, scale.z);
   group.position.set(pos.x, pos.y, pos.z);
   group.rotation.z = pos.rotation;

   // Create OBJ loader
   const loader = new OBJLoader();
   const loaderWrapper = document.querySelector('#loader-wrapper') as HTMLElement;
   const overlay = document.querySelector('#overlay') as HTMLElement;
   const loadingPercentage = loaderWrapper.lastElementChild as HTMLElement;
   loaderWrapper.style.display = 'flex';
   loaderWrapper.style.opacity = '1';
   overlay.style.display = 'block';
   overlay.style.opacity = '1';

   loader.load(
      path,
      (object) => {
         // console.log(object);
         loadedObj = object.children[0];
         loadingPercentage.innerText = '100%';
         dots();

         // Hide loader and show canvas
         loaderWrapper.style.opacity = '0';
         overlay.style.opacity = '0';
         setTimeout(() => {
            overlay.style.display = 'none';
            loaderWrapper.style.display = 'none';
            loadingPercentage.innerText = '0%';
         }, 500); // 500ms transition before display none
      },
      function (xhr) {
         // Update loading progress
         if (xhr.lengthComputable) {
            const percentComplete = Math.floor((xhr.loaded / xhr.total) * (90 + Math.floor(Math.random() * 10)));
            loadingPercentage.innerText = `${percentComplete} % `;
         }
      },
      function (error) {
         console.error('An error occurred loading the model:', error);
      }
   );
}
// Load the Telecaster model
loadObj(currentObj);

function updateSparklesGeometry() {
   let tempSparklesArraySizes: number[] = [];
   let tempSparklesArrayColors: number[] = [];
   sparkles.forEach((sparkle) => {
      tempSparklesArraySizes.push(sparkle.size);
      tempSparklesArrayColors.push(sparkle.color.r, sparkle.color.g, sparkle.color.b);
   });
   sparklesGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(tempSparklesArrayColors, 3)
   );
   sparklesGeometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(tempSparklesArraySizes, 1)
   );
}

function dots() {
   //Clear existing lines
   lines.forEach(line => {
      group.remove(line);
   });
   //console.log(lines)
   lines.length = 0;
   // Clear previous render loop before starting a new one

   if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = 0;
   }

   sampler = new MeshSurfaceSampler(loadedObj as THREE.Mesh).build();

   for (let i = 0; i < 8; i++) {
      const linesMaterial = new THREE.LineBasicMaterial({
         color: colors[i % 4],
         transparent: true,
         opacity: 1
      });
      // Create the line and cast it to unknown first, then to CustomLine
      const linesMesh = new THREE.Line(new THREE.BufferGeometry(), linesMaterial);
      const customLine = (linesMesh as unknown) as CustomLine;
      customLine.coordinates = [];
      customLine.previous = null;
      lines.push(customLine);
      group.add(customLine);
   }
   animationId = requestAnimationFrame(render);
}

let safe = 0;
const p1 = new THREE.Vector3();

function nextDot(line: CustomLine, positionBias = { x: 0, y: 0 }) {
   let ok = false;
   safe = 0;
   while (!ok && safe < 100) {
      sampler.sample(p1);

      // Apply frequency-based position bias
      p1.x += positionBias.x * 0.05;
      p1.y += positionBias.y * 0.05;

      if (line.previous && p1.distanceTo(line.previous) < 0.12) {
         line.coordinates.push(p1.x, p1.y, p1.z);
         line.previous = p1.clone();
         if (sparkles.length < MAX_SPARKLES) {
            const spark = new Sparkle();
            const material = line.material as THREE.LineBasicMaterial;
            spark.setup(p1, material.color, pixelRatio);
            sparkles.push(spark);
         }
         ok = true;
      } else if (!line.previous) {
         line.previous = p1.clone();
      }
      safe++;
   }
}

const MAX_SPARKLES = 10000;
const MAX_DRAW_TIME_PER_FRAME = 16;
const DRAW_DURATION = MAX_DRAW_TIME_PER_FRAME * 6;  // ~50ms total duration
let drawStartTime = 0;
let isDrawing = false;
// let prevVolume = 0;

function mapFrequencyToPosition(freqIndex: number, totalBins: number, frequencies: number[]) {
   // Get the actual frequency this bin represents
   const nyquist = 22050;
   const frequencyHz = (freqIndex / totalBins) * nyquist;

   // Get the intensity of this frequency
   const intensity = Math.abs(frequencies[freqIndex]) * 4; // Multiply by 4 to amplify the effect

   if (frequencyHz < 400) {
      // Bass frequencies (0-400Hz) - bottom part of guitar body
      return {
         x: -0.8 * intensity * Math.cos(group.rotation.z),
         y: -0.8 * intensity * Math.sin(group.rotation.z)
      };
   } else if (frequencyHz < 3000) {
      // Mid frequencies (400-3000Hz) - middle of guitar
      return {
         x: intensity * 0.5 * Math.sin(group.rotation.z),
         y: intensity * 0.5 * Math.cos(group.rotation.z)
      };
   } else {
      // High frequencies (>3000Hz) - neck/head area
      return {
         x: 0.8 * intensity * Math.cos(group.rotation.z),
         y: 0.8 * intensity * Math.sin(group.rotation.z)
      };
   }
}

let animationId: number;
function render() {
   // console.log(isPlaying)
   if (!isPlaying) {
      cancelAnimationFrame(animationId);
      return;
   };
   animationId = requestAnimationFrame(render);
   const currentTime = performance.now();

   const volume = mic.getVolume();
   const samples = mic.getSamples();
   const frequencies = mic.getFrequency(); // Get frequency data

   // Only process if there's significant volume change
   // if (Math.abs(volume - prevVolume) > 0.001) {
      if (volume > 0.012 && !isDrawing) {
         isDrawing = true;
         drawStartTime = currentTime;
         sparkles.length = 0;
         sparklesMaterial.opacity = 1;
         lines.forEach(line => {
            const customLine = line as CustomLine;
            customLine.coordinates = [];
            customLine.previous = null;
            (line.material as THREE.LineBasicMaterial).opacity = 1;
            line.geometry.setAttribute(
               "position",
               new THREE.BufferAttribute(new Float32Array([]), 3)
            );
         });
      // }
   }

   // prevVolume = volume;

   // Handle drawing phase
   if (isDrawing) {
      const progress = (currentTime - drawStartTime) / DRAW_DURATION;
      const drawStartTimeThisFrame = performance.now();

      if (progress < 1) {
         // Drawing phase
         lines.forEach((line, i) => {
            // Calculate the frequency range for this line
            const freqRangeStart = Math.floor(i * frequencies.length / lines.length);
            const freqRangeEnd = Math.floor((i + 1) * frequencies.length / lines.length);

            let freqSum = 0;
            for (let f = freqRangeStart; f < freqRangeEnd; f++) {
               freqSum += Math.abs(frequencies[f]);
            }
            const freqAvg = freqSum / (freqRangeEnd - freqRangeStart);


            // Apply frequency threshold to only draw when the frequency is significant
            if (freqAvg < 0.05) {
               return; // Skip this frequency range if it's too quiet
            }

            // Combine with time domain sample and volume for more dynamic response
            const sampleValue = Math.abs(samples[i * samples.length / lines.length]);
            const combinedValue = (freqAvg * 0.8) + (sampleValue * 0.2) /* + volume */;

            // Position bias based on actual frequency range
            const positionBias = mapFrequencyToPosition(freqRangeStart, frequencies.length, frequencies);

            // Use combined value for sparkle count
            let targetSparkles = Math.floor(combinedValue * MAX_SPARKLES);
            const dotsPerLine = Math.floor(targetSparkles / lines.length);

            // Limit dots per frame to maintain performance
            const maxDotsThisFrame = Math.min(dotsPerLine,
               Math.ceil(dotsPerLine * (MAX_DRAW_TIME_PER_FRAME / DRAW_DURATION)));

            for (let j = 0; j < maxDotsThisFrame; j++) {
               if (performance.now() - drawStartTimeThisFrame > MAX_DRAW_TIME_PER_FRAME) {
                  break;
               }
               nextDot(line as CustomLine, positionBias);
            }

            let tempVertices = new Float32Array((line as CustomLine).coordinates);
            line.geometry.setAttribute(
               "position",
               new THREE.BufferAttribute(tempVertices, 3)
            );
            line.geometry.computeBoundingSphere();
         });
         updateSparklesGeometry();
      } else {
         // Clear everything immediately after drawing phase
         isDrawing = false;
         sparkles.length = 0;
         lines.forEach(line => {
            (line as CustomLine).coordinates = [];
            (line as CustomLine).previous = null;
            line.geometry.setAttribute(
               "position",
               new THREE.BufferAttribute(new Float32Array([]), 3)
            );
         });
         sparklesGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array([]), 3)
         );
      }
   }


   let tempSparklesArray: number[] = [];
   sparkles.forEach((sparkle) => {
      sparkle.update();
      tempSparklesArray.push(sparkle.x, sparkle.y, sparkle.z);
   });

   sparklesGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(tempSparklesArray, 3)
   );
   composer.render();

   stats.update()
}

// Handle resize
function onWindowResize() {
   camera.aspect = window.innerWidth / window.innerHeight;
   camera.updateProjectionMatrix();
   composer.setSize(window.innerWidth, window.innerHeight);
   renderer.setSize(window.innerWidth, window.innerHeight);
   bloomPass.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize);

export { render, scene, loadObj, stats }