// Simple Snake game
(function(){
  const canvas = document.getElementById('snake-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const GRID = 20; // number of cells per row/col
  let cell = Math.floor(canvas.width / GRID);
  let snake = [{x:9,y:9}];
  let dir = {x:1,y:0};
  let nextDir = dir;
  let food = {x:15,y:10};
  let score = 0;
  let speed = 140; // ms per tick
  let running = false;
  let loopId = null;

  function resize(){
    const ww = Math.min(window.innerWidth - 80, 600);
    canvas.width = ww - (ww % GRID);
    canvas.height = canvas.width;
    cell = Math.floor(canvas.width / GRID);
    draw();
  }
  window.addEventListener('resize', resize); resize();

  function placeFood(){
    let tries = 0;
    while(true && tries++ < 999){
      const x = Math.floor(Math.random()*GRID);
      const y = Math.floor(Math.random()*GRID);
      if(!snake.some(s=>s.x===x && s.y===y)){ food = {x,y}; break; }
    }
  }

  function drawCell(x,y,clr){
    ctx.fillStyle = clr;
    ctx.fillRect(x*cell + 1, y*cell + 1, cell-2, cell-2);
  }

  function draw(){
    // background
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // grid bg
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // food
    const gradient = ctx.createRadialGradient((food.x+0.5)*cell, (food.y+0.5)*cell, cell*0.1, (food.x+0.5)*cell, (food.y+0.5)*cell, cell*0.7);
    gradient.addColorStop(0,'#ffcc33');
    gradient.addColorStop(1,'#ff6b6b');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc((food.x+0.5)*cell, (food.y+0.5)*cell, cell*0.35, 0, Math.PI*2);
    ctx.fill();

    // snake
    for(let i=0;i<snake.length;i++){
      const s = snake[i];
      const hue = 180 + (i/snake.length)*120;
      const color = i===0 ? '#7C5CFF' : `hsl(${hue},70%,60%)`;
      drawCell(s.x,s.y,color);
    }
  }

  function tick(){
    // move
    dir = nextDir;
    const head = {x:snake[0].x + dir.x, y:snake[0].y + dir.y};
    // collision with walls
    if(head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID){ gameOver(); return; }
    // collision with self
    if(snake.some(p=>p.x===head.x && p.y===head.y)){ gameOver(); return; }
    snake.unshift(head);
    // eat
    if(head.x===food.x && head.y===food.y){ score++; document.getElementById('snake-score').textContent = score; placeFood(); }
    else snake.pop();
    draw();
  }

  function gameOver(){ stop();
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='white'; ctx.font = `${Math.floor(canvas.width*0.06)}px sans-serif`; ctx.textAlign='center'; ctx.fillText('Game Over', canvas.width/2, canvas.height/2 - 10);
    ctx.font = `${Math.floor(canvas.width*0.035)}px sans-serif`; ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 30);
  }

  function start(){ if(running) return; running=true; if(!loopId) loopId = setInterval(tick, speed); }
  function stop(){ running=false; if(loopId){ clearInterval(loopId); loopId=null; } }
  function reset(){ stop(); snake = [{x:9,y:9}]; dir = {x:1,y:0}; nextDir = dir; score=0; document.getElementById('snake-score').textContent = score; placeFood(); draw(); }

  // controls
  window.addEventListener('keydown', function(e){
    const k = e.key;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(k)){
      e.preventDefault();
      if(k==='ArrowUp' && dir.y!==1) nextDir = {x:0,y:-1};
      if(k==='ArrowDown' && dir.y!==-1) nextDir = {x:0,y:1};
      if(k==='ArrowLeft' && dir.x!==1) nextDir = {x:-1,y:0};
      if(k==='ArrowRight' && dir.x!==-1) nextDir = {x:1,y:0};
    }
    if(k===' '){ // space toggles
      e.preventDefault(); running ? stop() : start();
    }
    if(k==='F2'){ e.preventDefault(); reset(); start(); }
  });

  // buttons
  const scoreEl = document.getElementById('snake-score'); if(scoreEl) scoreEl.textContent = score;
  // initial placement
  placeFood(); draw();

  // start automatically for convenience
  start();
})();