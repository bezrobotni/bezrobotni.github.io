// Minimal Tetris implementation (simplified)
(function(){
  const canvas = document.getElementById('tetris-canvas');
  const ctx = canvas.getContext('2d');
  const cols = 10, rows = 20, scale = 24;
  canvas.width = cols * scale; canvas.height = rows * scale;
  let board = Array.from({length:rows},()=>Array(cols).fill(0));
  const pieces = [
    [[1,1,1,1]], // I
    [[1,1],[1,1]], // O
    [[0,1,1],[1,1,0]], // S
    [[1,1,0],[0,1,1]], // Z
    [[1,0,0],[1,1,1]], // J
    [[0,0,1],[1,1,1]], // L
    [[0,1,0],[1,1,1]]  // T
  ];
  let cur = null, curX=3, curY=0, score=0, dropInterval=800, dropTimer=null, running=false;
  let best = parseInt(localStorage.getItem('tetris_best') || '0', 10);
  // show initial best if element exists
  if(document.getElementById('tetris-best')) document.getElementById('tetris-best').textContent = best;

  function randPiece(){ return JSON.parse(JSON.stringify(pieces[Math.floor(Math.random()*pieces.length)])); }
  function drawCell(x,y,c){ ctx.fillStyle = c? 'linear-gradient' : '#071026'; if(!c) return; ctx.fillStyle = '#7C5CFF'; ctx.fillRect(x*scale+1,y*scale+1,scale-2,scale-2); }

  function draw(){ ctx.clearRect(0,0,canvas.width,canvas.height); for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) drawCell(x,y,board[y][x]); if(cur){ for(let y=0;y<cur.length;y++) for(let x=0;x<cur[y].length;x++) if(cur[y][x]) drawCell(curX+x,curY+y,1); }
  }
  function collide(nx,ny,p){ for(let y=0;y<p.length;y++) for(let x=0;x<p[y].length;x++) if(p[y][x]){ let py=ny+y, px=nx+x; if(py>=rows||px<0||px>=cols) return true; if(py>=0 && board[py][px]) return true;} return false; }
  function merge(){ for(let y=0;y<cur.length;y++) for(let x=0;x<cur[y].length;x++) if(cur[y][x]) board[curY+y][curX+x]=1; }
  function rotate(p){ const H=p.length, W=p[0].length; let r=Array.from({length:W},()=>Array(H).fill(0)); for(let y=0;y<H;y++) for(let x=0;x<W;x++) r[x][H-1-y]=p[y][x]; return r; }
  function clearLines(){ let n=0; for(let y=rows-1;y>=0;y--){ if(board[y].every(v=>v)){ board.splice(y,1); board.unshift(Array(cols).fill(0)); n++; y++; }} if(n){ score += n*100; document.getElementById('tetris-score').textContent = score; // update best
      if(score > best){ best = score; localStorage.setItem('tetris_best', best); if(document.getElementById('tetris-best')) document.getElementById('tetris-best').textContent = best; } }}

  function spawn(){ cur = randPiece(); curX= Math.floor((cols - cur[0].length)/2); curY = -1; if(collide(curX,curY,cur)){ gameOver(); } }
  function drop(){ if(!running) return; if(!collide(curX,curY+1,cur)){ curY++; } else { merge(); clearLines(); spawn(); } draw(); }
  function gameLoop(){ drop(); }

  function start(){ if(running) return; running=true; if(!cur) spawn(); dropTimer = setInterval(gameLoop, dropInterval); }
  function pause(){ running=false; clearInterval(dropTimer); }
  function gameOver(){ pause(); // ensure best updated (already handled in clearLines, but check again)
    if(score > best){ best = score; localStorage.setItem('tetris_best', best); if(document.getElementById('tetris-best')) document.getElementById('tetris-best').textContent = best; }
    alert('Game over. Wynik: '+score); board = Array.from({length:rows},()=>Array(cols).fill(0)); score=0; document.getElementById('tetris-score').textContent=score; cur=null; draw(); }

  document.getElementById('tetris-start').addEventListener('click', ()=>{ start(); });
  document.getElementById('tetris-pause').addEventListener('click', ()=>{ running?pause():start(); });
  window.addEventListener('keydown', (e)=>{
    if(!cur) return; if(e.key==='ArrowLeft'){ if(!collide(curX-1,curY,cur)) curX--; }
    else if(e.key==='ArrowRight'){ if(!collide(curX+1,curY,cur)) curX++; }
    else if(e.key===' ') { // drop hard
      while(!collide(curX,curY+1,cur)) curY++; merge(); clearLines(); spawn(); }
    else if(e.key.toLowerCase()==='z'){ let r = rotate(cur); if(!collide(curX,curY,r)) cur = r; }
    draw();
  });

  // initial draw
  draw();
})();