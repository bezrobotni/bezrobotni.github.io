// main.js — bootstrap the 3D game
// Imports Three.js from unpkg (ES module). We keep dependencies minimal.
import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import Player from './player.js';
import {createWorld} from './world.js';
import {setupControls} from './controls.js';

// Basic globals
let scene, camera, renderer;
let player;
let clock = new THREE.Clock();
let raycaster = new THREE.Raycaster();
const canvas = document.getElementById('game-canvas');

// HUD elements
const hpEl = document.getElementById('hp-val');
const xpEl = document.getElementById('xp-val');
const crosshair = document.getElementById('crosshair');
// telemetry elements
const posXEl = document.getElementById('pos-x');
const posYEl = document.getElementById('pos-y');
const posZEl = document.getElementById('pos-z');
const yawEl = document.getElementById('yaw');
const pitchEl = document.getElementById('pitch');
const enemiesEl = document.getElementById('enemies');
const fpsEl = document.getElementById('fps');
const plockEl = document.getElementById('plock');
const telemetryEl = document.getElementById('telemetry');

// Chat elements
const chatLog = document.getElementById('chat-log');
const chatInput = document.getElementById('chat-input');
const chatBox = document.getElementById('chat');
// chat & debug state (accessible to other modules)
window.__GRA3d = window.__GRA3d || {};
window.__GRA3d.chatActive = false;
window.__GRA3d.debugEnabled = false;
if(telemetryEl) telemetryEl.style.display = 'none';

// Initialize renderer and scene
function init(){
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071026);

  // Camera (first-person)
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
  camera.position.set(0, 1.6, 5);
  camera.lookAt(0, 1.6, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({canvas, antialias:true});
  // improve device pixel ratio for crispness and ensure fallback size so canvas isn't 0x0
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const rw = canvas.clientWidth || Math.max(320, window.innerWidth);
  const rh = canvas.clientHeight || Math.max(240, window.innerHeight);
  renderer.setSize(rw, rh, false);
  renderer.setClearColor(0x071026, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Lights
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(5, 10, 7);
  dir.castShadow = true;
  dir.shadow.mapSize.set(1024,1024);
  dir.shadow.camera.near = 0.5; dir.shadow.camera.far = 50;
  scene.add(dir);

  // stronger ambient light so objects are visible even if lighting is minimal
  const amb = new THREE.AmbientLight(0xffffff,1.0);
  scene.add(amb);

  // World (ground, obstacles)
  createWorld(scene);

  // Debug cube to verify rendering (temporary)
  const dbgGeo = new THREE.BoxGeometry(0.6,0.6,0.6);
  const dbgMat = new THREE.MeshStandardMaterial({color:0xffcc00, emissive:0x220000, metalness:0.2, roughness:0.6});
  const dbg = new THREE.Mesh(dbgGeo, dbgMat);
  dbg.position.set(0, 1.6, 0);
  dbg.castShadow = true; dbg.receiveShadow = true;
  scene.add(dbg);

  // Player
  player = new Player(camera, scene);



  // Controls + Pointer lock
  setupControls(renderer.domElement, camera, player);

  // Resize
  window.addEventListener('resize', onResize);

  // Input: shoot on mousedown
  window.addEventListener('mousedown', (e)=>{
    if(e.button === 0){ shoot(); }
  });

  // Chat keyboard handling (capture so it intercepts before gameplay keys)
  window.addEventListener('keydown', function(e){
    try{
      if(e.key === '/' && !window.__GRA3d.chatActive && document.activeElement !== chatInput){
        e.preventDefault(); e.stopPropagation();
        openChat();
      }
      // allow ESC globally to close chat if open
      if(e.key === 'Escape' && window.__GRA3d.chatActive){
        e.preventDefault(); e.stopPropagation();
        closeChat();
      }
    }catch(err){/* ignore */}
  }, true);

  // chat input handlers
  if(chatInput){
    chatInput.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        e.preventDefault(); sendChatMessage();
      } else if(e.key === 'Escape'){
        e.preventDefault(); closeChat();
      }
    });
  }

  animate();

  // --- Chat functions ---
  function openChat(){
    if(!chatBox || !chatInput) return;
    window.__GRA3d.chatActive = true;
    chatBox.classList.add('open');
    chatInput.style.display = 'block';
    chatInput.focus();
    // reset player keys so movement stops
    if(player && player.keys) player.keys = {w:false,a:false,s:false,d:false,space:false};
    // exit pointer lock so user can type and move cursor, then hide the mouse cursor (keyboard-only chat)
    try{ if(document.pointerLockElement === canvas) document.exitPointerLock(); }catch(e){}
    try{ canvas.style.cursor = 'none'; document.body.style.cursor = 'none'; }catch(e){}
  }

  function closeChat(){
    if(!chatBox || !chatInput) return;
    window.__GRA3d.chatActive = false;
    chatBox.classList.remove('open');
    chatInput.blur();
    chatInput.style.display = 'none';
    // restore cursor visibility
    try{ canvas.style.cursor = ''; document.body.style.cursor = ''; }catch(e){}
    // return focus to canvas (does not auto-lock)
    try{ canvas.focus(); }catch(e){}
  }

  function sendChatMessage(){
    const v = chatInput && chatInput.value ? chatInput.value.trim() : '';
    if(!v) return;
    // Commands start with $
    if(v.startsWith('$')){
      const cmd = v.slice(1).trim().toLowerCase();
      if(cmd.startsWith('debug=')){
        const val = cmd.split('=')[1];
        if(val === 'on'){
          window.__GRA3d.debugEnabled = true;
          if(telemetryEl) telemetryEl.style.display = 'block';
          appendSystemMsg('<system> debug=on');
        } else if(val === 'off'){
          window.__GRA3d.debugEnabled = false;
          if(telemetryEl) telemetryEl.style.display = 'none';
          appendSystemMsg('<system> debug=off');
        } else {
          appendSystemMsg(`<system> unknown debug value: ${val}`);
        }
      } else {
        appendSystemMsg(`<system> unknown command: ${cmd}`);
      }
      chatInput.value = '';
      // close chat after handling any command; return pointer to gameplay
      closeChat();
      try{ if(document.pointerLockElement !== canvas) canvas.requestPointerLock(); }catch(e){ appendSystemMsg('<system> pointer lock request denied'); }
      return;
    }

    appendUserMsg(v);
    chatInput.value = '';
    // close chat automatically after sending and re-request pointer lock so mouse controls resume
    closeChat();
    try{ if(document.pointerLockElement !== canvas) canvas.requestPointerLock(); }catch(e){ appendSystemMsg('<system> pointer lock request denied'); }
  }

  function appendSystemMsg(text){ const el = document.createElement('div'); el.className = 'chat-msg chat-system'; el.innerText = text; if(chatLog){ chatLog.appendChild(el); chatLog.scrollTop = chatLog.scrollHeight; } }
  function appendUserMsg(text){ const el = document.createElement('div'); el.className = 'chat-msg'; el.innerText = `<user> ${text}`; if(chatLog){ chatLog.appendChild(el); chatLog.scrollTop = chatLog.scrollHeight; } }
}



function shoot(){
  // Raycast placeholder — no enemies in this map
  // Keep raycasting in case later we want debug hits:
  const origin = new THREE.Vector3();
  origin.setFromMatrixPosition(camera.matrixWorld);
  const dir = new THREE.Vector3(0,0,-1).transformDirection(camera.matrixWorld);
  raycaster.set(origin, dir);
  // intentionally no-op: no enemies to hit
}

function update(dt){
  player.update(dt);
  hpEl.textContent = Math.max(0, Math.round(player.hp));


  // Telemetry: position and camera angles
  if(posXEl){
    posXEl.textContent = player.position.x.toFixed(2);
    posYEl.textContent = player.position.y.toFixed(2);
    posZEl.textContent = player.position.z.toFixed(2);

    const eul = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
    yawEl.textContent = (THREE.MathUtils.radToDeg(eul.y)).toFixed(1);
    pitchEl.textContent = (THREE.MathUtils.radToDeg(eul.x)).toFixed(1);

    // no enemies present
    if(enemiesEl) enemiesEl.textContent = 0;

    fpsEl.textContent = dt>0 ? Math.round(1/dt) : '—';
    plockEl.textContent = (document.pointerLockElement === canvas) ? 'yes' : 'no';
  }
}

function onResize(){
  const w = canvas.clientWidth || Math.max(320, window.innerWidth);
  const h = canvas.clientHeight || Math.max(240, window.innerHeight);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, clock.getDelta());
  update(dt);
  renderer.render(scene, camera);
}

// Start
init();

// Export for debugging (optional)
window.__GRA3d = {scene, camera, renderer, player};