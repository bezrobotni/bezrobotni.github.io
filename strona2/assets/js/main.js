/* bubble script removed */
(function(){})();

  function rand(min, max){ return Math.random() * (max - min) + min; }

  function makeBubbleElement(size, x, y, hue){
    const b = document.createElement('div'); b.className = 'bubble';
    b.style.width = b.style.height = size + 'px';
    b.style.left = (x - size/2) + 'px';
    b.style.top = (y - size/2) + 'px';
    // 3D glossy style
    b.style.background = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), hsla(${hue},80%,60%,0.95) 30%, hsla(${hue},60%,40%,0.9) 70%)`;
    b.style.boxShadow = `0 8px 20px rgba(0,0,0,0.25), 0 0 24px rgba(255,255,255,0.06) inset`;
    b.style.borderRadius = '50%';
    b.style.position = 'absolute';
    b.style.willChange = 'transform,opacity,left,top';
    return b;
  }

  // recursive creation: level controls how many splits remain
  function createBubble(x, y, size, level){
    const hue = Math.round(rand(200,340));
    const b = makeBubbleElement(size, x, y, hue);
    container.appendChild(b);

    // flight vector
    const vx = rand(-160,160);
    const vy = rand(-300,-80);
    const rot = rand(-720,720);
    const dur = Math.max(400, Math.round(rand(600,1700) * (1 + (3-level)*0.06)));

    // slight pop animation at start
    b.animate([
      { transform: `scale(0.8)`, opacity:0 },
      { transform: `scale(1)`, opacity:1 }
    ], { duration: 220, easing: 'cubic-bezier(.2,.9,.3,1)' });

    // main flight
    const anim = b.animate([
      { transform: `translate3d(0px,0px,0) rotate(0deg)`, opacity:1 },
      { transform: `translate3d(${vx}px,${vy}px,0) rotate(${rot}deg)`, opacity:0 }
    ], { duration: dur, easing: 'cubic-bezier(.2,.9,.3,1)'});

    anim.onfinish = () => {
      // spawn children if level > 0
      if(level > 0){
        const children = Math.floor(rand(2,4));
        const rect = b.getBoundingClientRect();
        const cx = rect.left + rect.width/2; const cy = rect.top + rect.height/2;
        for(let i=0;i<children;i++){
          const childSize = Math.max(6, Math.round(size * rand(0.34, 0.56)));
          // slight spread from final position
          const offsetX = rand(-24,24); const offsetY = rand(-24,24);
          // small delay for stagger
          setTimeout(()=> createBubble(cx + offsetX, cy + offsetY, childSize, level - 1), Math.round(rand(30,120)));
        }
      }
      b.remove();
    };
  }

  // on click: create one big splash bubble which will split
  window.addEventListener('click', function(e){
    const tag = (e.target && e.target.tagName) || '';
    // if clicking controls, still produce a smaller split effect
    let initialSize = 90;
    let level = 3;
    if(['INPUT','TEXTAREA','SELECT'].includes(tag)) { initialSize = 34; level = 2; }
    if(['BUTTON','A'].includes(tag)) { initialSize = 56; level = 2; }

    // toggle crazy modifier if body has data-crazy
    const crazy = document.body.classList.contains('crazy');
    if(crazy){ initialSize *= 1.4; level = Math.min(5, level + 1); }

    // center creation and initial small burst
    const x = e.clientX; const y = e.clientY;
    // create a few initial small 'splash' droplets around click
    for(let i=0;i<6;i++){
      const s = Math.round(rand(initialSize*0.18, initialSize*0.5));
      const ox = rand(-initialSize*0.3, initialSize*0.3);
      const oy = rand(-initialSize*0.3, initialSize*0.3);
      createBubble(x + ox, y + oy, s, Math.max(1, level - 1));
    }

    // single big bubble in center that will split further
    setTimeout(()=> createBubble(x, y, initialSize, level), 60);
  }, { passive: true });

  // keyboard: press B for bubble storm (bigger depth)
  window.addEventListener('keydown', function(e){ if(e.key && e.key.toLowerCase() === 'b'){ for(let i=0;i<40;i++){ const xc = window.innerWidth/2 + rand(-300,300); const yc = window.innerHeight/2 + rand(-240,240); createBubble(xc, yc, rand(40,120), 3); } } });

  // confetti pop on [data-confetti]
  function popConfetti(el, x, y){
    const colors = ["#ff4d6d","#ffd166","#6ee7b7","#7dd3fc","#b78cff","#ffd3a5"];
    const crazy = document.body.classList.contains('crazy');
    const n = crazy ? 36 : 18;
    for(let i=0;i<n;i++){
      const d = document.createElement('div'); d.className='dot confetti-dot';
      const size = Math.round(rand(6,12)); d.style.width=d.style.height=size+'px';
      d.style.left = (x - size/2) + 'px'; d.style.top = (y - size/2) + 'px';
      d.style.position = 'fixed'; d.style.borderRadius = '2px'; d.style.zIndex = 9999;
      d.style.background = colors[Math.floor(rand(0,colors.length))];
      document.body.appendChild(d);
      const vx = rand(-240,240); const vy = rand(-360,-120); const rot = rand(-720,720);
      d.animate([
        { transform: `translate3d(0px,0px,0) rotate(0deg)`, opacity:1 },
        { transform: `translate3d(${vx}px,${vy}px,0) rotate(${rot}deg)`, opacity:0 }
      ], { duration: rand(700,1200), easing: 'cubic-bezier(.2,.9,.3,1)' }).onfinish = ()=> d.remove();
    }
  }
  document.querySelectorAll('[data-confetti]').forEach(a=>{ a.addEventListener('click', function(e){ const r = this.getBoundingClientRect(); popConfetti(this, r.left + r.width/2, r.top + r.height/2); }); });

  // small floating orbs in header
  function makeOrb(parent, x, y, size, hue){ const d = document.createElement('div'); d.className='orb'; d.style.width = d.style.height = size+'px'; d.style.left = x+'%'; d.style.top = y+'%'; d.style.background = `radial-gradient(circle at 30% 30%, hsla(${hue},80%,70%,0.95), hsla(${hue},60%,50%,0.2))`; parent.appendChild(d); }
  const headers = document.querySelectorAll('.header'); headers.forEach(h=>{ h.style.position='relative'; makeOrb(h, 8, 12, 140, 210); makeOrb(h, 84, 26, 92, 300); });

  // (crazy toggle removed)
})();