import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

// Player class: handles movement, physics, health, shooting XP
export default class Player{
  constructor(camera, scene){
    this.camera = camera;
    this.scene = scene;
    this.speed = 6; // m/s
    this.jumpSpeed = 6;
    this.gravity = -20;
    this.vel = new THREE.Vector3();
    this.onGround = false;
    this.hp = 100;
    this.xp = 0;

    // simple collision volume (sphere)
    this.radius = 0.35;

    // position object used for collision detection
    this.position = new THREE.Vector3().copy(camera.position);

    // Bind movement keys
    this.keys = {w:false,a:false,s:false,d:false,space:false};
    window.addEventListener('keydown',(e)=>this.onKey(e,true));
    window.addEventListener('keyup',(e)=>this.onKey(e,false));
  }

  onKey(e,down){
    // ignore gameplay keys while chat is active
    if(window.__GRA3d && window.__GRA3d.chatActive) return;
    const k = e.key.toLowerCase();
    if(k==='w') this.keys.w = down;
    if(k==='a') this.keys.a = down;
    if(k==='s') this.keys.s = down;
    if(k==='d') this.keys.d = down;
    if(k===' ') this.keys.space = down;
  }

  addXP(v){ this.xp += v; }

  takeDamage(v){ this.hp -= v; if(this.hp<0) this.hp=0; }

  // very simple collision resolution with world boxes
  checkCollisions(newPos){
    // check against boxes in scene: objects with userData.obstacle = true
    const obstacles = [];
    this.scene.traverse(o=>{ if(o.userData && o.userData.obstacle) obstacles.push(o); });
    for(const obs of obstacles){
      const box = new THREE.Box3().setFromObject(obs);
      // expand box by player radius
      box.min.addScalar(-this.radius);
      box.max.addScalar(this.radius);
      if(box.containsPoint(newPos)){
        return true; // collision
      }
    }
    return false;
  }

  update(dt){
    // Movement vector relative to camera orientation
    const dir = new THREE.Vector3();
    const forward = new THREE.Vector3();
    // use the player's camera reference
    this.camera.getWorldDirection(forward);
    forward.y = 0; forward.normalize();
  // Ensure forward points 'forward' from the camera (positive forward movement)
  forward.negate();
  // compute right vector as forward x up to get correct right-hand direction
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).normalize();

    // W should move forward in view, S backward — handle direction here
    if(this.keys.w) dir.add(forward.clone().negate());
    if(this.keys.s) dir.add(forward);
    // ensure A moves left and D moves right
    if(this.keys.a) dir.add(right);
    if(this.keys.d) dir.add(right.clone().negate());
    if(dir.lengthSq()>0) dir.normalize();

    // horizontal velocity
    const desiredVel = dir.multiplyScalar(this.speed);
    this.vel.x = desiredVel.x; this.vel.z = desiredVel.z;

    // gravity & jump
    if(this.onGround && this.keys.space){ this.vel.y = this.jumpSpeed; this.onGround=false; }
    this.vel.y += this.gravity * dt;

    // integrate
    const newPos = this.position.clone().add(this.vel.clone().multiplyScalar(dt));

    // naive ground collision at y=0
    if(newPos.y <= 1.6){ newPos.y = 1.6; this.vel.y = 0; this.onGround = true; }

    // world collision check
    const collided = this.checkCollisions(newPos);
    if(!collided){
      this.position.copy(newPos);
      this.camera.position.copy(this.position);
    } else {
      // if collided, zero horizontal velocities
      this.vel.x = 0; this.vel.z = 0;
    }
  }
}
