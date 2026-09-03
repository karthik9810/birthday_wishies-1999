/* ---------- confetti ---------- */
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener('resize', resize);
let pieces = [];
const colors = ['#D94F6A','#C89B3C','#6E1B2B','#5C6B2E','#FBF3E7'];
function burst(x,y,count){
  for(let i=0;i<count;i++){
    pieces.push({
      x, y,
      vx:(Math.random()-0.5)*9,
      vy:Math.random()*-9 - 3,
      size:Math.random()*6+4,
      color:colors[Math.floor(Math.random()*colors.length)],
      rot:Math.random()*360,
      vr:(Math.random()-0.5)*10,
      life:0
    });
  }
}
function loop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  pieces.forEach(p=>{
    p.vy += 0.22; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
    ctx.save();
    ctx.translate(p.x,p.y);
    ctx.rotate(p.rot*Math.PI/180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
    ctx.restore();
  });
  pieces = pieces.filter(p=> p.y < canvas.height+40 && p.life < 260);
  requestAnimationFrame(loop);
}
loop();



/* ---------- heart tap game ---------- */
(function(){
  const field = document.getElementById('heart-field');
  const startBtn = document.getElementById('heart-start');
  const scoreEl = document.getElementById('heart-score');
  const timerEl = document.getElementById('heart-timer');
  const resultEl = document.getElementById('heart-result');
  let score = 0, timeLeft = 15, tickHandle, spawnHandle;

  function spawnHeart(){
    const btn = document.createElement('button');
    btn.className = 'heart-target';
    btn.textContent = ['\u2764\ufe0f','\ud83d\udc95','\ud83e\udd0d'][Math.floor(Math.random()*3)];
    const maxX = field.clientWidth - 40;
    const maxY = field.clientHeight - 40;
    btn.style.left = Math.max(0, Math.random()*maxX) + 'px';
    btn.style.top = Math.max(0, Math.random()*maxY) + 'px';
    btn.addEventListener('click', ()=>{
      score++;
      scoreEl.textContent = 'Score: ' + score;
      btn.remove();
      if(typeof burst === 'function'){
        const r = btn.getBoundingClientRect();
        burst(r.left, r.top + window.scrollY, 10);
      }
    });
    field.appendChild(btn);
    setTimeout(()=> btn.remove(), 1400);
  }

  function endGame(){
    clearInterval(tickHandle);
    clearInterval(spawnHandle);
    field.innerHTML = '';
    let msg;
    if(score >= 12) msg = "Score " + score + " &mdash; okay, you're basically a professional heart-catcher.";
    else if(score >= 6) msg = "Score " + score + " &mdash; not bad, kutty.";
    else msg = "Score " + score + " &mdash; play again? I know you want to beat that.";
    resultEl.innerHTML = msg + ' <br><button class="heart-start" id="heart-replay" style="margin-top:0.8rem;">Play again</button>';
    document.getElementById('heart-replay').addEventListener('click', startGame);
  }

  function startGame(){
    score = 0; timeLeft = 15;
    resultEl.textContent = '';
    scoreEl.textContent = 'Score: 0';
    timerEl.textContent = 'Time: 15';
    field.innerHTML = '';
    spawnHandle = setInterval(spawnHeart, 650);
    tickHandle = setInterval(()=>{
      timeLeft--;
      timerEl.textContent = 'Time: ' + timeLeft;
      if(timeLeft <= 0) endGame();
    }, 1000);
  }

  startBtn.addEventListener('click', startGame);
})();

/* ---------- flip-card matching game ---------- */
(function(){
  const facts = [
    { key:'books', icon:'&#128214;', line:"You once told me a good book ruins your sleep schedule and you still buy three more anyway. Never stop." },
    { key:'travel', icon:'&#9992;&#65039;', line:"Half-packed bags, last-minute tickets, zero regrets &mdash; that's very you, and I love it." },
    { key:'food', icon:'&#127858;', line:"You've tried food off my plate more times than off your own. I've made peace with it." },
    { key:'jewel', icon:'&#128142;', line:"Jimikki, bangles, that one ring you never take off &mdash; small details, big personality." },
    { key:'dad', icon:'&#128153;', line:"The first person you call with good news is your dad, and honestly, that says everything about your heart." }
  ];

  const grid = document.getElementById('flip-grid');
  const movesEl = document.getElementById('flip-moves');
  const foundEl = document.getElementById('flip-found');
  const linesEl = document.getElementById('flip-lines');

  let cards = [];
  facts.forEach(f=>{ cards.push({key:f.key, icon:f.icon}); cards.push({key:f.key, icon:f.icon}); });
  cards.sort(()=> Math.random() - 0.5);

  let moves = 0, matched = 0, first = null, lock = false;

  cards.forEach((c, i)=>{
    const btn = document.createElement('button');
    btn.className = 'flip-card';
    btn.dataset.key = c.key;
    btn.dataset.i = i;
    btn.innerHTML = '<span class="flip-inner"><span class="flip-back">&#10084;&#65039;</span><span class="flip-front">' + c.icon + '</span></span>';
    btn.addEventListener('click', ()=>{
      if(lock || btn.classList.contains('flipped') || btn.classList.contains('matched')) return;
      btn.classList.add('flipped');

      if(!first){
        first = btn;
        return;
      }

      moves++;
      movesEl.textContent = 'Moves: ' + moves;

      if(first.dataset.key === btn.dataset.key){
        first.classList.add('matched');
        btn.classList.add('matched');
        matched++;
        foundEl.textContent = 'Matched: ' + matched + ' / ' + facts.length;
        const fact = facts.find(f=> f.key === btn.dataset.key);
        const p = document.createElement('p');
        p.innerHTML = fact.line;
        linesEl.appendChild(p);
        if(typeof burst === 'function'){
          const r = btn.getBoundingClientRect();
          burst(r.left + r.width/2, r.top + window.scrollY, 16);
        }
        first = null;
      } else {
        lock = true;
        setTimeout(()=>{
          first.classList.remove('flipped');
          btn.classList.remove('flipped');
          first = null;
          lock = false;
        }, 700);
      }
    });
    grid.appendChild(btn);
  });
})();

/* ---------- this-or-that mini-game ---------- */
(function(){
  const qs = document.querySelectorAll('#tot-game .tot-q');
  const progressEl = document.getElementById('tot-progress');
  qs.forEach(()=>{ const i = document.createElement('i'); progressEl.appendChild(i); });
  const bars = progressEl.children;
  const resultEl = document.getElementById('tot-result');
  const resultText = document.getElementById('tot-result-text');
  let current = 0;
  const picks = [];

  const captions = {
    beach:"beach girl, no question", hills:"misty hill town over anything",
    book:"reads the book before the movie's even out", movie:"movie night over homework, every time",
    street:"lives for street food", fancy:"knows how to dress up for dinner",
    jimikki:"never says no to a new jimikki", saree:"a saree girl through and through",
    dad:"calls her dad first, and that's exactly who she is", me:"comes to you first, and you love that"
  };

  function showQ(i){
    qs.forEach(q=> q.classList.remove('active'));
    if(i < qs.length){ qs[i].classList.add('active'); }
  }

  qs.forEach((q, qi)=>{
    q.querySelectorAll('.tot-choices button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        picks.push(btn.dataset.tag);
        bars[qi].classList.add('done');
        if(typeof burst === 'function'){
          const r = btn.getBoundingClientRect();
          burst(r.left + r.width/2, r.top + window.scrollY, 12);
        }
        current++;
        if(current < qs.length){
          showQ(current);
        } else {
          qs.forEach(q2=> q2.classList.remove('active'));
          const lines = picks.map(p=> captions[p] || p).slice(0,3);
          resultText.textContent = "So far: " + lines.join(", ") + ". Honestly, tracks.";
          resultEl.classList.add('active');
        }
      });
    });
  });

  document.getElementById('tot-restart').addEventListener('click', ()=>{
    current = 0; picks.length = 0;
    Array.from(bars).forEach(b=> b.classList.remove('done'));
    resultEl.classList.remove('active');
    showQ(0);
  });
})();

/* ---------- cake / candles (isolated, self-contained) ---------- */
(function(){
  var candles = document.querySelectorAll('#cake-wrap .candle');
  var finalMsg = document.getElementById('final-msg');
  var blownCount = 0;

  function tryBurst(x, y, n){
    try{ if(typeof burst === 'function'){ burst(x, y, n); } }catch(e){}
  }

  candles.forEach(function(c){
    c.addEventListener('click', function(){
      if(c.classList.contains('out')) return;
      c.classList.add('out');
      blownCount++;
      var r = c.getBoundingClientRect();
      tryBurst(r.left + r.width/2, r.top + window.scrollY, 14);
      if(blownCount === candles.length){
        setTimeout(function(){
          finalMsg.classList.add('show');
          tryBurst(window.innerWidth/2, window.innerHeight*0.6, 80);
          setTimeout(function(){ tryBurst(window.innerWidth*0.3, window.innerHeight*0.55, 50); }, 200);
          setTimeout(function(){ tryBurst(window.innerWidth*0.7, window.innerHeight*0.55, 50); }, 400);
        }, 350);
      }
    });
  });
})();

/* ---------- song player (isolated, self-contained) ---------- */
(function(){
  try{
    var audio = document.getElementById('song-audio');
    var btn = document.getElementById('song-play-btn');
    var art = document.querySelector('.song-art');
    if(!audio || !btn) return;

    btn.addEventListener('click', function(){
      if(audio.paused){
        audio.play();
        btn.innerHTML = '&#10073;&#10073;';
        if(art) art.classList.add('playing');
      } else {
        audio.pause();
        btn.innerHTML = '&#9654;';
        if(art) art.classList.remove('playing');
      }
    });

    audio.addEventListener('ended', function(){
      btn.innerHTML = '&#9654;';
      if(art) art.classList.remove('playing');
    });
  }catch(e){}
})();

/* ---------- balloon blast (isolated, self-contained) ---------- */
(function(){
  try{
    var stage = document.getElementById('balloon-stage');
    var btn = document.getElementById('celebrate-btn');
    var wishes = document.getElementById('birthday-wishes');
    if(!stage || !btn) return;

    var colors = ['#D94F6A','#C89B3C','#6E1B2B','#5C6B2E','#e8a2ae'];

    function spawnBalloons(){
      var count = 16;
      for(var i=0;i<count;i++){
        (function(i){
          var b = document.createElement('div');
          b.className = 'balloon';
          b.style.background = colors[i % colors.length];
          b.style.left = (Math.random()*90) + '%';
          b.style.setProperty('--drift', (Math.random()*80 - 40) + 'px');
          b.style.setProperty('--rot', (Math.random()*16 - 8) + 'deg');
          b.style.animationDelay = (Math.random()*0.8) + 's';
          stage.appendChild(b);
          setTimeout(function(){ b.remove(); }, 4500);
        })(i);
      }
    }

    btn.addEventListener('click', function(){
      btn.classList.add('hide');
      stage.classList.add('blast');
      spawnBalloons();
      setTimeout(function(){
        wishes.classList.add('show');
        if(typeof burst === 'function'){
          burst(window.innerWidth/2, window.innerHeight*0.5, 90);
        }
      }, 500);
    });
  }catch(e){}
})();

/* ---------- time-together counter (isolated, self-contained) ---------- */
(function(){
  try{
    var startDate = new Date('2026-08-10T00:00:00');
    var dEl = document.getElementById('c-days');
    var hEl = document.getElementById('c-hours');
    var mEl = document.getElementById('c-mins');
    var sEl = document.getElementById('c-secs');
    if(!dEl) return;

    function tick(){
      var diff = Date.now() - startDate.getTime();
      if(diff < 0) diff = 0;
      var secs = Math.floor(diff / 1000);
      var days = Math.floor(secs / 86400);
      var hours = Math.floor((secs % 86400) / 3600);
      var mins = Math.floor((secs % 3600) / 60);
      var s = secs % 60;
      dEl.textContent = days;
      hEl.textContent = hours;
      mEl.textContent = mins;
      sEl.textContent = s;
    }
    tick();
    setInterval(tick, 1000);
  }catch(e){}
})();

/* ---------- mic blow-to-extinguish (isolated, self-contained) ---------- */
(function(){
  try{
    var micBtn = document.getElementById('mic-blow-btn');
    var candles = document.querySelectorAll('#cake-wrap .candle');
    if(!micBtn || !candles.length) return;

    var listening = false;
    var audioCtx, analyser, source, dataArray, rafId;

    function tryBurst(x, y, n){
      try{ if(typeof burst === 'function'){ burst(x, y, n); } }catch(e){}
    }

    function blowOutNext(){
      for(var i=0;i<candles.length;i++){
        if(!candles[i].classList.contains('out')){
          candles[i].click();
          return;
        }
      }
    }

    function checkVolume(){
      analyser.getByteFrequencyData(dataArray);
      var sum = 0;
      for(var i=0;i<dataArray.length;i++){ sum += dataArray[i]; }
      var avg = sum / dataArray.length;
      if(avg > 45){
        blowOutNext();
      }
      rafId = requestAnimationFrame(checkVolume);
    }

    function stopListening(){
      listening = false;
      micBtn.classList.remove('listening');
      micBtn.innerHTML = '&#127908; Blow into the mic';
      if(rafId) cancelAnimationFrame(rafId);
      if(audioCtx){ try{ audioCtx.close(); }catch(e){} }
    }

    micBtn.addEventListener('click', function(){
      if(listening){ stopListening(); return; }

      navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream){
        listening = true;
        micBtn.classList.add('listening');
        micBtn.innerHTML = '&#127908; Listening&hellip; blow now';

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        checkVolume();

        // auto-stop after 12s or once all candles are out
        setTimeout(function(){
          if(listening) stopListening();
          stream.getTracks().forEach(function(t){ t.stop(); });
        }, 12000);
      }).catch(function(){
        micBtn.innerHTML = 'Mic not available &mdash; tap the candles instead';
      });
    });
  }catch(e){}
})();

/* ---------- photo deck (isolated, self-contained) ---------- */
(function(){
  try{
    var wrap = document.getElementById('deck-wrap');
    if(!wrap) return;
    var cards = Array.prototype.slice.call(wrap.querySelectorAll('.deck-card'));
    var order = cards.map(function(c, i){ return i; });

    function render(){
      order.forEach(function(cardIndex, pos){
        cards[cardIndex].style.setProperty('--i', pos);
      });
    }

    cards.forEach(function(card){
      card.addEventListener('click', function(){
        if(order[0] !== cards.indexOf(card)) return; // only front card responds
        card.classList.add('sent-back');
        setTimeout(function(){
          order.push(order.shift());
          card.classList.remove('sent-back');
          render();
        }, 260);
      });
    });

    render();
  }catch(e){}
})();
