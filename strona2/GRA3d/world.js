import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function createWorld(scene){
  // Ground
  const tex = new THREE.TextureLoader().load('https://threejs.org/examples/textures/uv_grid_opengl.jpg');
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(10,10);
  const mat = new THREE.MeshStandardMaterial({map:tex});
  const g = new THREE.PlaneGeometry(200,200);
  const ground = new THREE.Mesh(g, mat);
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; ground.position.y = 0;
  scene.add(ground);

  // Sky: use an equirectangular/360 PNG to surround the player (place your file at ./GRA3d/sky.png)
  // Positioning: vertical offset and Y-rotation control which part of the image faces the player.
  // Set SKY_VERTICAL_OFFSET so the image center is closer to the equator (less distortion at center)
  const SKY_VERTICAL_OFFSET = 0.25; // 0 = top, 0.5 = center of image, adjust to taste
  const SKY_ROTATION_Y = Math.PI / 2; // rotate sky so image center is to the side (in radians)
  const SKY_RADIUS = 150; // default radius (restored)

  const loader = new THREE.TextureLoader();
  loader.load('sky.png', (tex)=>{
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.offset.y = SKY_VERTICAL_OFFSET;
    tex.anisotropy = 4; // slightly improve sampling

    const skyMat = new THREE.MeshBasicMaterial({map: tex, side: THREE.BackSide});
    // higher subdivisions give slightly less distortion near the poles
    const skyGeo = new THREE.SphereGeometry(SKY_RADIUS, 64, 48);
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.rotation.y = SKY_ROTATION_Y; // rotate so image center faces the side
    scene.add(skyMesh);
  }, undefined, (err)=>{ console.warn('Failed to load sky.png — falling back to ambient sky', err); });

  // Simple sky/ambient light so the ground is visible
  const hemi = new THREE.HemisphereLight(0x87CEEB, 0x071026, 0.8);
  scene.add(hemi);

  // Model loading removed — cyganbody model is no longer added to the scene.
  // The 3d models folder still contains the original files, but no loader runs now.

  // Note: All other decorative objects and obstacles removed — flat terrain only
  // (This keeps the scene minimal for testing and reference.)
}
