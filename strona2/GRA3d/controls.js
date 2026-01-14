import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Simple pointer-lock look controls + mobile fallback
export function setupControls(canvas, camera, player){
  // rotation state
  const euler = new THREE.Euler(0,0,0,'YXZ');
  let pitch = 0; let yaw = 0;
  const sensitivity = 0.002;

  function onMouseMove(e){
    if(document.pointerLockElement !== canvas) return;
    yaw -= e.movementX * sensitivity; // inverted horizontal axis
    pitch -= e.movementY * sensitivity;
    pitch = Math.max(-Math.PI/2 + 0.05, Math.min(Math.PI/2 - 0.05, pitch));
    euler.set(pitch, yaw, 0);
    camera.quaternion.setFromEuler(euler);
  }

  // Request pointer lock on the canvas element
  canvas.addEventListener('click', ()=>{ canvas.requestPointerLock(); });
  document.addEventListener('pointerlockchange', ()=>{
    if(document.pointerLockElement === canvas){ document.addEventListener('mousemove', onMouseMove); }
    else{ document.removeEventListener('mousemove', onMouseMove); }
  });

  // Simple touch controls (tap to look not implemented fully)
  // move player using WASD keys handled in player.js
}
