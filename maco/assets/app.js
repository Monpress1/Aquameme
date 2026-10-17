(function(){
const C=window.CONFIG,CAT=window.CATALOG,DEMO=!C.API_BASE||!C.TREASURY;
const $=(s,r)=>(r||document).querySelector(s);
const short=a=>a?a.slice(0,6)+'…'+a.slice(-4):'';
const pad=h=>h.replace(/^0x/,'').toLowerCase().padStart(64,'0');
const hex=s=>'0x'+Array.from(new TextEncoder().encode(s)).map(b=>b.toString(16).padStart(2,'0')).join('');
function parseUnits(v,d){const p=String(v).split('.');return BigInt(p[0]+((p[1]||'').padEnd(d,'0').slice(0,d)))}
function fmt(b,d,mx){mx=mx==null?2:mx;let s=b.toString(),i,f='';if(d>0){s=s.padStart(d+1,'0');i=s.slice(0,-d);f=s.slice(-d).slice(0,mx).replace(/0+$/,'')}else i=s;return i.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(f?'.'+f:'')}
const fmtT=s=>{s=Math.max(0,Math.floor(s));const m=Math.floor(s/60),r=s%60;return m+':'+String(r).padStart(2,'0')};

/* ---------------- wallet ---------------- */
const W={addr:null,kind:null,prov:null,chain:null,wrong:false,raw:null,dec:C.MACO_DECIMALS,sym:C.MACO_SYMBOL,fn:[]};
W.on=f=>W.fn.push(f);W.emit=()=>W.fn.forEach(f=>{try{f(W)}catch(e){}});
W.req=(m,p)=>W.prov.request({method:m,params:p||[]});
W.bal=()=>W.raw==null?'—':fmt(W.raw,W.dec==null?18:W.dec,2);
async function afterConnect(a){W.addr=a;localStorage.setItem('maco_w',W.kind);await W.refresh();
  if(W.prov&&W.prov.on&&W.kind!=='demo'){W.prov.on('accountsChanged',x=>{if(!x.length)W.disconnect();else{W.addr=x[0];W.refresh()}});W.prov.on('chainChanged',()=>W.refresh())}}
const wcId=()=>C.WC_PROJECT_ID||localStorage.getItem('maco_wc_id')||'';
async function wcProvider(connect){const id=wcId();if(!id)throw new Error('NEEDS_WC_ID');
  let mod;for(const u of ['https://esm.sh/@walletconnect/ethereum-provider@2.17.0','https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.17.0/+esm']){try{mod=await import(u);break}catch(e){}}
  if(!mod||!mod.EthereumProvider)throw new Error('Could not load WalletConnect. Check your connection and try again.');
  const o={projectId:id,showQrModal:true,metadata:{name:'MACO Rush',description:'MACO Rush',url:location.origin,icons:[]}};
  if(C.CHAIN_ID){o.chains=[C.CHAIN_ID];if(C.RPC_URL)o.rpcMap={[C.CHAIN_ID]:C.RPC_URL}}else o.optionalChains=[1];
  const p=await mod.EthereumProvider.init(o);
  if(connect&&!(p.session&&p.accounts&&p.accounts.length))await p.connect();
  p.on('disconnect',()=>{if(W.kind==='wc')W.disconnect()});return p}
W.connect=async kind=>{
  W.kind=kind;
  if(kind==='demo'){W.addr=localStorage.getItem('maco_demo_addr')||('0x'+Array.from({length:40},()=>'0123456789abcdef'[Math.random()*16|0]).join(''));localStorage.setItem('maco_demo_addr',W.addr);W.raw=5000n*10n**18n;W.dec=18;await afterConnect(W.addr);return}
  if(kind==='wc')W.prov=await wcProvider(true);
  else{if(!window.ethereum)throw new Error('No wallet found. Open this page in your wallet app browser, or install MetaMask.');W.prov=window.ethereum}
  const a=await W.req('eth_requestAccounts');if(!a||!a.length)throw new Error('No account returned');await afterConnect(a[0])};
W.restore=async()=>{const k=localStorage.getItem('maco_w');if(!k)return;
  if(k==='demo'&&DEMO){await W.connect('demo');return}
  if(k==='wc'){try{W.kind='wc';const p=await wcProvider(false);if(p.session&&p.accounts&&p.accounts.length){W.prov=p;await afterConnect(p.accounts[0])}else W.kind=null}catch(e){W.kind=null}return}
  if(k==='injected'&&window.ethereum){try{W.kind='injected';W.prov=window.ethereum;const a=await W.req('eth_accounts');if(a&&a.length)await afterConnect(a[0]);else W.kind=null}catch(e){W.kind=null}}};
W.disconnect=()=>{try{if(W.kind==='wc'&&W.prov&&W.prov.disconnect)W.prov.disconnect()}catch(e){}W.addr=null;W.raw=null;W.kind=null;localStorage.removeItem('maco_w');sessionStorage.removeItem('maco_tok');W.emit()};
W.ensureChain=async()=>{if(!C.CHAIN_ID||W.kind==='demo')return true;const want='0x'+C.CHAIN_ID.toString(16);
  if(parseInt(await W.req('eth_chainId'),16)===C.CHAIN_ID)return true;
  try{await W.req('wallet_switchEthereumChain',[{chainId:want}])}catch(e){if(e.code===4902||/unrecognized|not added/i.test(e.message||'')){await W.req('wallet_addEthereumChain',[{chainId:want,chainName:C.CHAIN_NAME||'MACO network',rpcUrls:[C.RPC_URL],blockExplorerUrls:C.EXPLORER?[C.EXPLORER]:undefined,nativeCurrency:{name:'ETH',symbol:'ETH',decimals:18}}])}else throw e}
  await W.refresh();return !W.wrong};
W.refresh=async()=>{if(!W.addr)return;if(W.kind==='demo'){W.emit();return}
  try{W.chain=parseInt(await W.req('eth_chainId'),16);W.wrong=!!(C.CHAIN_ID&&W.chain!==C.CHAIN_ID);
    if(C.MACO_ADDRESS&&!W.wrong){if(W.dec==null){const d=await W.req('eth_call',[{to:C.MACO_ADDRESS,data:'0x313ce567'},'latest']);W.dec=parseInt(d,16)||18}
      const r=await W.req('eth_call',[{to:C.MACO_ADDRESS,data:'0x70a08231'+pad(W.addr)},'latest']);W.raw=BigInt(r&&r!=='0x'?r:'0x0')}}catch(e){console.warn(e)}
  W.emit()};
W.sign=async msg=>{if(W.kind==='demo')return '0xdemo';return W.req('personal_sign',[hex(msg),W.addr])};
W.pay=async amount=>{if(W.kind==='demo'||DEMO)return 'demo-'+Date.now();
  if(!await W.ensureChain())throw new Error('Wrong network');
  const raw=parseUnits(amount,W.dec==null?18:W.dec);if(W.raw!=null&&W.raw<raw)throw new Error('Not enough MACO');
  const hash=await W.req('eth_sendTransaction',[{from:W.addr,to:C.MACO_ADDRESS,data:'0xa9059cbb'+pad(C.TREASURY)+raw.toString(16).padStart(64,'0')}]);
  for(let i=0;i<90;i++){const r=await W.req('eth_getTransactionReceipt',[hash]);if(r){if(r.status==='0x1')break;throw new Error('Transaction failed')}await new Promise(r=>setTimeout(r,2000))}
  W.refresh();return hash};

/* ---------------- API (edge function contract; mock when DEMO) ---------------- */
const mk=()=>'maco_mock_'+(W.addr||'guest').toLowerCase();
const weekStart=()=>{const d=new Date(),t=Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate());return t-((new Date(t).getUTCDay()+6)%7)*864e5};
function mload(){let p;try{p=JSON.parse(localStorage.getItem(mk()))}catch(e){}
  if(!p)p={timeSec:C.FREE_SECONDS,keys:0,chars:['robot'],equipped:'robot',inv:{magnet:0,shield:0,nitro:0,x2:0,shoe:0,jet:0},boosts:{jet:false,fuel:0},best:{score:0,coins:0},tot:{coins:0},week:{id:0,score:0,coins:0}};
  const w=weekStart();if(p.week.id!==w)p.week={id:w,score:0,coins:0};return p}
const msave=p=>{try{localStorage.setItem(mk(),JSON.stringify(p))}catch(e){}};
function seeded(n,seed){let s=seed;const r=()=>(s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296;return Array.from({length:n},()=>{let a='0x';for(let i=0;i<40;i++)a+='0123456789abcdef'[r()*16|0];const q=r();return{address:a,coins:Math.floor(60+9000*q*q*q),score:Math.floor(4000+90000*q*q),wc:Math.floor(20+1400*r()*r()),ws:Math.floor(2000+30000*r()*r())}})}
function mock(path,b){const p=mload();let r={};
  switch(path){
    case 'nonce':return {nonce:Math.random().toString(36).slice(2)};
    case 'login':return {token:'demo'};
    case 'profile':break;
    case 'purchase':{const e=CAT.items.find(x=>x.id===b.id)||CAT.chars.find(x=>x.id===b.id);if(!e)throw new Error('Unknown item');
      if(b.kind==='char'){if(!p.chars.includes(e.id))p.chars.push(e.id)}else{const g=e.grant;if(g.keys)p.keys+=g.keys;if(g.minutes)p.timeSec+=g.minutes*60;if(g.inv)for(const k in g.inv)p.inv[k]=(p.inv[k]||0)+g.inv[k];if(g.boost){if(g.boost.jet)p.boosts.jet=true;if(g.boost.fuel)p.boosts.fuel=Math.max(p.boosts.fuel,g.boost.fuel)}}break}
    case 'equip':if(p.chars.includes(b.charId))p.equipped=b.charId;break;
    case 'consumeTime':p.timeSec=Math.max(0,p.timeSec-(b.sec||0));break;
    case 'useLoadout':(b.items||[]).forEach(k=>{if(p.inv[k]>0)p.inv[k]--});break;
    case 'useKey':if(p.keys>0)p.keys--;break;
    case 'submitRun':p.keys+=b.keys||0;p.tot.coins+=b.coins||0;p.week.coins+=b.coins||0;p.best.coins=Math.max(p.best.coins,b.coins||0);p.best.score=Math.max(p.best.score,b.score||0);p.week.score=Math.max(p.week.score,b.score||0);p.timeSec=Math.max(0,p.timeSec-(b.sec||0));break;
    case 'leaderboard':{const wk=b.period==='week',sc=b.metric==='score',list=seeded(30,wk?77:19).map(x=>({address:x.address,value:wk?(sc?x.ws:x.wc):(sc?x.score:x.coins)}));
      if(W.addr)list.push({address:W.addr,value:wk?(sc?p.week.score:p.week.coins):(sc?p.best.score:p.tot.coins),me:true});
      list.sort((a,c)=>c.value-a.value);list.forEach((x,i)=>x.rank=i+1);return {entries:list.slice(0,50),me:list.find(x=>x.me)||null,resetsAt:weekStart()+7*864e5}}
    default:throw new Error('Unknown endpoint')}
  msave(p);return p}
const API={async call(path,body){
  if(DEMO)return mock(path,body||{});
  const r=await fetch(C.API_BASE.replace(/\/$/,'')+'/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+(sessionStorage.getItem('maco_tok')||'')},body:JSON.stringify(Object.assign({address:W.addr},body||{}))});
  const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Request failed');return j}};

/* ---------------- UI helpers ---------------- */
function toast(m){let e=$('#toast');if(!e){e=document.createElement('div');e.id='toast';document.body.appendChild(e)}e.textContent=m;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,2200)}
function paintChip(){const e=$('#wchip');if(!e)return;e.innerHTML=W.addr?Icons.svg('mcoin',18)+'<b>'+W.bal()+'</b><i>'+short(W.addr)+'</i>':'Connect wallet'}
function header(){const h=document.createElement('header');h.className='top';h.innerHTML='<a class="brand" href="index.html">'+Icons.svg('mcoin',30)+'<b>MACO<span>RUSH</span></b></a><a class="wchip" id="wchip" href="connect.html"></a>';document.body.prepend(h);paintChip();
  if(DEMO){const d=document.createElement('div');d.className='demo';d.textContent='Demo mode: payments and progress are simulated in this browser until the treasury wallet and edge function are set in config.js.';h.after(d)}}
function nav(a){const n=document.createElement('nav');n.className='nav';const L=[['index.html','home','Home','home'],['characters.html','heroes','Heroes','heroes'],['game.html','play','','play'],['market.html','market','Market','market'],['leaderboard.html','rank','Ranks','rank']];
  n.innerHTML=L.map(l=>'<a href="'+l[0]+'" class="'+(l[1]==='play'?'play ':'')+(a===l[1]?'on':'')+'">'+Icons.nav(l[1])+(l[2]?'<span>'+l[2]+'</span>':'')+'</a>').join('');document.body.appendChild(n)}
function busy(msg){let m=$('#busy');if(!m){m=document.createElement('div');m.id='busy';m.className='modal';m.style.alignItems='center';document.body.appendChild(m)}m.innerHTML='<div class="card"><div class="spin"></div><b>'+msg+'</b></div>'}
function unbusy(){const m=$('#busy');if(m)m.remove()}
function confirmBuy(e,kind){return new Promise(res=>{const m=document.createElement('div');m.className='modal';
  const need=parseUnits(e.price,W.dec==null?18:W.dec),low=W.raw!=null&&W.raw<need,unk=W.raw==null&&!DEMO;
  m.innerHTML='<div class="card"><div>'+(kind==='char'?'<span class="rar '+e.rarity+'">'+e.rarity+'</span>':Icons.svg(e.icon,64))+'</div><h2>'+e.name+(e.qty?' '+e.qty:'')+'</h2><p class="m">'+(e.desc||'')+'</p><div class="ln"><span>Price</span><span class="price">'+Icons.svg('mcoin',18)+e.price+' MACO</span></div><div class="ln"><span>Your balance</span><span>'+W.bal()+' MACO</span></div>'+(low?'<p class="bad m">Not enough MACO.</p>':'')+(unk?'<p class="bad m">Switch to the right network on the Wallet page first.</p>':'')+'<button class="btn gold" id="cy"'+(low||unk?' disabled':'')+'>Pay '+e.price+' MACO</button><button class="btn alt" id="cn">Cancel</button></div>';
  document.body.appendChild(m);$('#cn',m).onclick=()=>{m.remove();res(false)};$('#cy',m).onclick=()=>{m.remove();res(true)}})}
async function buy(e,kind){
  if(!W.addr){location.href='connect.html?next='+encodeURIComponent(location.pathname.split('/').pop()||'index.html');return null}
  if(!await confirmBuy(e,kind))return null;
  try{busy('Confirm in your wallet…');const tx=await W.pay(e.price);busy('Verifying payment…');const r=await API.call('purchase',{id:e.id,kind:kind||'item',tx});unbusy();App.P=r;toast('Purchase complete');return r}
  catch(x){unbusy();toast(x&&x.code===4001?'Payment cancelled':(x&&x.message)||'Payment failed');return null}}
async function init(o){o=o||{};if(o.header!==false)header();if(o.nav!==false)nav(o.page);
  await W.restore();W.on(paintChip);paintChip();
  if(o.need&&!W.addr){location.replace('connect.html?next='+encodeURIComponent(location.pathname.split('/').pop()||'index.html'));return null}
  if(W.addr){try{App.P=await API.call('profile')}catch(e){toast(e.message)}}
  return App.P||null}
window.App={W,API,DEMO,wcId,init,toast,buy,short,fmt,fmtT,parseUnits,busy,unbusy,P:null};
})();
