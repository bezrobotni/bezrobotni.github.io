import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { OBJLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/OBJLoader.js';

export function createWorld(scene, sceneId = 1){
  // sceneId 1: default world (ground + sky)
  // sceneId 2: empty world (only sky)

  // add floor only in scene 1
  if(sceneId === 1){
    const tex = new THREE.TextureLoader().load('https://threejs.org/examples/textures/uv_grid_opengl.jpg');
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(10,10);
    const mat = new THREE.MeshStandardMaterial({map:tex});
    const g = new THREE.PlaneGeometry(200,200);
    const ground = new THREE.Mesh(g, mat);
    ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; ground.position.y = 0;
    scene.add(ground);
  }

  // Sky (present in all scenes)
  const SKY_VERTICAL_OFFSET = 0.25;
  const SKY_ROTATION_Y = Math.PI / 2;
  const SKY_RADIUS = 150;

  const loader = new THREE.TextureLoader();
  loader.load('sky.png', (tex)=>{
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.offset.y = SKY_VERTICAL_OFFSET;
    tex.anisotropy = 4;

    const skyMat = new THREE.MeshBasicMaterial({map: tex, side: THREE.BackSide});
    const skyGeo = new THREE.SphereGeometry(SKY_RADIUS, 64, 48);
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    skyMesh.rotation.y = SKY_ROTATION_Y;
    scene.add(skyMesh);
  }, undefined, (err)=>{ console.warn('Failed to load sky.png — falling back to ambient sky', err); });

  const hemi = new THREE.HemisphereLight(0x87CEEB, 0x071026, 0.8);
  scene.add(hemi);

  // scene2: load the OBJ model and apply simple texture
  if(sceneId === 2){
    const base = encodeURI('3d models/cyganbody/') + '/';
    const objPath = base + 'textured_output.obj';
    const texPath = base + 'textured_output.jpg';

    // load texture first, then apply when obj arrives
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(texPath, texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping; // if needed
      const objLoader = new OBJLoader();
      objLoader.load(objPath, obj => {
        obj.position.set(0, 0, 0);
        obj.scale.set(1.5, 1.5, 1.5); // 1.5x bigger
        obj.traverse(c=>{ 
          if(c.isMesh){ 
            c.castShadow=true; c.receiveShadow=true; 
            // assign texture to material
            if(c.material){
              c.material.map = texture;
              c.material.needsUpdate = true;
            }
          }
        });
        scene.add(obj);
      }, undefined, err => {
        console.warn('failed to load cyganbody obj', err);
      });
    }, undefined, err => {
      console.warn('failed to load cyganbody texture', err);
      // still try loading OBJ without texture
      const objLoader = new OBJLoader();
      objLoader.load(objPath, obj => {
        obj.position.set(0, 0, 0);
        obj.scale.set(1.5,1.5,1.5);
        obj.traverse(c=>{ if(c.isMesh){ c.castShadow=true; c.receiveShadow=true; }});
        scene.add(obj);
      }, undefined, err2 => {
        console.warn('failed to load cyganbody obj', err2);
      });
    });
  }
}
