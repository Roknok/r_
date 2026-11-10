(() => {
'use strict';
const START=200, MIN_BET=10, $=id=>document.getElementById(id);
let name='', balance=START, activeGame=null, selected={}, roundLock=false, ended=false, crashTimer=null, crashValue=1, crashPoint=1, crashRunning=false, supabase=null, bj=null, playerReady=false;
const ROULETTE_ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const ROULETTE_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
function rouletteColor(n){return n===0?'green':ROULETTE_RED.has(n)?'red':'black'}
function rouletteWheelSVG(){
 const cx=87,cy=87,r=81,step=360/ROULETTE_ORDER.length;
 return `<svg class="roulette-pockets" viewBox="0 0 174 174" aria-hidden="true">${ROULETTE_ORDER.map((n,i)=>{const a1=(-90+i*step)*Math.PI/180,a2=(-90+(i+1)*step)*Math.PI/180,am=(a1+a2)/2,x1=cx+r*Math.cos(a1),y1=cy+r*Math.sin(a1),x2=cx+r*Math.cos(a2),y2=cy+r*Math.sin(a2),tx=cx*1+(r-17)*Math.cos(am),ty=cy+(r-17)*Math.sin(am),rot=(am*180/Math.PI)+90,color=rouletteColor(n),fill=color==='red'?'#c83b32':color==='black'?'#202820':'#16834b';return `<path d="M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${fill}" stroke="#d8bd66" stroke-width=".8"/><text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" transform="rotate(${rot.toFixed(2)} ${tx.toFixed(2)} ${ty.toFixed(2)})" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="6.2" font-weight="700">${n}</text>`}).join('')}</svg>`;
}
const games=[
 {id:'roulette',name:'Roulette',desc:'Choose a colour. Spin for the win.',emoji:'🎡',tint:'#e8f6d6'},
 {id:'slots',name:'Slot Machine',desc:'Match symbols across the reels.',emoji:'🎰',tint:'#fff2b8'},
 {id:'blackjack',name:'Blackjack',desc:'Beat the dealer and reach 21.',emoji:'🃏',tint:'#e5f4d9'},
 {id:'dice',name:'Dice Duel',desc:'Call high or low.',emoji:'🎲',tint:'#fff0b3'},
 {id:'coin',name:'Coin Flip',desc:'Heads or tails. Pick a side.',emoji:'🪙',tint:'#e6f4d5'},
 {id:'crash',name:'Crash',desc:'Cash out before it crashes.',emoji:'📈',tint:'#fff0b3'},
 {id:'lucky',name:'Lucky Number',desc:'Guess the hidden number.',emoji:'🎯',tint:'#e8f6d6'}
];
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2300)}
function sleep(ms){return new Promise(resolve=>setTimeout(resolve,ms))}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function setBalance(v){balance=Math.max(0,Math.floor(v));$('balance').textContent=balance.toLocaleString('en-IN')}
function renderGrid(){$('game-grid').innerHTML=games.map(g=>`<button class="game-card" data-game="${g.id}" style="--tint:${g.tint}"><span class="game-emoji">${g.emoji}</span><strong>${g.name}</strong><span>${g.desc}</span></button>`).join('');document.querySelectorAll('.game-card').forEach(b=>b.onclick=()=>openGame(b.dataset.game))}
function openGame(id){if(ended||balance<MIN_BET)return finishRun(true);activeGame=id;selected={};$('game-grid').classList.add('hidden');$('play-area').classList.remove('hidden');$('game-tag').textContent=id.toUpperCase();renderGame();showGameIntro(id)}
function back(){if(roundLock||crashRunning){toast('Finish the current round before leaving.');return}stopCrash();activeGame=null;$('play-area').classList.add('hidden');$('game-grid').classList.remove('hidden')}
function title(t,s){return `<div class="game-panel"><h2 class="game-title">${t}</h2><p class="game-sub">${s}</p>`}
function betField(){return `<div class="bet-row"><label for="bet">BET</label><input id="bet" class="bet-input" type="number" min="${MIN_BET}" max="${balance}" step="1" value="${Math.min(10,balance)}"><span class="small-note">Minimum 10 · Balance ${balance}</span></div>`}
function bet(){const n=Number($('bet')?.value);if(!Number.isInteger(n)||n<MIN_BET||n>balance){toast(`Bet must be between 10 and ${balance} coins.`);return null}return n}
function result(msg,win){$('game-result').innerHTML=msg;$('game-result').className='game-result '+(win?'positive':'negative')}
async function finishRound(wager,payout,msg,win){
 const net=payout-wager;setBalance(balance+net);result(msg,net>=0);roundLock=true;
 await saveBalance();
 if($('play'))$('play').disabled=false;
 $('outcome-amount').textContent=`${net>0?'+':''}${net.toLocaleString('en-IN')} coins`;
 $('outcome-amount').className='outcome-amount '+(net>0?'win':net<0?'loss':'even');
 $('outcome-detail').textContent=`${msg} · Balance: ${balance.toLocaleString('en-IN')} coins`;
 $('outcome-continue').textContent=balance<MIN_BET?'View leaderboard':'Continue playing';
 $('outcome-modal').classList.remove('hidden');
 $('outcome-card').classList.remove('win-pop','loss-shake');void $('outcome-card').offsetWidth;$('outcome-card').classList.add(net>=0?'win-pop':'loss-shake');
 }
function showGameIntro(id){
 const g=games.find(x=>x.id===id);const tips={
 roulette:'Choose red, black, or green. Red and black pay 2× your bet; green pays 14×.',
 slots:'Spin three reels. Three matching symbols pay 5× (7s pay 10×); two matching symbols pay 2×.',
 blackjack:'Deal two cards, then hit or stand. Beat the dealer without going over 21. A tie returns your bet.',
 dice:'Choose low (1–3) or high (4–6). A correct call pays 2× your bet.',
 coin:'Choose heads or tails. A correct call pays 2× your bet.',
 crash:'Start the multiplier and cash out before it crashes. If it crashes first, you lose your bet.',
 lucky:'Pick one number from 1 to 10. An exact guess pays 8× your bet.'};
 $('intro-title').textContent=g.name;$('intro-description').textContent=tips[id];$('intro-modal').classList.remove('hidden');
 }
function renderGame(){
 stopCrash();const area=$('game-content');
 if(activeGame==='roulette')area.innerHTML=title('Roulette','Choose red, black, or green. Red and black pay 1:1; green pays 14:1.')+`<div class="roulette-stage"><div class="roulette-pointer"></div><div class="roulette-wheel" id="wheel">${rouletteWheelSVG()}<div class="wheel-center" id="wheel-number">?</div></div></div>${betField()}<div class="choice-row" id="choices"><button class="choice selected" data-choice="red">Red</button><button class="choice" data-choice="black">Black</button><button class="choice" data-choice="green">Green</button></div><button class="primary game-action" id="play">SPIN THE WHEEL</button><div id="game-result" class="game-result"></div></div>`;
 if(activeGame==='slots')area.innerHTML=title('Slot Machine','Three matching symbols win. Two matching symbols return 2×.')+`<div class="slot-machine"><div class="slot-reels"><div class="reel" id="r1">🍒</div><div class="reel" id="r2">⭐</div><div class="reel" id="r3">🍋</div></div><div class="slot-light"></div></div>${betField()}<button class="primary game-action" id="play">SPIN REELS</button><div id="game-result" class="game-result"></div></div>`;
 if(activeGame==='coin')area.innerHTML=title('Coin Flip','Pick a side. Correct guesses return 2× your bet.')+`<div class="coin-stage"><div class="coin-disc" id="coin-face">?</div></div>${betField()}<div class="choice-row" id="choices"><button class="choice selected" data-choice="Heads">Heads</button><button class="choice" data-choice="Tails">Tails</button></div><button class="primary game-action" id="play">FLIP COIN</button><div id="game-result" class="game-result"></div></div>`;
 if(activeGame==='dice')area.innerHTML=title('Dice Duel','Choose high (4–6) or low (1–3). Correct calls return 2×.')+`<div class="dice-stage"><div class="dice-face" id="dice-face">⚄</div></div>${betField()}<div class="choice-row" id="choices"><button class="choice selected" data-choice="low">Low · 1–3</button><button class="choice" data-choice="high">High · 4–6</button></div><button class="primary game-action" id="play">ROLL DICE</button><div id="game-result" class="game-result"></div></div>`;
 if(activeGame==='lucky')area.innerHTML=title('Lucky Number','Guess the hidden number from 1 to 10. Exact guesses pay 8×.')+`<div class="lucky-orb" id="lucky-face">?</div>${betField()}<div class="choice-row number-choices" id="choices">${Array.from({length:10},(_,i)=>`<button class="choice ${i===4?'selected':''}" data-choice="${i+1}">${i+1}</button>`).join('')}</div><button class="primary game-action" id="play">REVEAL NUMBER</button><div id="game-result" class="game-result"></div></div>`;
 if(activeGame==='blackjack')area.innerHTML=title('Blackjack','Get closer to 21 than the dealer. Blackjack pays 2.5×; a win pays 2×; a tie returns your bet.')+`<div class="table-felt"><div class="hand-label">YOUR HAND</div><div class="cards" id="player-cards"></div><div id="player-total" class="hand-total"></div><div class="hand-label dealer-label">DEALER</div><div class="cards" id="dealer-cards"></div><div id="dealer-total" class="hand-total"></div></div>${betField()}<div class="choice-row"><button class="primary" id="deal">DEAL</button><button class="choice" id="hit" disabled>HIT</button><button class="choice" id="stand" disabled>STAND</button></div><div id="game-result" class="game-result"></div></div>`;
 if(activeGame==='crash')area.innerHTML=title('Crash','Start a round, then cash out before the multiplier crashes.')+`<div class="crash-stage"><div class="crash-mult" id="multiplier">1.00×</div><div class="crash-track"><div class="crash-line" id="crash-line"></div></div></div>${betField()}<div class="crash-controls"><button class="primary game-action" id="start-crash">START ROUND</button><button class="choice" id="cash-crash" disabled>CASH OUT</button></div><div id="game-result" class="game-result"></div><p class="small-note">The crash point is random and hidden until the round ends.</p></div>`;
 if(['roulette','coin','dice','lucky'].includes(activeGame))wireChoices();
 if($('play'))$('play').onclick=playSimple;if($('deal'))$('deal').onclick=deal;if($('hit'))$('hit').onclick=hit;if($('stand'))$('stand').onclick=stand;if($('start-crash'))$('start-crash').onclick=startCrash;if($('cash-crash'))$('cash-crash').onclick=cashCrash;
}
function wireChoices(){document.querySelectorAll('#choices .choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('#choices .choice').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected.choice=b.dataset.choice})}
async function playSimple(){
 if(roundLock||ended)return;const wager=bet();if(!wager)return;roundLock=true;$('play').disabled=true;
 if(activeGame==='roulette'){
  const wheel=$('wheel'),pockets=wheel.querySelector('.roulette-pockets');
  const n=Math.floor(Math.random()*37),index=ROULETTE_ORDER.indexOf(n),step=360/ROULETTE_ORDER.length;
  const pocketCenter=-90+(index+.5)*step;
  const targetRotation=360*5-pocketCenter;
  const color=rouletteColor(n),choice=selected.choice||'red';
  pockets.style.transition='transform 2.6s cubic-bezier(.10,.72,.12,1)';
  pockets.style.transform=`rotate(${targetRotation}deg)`;
  await sleep(2700);
  $('wheel-number').textContent=n;
  $('wheel-number').style.background=color==='red'?'#c83b32':color==='black'?'#202820':'#16834b';
  const payout=choice===color?wager*(color==='green'?14:2):0;
  await finishRound(wager,payout,`The ball landed on ${n} (${color}). ${payout?`You won ${payout-wager} coins!`:'You lost your bet.'}`,!!payout);return
 }
 if(activeGame==='slots'){
  const symbols=['🍒','⭐','🍋','🔔','7️⃣','🍀'],reels=[$('r1'),$('r2'),$('r3')];
  const r=Array.from({length:3},()=>symbols[Math.floor(Math.random()*symbols.length)]);
  const timers=reels.map((el,i)=>{el.classList.add('spinning');return setInterval(()=>{el.textContent=symbols[Math.floor(Math.random()*symbols.length)]},65+i*12)});
  for(let i=0;i<reels.length;i++){
   await sleep(650);
   clearInterval(timers[i]);reels[i].textContent=r[i];reels[i].classList.remove('spinning');reels[i].classList.add('reveal');
  }
  await sleep(350);reels.forEach(el=>el.classList.remove('reveal'));
  let payout=0;if(r.every(x=>x===r[0]))payout=wager*(r[0]==='7️⃣'?10:5);else if(new Set(r).size===2)payout=wager*2;
  await finishRound(wager,payout,`${r.join('  ')} — ${payout?`Payout ${payout} coins!`:'No match. Better luck next spin.'}`,payout>0);return
 }
 if(activeGame==='coin'){
  const face=$('coin-face'),side=Math.random()<.5?'Heads':'Tails',choice=selected.choice||'Heads';
  face.classList.add('flipping');await sleep(1120);face.classList.remove('flipping');
  face.textContent=side==='Heads'?'H':'T';face.classList.add('reveal');
  const payout=side===choice?wager*2:0;await finishRound(wager,payout,`${side}! ${payout?'You called it.':'Not this time.'}`,!!payout);return
 }
 if(activeGame==='dice'){
  const face=$('dice-face'),n=1+Math.floor(Math.random()*6),choice=selected.choice||'low';
  face.classList.add('rolling');await sleep(840);face.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][n-1];
  face.classList.remove('rolling');face.classList.add('reveal');
  const win=choice==='high'?n>=4:n<=3,payout=win?wager*2:0;await finishRound(wager,payout,`You rolled ${n}. ${win?'Correct call!':'Wrong call.'}`,win);return
 }
 if(activeGame==='lucky'){
  const face=$('lucky-face'),n=1+Math.floor(Math.random()*10),choice=Number(selected.choice||5);
  face.classList.add('revealing');await sleep(950);face.textContent=n;
  face.classList.remove('revealing');face.classList.add('reveal');
  const payout=n===choice?wager*8:0;await finishRound(wager,payout,`The number was ${n}. ${payout?'Perfect guess!':'Not quite.'}`,!!payout);return
 }
}
const deck=()=>{const suits=['♠','♥','♦','♣'],ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'],d=[];for(const s of suits)for(const r of ranks)d.push({s,r});return d.sort(()=>Math.random()-.5)};
function cardVal(c){return c.r==='A'?11:['K','Q','J'].includes(c.r)?10:Number(c.r)}
function total(hand){let t=hand.reduce((a,c)=>a+cardVal(c),0),aces=hand.filter(c=>c.r==='A').length;while(t>21&&aces-- >0)t-=10;return t}
function draw(hand,id){$(id).innerHTML=hand.map(c=>`<div class="playing-card ${['♥','♦'].includes(c.s)?'red':'black'}">${c.r}${c.s}</div>`).join('')}
function drawDealerHidden(hand){$('dealer-cards').innerHTML=hand.map((c,i)=>i===1?'<div class="playing-card card-back" aria-label="Hidden card">?</div>':`<div class="playing-card ${['♥','♦'].includes(c.s)?'red':'black'}">${c.r}${c.s}</div>`).join('')}
async function deal(){if(roundLock||ended)return;const wager=bet();if(!wager)return;roundLock=true;bj={wager,d:deck(),p:[],h:[],done:false};bj.p.push(bj.d.pop(),bj.d.pop());bj.h.push(bj.d.pop(),bj.d.pop());draw(bj.p,'player-cards');drawDealerHidden(bj.h);$('player-total').textContent=total(bj.p);$('dealer-total').textContent='Hidden';$('hit').disabled=$('stand').disabled=false;$('deal').disabled=true;if(total(bj.p)===21)await settleBJ()}
async function hit(){if(!bj||bj.done)return;bj.p.push(bj.d.pop());draw(bj.p,'player-cards');$('player-total').textContent=total(bj.p);if(total(bj.p)>=21)await settleBJ()}
async function stand(){if(!bj||bj.done)return;while(total(bj.h)<17)bj.h.push(bj.d.pop());await settleBJ()}
async function settleBJ(){if(!bj||bj.done)return;bj.done=true;while(total(bj.h)<17)bj.h.push(bj.d.pop());draw(bj.h,'dealer-cards');$('dealer-total').textContent=total(bj.h);$('hit').disabled=$('stand').disabled=true;$('deal').disabled=false;const p=total(bj.p),d=total(bj.h);let payout=0,msg='';const playerNatural=bj.p.length===2&&p===21,dealerNatural=bj.h.length===2&&d===21;if(playerNatural&&dealerNatural){payout=bj.wager;msg='Both you and the dealer have blackjack. Push — your bet is returned.'}else if(playerNatural){payout=Math.floor(bj.wager*2.5);msg='Blackjack!'}else if(dealerNatural)msg='The dealer has blackjack.';else if(p>21)msg='Bust! You went over 21.';else if(d>21||p>d){payout=bj.wager*2;msg='You beat the dealer!'}else if(p===d){payout=bj.wager;msg='Push — your bet is returned.'}else msg='The dealer wins.';await finishRound(bj.wager,payout,`${msg} Dealer: ${d}, you: ${p}.`,payout>=bj.wager);bj=null}
function startCrash(){if(crashRunning||ended||roundLock)return;const wager=bet();if(!wager)return;roundLock=true;crashRunning=true;crashValue=1;const r=Math.random();crashPoint=Math.max(1.05,Math.min(12,Math.floor((1/(1-r))*100)/100));$('start-crash').disabled=true;$('cash-crash').disabled=false;$('game-result').textContent='';$('crash-line').classList.add('rising');crashTimer=setInterval(()=>{crashValue+=.01+crashValue*.008;$('multiplier').textContent=crashValue.toFixed(2)+'×';$('crash-line').style.width=Math.min(100,(crashValue-1)*12)+'%';if(crashValue>=crashPoint){crashValue=crashPoint;$('multiplier').textContent=crashPoint.toFixed(2)+'×';$('crash-line').style.width=Math.min(100,(crashPoint-1)*12)+'%';crashNow()}},90);selected.crashBet=wager}
async function crashNow(){if(!crashRunning)return;stopCrash();$('multiplier').classList.add('boom');$('multiplier').textContent='CRASH';$('cash-crash').disabled=true;$('start-crash').disabled=false;const wager=selected.crashBet;await finishRound(wager,0,`Crashed at ${crashPoint.toFixed(2)}×. Your bet is gone.`,false)}
async function cashCrash(){if(!crashRunning)return;const wager=selected.crashBet,payout=Math.floor(wager*crashValue);stopCrash();$('cash-crash').disabled=true;$('start-crash').disabled=false;await finishRound(wager,payout,`Cashed out at ${crashValue.toFixed(2)}× — payout ${payout} coins!`,true)}
function stopCrash(){if(crashTimer)clearInterval(crashTimer);crashTimer=null;crashRunning=false;if($('crash-line'))$('crash-line').classList.remove('rising')}
async function finishRun(lost=false){
 if(ended)return;ended=true;stopCrash();
 $('game-screen').classList.add('hidden');$('entry-screen').classList.add('hidden');$('locked-screen').classList.remove('hidden');
 $('locked-message').textContent=lost?'Your balance fell below 10 coins. Your run is over for today.':'Your score has been submitted. You can return tomorrow.';
 try{if(!await saveBalance())throw new Error('Your latest balance has not been saved. Please check your connection and try again.');const {error}=await supabase.rpc('finish_player_run',{p_score:balance});if(error)throw error;}
 catch(e){ended=false;$('locked-screen').classList.add('hidden');$('game-screen').classList.remove('hidden');console.error('Could not finish run:',e);toast('Could not save your run: '+(e.message||e));}
 await loadLeaderboard();
}
let backendError='';
async function saveBalance(){
 if(!supabase||!playerReady)return false;
 try{const {error}=await supabase.rpc('save_player_balance',{p_balance:balance});if(error)throw error;return true;}
 catch(e){console.error('Balance save failed:',e);toast('Balance could not be saved. Please check your connection.');return false;}
}
async function loadLeaderboard(){
 let rows=[],remote=false;
 if(!supabase){backendError='Supabase client is not available.'}
 else{try{const {data,error}=await supabase.from('leaderboard').select('player_name,score').order('score',{ascending:false}).limit(10);if(error)throw error;rows=data||[];remote=true;backendError=''}catch(e){backendError=e?.message||String(e);console.error('Supabase leaderboard read failed:',e)}}
 const note=remote?'Connected to Supabase · Global scores.':`GLOBAL LEADERBOARD UNAVAILABLE: ${backendError}`;
 const html=remote?(rows.length?rows.map((r,i)=>`<div class="leader-row"><span class="rank ${i===0?'first':''}">${i+1}</span><span class="leader-name">${escapeHTML(r.player_name)}</span><span class="leader-score">${Number(r.score).toLocaleString('en-IN')} coins</span></div>`).join(''):'<div class="loading">No global scores yet. Be the first!</div>'):'<div class="loading error-note">Could not load global scores. See the message below.</div>';
 ['leaderboard-list','locked-leaderboard-list'].forEach(id=>{if($(id))$(id).innerHTML=html});
 ['leaderboard-note','locked-leaderboard-note'].forEach(id=>{if($(id))$(id).textContent=note});
}
function showEntry(){ $('entry-screen').classList.remove('hidden');$('game-screen').classList.add('hidden');$('locked-screen').classList.add('hidden'); }
function showGame(){ $('entry-screen').classList.add('hidden');$('locked-screen').classList.add('hidden');$('game-screen').classList.remove('hidden');$('player-label').textContent=name;$('player-name').value=name;$('balance').textContent=balance.toLocaleString('en-IN');renderGrid(); }
function hydratePlayer(row){
 name=row.player_name;balance=Number(row.balance);playerReady=true;ended=!!row.is_locked;setBalance(balance);
 if(row.daily_bonus_awarded)toast('Welcome back! 100 daily coins have been added.');
 if(ended)showLocked();else showGame();
}
async function enter(){
 const v=$('player-name').value.trim();if(v.length<2)return;
 const btn=$('entry-form').querySelector('button[type="submit"]');btn.disabled=true;$('entry-error').textContent='Creating your player…';
 try{
  const {data,error}=await supabase.rpc('register_player',{p_name:v});if(error)throw error;
  const row=Array.isArray(data)?data[0]:data;if(!row)throw new Error('Could not create player profile.');
  $('entry-error').textContent='';hydratePlayer(row);await loadLeaderboard();
 }catch(e){console.error('Player registration failed:',e);$('entry-error').textContent=(e.message||'Could not register.').toLowerCase().includes('taken')?'That name is already taken. Please choose another.':(e.message||'Could not register. Please try again.');}
 finally{btn.disabled=false;}
}
function showLocked(){ended=true;$('entry-screen').classList.add('hidden');$('game-screen').classList.add('hidden');$('locked-screen').classList.remove('hidden');$('locked-message').textContent='You have already completed your run today. Your balance will carry over, and you will receive 100 coins when you return on a new day.';loadLeaderboard();}
async function boot(){
 if(!supabase){showEntry();$('entry-error').textContent='Supabase is unavailable. Please refresh in a moment.';return;}
 try{
  let {data:{session},error}=await supabase.auth.getSession();if(error)throw error;
  if(!session){const signed=await supabase.auth.signInAnonymously();if(signed.error)throw signed.error;}
  const {data,error:stateError}=await supabase.rpc('get_player_state');if(stateError)throw stateError;
  const row=Array.isArray(data)?data[0]:data;
  if(row)hydratePlayer(row);else showEntry();
  await loadLeaderboard();
 }catch(e){console.error('Player startup failed:',e);showEntry();$('entry-error').textContent='Could not connect to player accounts: '+(e.message||e)+'. Enable Anonymous Sign-Ins in Supabase.';}
}
$('entry-form').addEventListener('submit',e=>{e.preventDefault();enter()});
$('cashout-top').onclick=()=>{if(roundLock||crashRunning){toast('Finish the current round before cashing out.');return}if(balance<MIN_BET)return finishRun(true);if(confirm(`Cash out with ${balance} coins? This ends your run for today.`))finishRun(false)};
$('back-games').onclick=back;

$('intro-start').onclick=()=>{$('intro-modal').classList.add('hidden')};
$('outcome-continue').onclick=()=>{$('outcome-modal').classList.add('hidden');roundLock=false;if(balance<MIN_BET)finishRun(true)};
const cfg=window.LUCKY_CONFIG||{};if(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&window.supabase){try{supabase=window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})}catch(e){backendError=e.message;console.error(e)}}else{backendError='Missing Supabase URL, publishable key, or Supabase JavaScript library.'}
boot();
})();
