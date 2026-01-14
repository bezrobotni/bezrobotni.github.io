// Minimal Flappy Bird-like implementation
(function(){
  const canvas = document.getElementById('flappy-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width, H = canvas.height;
  const bird = {x:80,y:H/2,vy:0,r:14};
  let pipes=[], frame=0, gap=120, speed=2.6, gravity=0.5, score=0, running=false, timer=null;
  let best = parseInt(localStorage.getItem('flappy_best') || '0', 10);
  if(document.getElementById('flappy-best')) document.getElementById('flappy-best').textContent = best;

  function reset(){ pipes=[]; frame=0; bird.y=H/2; bird.vy=0; score=0; document.getElementById('flappy-score').textContent = score; }
  function spawnPipe(){ const top = Math.random()*(H-140) + 20; pipes.push({x:W,top:top}); }
  function draw(){ ctx.clearRect(0,0,W,H); // bg
    // pipes
    ctx.fillStyle = '#2d6a4f'; for(let p of pipes){ ctx.fillRect(p.x,0,52,p.top); ctx.fillRect(p.x,p.top+gap,52,H-(p.top+gap)); }
    // bird
    ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.arc(bird.x,bird.y,bird.r,0,Math.PI*2); ctx.fill();
    // score
    ctx.fillStyle = '#fff'; ctx.font='20px Inter'; ctx.fillText('Wynik: '+score, 12,24);
  }
  function step(){ frame++; if(frame%90===0) spawnPipe(); for(let p of pipes) p.x -= speed; pipes = pipes.filter(p=>p.x> -60);
    bird.vy += gravity; bird.y += bird.vy; // collision with ground/ceiling
    if(bird.y + bird.r > H || bird.y - bird.r < 0) return lose();
    // scoring & collisions
    for(let p of pipes){ if(!p.passed && p.x + 52 < bird.x){ p.passed = true; score++; document.getElementById('flappy-score').textContent = score; // update best
        if(score > best){ best = score; localStorage.setItem('flappy_best', best); if(document.getElementById('flappy-best')) document.getElementById('flappy-best').textContent = best; } }
      // collision check
      if(bird.x + bird.r > p.x && bird.x - bird.r < p.x + 52){ if(bird.y - bird.r < p.top || bird.y + bird.r > p.top + gap) return lose(); }
    }
    draw();
  }
  function flap(){ bird.vy = -8; }
  function start(){ if(running) return; running=true; timer = setInterval(step, 1000/60); }
  function pause(){ running=false; clearInterval(timer); }
  function lose(){ pause(); // update best if needed
    if(score > best){ best = score; localStorage.setItem('flappy_best', best); if(document.getElementById('flappy-best')) document.getElementById('flappy-best').textContent = best; }
    alert('Przegrałeś. Wynik: '+score); reset(); draw(); }

  document.getElementById('flappy-start').addEventListener('click', ()=>{ start(); });
  document.getElementById('flappy-pause').addEventListener('click', ()=>{ running?pause():start(); });
  window.addEventListener('keydown', (e)=>{ if(e.code==='Space'){ e.preventDefault(); flap(); } });
  canvas.addEventListener('click', ()=> flap());
  reset(); draw();
})();