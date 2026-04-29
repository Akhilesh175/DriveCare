
/* ============================================================
   DriveCare — Mechanic On Demand  |  script.js
   Production-ready JavaScript · Modular · Clean state mgmt
   ============================================================ */

'use strict';
// ── Storage (persistent sessions) ──
const DB={get:k=>{try{return JSON.parse(localStorage.getItem('dc8_'+k));}catch(e){return null;}},set:(k,v)=>localStorage.setItem('dc8_'+k,JSON.stringify(v)),del:k=>localStorage.removeItem('dc8_'+k)};

// ── App State ──
let S={
  user:null,role:'user',
  vehicle:'Bike',vehicleIcon:'🏍️',
  service:'Puncture',serviceIcon:'🔩',servicePrice:'₹149',serviceFee:100,
  mech:{name:'Ramesh Kumar',icon:'🧰',bg:'#1e293b',dist:'1.2 km',eta:'8',rating:'4.9',id:'DC-M-001'},
  payMethod:'upi',selectedRating:0,
  etaTimer:null,etaVal:8,
  pendingOtp:null,pendingPhone:null,pendingRole:null,
  callTimer:null,callSecs:0,muted:false,speaker:false,
  pinBuf:[],pinStep:'first',pinConfBuf:[],pinMode:null,
  mechOnline:true,
  activeJob:null,
  svcCompletedByMech:false,
  activeMechId:null,      // mechId of the assigned mechanic — shared flag key
  payTiming:'now',        // 'now' = pay at booking | 'after' = pay after service
  paymentDone:false,      // tracks whether payment has been completed
  depAmt:0,selUpiApp:null,depTab:'apps',
  commRate:0.20,
  bankOk:false,
  // GPS & Tracking
  userLat:null,userLng:null,userLocStr:'Detecting…',
  trkActive:false,trkMode:'ws',
  trkUpdates:0,trkSpeed:0,
  mechLat:27.4924,mechLng:77.6737,
  userGpsLat:null,userGpsLng:null,
  trkTimer:null,etaTrkTimer:null,
  wsTimer:null,pollTimer:null,drTimer:null,animTimer:null,
  // Dead reckoning
  drLat:0,drLng:0,drHeading:0,drSpeed:0,drLastT:0,
  // Canvas
  ctx:null,canvasW:0,canvasH:0,
  // Simulated mechanic route (lat/lng offsets from user)
  routeWps:[],wpIdx:0,
  mechMarkerLat:0,mechMarkerLng:0,
  targetLat:0,targetLng:0,
  // UPI validation
  upiInValid:false,
  upiOvValid:false
};

const STAR_LABELS={1:'Poor',2:'Average',3:'Good',4:'Best',5:'Excellent'};

// ── Vehicle Selection Wizard State (declared here so boot IIFE can safely call vsRender) ──
let VS={
  selectedBrand:null, selectedCategory:null, selectedModel:null, vehicleNumber:null, vehicleNumberSkipped:false, selectedProblem:null,
  // internal extras kept for booking compat
  problemIcon:null, problemPrice:null, problemFee:null
};

// ══════════════════════════════════════════════════════
// VEHICLE SELECTION WIZARD DATA — must be above boot IIFE
// so vsRender() can reference them when boot calls vsRender()
// ══════════════════════════════════════════════════════
const VS_BRANDS=[
  // Each logo is a small inline SVG — a coloured circle with initials,
  // matching the brand's real colour identity.
  {
    id:'tata', name:'Tata',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#003399"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#fff">T</text>
    </svg>`
  },
  {
    id:'mahindra', name:'Mahindra',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#C0392B"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" font-weight="700" fill="#fff">M</text>
    </svg>`
  },
  {
    id:'hyundai', name:'Hyundai',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#002C5F"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="14" font-weight="700" fill="#fff">H</text>
    </svg>`
  },
  {
    id:'maruti', name:'Maruti',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#E8272B"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff">MS</text>
    </svg>`
  },
  {
    id:'honda', name:'Honda',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#CC0000"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff">H</text>
    </svg>`
  },
  {
    id:'toyota', name:'Toyota',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#EB0A1E"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">TOY</text>
    </svg>`
  },
  {
    id:'suzuki', name:'Suzuki',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#1A1A2E"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff">S</text>
    </svg>`
  },
  {
    id:'bajaj', name:'Bajaj',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#002147"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff">B</text>
    </svg>`
  },
  {
    id:'hero', name:'Hero',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#009A44"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff">H</text>
    </svg>`
  },
  {
    id:'tvs', name:'TVS',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#E31837"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">TVS</text>
    </svg>`
  },
  {
    id:'royalenfield', name:'Royal Enfield',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#3B2314"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#C9A84C">RE</text>
    </svg>`
  },
  {
    id:'yamaha', name:'Yamaha',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#0A0A0A"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">YMH</text>
    </svg>`
  },
  {
    id:'kia', name:'Kia',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#05141F"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#fff">KIA</text>
    </svg>`
  },
  {
    id:'renault', name:'Renault',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#EFDF00"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="#000">R</text>
    </svg>`
  },
  {
    id:'ktm', name:'KTM',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#FF6B00"/>
      <text x="18" y="23" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">KTM</text>
    </svg>`
  },
  {
    id:'other', name:'Other',
    logo:`<svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="#52525e"/>
      <text x="18" y="26" text-anchor="middle" font-family="Arial,sans-serif" font-size="20">🚗</text>
    </svg>`
  },
];
const VS_CATEGORIES={
  tata:        [{id:'Car',ic:'🚗'},{id:'Truck',ic:'🚚'},{id:'SUV',ic:'🛻'}],
  mahindra:    [{id:'Car',ic:'🚗'},{id:'SUV',ic:'🛻'},{id:'Tractor',ic:'🚜'}],
  hyundai:     [{id:'Car',ic:'🚗'},{id:'SUV',ic:'🛻'}],
  maruti:      [{id:'Car',ic:'🚗'},{id:'SUV',ic:'🛻'}],
  honda:       [{id:'Bike',ic:'🏍️'},{id:'Scooter',ic:'🛵'},{id:'Car',ic:'🚗'}],
  toyota:      [{id:'Car',ic:'🚗'},{id:'SUV',ic:'🛻'}],
  suzuki:      [{id:'Bike',ic:'🏍️'},{id:'Car',ic:'🚗'}],
  bajaj:       [{id:'Bike',ic:'🏍️'},{id:'Auto',ic:'🛺'}],
  hero:        [{id:'Bike',ic:'🏍️'},{id:'Scooter',ic:'🛵'}],
  tvs:         [{id:'Bike',ic:'🏍️'},{id:'Scooter',ic:'🛵'}],
  royalenfield:[{id:'Bike',ic:'🏍️'}],
  yamaha:      [{id:'Bike',ic:'🏍️'},{id:'Scooter',ic:'🛵'}],
  kia:         [{id:'Car',ic:'🚗'},{id:'SUV',ic:'🛻'}],
  renault:     [{id:'Car',ic:'🚗'},{id:'SUV',ic:'🛻'}],
  ktm:         [{id:'Bike',ic:'🏍️'}],
  other:       [{id:'Bike',ic:'🏍️'},{id:'Car',ic:'🚗'},{id:'Truck',ic:'🚚'},{id:'Tractor',ic:'🚜'}],
};
const VS_MODELS={
  tata:        {Car:['Nexon','Punch','Altroz','Tiago','Tigor','Harrier','Safari'],Truck:['Prima','Ultra','Ace','LPT 407','1109'],SUV:['Harrier','Safari','Nexon EV','Punch EV','Sierra']},
  mahindra:    {Car:['Bolero','KUV100','Verito'],SUV:['Scorpio','Thar','XUV700','XUV300','BE6','Scorpio N','Alturas G4'],Tractor:['265 DI','575 DI','Arjun 605','Novo 605','Yuvo 575']},
  hyundai:     {Car:['i10','i20','Aura','Verna','Grand i10 Nios','Elantra'],SUV:['Creta','Venue','Alcazar','Tucson','Exter','Ioniq 5']},
  maruti:      {Car:['Alto','WagonR','Swift','Dzire','Baleno','Ertiga','Celerio','S-Presso','Ciaz'],SUV:['Brezza','Grand Vitara','Jimny','Fronx']},
  honda:       {Bike:['Shine','Hornet','SP125','CB300R','CB350','Unicorn'],Scooter:['Activa','Dio','Grazia','Activa 125'],Car:['City','Amaze','Jazz','Elevate','WR-V']},
  toyota:      {Car:['Glanza','Yaris','Camry'],SUV:['Fortuner','Innova','Urban Cruiser','Hyryder','Land Cruiser','Hilux']},
  suzuki:      {Bike:['Gixxer','Hayabusa','Intruder','V-Strom','V-Strom SX'],Car:['Celerio','Swift','Baleno','Ignis']},
  bajaj:       {Bike:['Pulsar','Platina','CT100','Avenger','Dominar','Chetak EV','Pulsar RS200','NS200'],Auto:['RE Compact','Maxima','RE E-Tec']},
  hero:        {Bike:['Splendor','HF Deluxe','Passion','Xtreme','Glamour','Karizma XMR','Xpulse 200'],Scooter:['Maestro','Destini','Pleasure','Vida V1']},
  tvs:         {Bike:['Apache','Star City','Radeon','Ronin','Raider','Apache RR310'],Scooter:['Jupiter','Ntorq','iQube','Zest','Scooty Pep+']},
  royalenfield:{Bike:['Classic 350','Bullet 350','Meteor 350','Himalayan','Hunter 350','Super Meteor 650','Continental GT 650','Interceptor 650']},
  yamaha:      {Bike:['FZ','R15','MT-15','FZS','Saluto','FZ-X','R3'],Scooter:['Fascino','Ray ZR','Aerox']},
  kia:         {Car:['Sonet','Seltos','Carens'],SUV:['Carnival','EV6','EV9']},
  renault:     {Car:['Kwid','Triber'],SUV:['Kiger','Duster','Captur']},
  ktm:         {Bike:['Duke 125','Duke 200','Duke 390','RC 200','RC 390','Adventure 390','Adventure 250']},
  other:       {Bike:['Other Bike','Harley Davidson','Kawasaki'],Car:['Other Car','Mercedes','BMW','Audi'],Truck:['Other Truck','Eicher','Ashok Leyland'],Tractor:['Other Tractor','Sonalika','John Deere']},
};

const VS_SERVICES={
  Bike:[
    {ic:'🔩',name:'Puncture',      sub:'Tyre repair & change',  price:'₹149',fee:100,pop:true},
    {ic:'🔋',name:'Battery dead',  sub:'Jump-start or replace', price:'₹199',fee:150},
    {ic:'⛽',name:'Out of fuel',   sub:'Emergency refill',      price:'₹149',fee:100},
    {ic:'🔧',name:'Engine issue',  sub:'General breakdown',     price:'₹349',fee:300},
    {ic:'💡',name:'Lights/Wiring', sub:'Electrical fault',      price:'₹249',fee:200},
  ],
  Scooter:[
    {ic:'🔩',name:'Puncture',      sub:'Tyre repair & change',  price:'₹149',fee:100,pop:true},
    {ic:'🔋',name:'Battery dead',  sub:'Jump-start or replace', price:'₹199',fee:150},
    {ic:'⛽',name:'Out of fuel',   sub:'Emergency refill',      price:'₹149',fee:100},
    {ic:'🔧',name:'Engine issue',  sub:'General breakdown',     price:'₹299',fee:250},
  ],
  Car:[
    {ic:'🔩',name:'Puncture',      sub:'Tyre repair & change',  price:'₹199',fee:150,pop:true},
    {ic:'🔋',name:'Battery dead',  sub:'Jump-start or replace', price:'₹299',fee:250},
    {ic:'⛽',name:'Out of fuel',   sub:'Emergency refill',      price:'₹199',fee:150},
    {ic:'🔧',name:'Engine issue',  sub:'General breakdown',     price:'₹499',fee:450},
    {ic:'❄️',name:'AC issue',      sub:'Cooling system fault',  price:'₹599',fee:500},
    {ic:'💡',name:'Lights/Wiring', sub:'Electrical fault',      price:'₹299',fee:250},
  ],
  SUV:[
    {ic:'🔩',name:'Puncture',      sub:'Tyre repair & change',  price:'₹249',fee:200,pop:true},
    {ic:'🔋',name:'Battery dead',  sub:'Jump-start or replace', price:'₹349',fee:300},
    {ic:'⛽',name:'Out of fuel',   sub:'Emergency refill',      price:'₹199',fee:150},
    {ic:'🔧',name:'Engine issue',  sub:'General breakdown',     price:'₹599',fee:550},
    {ic:'❄️',name:'AC issue',      sub:'Cooling system fault',  price:'₹699',fee:600},
    {ic:'💡',name:'Lights/Wiring', sub:'Electrical fault',      price:'₹349',fee:300},
  ],
  Truck:[
    {ic:'🔩',name:'Puncture',      sub:'Tyre repair & change',  price:'₹399',fee:350,pop:true},
    {ic:'🔋',name:'Battery dead',  sub:'Jump-start or replace', price:'₹499',fee:450},
    {ic:'⛽',name:'Out of fuel',   sub:'Emergency refill',      price:'₹299',fee:250},
    {ic:'🔧',name:'Engine issue',  sub:'General breakdown',     price:'₹799',fee:700},
  ],
  Tractor:[
    {ic:'🔩',name:'Puncture',      sub:'Tyre repair & change',  price:'₹349',fee:300,pop:true},
    {ic:'🔧',name:'Engine issue',  sub:'General breakdown',     price:'₹699',fee:600},
    {ic:'⛽',name:'Out of fuel',   sub:'Emergency refill',      price:'₹249',fee:200},
    {ic:'🔌',name:'Hydraulics',    sub:'Hydraulic system fault',price:'₹799',fee:700},
  ],
  Auto:[
    {ic:'🔩',name:'Puncture',      sub:'Tyre repair & change',  price:'₹149',fee:100,pop:true},
    {ic:'🔋',name:'Battery dead',  sub:'Jump-start or replace', price:'₹199',fee:150},
    {ic:'⛽',name:'Out of fuel',   sub:'Emergency refill',      price:'₹149',fee:100},
    {ic:'🔧',name:'Engine issue',  sub:'General breakdown',     price:'₹349',fee:300},
  ],
};
const VS_SVC_DEFAULT=VS_SERVICES.Car;
const VS_TABS=[
  {id:'brand',    label:'Brand',   icon:'🏭'},
  {id:'category', label:'Type',    icon:'🚗'},
  {id:'model',    label:'Model',   icon:'🔖'},
  {id:'vehNum',   label:'Number',  icon:'🔢'},
  {id:'problem',  label:'Problem', icon:'🔧'},
  {id:'summary',  label:'Book',    icon:'✅'},
];

// toast timer — declared here so it's initialized before boot IIFE runs
let _tt;

// ── UPI VALIDATION ──
// Valid UPI patterns (real-world): name@bank, phone@bank, etc.
const UPI_REGEX=/^[a-zA-Z0-9._\-]{3,}@[a-zA-Z]{3,}$/;
function isValidUpi(v){return UPI_REGEX.test(v.trim());}
function getUpiBank(v){
  const parts=v.trim().split('@');if(parts.length!==2)return null;
  const banks={paytm:'Paytm Payments Bank',oksbi:'SBI',okicici:'ICICI Bank',okaxis:'Axis Bank',okhdfc:'HDFC Bank',ybl:'Yes Bank',upi:'NPCI UPI',ibl:'IDFC First Bank',apl:'Amazon Pay',axl:'Axis Bank',idfbr:'IDFC First Bank',timecosmos:'Equitas Bank',waicici:'ICICI Bank',wahdfcbank:'HDFC Bank',gpay:'Google Pay',razorpay:'Razorpay'};
  const handle=parts[1].toLowerCase();
  return banks[handle]||('VPA: '+parts[1]);
}
function liveUpiCheck(el){
  const v=el.value.trim();const badge=document.getElementById('upiInBadge');
  if(!v){badge.style.display='none';S.upiInValid=false;return;}
  if(isValidUpi(v)){
    const bk=getUpiBank(v);badge.className='upi-valid-badge ok';badge.textContent='✓ Valid UPI · '+(bk||v.split('@')[1]);badge.style.display='flex';S.upiInValid=true;
  } else {
    badge.className='upi-valid-badge err';badge.textContent='✗ Invalid format — use name@bank';badge.style.display='flex';S.upiInValid=false;
  }
}
function validateUpiOv(el){
  const v=el.value.trim();const badge=document.getElementById('upiOvBadge');
  if(!v){badge.style.display='none';S.upiOvValid=false;return;}
  if(isValidUpi(v)){badge.className='upi-valid-badge ok';badge.textContent='✓ Valid UPI';badge.style.display='flex';S.upiOvValid=true;}
  else{badge.className='upi-valid-badge err';badge.textContent='✗ Invalid — use name@bank';badge.style.display='flex';S.upiOvValid=false;}
}
function liveDepUpi(el){
  const v=el.value.trim();const badge=document.getElementById('depUpiBadge');
  if(!v){badge.style.display='none';return;}
  if(isValidUpi(v)){const bk=getUpiBank(v);badge.className='upi-valid-badge ok';badge.textContent='✓ Valid · '+(bk||v.split('@')[1]);badge.style.display='flex';}
  else{badge.className='upi-valid-badge err';badge.textContent='✗ Invalid UPI format';badge.style.display='flex';}
}

// ── BOOT (persist across refresh) ──
function initApp(){
  const saved=DB.get('currentUser');
  if(saved){
    const users=DB.get('users')||{};const d=getDigits(saved.phone);
    if(users[d]){
      S.user=users[d];S.role=S.user.role||'user';
      applyUser();
      if(S.role==='mechanic'){
        // Restore mechanic active job from svcComplete flag in localStorage
        _restoreMechJob();
        if(!restoreSession()){
          refreshMechDash();showScreen('mechHome');
        }
      } else {
        // User: try to restore session (wizard / booking / tracking)
        if(!restoreSession()){
          _resetWizardAndJobState();
          showScreen('home');
        }
      }
    } else showScreen('auth');
  } else showScreen('auth');
  vsRender();
  setTimeout(requestGPS,1000);
}

/** Restore mechanic's active job from localStorage svcComplete flag */
function _restoreMechJob(){
  if(!S.user||!S.user.mechId)return;
  const flag=DB.get('svcComplete_mech_'+S.user.mechId);
  if(flag&&flag.jobId&&flag.mechId===S.user.mechId){
    // Rebuild S.activeJob from the flag + user history
    const hist=(S.user.history||[]).find(h=>h.jobId===flag.jobId);
    if(hist){
      S.activeJob={
        jobId:flag.jobId,
        service:flag.service||hist.service,
        serviceIcon:hist.serviceIcon||'🔧',
        vehicle:flag.vehicle||hist.vehicle,
        userName:flag.userName||hist.userName||'User',
        price:flag.price||hist.price||'₹0',
        net:hist.netEarned||0,
        brandId:flag.brandId||hist.brandId,
        brandName:hist.brandName||'',
        brandLogo:hist.brandLogo||'🚗',
        reqId:hist.reqId||''
      };
      S.svcCompletedByMech=flag.complete===true;
    }
  }
}

// ── GPS / Location ──
function requestGPS(){
  // Update bar to show we're trying
  S.userLocStr='Detecting location…';
  updateLocBar();

  if(!navigator.geolocation){
    _applyFallbackLocation(false);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    // ── Success ──
    function(pos){
      S.userLat=pos.coords.latitude;
      S.userLng=pos.coords.longitude;
      S.userGpsLat=S.userLat;
      S.userGpsLng=S.userLng;
      S.userLocStr='Lat: '+S.userLat.toFixed(4)+' · Lng: '+S.userLng.toFixed(4);
      updateLocBar();
      // Set mechanic start ~1.2km north of user
      S.mechLat=S.userLat+0.011;S.mechLng=S.userLng;
      S.mechMarkerLat=S.mechLat;S.mechMarkerLng=S.mechLng;
      buildRoute();
    },
    // ── Error — silent fallback, no intrusive popup ──
    function(err){
      // err.code: 1=PERMISSION_DENIED, 2=UNAVAILABLE, 3=TIMEOUT
      _applyFallbackLocation(true);
    },
    {enableHighAccuracy:true,timeout:8000,maximumAge:30000}
  );
}

// Apply default location coordinates silently.
// showIndicator=true adds a subtle ● on the loc bar instead of a toast.
function _applyFallbackLocation(showIndicator){
  S.userLat=27.4924;S.userLng=77.6737;
  S.userGpsLat=S.userLat;S.userGpsLng=S.userLng;
  S.userLocStr='NH-2 Highway, Mathura';
  S.mechLat=S.userLat+0.011;S.mechLng=S.userLng;
  S.mechMarkerLat=S.mechLat;S.mechMarkerLng=S.mechLng;
  buildRoute();
  // Show subtle indicator on the loc bar text — no full-screen toast
  const locEl=document.getElementById('locText');
  if(locEl){
    locEl.textContent=S.userLocStr;
    if(showIndicator){
      locEl.style.color='var(--tx3)';
      locEl.title='Using approximate location. Tap to try GPS again.';
    }
  }
}
function updateLocBar(){
  const el=document.getElementById('locText');
  if(!el)return;
  el.textContent=S.userLocStr;
  // Reset fallback colour styling when called from GPS success
  el.style.color='';
  el.title='';
}
function buildRoute(){
  // Build waypoints from mechanic to user
  S.routeWps=[];const steps=6;
  for(let i=0;i<=steps;i++){const t=i/steps;S.routeWps.push({lat:S.mechLat+(S.userLat-S.mechLat)*t,lng:S.mechLng+(S.userLng-S.mechLng)*t});}
  S.wpIdx=0;S.targetLat=S.mechLat;S.targetLng=S.mechLng;
}

// ── Screens ──
function showScreen(id){
  if(window.reactNavigate){
    window.reactNavigate(id);
  }
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el=document.getElementById(id);
  if(el){el.classList.add('active');const sb=el.querySelector('.sb');if(sb)sb.scrollTop=0;}
  // Home resets wizard + deletes session; all other screens save their id
  if(id==='home'){_resetWizardAndJobState();vsRender();DB.del('session');}
  else if(id==='mechHome'){DB.del('session');}
  else if(id==='adminLogin'||id==='adminPortal'){/* admin screens - no session */}
  else{saveSession(id);}
}
function toast(m){const el=document.getElementById('toast');el.textContent=m;el.style.display='block';clearTimeout(_tt);_tt=setTimeout(()=>el.style.display='none',2800);}
function openOv(id){document.getElementById(id).classList.add('open');}
function closeOv(id){document.getElementById(id).classList.remove('open');}
function showTab(t){
  const m={
    home:()=>{_resetWizardAndJobState();showScreen(S.role==='mechanic'?'mechHome':'home');_syncSidebarActive(S.role==='mechanic'?'sdash':'shome');},
    userHistory:()=>{renderUserHistory();showScreen('userHistory');_syncSidebarActive('shistory');},
    userProfile:()=>{renderUserProfile();showScreen('userProfile');_syncSidebarActive('sprofile');},
    userWallet:()=>{renderUserWallet();showScreen('userWallet');_syncSidebarActive('swallet');},
    userPrivacy:()=>{showScreen('userPrivacy');_syncSidebarActive('sprivacy');},
    userHelp:()=>{showScreen('userHelp');_syncSidebarActive('shelp');},
    mechProfile:()=>{renderMechProfile();showScreen('mechProfile');_syncSidebarActive('smprofile');},
    mechPrivacy:()=>showScreen('mechPrivacy'),
    mechHelp:()=>showScreen('mechHelp')
  };
  if(m[t])m[t]();
}
function showMechTab(t){
  if(t==='home'){refreshMechDash();showScreen('mechHome');_syncSidebarActive('sdash');}
  else if(t==='svcComplete'){renderMechSvcComplete();showScreen('mechSvcComplete');const av=document.getElementById('mechSvcAv');if(av&&S.user)av.textContent=S.user.initials||'?';_syncSidebarActive('ssvc');}
  else if(t==='history'){renderMechHistory();showScreen('mechHistory');_syncSidebarActive('smhist');}
  else if(t==='earnings'){renderMechEarnings();showScreen('mechEarningsScreen');_syncSidebarActive('smearn');}
}

// ── Phone helpers ──
function fmtPhone(el) {
  let val = el.value;
  if (val.startsWith('+91 ')) val = val.substring(4);
  else if (val.startsWith('+91')) val = val.substring(3);
  else if (val.startsWith('+9')) val = val.substring(2);
  else if (val.startsWith('+')) val = val.substring(1);
  
  let digits = val.replace(/\D/g, '');
  
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  
  if (digits.length > 10) digits = digits.slice(0, 10);
  
  el.value = digits.length ? '+91 ' + digits : '';

  // Reset OTP sections and errors if user edits the phone number
  if (el.id === 'loginPhone') {
    const err = document.getElementById('loginPhErr');
    if (err) err.style.display = 'none';
    el.classList.remove('err');
    const wrap = document.getElementById('loginOtpWrap');
    const btn = document.getElementById('loginOtpBtn');
    if (wrap && wrap.style.display === 'block') {
      wrap.style.display = 'none';
      if (btn) btn.style.display = 'block';
      S.pendingOtp = null;
    }
  } else if (el.id === 'regPhone') {
    const err = document.getElementById('regPhErr');
    if (err) err.style.display = 'none';
    el.classList.remove('err');
    const wrap = document.getElementById('regOtpWrap');
    const btn = document.getElementById('regOtpBtn');
    if (wrap && wrap.style.display === 'block') {
      wrap.style.display = 'none';
      if (btn) btn.style.display = 'block';
      S.pendingOtp = null;
    }
  } else if (el.id === 'cpNewPhone') {
    const err = document.getElementById('cpPhErr');
    if (err) err.style.display = 'none';
    el.classList.remove('err');
  }
}
function validPhone(el){
  const d = getDigits(el.value);
  return d.length === 10 && /^[6-9]/.test(d);
}
function getDigits(val){
  const v = (val || '').replace(/\D/g, '');
  if (v.length === 12 && v.startsWith('91')) return v.slice(2);
  return v;
}
function genOtp(){return String(Math.floor(1000+Math.random()*9000));}
function on(el,i,pfx){if(el.value.length===1){el.classList.add('filled');if(i<3)document.getElementById(pfx+(i+1)).focus();}}
function ob(e,i,pfx){if(e.key==='Backspace'){document.getElementById(pfx+i).classList.remove('filled');if(i>0&&!document.getElementById(pfx+i).value)document.getElementById(pfx+(i-1)).focus();}}
function getOtp(pfx){return[0,1,2,3].map(i=>document.getElementById(pfx+i).value).join('');}
function clearOtp(pfx){[0,1,2,3].forEach(i=>{const el=document.getElementById(pfx+i);if(el){el.value='';el.classList.remove('filled');}});}

// ── Bank validation ──
function validateBank(){
  const acc=document.getElementById('bankAcc').value.replace(/\D/g,'');
  const conf=document.getElementById('bankAccConf').value.replace(/\D/g,'');
  const ifsc=document.getElementById('bankIfsc').value.toUpperCase().trim();
  const aErr=document.getElementById('bankAccErr');const cErr=document.getElementById('bankAccConfErr');const iErr=document.getElementById('bankIfscErr');
  const st=document.getElementById('bankStatusEl');
  let ok=true;
  if(acc.length<9||acc.length>18){document.getElementById('bankAcc').classList.add('err');aErr.style.display='block';ok=false;}else{document.getElementById('bankAcc').classList.remove('err');aErr.style.display='none';}
  if(conf&&acc!==conf){document.getElementById('bankAccConf').classList.add('err');cErr.style.display='block';ok=false;}else{document.getElementById('bankAccConf').classList.remove('err');cErr.style.display='none';}
  const ifscOk=/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
  if(ifsc.length>0&&!ifscOk){document.getElementById('bankIfsc').classList.add('err');iErr.style.display='block';ok=false;}else{document.getElementById('bankIfsc').classList.remove('err');iErr.style.display='none';}
  if(acc.length>=9&&acc===conf&&ifscOk){
    const banks={SBIN:'SBI',HDFC:'HDFC Bank',ICIC:'ICICI Bank',PUNB:'PNB',BARB:'Bank of Baroda',UTIB:'Axis Bank',KKBK:'Kotak Bank',YESB:'Yes Bank',BKID:'Bank of India',IDFB:'IDFC First'};
    const bname=banks[ifsc.slice(0,4)]||'Indian Bank';
    st.style.display='block';st.className='bank-status valid';st.innerHTML='✅ Verified · '+bname+' · IFSC: '+ifsc;
    S.bankOk=true;
  } else if(acc||ifsc){st.style.display='none';S.bankOk=false;}
  return ok&&S.bankOk;
}

// ── AUTH ──
function switchAuthTab(t){document.querySelectorAll('.auth-tab').forEach((el,i)=>el.classList.toggle('active',(i===0&&t==='login')||(i===1&&t==='register')));document.getElementById('loginPanel').classList.toggle('active',t==='login');document.getElementById('registerPanel').classList.toggle('active',t==='register');}
let selectedRole=null;
function selRole(r){
  selectedRole=r;
  document.getElementById('roleUser').className='role-card'+(r==='user'?' sel-user':'');
  document.getElementById('roleMech').className='role-card'+(r==='mechanic'?' sel-mech':'');
  document.getElementById('mechFields').style.display=r==='mechanic'?'block':'none';
  document.getElementById('regRoleErr').style.display='none';
  if(r==='mechanic') renderBrandPicker();
}

// Renders the brand multi-select grid inside mechanic registration
function renderBrandPicker(){
  const grid=document.getElementById('brandPickerGrid');
  if(!grid||grid.dataset.built==='1')return; // only build once
  grid.dataset.built='1';
  grid.innerHTML=VS_BRANDS.map(b=>`
    <div class="brand-pick-card" id="bp-${b.id}" onclick="toggleBrandPick('${b.id}')">
      <div class="bp-chk">✓</div>
      <div class="bp-logo">${b.logo}</div>
      <div class="bp-name">${b.name}</div>
    </div>`).join('');
}

// Toggle a brand card selected/deselected
function toggleBrandPick(id){
  const card=document.getElementById('bp-'+id);
  if(!card)return;
  card.classList.toggle('picked');
  document.getElementById('brandPickErr').style.display='none';
}

// Return array of selected brand ids from the picker
function getPickedBrands(){
  return VS_BRANDS.map(b=>b.id).filter(id=>{
    const c=document.getElementById('bp-'+id);
    return c&&c.classList.contains('picked');
  });
}

function genMechId(){return 'DC-M-'+Date.now();}
function genUserId(){return 'DC-U-'+Date.now();}

function sendLoginOtp(){
  const el=document.getElementById('loginPhone'),err=document.getElementById('loginPhErr');
  if(!validPhone(el)){el.classList.add('err');err.style.display='block';return;}
  el.classList.remove('err');err.style.display='none';
  const digits=getDigits(el.value),users=DB.get('users')||{};
  if(!users[digits]){toast('📵 No account with this number. Please register.');setTimeout(()=>switchAuthTab('register'),900);return;}
  S.pendingOtp=genOtp();S.pendingPhone=digits;
  document.getElementById('loginOtpMsg').textContent='📱 OTP sent to '+el.value+' (demo: '+S.pendingOtp+')';
  document.getElementById('loginOtpWrap').style.display='block';document.getElementById('loginOtpBtn').style.display='none';
  clearOtp('lo');document.getElementById('lo0').focus();
}
function verifyLoginOtp(){
  const entered=getOtp('lo'),err=document.getElementById('loginOtpErr');
  if(entered!==S.pendingOtp){err.style.display='block';clearOtp('lo');document.getElementById('lo0').focus();return;}
  err.style.display='none';
  
  const finishLogin = (u) => {
    if(!u){toast('❌ User not found');return;}
    S.user=u;S.role=u.role||'user';DB.set('currentUser',{phone:u.phone});DB.set('user',S.user);
    // Also update local users cache
    const localUsers = DB.get('users') || {};
    localUsers[u.phone] = u;
    DB.set('users', localUsers);

    applyUser();
    if(typeof adminAddLog==='function')adminAddLog('login',`🔑 ${S.role==='mechanic'?'Mechanic':'User'} login: ${u.name} (${u.phone})`);
    toast('👋 Welcome back, '+u.name+'!');
    showScreen(S.role==='mechanic'?'mechHome':'home');
    if(S.role==='mechanic')refreshMechDash();
  };

  // 1. Try Supabase first
  if (window.supabase && typeof window.supabase.from === 'function' && !window.supabase.isDummy) {
    window.supabase.from('profiles').select('*').eq('phone', S.pendingPhone).single().then(({ data, error }) => {
      if (data) {
        finishLogin(data);
      } else {
        // Fallback to local
        const u=(DB.get('users')||{})[S.pendingPhone];
        finishLogin(u);
      }
    });
  } else {
    // 2. Fallback to local
    const u=(DB.get('users')||{})[S.pendingPhone];
    finishLogin(u);
  }
}
function resendOtp(){S.pendingOtp=genOtp();document.getElementById('loginOtpMsg').textContent='📱 New OTP: '+S.pendingOtp;toast('📱 OTP resent!');clearOtp('lo');document.getElementById('lo0').focus();}

function sendRegOtp(){
  if(!selectedRole){document.getElementById('regRoleErr').style.display='block';return;}
  const nameEl=document.getElementById('regName'),phoneEl=document.getElementById('regPhone');
  const ne=document.getElementById('regNameErr'),pe=document.getElementById('regPhErr');
  let ok=true;
  if(!nameEl.value.trim()){nameEl.classList.add('err');ne.style.display='block';ok=false;}else{nameEl.classList.remove('err');ne.style.display='none';}
  if(!validPhone(phoneEl)){phoneEl.classList.add('err');pe.textContent='Enter your own valid 10-digit Indian mobile number';pe.style.display='block';ok=false;}else{phoneEl.classList.remove('err');pe.style.display='none';}
  if(selectedRole==='mechanic'){
    const acc=document.getElementById('bankAcc').value.replace(/\D/g,'');
    const conf=document.getElementById('bankAccConf').value.replace(/\D/g,'');
    const ifsc=document.getElementById('bankIfsc').value.toUpperCase().trim();
    if(acc.length<9||acc!==conf||!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc)){
      toast('⚠️ Provide valid bank account number and IFSC code for payouts.');ok=false;
    }
    // Validate at least one brand selected
    if(getPickedBrands().length===0){
      document.getElementById('brandPickErr').style.display='block';ok=false;
    }
  }
  if(!ok)return;
  const digits=getDigits(phoneEl.value),users=DB.get('users')||{};
  if(users[digits]){phoneEl.classList.add('err');pe.textContent='This number is already registered. Please login.';pe.style.display='block';setTimeout(()=>switchAuthTab('login'),1000);return;}
  S.pendingOtp=genOtp();S.pendingPhone=digits;S.pendingRole=selectedRole;
  document.getElementById('regOtpMsg').textContent='📱 OTP sent to '+phoneEl.value+' (demo: '+S.pendingOtp+')';
  document.getElementById('regOtpWrap').style.display='block';document.getElementById('regOtpBtn').style.display='none';
  clearOtp('ro');document.getElementById('ro0').focus();
}
function verifyRegOtp(){
  const entered=getOtp('ro'),err=document.getElementById('regOtpErr');
  if(entered!==S.pendingOtp){err.style.display='block';clearOtp('ro');document.getElementById('ro0').focus();return;}
  err.style.display='none';
  const name=document.getElementById('regName').value.trim();
  const phone=document.getElementById('regPhone').value;
  const city=document.getElementById('regCity').value.trim()||'—';
  const initials=name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const role=S.pendingRole||'user';
  let u={name,phone,city,initials,role,history:[],createdAt:Date.now()};
  if(role==='mechanic'){
    const acc=document.getElementById('bankAcc').value.replace(/\D/g,'');
    const ifsc=document.getElementById('bankIfsc').value.toUpperCase().trim();
    u.mechId=genMechId();u.shopName=document.getElementById('shopName').value.trim()||name+' Auto Works';
    u.specialization=document.getElementById('specialization').value||'All vehicle types';
    u.experience=(document.getElementById('experience').value||'1')+' years';
    u.preferredBrands=getPickedBrands(); // e.g. ['tata','honda','hero']
    u.bankAccMasked='xxxx'+acc.slice(-4);u.bankAccFull=acc;u.bankIfsc=ifsc;
    u.grossEarnings=0;u.paidOut=0;u.payouts=[];u.online=true;
  } else {u.userId=genUserId();}
  const users=DB.get('users')||{};users[S.pendingPhone]=u;DB.set('users',users);
  
  // ── Sync Profile to Supabase ──
  if (window.supabase && typeof window.supabase.from === 'function' && !window.supabase.isDummy) {
    window.supabase.from('profiles').insert([u]).then(({ error }) => {
      if (error) console.error('Supabase profile save error:', error);
    });
  }

  S.user=u;S.role=role;
  DB.del('session'); // Clear old session on new registration
  DB.set('currentUser',{phone:u.phone});DB.set('user',S.user);
  applyUser();if(typeof adminAddLog==='function')adminAddLog('login',`🆕 New ${role} registered: ${name} (${phone})`);toast('🎉 Account created! Welcome, '+name+'!');
  showScreen(role==='mechanic'?'mechHome':'home');if(role==='mechanic')refreshMechDash();
}
function demoLogin(role){
  const key=role==='mechanic'?'9000000001':'9876543210';const users=DB.get('users')||{};
  if(!users[key]){
    if(role==='user')users[key]={name:'Demo User',phone:'+91 9876543210',city:'Mathura',initials:'DU',role:'user',userId:'DC-U-001',history:[{service:'Puncture',serviceIcon:'🔩',vehicle:'Bike',mechName:'Ramesh Kumar',mechId:'DC-M-001',price:'₹149',status:'done',rating:5,ratingLabel:'Excellent',date:Date.now()-86400000}],createdAt:Date.now()-604800000};
    else users[key]={name:'Demo Mechanic',phone:'+91 9000000001',city:'Mathura',initials:'DM',role:'mechanic',mechId:'DC-M-001',shopName:'Demo Auto Works',specialization:'All vehicle types',experience:'5 years',preferredBrands:['tata','mahindra','maruti','honda','bajaj','hero'],bankAccMasked:'xxxx1234',bankAccFull:'9876541234',bankIfsc:'SBIN0001234',walletBal:1193,grossEarnings:1490,paidOut:0,payouts:[],online:true,history:[{service:'Puncture',serviceIcon:'🔩',vehicle:'Tata Nexon · Car',userName:'Demo User',price:'₹199',netEarned:159,status:'accepted',date:Date.now()-86400000},{service:'Battery dead',serviceIcon:'🔋',vehicle:'Honda City · Car',userName:'Priya S',price:'₹299',netEarned:239,status:'accepted',date:Date.now()-172800000},{service:'Out of fuel',serviceIcon:'⛽',vehicle:'Bajaj Pulsar · Bike',userName:'Ravi K',price:'₹149',status:'declined',date:Date.now()-259200000}],createdAt:Date.now()-604800000};
    DB.set('users',users);
  }
  S.user=users[key];S.role=role;
  DB.del('session'); // Clear old session to prevent incorrect redirects
  DB.set('currentUser',{phone:S.user.phone});DB.set('user',S.user);
  applyUser();if(typeof adminAddLog==='function')adminAddLog('login',`🎮 Demo ${role} login: ${users[key].name}`);toast('🚀 Demo '+role+' login!');
  showScreen(role==='mechanic'?'mechHome':'home');if(role==='mechanic')refreshMechDash();
}
function applyUser(){
  if(!S.user)return;
  const ini=S.user.initials||'?';
  ['homeAv','bookAv','uhAv','mechHomeAv','mechProfAv'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=ini;});
  updateLocBar();
  const bloc=document.getElementById('b-loc');if(bloc)bloc.textContent=S.userLocStr;
  // Sync sidebar
  _syncSidebar();
}

function _syncSidebar(){
  const av=document.getElementById('sidebarAv');
  const nm=document.getElementById('sidebarName');
  const rl=document.getElementById('sidebarRole');
  const sa=document.getElementById('snavAvatar');
  const su=document.getElementById('snav-user');
  const sm=document.getElementById('snav-mech');
  const sidebar = document.getElementById('sidebar');

  if(!S.user){
    if(sa)sa.style.display='none';
    if(su)su.style.display='none';
    if(sm)sm.style.display='none';
    return;
  }

  // CSS will handle sidebar display via media queries
  if(av)av.textContent=S.user.initials||'?';
  if(nm)nm.textContent=S.user.name||'—';
  if(rl)rl.textContent=S.role==='mechanic'?'🔧 Mechanic':'👤 User';
  
  if(sa)sa.style.display='flex';
  
  if(S.role==='mechanic'){
    if(su) su.style.display='none';
    if(sm) sm.style.display='block';
    _syncSidebarActive('sdash');
  } else {
    if(su) su.style.display='block';
    if(sm) sm.style.display='none';
    _syncSidebarActive('shome');
  }
}

function _syncSidebarActive(key){
  const map={
    shome:'snav-home', shistory:'snav-history', swallet:'snav-wallet',
    sprofile:'snav-profile', sprivacy:'snav-privacy', shelp:'snav-help',
    sdash:'snav-mdash', ssvc:'snav-msvc', smhist:'snav-mhist',
    smearn:'snav-mearn', smprofile:'snav-mprofile'
  };
  Object.values(map).forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('active');});
  const target=map[key];
  if(target){const el=document.getElementById(target);if(el)el.classList.add('active');}
}
function doLogout(){
  stopTracking();DB.del('currentUser');DB.del('user');S.user=null;selectedRole=null;
  // Clear forms
  ['loginPhone','regName','regPhone','regCity','shopName','experience','bankAcc','bankAccConf','bankIfsc'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const sp=document.getElementById('specialization');if(sp)sp.selectedIndex=0;
  
  // Safe style resets
  const low = document.getElementById('loginOtpWrap'); if(low) low.style.display='none';
  const lob = document.getElementById('loginOtpBtn'); if(lob) lob.style.display='block';
  const row = document.getElementById('regOtpWrap'); if(row) row.style.display='none';
  const rob = document.getElementById('regOtpBtn'); if(rob) rob.style.display='block';
  const mf = document.getElementById('mechFields'); if(mf) mf.style.display='none';
  
  const bse=document.getElementById('bankStatusEl');if(bse)bse.style.display='none';
  const rU=document.getElementById('roleUser');const rM=document.getElementById('roleMech');
  if(rU)rU.className='role-card';if(rM)rM.className='role-card';
  
  // Reset brand picker
  document.querySelectorAll('.brand-pick-card').forEach(c=>c.classList.remove('picked'));
  const grid=document.getElementById('brandPickerGrid');
  if(grid){grid.innerHTML='';delete grid.dataset.built;}
  const bpe=document.getElementById('brandPickErr');if(bpe)bpe.style.display='none';
  
  clearOtp('lo');clearOtp('ro');S.pendingOtp=null;S.bankOk=false;
  
  // Only call switchAuthTab if auth screen might be loading
  if(document.getElementById('auth')) switchAuthTab('login');

  _syncSidebar(); // hide sidebar avatar and nav items
  toast('👋 Logged out!');setTimeout(()=>showScreen('auth'),350);
}

// ══════════════════════════════════════════════════════════════════
// VEHICLE SELECTION WIZARD  —  Tab-based cumulative flow
// All VS_* data constants are declared at top of script (above boot).
// ══════════════════════════════════════════════════════════════════

// ── Master render ──
function vsRender(){
  const el=document.getElementById('vsWizard');
  if(!el)return;

  const {selectedBrand,selectedCategory,selectedModel,selectedProblem}=VS;

  // Which step index are we on? (0-5)
  const stepIdx=!selectedBrand?0
    :!selectedCategory?1
    :!selectedModel?2
    :(!VS.vehicleNumber && !VS.vehicleNumberSkipped)?3
    :!selectedProblem?4
    :5;

  let html='';

  // ── Tab strip ──
  html+='<div class="vs-tab-strip">';
  VS_TABS.forEach((t,i)=>{
    const isDone=i<stepIdx;
    const isActive=i===stepIdx;
    const isLocked=i>stepIdx;
    let cls=isDone?'done':isActive?'active':isLocked?'locked':'';
    const badge=isDone?`<span class="vs-tab-check">✓</span>`:'';
    html+=`<button class="vs-tab-btn ${cls}" onclick="${isLocked?'':'vsJumpTab('+i+')'}">
      <span class="vs-tab-ic">${t.icon}</span>${t.label}${badge}
    </button>`;
  });
  html+='</div>';

  // ── Step 1: Brand ──
  if(stepIdx===0){
    html+=_vsBrandGrid(selectedBrand);
  } else {
    // Collapsed pill — tap to change
    const bObj=VS_BRANDS.find(x=>x.id===selectedBrand)||{logo:'🚗',name:selectedBrand};
    html+=_vsCompactPill(bObj.logo,'Brand',bObj.name,'vsJumpTab(0)');
  }

  // ── Step 2: Category ──
  if(selectedBrand){
    if(stepIdx===1){
      html+='<div class="vs-step-reveal">';
      html+=_vsCategoryGrid(selectedBrand,selectedCategory);
      html+='</div>';
    } else {
      const cats=VS_CATEGORIES[selectedBrand]||[];
      const cObj=cats.find(x=>x.id===selectedCategory)||{ic:'🚗',id:selectedCategory};
      html+=_vsCompactPill(cObj.ic,'Vehicle type',selectedCategory,'vsJumpTab(1)');
    }
  }

  // ── Step 3: Model ──
  if(selectedBrand&&selectedCategory){
    if(stepIdx===2){
      html+='<div class="vs-step-reveal">';
      html+=_vsModelChips(selectedBrand,selectedCategory,selectedModel);
      html+='</div>';
    } else {
      html+=_vsCompactPill('🔖','Model',selectedModel,'vsJumpTab(2)');
    }
  }

  // ── Step 4: Vehicle Number ──
  if(selectedBrand&&selectedCategory&&selectedModel){
    if(stepIdx===3){
      html+='<div class="vs-step-reveal">';
      html+=_vsVehicleNumberInput();
      html+='</div>';
    } else {
      const val = VS.vehicleNumberSkipped ? 'Skipped' : VS.vehicleNumber;
      html+=_vsCompactPill('🔢','Vehicle Number',val,'vsJumpTab(3)');
    }
  }

  // ── Step 5: Problem ──
  if(selectedBrand&&selectedCategory&&selectedModel&&(VS.vehicleNumber||VS.vehicleNumberSkipped)){
    if(stepIdx===4){
      html+='<div class="vs-step-reveal">';
      html+=_vsProblemGrid(selectedCategory,selectedProblem);
      html+='</div>';
    } else {
      html+=_vsCompactPill(VS.problemIcon||'🔧','Problem',selectedProblem,'vsJumpTab(4)');
    }
  }

  // ── Step 6: Booking Summary ──
  if(stepIdx===5){
    html+='<div class="vs-step-reveal">';
    html+=_vsBookingSummary();
    html+='</div>';
  }

  el.innerHTML=html;

  // ── CTA button ──
  const homeBtn=document.getElementById('homeBookBtn');
  const mechSec=document.getElementById('mechSection');
  const allDone=stepIdx===5;
  if(mechSec)mechSec.style.display=allDone?'block':'none';
  if(homeBtn){
    if(allDone){
      homeBtn.classList.remove('vs-cta-locked');
      homeBtn.innerHTML='🔧 REQUEST NEAREST MECHANIC';
    } else {
      homeBtn.classList.add('vs-cta-locked');
      const labels=['brand','vehicle type','model','vehicle number','problem'];
      homeBtn.innerHTML='🔒 Select '+labels[stepIdx]+' to continue';
    }
  }

  // ── Sync S state ──
  _vsSyncS();
}

// ── Jump to an earlier tab (to change a selection) ──
function vsJumpTab(idx){
  if(idx===0){VS.selectedBrand=null;VS.selectedCategory=null;VS.selectedModel=null;VS.vehicleNumber=null;VS.vehicleNumberSkipped=false;VS.selectedProblem=null;VS.problemIcon=null;VS.problemPrice=null;VS.problemFee=null;}
  else if(idx===1){VS.selectedCategory=null;VS.selectedModel=null;VS.vehicleNumber=null;VS.vehicleNumberSkipped=false;VS.selectedProblem=null;VS.problemIcon=null;VS.problemPrice=null;VS.problemFee=null;}
  else if(idx===2){VS.selectedModel=null;VS.vehicleNumber=null;VS.vehicleNumberSkipped=false;VS.selectedProblem=null;VS.problemIcon=null;VS.problemPrice=null;VS.problemFee=null;}
  else if(idx===3){VS.vehicleNumber=null;VS.vehicleNumberSkipped=false;VS.selectedProblem=null;VS.problemIcon=null;VS.problemPrice=null;VS.problemFee=null;}
  else if(idx===4){VS.selectedProblem=null;VS.problemIcon=null;VS.problemPrice=null;VS.problemFee=null;}
  vsRender();
  // Scroll wizard back to top
  const el=document.getElementById('vsWizard');
  if(el)el.scrollIntoView({behavior:'smooth',block:'start'});
}

// ── Section builders ──

function _vsBrandGrid(selected){
  let h='<div class="vs-step-section">';
  h+='<div class="vs-step-label">Step 1 of 4 • Select vehicle brand</div>';
  h+='<div class="vs-brand-grid">';
  VS_BRANDS.forEach(b=>{
    const active=selected===b.id?'active':'';
    h+=`<div class="vs-brand-card ${active}" onclick="vsSelBrand('${b.id}')">
      <div class="vs-bc-logo">${b.logo}</div>
      <div class="vs-bc-name">${b.name}</div>
    </div>`;
  });
  h+='</div></div>';
  return h;
}

function _vsCategoryGrid(brand,selected){
  const cats=VS_CATEGORIES[brand]||VS_CATEGORIES.other;
  let h='<div class="vs-step-label">Step 2 of 4 • Select vehicle type</div>';
  h+='<div class="vs-cat-row">';
  cats.forEach(c=>{
    const active=selected===c.id?'active':'';
    h+=`<div class="vs-cat ${active}" onclick="vsSelCategory('${c.id}')">
      <div class="vs-cat-ic">${c.ic}</div>
      <div class="vs-cat-lbl">${c.id}</div>
    </div>`;
  });
  h+='</div>';
  return h;
}

function _vsModelChips(brand,category,selected){
  const models=(VS_MODELS[brand]&&VS_MODELS[brand][category])||['Other'];
  let h='<div class="vs-step-label">Step 3 of 4 • Select model</div>';
  h+='<div class="vs-model-wrap" id="modelContainer">';
  models.forEach(m=>{
    const safe=m.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const active=selected===m?'active':'';
    h+=`<div class="vs-model-chip ${active}" onclick="vsSelModel('${safe}')">${m}</div>`;
  });
  h+='</div>';
  return h;
}

function _vsVehicleNumberInput(){
  let h='<div class="vs-step-section">';
  h+='<div class="vs-step-label">Step 4 of 5 • Enter Vehicle Number (Optional)</div>';
  h+='<div class="vs-model-wrap" style="display:flex; flex-direction:column; gap: 15px; background:var(--bg3); border:1.5px solid var(--b); border-radius:var(--r); padding:16px;">';
  h+='<input type="text" id="vehNumInput" placeholder="e.g. MH 12 AB 1234" style="width:100%; padding: 14px 16px; border-radius: var(--rs); border: 1.5px solid var(--b); background: var(--bg); color: var(--tx); font-size: 16px; font-weight:600; text-transform: uppercase;" oninput="this.value = this.value.toUpperCase();" />';
  h+='<div style="display:flex; gap: 10px; width: 100%;">';
  h+='<button class="btn-o" style="flex:1;" onclick="vsSkipVehicleNumber()">Skip</button>';
  h+='<button class="btn" style="flex:1;" onclick="vsSetVehicleNumber()">Save</button>';
  h+='</div>';
  h+='</div></div>';
  return h;
}

function vsSetVehicleNumber() {
  const el = document.getElementById('vehNumInput');
  if (el && el.value.trim()) {
    VS.vehicleNumber = el.value.trim();
    VS.vehicleNumberSkipped = false;
    vsRender();
    _vsScrollToNewStep();
    saveSession('home');
  } else {
    vsSkipVehicleNumber();
  }
}

function vsSkipVehicleNumber() {
  VS.vehicleNumber = null;
  VS.vehicleNumberSkipped = true;
  vsRender();
  _vsScrollToNewStep();
  saveSession('home');
}

function _vsProblemGrid(category,selected){
  const svcs=VS_SERVICES[category]||VS_SVC_DEFAULT;
  let h='<div class="vs-step-label">Step 5 of 5 • What\'s wrong?</div>';
  h+='<div class="svc-grid">';
  svcs.forEach(s=>{
    const active=selected===s.name?'active':'';
    const badge=s.pop?'<div class="sc-badge">Popular</div>':'';
    const sn=s.name.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    const si=s.ic.replace(/'/g,"\\'");
    const sp=s.price.replace(/'/g,"\\'");
    h+=`<div class="sc ${active}" onclick="vsSelProblem('${sn}','${si}','${sp}',${s.fee})">
      ${badge}
      <div class="si">${s.ic}</div>
      <div class="sn">${s.name}</div>
      <div class="ss">${s.sub}</div>
    </div>`;
  });
  h+='</div>';
  return h;
}

function _vsBookingSummary(){
  const {selectedBrand,selectedCategory,selectedModel,selectedProblem}=VS;
  const bObj=VS_BRANDS.find(x=>x.id===selectedBrand)||{logo:'🚗',name:selectedBrand};
  const cats=VS_CATEGORIES[selectedBrand]||[];
  const catObj=cats.find(x=>x.id===selectedCategory)||{ic:'🚗',id:selectedCategory};
  const price=VS.problemPrice||'₹299';
  const comm=Math.round(parseInt(price.replace('₹',''))*0.20);
  let h='<div class="vs-step-label">✅ Your booking summary</div>';
  h+='<div class="vs-summary-list">';
  
  // Brand
  h+=`<div class="vs-summary-card"><div class="vs-br-ic">${bObj.logo}</div><div class="vs-br-info"><div class="vs-br-lbl">Company (Brand)</div><div class="vs-br-val">${bObj.name}</div></div></div>`;
  // Category
  h+=`<div class="vs-summary-card"><div class="vs-br-ic">${catObj.ic}</div><div class="vs-br-info"><div class="vs-br-lbl">Gaadi ka type</div><div class="vs-br-val">${selectedCategory}</div></div></div>`;
  // Model
  h+=`<div class="vs-summary-card"><div class="vs-br-ic">🔖</div><div class="vs-br-info"><div class="vs-br-lbl">Model</div><div class="vs-br-val">${selectedModel}</div></div></div>`;
  // Vehicle Number
  if (VS.vehicleNumber) {
    h+=`<div class="vs-summary-card"><div class="vs-br-ic">🔢</div><div class="vs-br-info"><div class="vs-br-lbl">Vehicle Number</div><div class="vs-br-val">${VS.vehicleNumber}</div></div></div>`;
  }
  // Problem
  h+=`<div class="vs-summary-card"><div class="vs-br-ic">${VS.problemIcon||'🔧'}</div><div class="vs-br-info"><div class="vs-br-lbl">Problem</div><div class="vs-br-val">${selectedProblem}</div></div><div class="vs-br-price">${price}</div></div>`;
  
  // Commission Card
  h+=`<div class="vs-comm-card">
      <div class="vs-br-ic">💡</div>
      <div class="vs-br-info">
        <div class="vs-br-lbl">Commission (20%)</div>
        <div class="vs-br-val">₹${comm} · Mechanic ko milega ₹${parseInt(price.replace('₹',''))-comm}</div>
      </div>
    </div>`;
    
  h+='</div>';
  h+='<div class="vs-step-label">Paas ke mechanics</div>';
  return h;
}

function _vsCompactPill(icon,label,value,onclick){
  return `<div class="vs-selected-pill" onclick="${onclick}">
    <div class="vsp-ic">${icon}</div>
    <div class="vsp-info">
      <div class="vsp-lbl">${label}</div>
      <div class="vsp-val">${value}</div>
    </div>
    <div class="vsp-chg">Badlein ›</div>
  </div>`;
}

function _vsSyncS(){
  const {selectedBrand,selectedCategory,selectedModel,selectedProblem}=VS;
  if(selectedProblem){
    S.service=selectedProblem;
    S.serviceIcon=VS.problemIcon||'🔧';
    S.servicePrice=VS.problemPrice||'₹299';
    S.serviceFee=VS.problemFee||250;
  }
  if(selectedBrand&&selectedCategory){
    const bObj=VS_BRANDS.find(x=>x.id===selectedBrand);
    const cats=VS_CATEGORIES[selectedBrand]||[];
    const catObj=cats.find(x=>x.id===selectedCategory)||{ic:'🚗'};
    S.vehicle=selectedModel
      ?((bObj?bObj.name+' ':'')+selectedModel+' · '+selectedCategory)
      :(selectedCategory);
    if (VS.vehicleNumber) {
      S.vehicle += ` (${VS.vehicleNumber})`;
    }
    S.vehicleIcon=catObj.ic;
  }
}

// ── Dedicated renderModels() — targets live #modelContainer after vsRender ──
function renderModels(){
  const container=document.getElementById('modelContainer');
  if(!container)return;
  const {selectedBrand,selectedCategory,selectedModel}=VS;
  const models=(VS_MODELS[selectedBrand]&&VS_MODELS[selectedBrand][selectedCategory])||['Other'];
  container.innerHTML='';
  models.forEach(m=>{
    const chip=document.createElement('div');
    chip.className='vs-model-chip'+(selectedModel===m?' active':'');
    chip.textContent=m;
    chip.addEventListener('click',()=>vsSelModel(m));
    container.appendChild(chip);
  });
}

// ── Selection handlers ──
function vsSelBrand(id){
  VS.selectedBrand=id;VS.selectedCategory=null;VS.selectedModel=null;VS.vehicleNumber=null;VS.vehicleNumberSkipped=false;VS.selectedProblem=null;
  VS.problemIcon=null;VS.problemPrice=null;VS.problemFee=null;
  vsRender();_vsScrollToNewStep();
  saveSession('home');
}
function vsSelCategory(id){
  VS.selectedCategory=id;VS.selectedModel=null;VS.vehicleNumber=null;VS.vehicleNumberSkipped=false;VS.selectedProblem=null;
  VS.problemIcon=null;VS.problemPrice=null;VS.problemFee=null;
  vsRender();renderModels();_vsScrollToNewStep();
  saveSession('home');
}
function vsSelModel(name){
  VS.selectedModel=name;VS.vehicleNumber=null;VS.vehicleNumberSkipped=false;VS.selectedProblem=null;
  VS.problemIcon=null;VS.problemPrice=null;VS.problemFee=null;
  vsRender();_vsScrollToNewStep();
  saveSession('home');
}
function vsSelProblem(name,icon,price,fee){
  VS.selectedProblem=name;VS.problemIcon=icon;VS.problemPrice=price;VS.problemFee=fee;
  S.service=name;S.serviceIcon=icon;S.servicePrice=price;S.serviceFee=fee;
  _vsSyncS();vsRender();_vsScrollToNewStep();
  saveSession('home');
}

function _vsScrollToNewStep(){
  // Scroll the newly revealed section into view smoothly
  setTimeout(()=>{
    const el=document.getElementById('vsWizard');
    if(!el)return;
    const last=el.querySelector('.vs-step-reveal:last-of-type')||
                el.querySelector('.vs-booking-card')||
                el.querySelector('.vs-model-wrap')||
                el.querySelector('.vs-cat-row')||
                el.querySelector('.vs-brand-grid');
    if(last)last.scrollIntoView({behavior:'smooth',block:'nearest'});
  },80);
}

function vsResetFrom(field){vsJumpTab({brand:0,category:1,model:2,problem:3}[field]||0);}
function vsRequestNearest(){
  const {selectedBrand,selectedCategory,selectedModel,selectedProblem}=VS;
  if(!(selectedBrand&&selectedCategory&&selectedModel&&selectedProblem)){
    toast('⚠️ Pehle sabhi 4 steps complete karein');return;
  }
  // If we are on summary step, goBook
  goBook('Ramesh Kumar','🧰','#1e293b','1.2 km','8','4.9','DC-M-001');
}
// ── Core reset: called by every home-navigation path ──────────────────
// Clears wizard selections AND stale job state so home always starts
// at Brand step, whether returning after rating, refresh, or tab tap.
function _resetWizardAndJobState(){
  // ── Stop all background timers first (tracking, polling, animation) ──
  // This must run before clearing state so timers can't re-dirty it after reset.
  clearInterval(S.wsTimer);
  clearInterval(S.pollTimer);
  clearInterval(S.drTimer);
  clearInterval(S.animTimer);
  clearInterval(S.etaTrkTimer);
  clearInterval(S._svcPollTimer);   // mechanic-complete poll
  S.trkActive = false;

  // ── Clear wizard selections → wizard returns to Brand step ──
  VS.selectedBrand    = null;
  VS.selectedCategory = null;
  VS.selectedModel    = null;
  VS.vehicleNumber    = null;
  VS.vehicleNumberSkipped = false;
  VS.selectedProblem  = null;
  VS.problemIcon      = null;
  VS.problemPrice     = null;
  VS.problemFee       = null;

  // ── Clear in-memory job/tracking state ──
  // (does NOT touch localStorage — user history/wallet are preserved)
  S.activeJob           = null;
  S.svcCompletedByMech  = false;
  S.activeMechId        = null;
  S.paymentDone         = false;
  S.selectedRating      = 0;
  S.payTiming           = 'now';
  S.etaVal              = 8;

  // ── Remove stale mechanic-complete flag and session from localStorage ──
  // Prevents a page refresh from picking up a completed job's old flag.
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('dc8_svcComplete_mech_')) localStorage.removeItem(k);
    });
  } catch(e) {}
  DB.del('session');
}
function vsReset(){
  _resetWizardAndJobState();
  vsRender();
}

// ══════════════════════════════════════════════════════════════
// SESSION PERSISTENCE
// Saves the active screen + wizard + booking/tracking state so
// a page refresh lands back on the exact step the user was on.
// ══════════════════════════════════════════════════════════════

/** Save the current UI state (screen + in-progress booking/tracking) */
function saveSession(screenId){
  if(!S.user)return;
  const session={
    screen: screenId || _currentScreen(),
    // Wizard state
    vs:{
      selectedBrand:   VS.selectedBrand,
      selectedCategory:VS.selectedCategory,
      selectedModel:   VS.selectedModel,
      vehicleNumber:   VS.vehicleNumber,
      vehicleNumberSkipped: VS.vehicleNumberSkipped,
      selectedProblem: VS.selectedProblem,
      problemIcon:     VS.problemIcon,
      problemPrice:    VS.problemPrice,
      problemFee:      VS.problemFee
    },
    // Booking / Tracking state
    mech:        S.mech,
    service:     S.service,
    serviceIcon: S.serviceIcon,
    servicePrice:S.servicePrice,
    serviceFee:  S.serviceFee,
    vehicle:     S.vehicle,
    vehicleIcon: S.vehicleIcon,
    payMethod:   S.payMethod,
    payTiming:   S.payTiming,
    activeJobId: S.activeJobId,
    activeMechId:S.activeMechId,
    paymentDone: S.paymentDone,
    etaVal:      S.etaVal
  };
  DB.set('session',session);
}

/** Returns the id of the currently visible screen */
function _currentScreen(){
  const el=document.querySelector('.screen.active');
  return el?el.id:'home';
}

/** Restore session state after a page refresh */
function restoreSession(){
  const session=DB.get('session');
  if(!session||!S.user)return false;

  const screen=session.screen||'home';

  // ── Restore wizard (VS) state ──
  if(session.vs){
    VS.selectedBrand   =session.vs.selectedBrand   ||null;
    VS.selectedCategory=session.vs.selectedCategory||null;
    VS.selectedModel   =session.vs.selectedModel   ||null;
    VS.vehicleNumber   =session.vs.vehicleNumber   ||null;
    VS.vehicleNumberSkipped =session.vs.vehicleNumberSkipped ||false;
    VS.selectedProblem =session.vs.selectedProblem ||null;
    VS.problemIcon     =session.vs.problemIcon     ||null;
    VS.problemPrice    =session.vs.problemPrice     ||null;
    VS.problemFee      =session.vs.problemFee      ||null;
  }

  // ── Restore booking / tracking state ──
  if(session.mech)       S.mech        =session.mech;
  if(session.service)    S.service     =session.service;
  if(session.serviceIcon)S.serviceIcon =session.serviceIcon;
  if(session.servicePrice)S.servicePrice=session.servicePrice;
  if(session.serviceFee) S.serviceFee  =session.serviceFee;
  if(session.vehicle)    S.vehicle     =session.vehicle;
  if(session.vehicleIcon)S.vehicleIcon =session.vehicleIcon;
  if(session.payMethod)  S.payMethod   =session.payMethod;
  if(session.payTiming)  S.payTiming   =session.payTiming;
  if(session.activeJobId)S.activeJobId =session.activeJobId;
  if(session.activeMechId)S.activeMechId=session.activeMechId;
  if(typeof session.paymentDone==='boolean')S.paymentDone=session.paymentDone;
  if(session.etaVal)     S.etaVal      =session.etaVal;

  // ── USER: tracking screen ──
  if(screen==='tracking'&&S.activeJobId&&S.mech){
    _restoreTrackingUI();
    showScreen('tracking');
    setTimeout(()=>{initTrackingCanvas();startTracking();startSvcCompletePoller();updateMarkCompleteBtn();},150);
    return true;
  }

  // ── USER: booking screen ──
  if(screen==='booking'&&S.mech){
    _restoreBookingUI();
    showScreen('booking');
    return true;
  }

  // ── USER: home with wizard in progress ──
  if(screen==='home'&&S.role==='user'){
    vsRender();
    showScreen('home');
    // Don't delete session yet — wizard state should survive another refresh
    return true;
  }

  // ── MECHANIC: active service screen ──
  if(screen==='mechSvcComplete'&&S.role==='mechanic'&&S.activeJob){
    refreshMechDash();
    showScreen('mechSvcComplete');
    renderMechSvcComplete();
    return true;
  }

  // ── MECHANIC: dashboard + all sub-screens ──
  if(S.role==='mechanic'){
    const mechSubScreens={
      mechHome:            ()=>{refreshMechDash();showScreen('mechHome');},
      mechHistory:         ()=>{renderMechHistory();showScreen('mechHistory');},
      mechEarningsScreen:  ()=>{renderMechEarnings();showScreen('mechEarningsScreen');},
      mechProfile:         ()=>{renderMechProfile();showScreen('mechProfile');},
      mechPrivacy:         ()=>showScreen('mechPrivacy'),
      mechHelp:            ()=>showScreen('mechHelp'),
    };
    if(mechSubScreens[screen]){
      mechSubScreens[screen]();
      return true;
    }
    // Mechanic fallback — always land on dashboard, never blank
    refreshMechDash();showScreen('mechHome');
    return true;
  }

  // ── Other user sub-screens (history, wallet, etc.) ──
  const userSubScreens={
    userHistory:()=>{renderUserHistory();showScreen('userHistory');},
    userProfile:()=>{renderUserProfile();showScreen('userProfile');},
    userPrivacy:()=>showScreen('userPrivacy'),
    userHelp:   ()=>showScreen('userHelp'),
  };
  if(userSubScreens[screen]&&S.role==='user'){
    userSubScreens[screen]();
    return true;
  }

  // ── Final fallback: always show correct home, never a blank screen ──
  // Never restore to admin screens without re-authentication
  if(screen==='adminLogin'||screen==='adminPortal'){
    showScreen(S.role==='mechanic'?'mechHome':'home');
    if(S.role==='mechanic')refreshMechDash();
    return true;
  }
  showScreen('home');vsRender();
  return true;
}

/** Re-populate the tracking screen DOM from restored state */
function _restoreTrackingUI(){
  const set=(id,val)=>{const el=document.getElementById(id);if(el&&val!==undefined)el.textContent=val;};
  set('trkSvc',(S.service||'Service')+' · '+(S.vehicle||''));
  set('trkSvcIc',S.serviceIcon||'🔧');
  set('trkPrice',S.servicePrice||'₹0');
  set('trkUserLoc',S.userLocStr);
  set('etaNum',String(S.etaVal||8).padStart(2,'0'));
  set('trkEtaLbl',String(S.etaVal||8).padStart(2,'0')+' min');
  if(S.mech){
    set('chatTitle',S.mech.name);
    set('callName',S.mech.name);
    set('callEmoji',S.mech.icon);
  }
  const pp=document.getElementById('postPayPanel');
  if(pp)pp.style.display='none';
  renderUserOtpState();
}

/** Re-populate the booking screen DOM from restored state */
function _restoreBookingUI(){
  if(!S.mech)return;
  const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val||'';};
  const setStyle=(id,prop,val)=>{const el=document.getElementById(id);if(el)el.style[prop]=val;};
  set('b-av',S.mech.icon);setStyle('b-av','background',S.mech.bg||'#1e293b');
  set('b-name',S.mech.name);
  set('b-dist',S.mech.dist||'');
  set('b-eta','~'+(S.mech.eta||'8')+' min');
  set('b-rating',S.mech.rating||'');
  set('b-mechid','ID: '+(S.mech.id||''));
  set('b-svc',S.service||'');
  set('b-svc-ic',S.serviceIcon||'🔧');
  set('b-veh',S.vehicle||'');
  set('b-veh-ic',S.vehicleIcon||'🚗');
  set('b-loc',S.userLocStr);
  set('b-price',S.servicePrice||'₹0');
  const bmRow=document.getElementById('b-brand-row');
  const bmVal=document.getElementById('b-brand-model');
  if(bmRow&&bmVal&&VS.selectedBrand&&VS.selectedModel){
    const bObj=VS_BRANDS.find(x=>x.id===VS.selectedBrand);
    bmRow.style.display='flex';
    bmVal.textContent=(bObj?bObj.name+' ':'')+VS.selectedModel;
  }
  const total=parseInt((S.servicePrice||'₹0').replace('₹',''))||0;
  const comm=Math.round(total*S.commRate);
  set('commAmt','-₹'+comm);
  set('mechEarnAmt','₹'+(total-comm));
  selPayTiming(S.payTiming||'now');
  selPay(S.payMethod||'upi');

}

/** Smart "go home" — used by every DRIVECARE logo click.
 *  Routes to the correct home screen based on who is logged in:
 *  Admin  → Admin Portal dashboard
 *  Mechanic → Mechanic dashboard
 *  User   → User home
 *  Nobody → Auth screen
 */
function goHome(){
  // Admin: go to admin portal dashboard
  if(typeof ADM!=='undefined' && ADM.loggedIn){
    showScreen('adminPortal');
    adminTab('dashboard');
    return;
  }
  // Mechanic: go to mechanic dashboard
  if(S.role==='mechanic' && S.user){
    refreshMechDash();
    showScreen('mechHome');
    _syncSidebarActive('sdash');
    saveSession('mechHome');
    return;
  }
  // User: reset wizard + job state, go to home
  if(S.user){
    _resetWizardAndJobState();
    DB.del('session');
    showScreen('home');
    _syncSidebarActive('shome');
    return;
  }
  // Not logged in: back to auth
  showScreen('auth');
}

// ── Hook saveSession into every state-changing action ──
// (called after showScreen in key places — see patched versions below)


function selV(el,name,icon){document.querySelectorAll('.vtab').forEach(v=>v.classList.remove('active'));el.classList.add('active');S.vehicle=name;S.vehicleIcon=icon;const bv=document.getElementById('b-veh');const bi=document.getElementById('b-veh-ic');if(bv)bv.textContent=name;if(bi)bi.textContent=icon;toast(icon+' '+name+' selected');}
function selS(el,name,icon,price,fee){
  document.querySelectorAll('.sc').forEach(s=>s.classList.remove('active'));el.classList.add('active');
  S.service=name;S.serviceIcon=icon;S.servicePrice=price;S.serviceFee=fee;
  document.getElementById('b-svc').textContent=name;document.getElementById('b-svc-ic').textContent=icon;
  document.getElementById('b-price').textContent=price;
  const total=parseInt(price.replace('₹',''));const comm=Math.round(total*S.commRate);
  document.getElementById('commAmt').textContent='-₹'+comm;document.getElementById('mechEarnAmt').textContent='₹'+(total-comm);
  toast(icon+' '+name+' · '+price);
}
function goBook(name,icon,bg,dist,eta,rating,mechId){
  // Guard: wizard must be complete before booking
  const {selectedBrand,selectedCategory,selectedModel,selectedProblem}=VS;
  if(!(selectedBrand&&selectedCategory&&selectedModel&&selectedProblem)){
    toast('⚠️ Please complete all vehicle selection steps first');return;
  }
  // ── Set state only — do NOT touch DOM here ──
  // The Booking component hasn't rendered yet (React Router navigation is async).
  // _restoreBookingUI() runs from Booking.jsx's useEffect and safely populates all DOM.
  S.mech={name,icon,bg,dist,eta,rating,id:mechId};
  // Build vehicle label from VS wizard data
  const bObj=VS_BRANDS.find(x=>x.id===selectedBrand)||{logo:'',name:selectedBrand};
  const cats=VS_CATEGORIES[selectedBrand]||[];
  const catObj=cats.find(x=>x.id===selectedCategory)||{ic:'🚗'};
  const vehLabel=bObj.name+' '+selectedModel+' · '+selectedCategory;
  S.vehicle=vehLabel;S.vehicleIcon=catObj.ic;
  S.service=selectedProblem;S.serviceIcon=VS.problemIcon||'🔧';
  S.servicePrice=VS.problemPrice||'₹299';S.serviceFee=VS.problemFee||250;
  S.payTiming='now';
  S.payMethod='upi';
  S.upiInValid=false;

  saveSession('booking');
  showScreen('booking');
}

// ── Razorpay Gateway ──
function payWithRazorpay(amount, description, onSuccess) {
  if (typeof window.Razorpay === 'undefined') {
    toast('❌ Razorpay SDK not loaded. Please check your internet connection.');
    return;
  }
  
  // Use VITE_ prefix for public key
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  
  const options = {
    key: key,
    amount: Math.round(amount * 100), // amount in paise
    currency: "INR",
    name: "DriveCare",
    description: description,
    handler: function (response) {
      toast("✅ Payment Successful: " + response.razorpay_payment_id);
      if (onSuccess) onSuccess(response);
    },
    prefill: {
      name: S.user ? S.user.name : "",
      email: S.user ? S.user.email : "",
      contact: S.user ? S.user.phone : ""
    },
    theme: { color: "#0ea5e3" },
    modal: {
      ondismiss: function() {
        toast("⚠️ Payment cancelled");
      }
    }
  };
  
  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (response){
    toast("❌ Payment Failed: " + response.error.description);
  });
  rzp.open();
}

// ── Pay Timing ──
function selPayTiming(t){
  S.payTiming=t;
  const ptN=document.getElementById('ptNow');if(ptN)ptN.className='pt-opt'+(t==='now'?' sel-now':'');
  const ptA=document.getElementById('ptAfter');if(ptA)ptA.className='pt-opt'+(t==='after'?' sel-after':'');
  const pns=document.getElementById('payNowSection');if(pns)pns.style.display=t==='now'?'block':'none';
  const pas=document.getElementById('payAfterSection');if(pas)pas.style.display=t==='after'?'block':'none';
  const btn=document.getElementById('bookingConfirmBtn');
  if(btn)btn.innerHTML=t==='after'?'🔧 CONFIRM &amp; REQUEST (Pay Later)':'✓ CONFIRM &amp; REQUEST';
}

// ── Payment ──
function selPay(m){
  S.payMethod=m;
  ['upi','qr'].forEach(k=>{
    const el=document.getElementById('pay'+k.charAt(0).toUpperCase()+k.slice(1));
    if(el)el.classList.toggle('sel',k===m);
  });
  const qd=document.getElementById('qrCodeDisplay');
  if(qd)qd.style.display=m==='qr'?'block':'none';
}

function confirmBooking(){
  if(S.payTiming==='after'){
    proceedToTracking(false);
    return;
  }
  const amt = parseInt(S.servicePrice.replace('₹','')) || 0;
  payWithRazorpay(amt, S.service + " for " + S.vehicle, () => proceed());
}

function getChkAmt(){const el=document.getElementById('qrChkAmt');return el?el.textContent.replace('₹',''):'0';}
function showCheckoutQr(){
  const amt=S.servicePrice;
  const el=document.getElementById('qrChkAmt');if(el)el.textContent=amt;
  openOv('qrCheckOv');
}
function launchUpiDeepLink(app,amt){
  const base='upi://pay?pa=drivecare@razorpay&pn=DriveCare&am='+amt+'&cu=INR&tn='+encodeURIComponent(S.service);
  const urls={
    phonepe:'phonepe://pay?pa=drivecare@razorpay&pn=DriveCare&am='+amt+'&cu=INR&tn='+encodeURIComponent(S.service||'Service'),
    paytm:'paytmmp://pay?pa=drivecare@razorpay&pn=DriveCare&am='+amt+'&cu=INR',
    gpay:'gpay://upi/pay?pa=drivecare@razorpay&pn=DriveCare&am='+amt+'&cu=INR',
    bhim:base
  };
  const appUrl=urls[app]||base;
  const a=document.createElement('a');a.href=appUrl;a.style.display='none';document.body.appendChild(a);
  try{a.click();}catch(e){}document.body.removeChild(a);
  if(appUrl!==base){setTimeout(()=>{const b=document.createElement('a');b.href=base;b.style.display='none';document.body.appendChild(b);try{b.click();}catch(e){}document.body.removeChild(b);},1000);}
  setTimeout(()=>toast('💡 If app didn\'t open, scan QR or enter UPI ID'),1800);
}
function confirmQrPaid(){closeOv('qrCheckOv');proceed();}

// Called by pay-now paths (UPI/QR/Wallet confirmed)
function proceed(){
  proceedToTracking(true);
}

// Core: set up tracking state and navigate. paymentDone=false for pay-later.
// DOM population is handled by _restoreTrackingUI() from Tracking.jsx's useEffect.
function proceedToTracking(paymentDone){
  if(!S.user) S.user = { name: 'Guest User', phone: '0000000000', history: [] };
  if(!S.user.history)S.user.history=[];
  const jobId='JOB-USR-'+Date.now();
  S.activeJobId=jobId;
  // The shared flag is keyed on the MECHANIC's mechId — mechAccept writes it, we poll it
  S.activeMechId=S.mech?.id;
  S.paymentDone=paymentDone;
  S.user.history.unshift({
    jobId,
    service:S.service,serviceIcon:S.serviceIcon,vehicle:S.vehicle,
    mechName:S.mech?.name || 'Unknown',mechId:S.mech?.id,price:S.servicePrice,
    status:'done',date:Date.now(),
    payMethod: paymentDone ? S.payMethod : 'pending',
    payTiming: S.payTiming
  });
  // Only credit mechanic now if paid upfront
  if(paymentDone && S.mech?.id){
    creditMechanic(S.mech.id,S.service,S.serviceIcon,S.vehicle,(S.user.name||'User'),S.servicePrice,Math.round(parseInt((S.servicePrice||'0').replace('₹',''))*(1-S.commRate)));
  }
  // Generate OTP 1 (OTP 2 is generated later when work starts)
  const otp1 = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiry = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

  // Ensure the shared flag exists for this mechanic (mechAccept also writes this;
  // whichever runs first just sets complete:false — the mechanic's write wins on accept)
  const mechIdForFlag = S.mech?.id || 'unknown_mech';
  const existingFlag=DB.get('svcComplete_mech_'+mechIdForFlag);
  if(!existingFlag||existingFlag.complete){
    DB.set('svcComplete_mech_'+mechIdForFlag,{
      complete:false, 
      jobId, 
      mechId:mechIdForFlag, 
      ts:Date.now(),
      otp1,
      otp2: null, // Generated later
      otp1Verified: false,
      otp2Revealed: false,
      otpRetries: 0,
      otpExpiry
    });
  }

  // ── BROADCAST: Add to Supabase (with localStorage fallback) ──
  const newLiveReq = {
    id: jobId,
    brand: VS.selectedBrand,
    service: S.service,
    icon: S.serviceIcon,
    category: VS.selectedCategory,
    model: VS.selectedModel,
    user: S.user.name || 'User',
    phone: S.user.phone,
    dist: '1.2 km',
    eta: '8',
    price: S.servicePrice,
    vehNum: VS.vehicleNumber || '',
    status: 'pending',
    targetMechId: mechIdForFlag,
    otp1,
    otp2: null,
    otpExpiry,
    ts: Date.now()
  };

  // 1. Try Supabase
  if (window.supabase && typeof window.supabase.from === 'function') {
    window.supabase.from('service_requests').insert([newLiveReq]).then(({ error }) => {
      if (error) console.error('Supabase broadcast error:', error);
    });
  }

  // 2. Local fallback (for same-browser testing or if Supabase not configured)
  const liveReqs = DB.get('active_requests') || [];
  liveReqs.unshift(newLiveReq);
  DB.set('active_requests', liveReqs.slice(0, 50));
  S.svcCompletedByMech=false;
  S.etaVal=parseInt(S.mech.eta)||8;
  saveUser();
  // ── Navigate — DOM setup is handled by _restoreTrackingUI from Tracking.jsx useEffect ──
  saveSession('tracking');
  showScreen('tracking');
}

// ── POST-SERVICE PAYMENT (Pay Later) ──
// Post-pay method state
let ppMethod='upi',ppUpiValid=false;

function renderPostPayPanel(){
  const pp=document.getElementById('postPayPanel');if(!pp)return;
  const amt=S.servicePrice;
  pp.style.display='block';
  pp.innerHTML=`
    <div class="post-pay-panel">
      <div class="post-pay-header">
        <div class="post-pay-ic">💳</div>
        <div><div class="post-pay-title">PAYMENT DUE</div><div class="post-pay-sub">Service complete — please pay ${amt} to confirm</div></div>
      </div>
      <div class="post-pay-methods">
        <div class="pp-opt sel" id="ppUpiOpt" onclick="selPostPay('upi')">
          <div class="pp-ic" style="background:rgba(255,255,255,.06);">💳</div>
          <div style="flex:1;"><div class="pp-name">UPI / Online</div><div class="pp-sub">Pay securely via Razorpay</div></div>
          <div class="pp-radio"><div class="pp-chk"></div></div>
        </div>
        <div class="pp-opt" id="ppQrOpt" onclick="selPostPay('qr')">
          <div class="pp-ic" style="background:var(--agl);">📲</div>
          <div style="flex:1;"><div class="pp-name">Scan QR Code</div><div class="pp-sub">Any UPI app</div></div>
          <div class="pp-radio"><div class="pp-chk"></div></div>
        </div>
      </div>
      <div id="ppQrDisplay" style="display:none; text-align:center; margin-top:15px; padding:15px; background:rgba(255,255,255,.03); border-radius:12px;">
        <div style="font-size:10px; color:var(--tx3); margin-bottom:10px; text-transform:uppercase;">Scan to pay ${amt}</div>
        <img src="/QR_Code.jpeg" style="width:140px; height:140px; border-radius:8px; border:3px solid #fff;" />
      </div>
      <button onclick="confirmPostPayment()" class="btn-pay-now">PAY ${amt} NOW</button>
    </div>`;
  ppMethod='upi';ppUpiValid=false;
}

function selPostPay(m){
  ppMethod=m;
  ['upi','qr'].forEach(k=>{
    const el=document.getElementById('pp'+k.charAt(0).toUpperCase()+k.slice(1)+'Opt');
    if(el)el.classList.toggle('sel',k===m);
  });
  const qd=document.getElementById('ppQrDisplay');
  if(qd)qd.style.display=m==='qr'?'block':'none';
}

function livePostPayUpi(el){
  const v=el.value.trim();const badge=document.getElementById('ppUpiBadge');
  if(!v){badge.style.display='none';ppUpiValid=false;return;}
  if(isValidUpi(v)){badge.className='upi-valid-badge ok';badge.textContent='✓ Valid UPI · '+getUpiBank(v);badge.style.display='flex';ppUpiValid=true;}
  else{badge.className='upi-valid-badge err';badge.textContent='✗ Invalid format — use name@bank';badge.style.display='flex';ppUpiValid=false;}
}

function confirmPostPayment(){
  const amt=parseInt(S.servicePrice.replace('₹',''));
  if(ppMethod==='qr' || ppMethod==='upi'){
    payWithRazorpay(amt, "Post-service payment for " + S.service, () => finalisePostPayment(ppMethod));
    return;
  }
}

function finalisePostPayment(method){
  const amt=parseInt(S.servicePrice.replace('₹',''));
  S.paymentDone=true;
  S.payMethod=method;
  // Update history entry
  if(S.user&&S.user.history){const h=S.user.history.find(x=>x.jobId===S.activeJobId);if(h){h.payMethod=method;}}
  // Credit mechanic now that payment is done
  creditMechanic(S.mech.id,S.service,S.serviceIcon,S.vehicle,(S.user.name||'User'),S.servicePrice,Math.round(amt*(1-S.commRate)));
  saveUser();
  // Hide payment panel and unlock completion
  const pp=document.getElementById('postPayPanel');if(pp)pp.style.display='none';
  toast('✅ Payment of ₹'+amt+' confirmed!');
  
  // If OTP2 hasn't been revealed yet, reveal it now automatically
  const rec = DB.get('svcComplete_mech_' + S.activeMechId);
  if (rec && rec.otp1Verified && !rec.otp2Revealed) {
    revealFinalOtp();
  } else {
    renderUserOtpState();
  }
}
function creditMechanic(mechId,service,icon,vehicle,userName,price,net){
  const users=DB.get('users')||{};const mech=Object.values(users).find(u=>u.mechId===mechId);if(!mech)return;
  mech.grossEarnings=(mech.grossEarnings||0)+parseInt(price.replace('₹',''));mech.walletBal=(mech.walletBal||0)+net;
  if(!mech.history)mech.history=[];mech.history.unshift({service,serviceIcon:icon,vehicle,userName,price,netEarned:net,status:'accepted',date:Date.now()});
  if(!mech.walletTxns)mech.walletTxns=[];mech.walletTxns.unshift({type:'credit',label:'Job - '+service,amount:net,date:Date.now()});
  const d=getDigits(mech.phone);users[d]=mech;DB.set('users',users);
}
function saveUser(){if(!S.user)return;DB.set('user',S.user);const users=DB.get('users')||{};const d=getDigits(S.user.phone);users[d]=S.user;DB.set('users',users);}

// ══════════════════════════════════════════════
// REAL-TIME TRACKING ENGINE (Canvas-based map)
// ══════════════════════════════════════════════
function initTrackingCanvas(){
  const canvas=document.getElementById('trackCanvas');const wrap=canvas.parentElement;
  function resize(){
    canvas.width=wrap.clientWidth;canvas.height=wrap.clientHeight;
    S.canvasW=canvas.width;S.canvasH=canvas.height;
    if(!S.ctx)S.ctx=canvas.getContext('2d');
    drawMap();
  }
  resize();
  // Re-draw on orientation change and window resize (mobile + desktop)
  if(window.ResizeObserver){
    const ro=new ResizeObserver(()=>{if(S.trkActive)resize();});
    ro.observe(wrap);
    S._canvasRO=ro;
  } else {
    window.addEventListener('resize',()=>{if(S.trkActive)resize();});
    window.addEventListener('orientationchange',()=>{setTimeout(()=>{if(S.trkActive)resize();},200);});
  }
  buildRoute();S.mechMarkerLat=S.mechLat;S.mechMarkerLng=S.mechLng;
  drawMap();
}
function latLngToXY(lat,lng){
  // Map lat/lng relative to user location to canvas pixels
  const refLat=S.userLat||27.4924,refLng=S.userLng||77.6737;
  const scale=8000;// pixels per degree
  const x=S.canvasW/2+(lng-refLng)*scale;
  const y=S.canvasH/2-(lat-refLat)*scale;
  return{x,y};
}
function drawMap(){
  if(!S.ctx)return;
  const c=S.ctx,W=S.canvasW,H=S.canvasH;
  // Background
  c.fillStyle='#1a2332';c.fillRect(0,0,W,H);
  // Grid
  c.strokeStyle='rgba(255,255,255,0.03)';c.lineWidth=1;
  for(let x=0;x<W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
  for(let y=0;y<H;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke();}
  // Roads (simulated streets)
  c.strokeStyle='#2a3a52';c.lineWidth=8;c.lineCap='round';
  const roads=[[0,H/2,W,H/2],[W/2,0,W/2,H],[0,H*0.3,W,H*0.3],[0,H*0.7,W,H*0.7]];
  roads.forEach(r=>{c.beginPath();c.moveTo(r[0],r[1]);c.lineTo(r[2],r[3]);c.stroke();});
  // City blocks
  c.fillStyle='#1e2d3e';[[0,0,W*0.45,H*0.27],[W*0.55,0,W,H*0.27],[0,H*0.33,W*0.45,H*0.65],[W*0.55,H*0.33,W,H*0.65],[0,H*0.73,W*0.45,H],[W*0.55,H*0.73,W,H]].forEach(b=>{c.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1]);});
  c.fillStyle='#22334a';[[20,10,100,60],[W*0.55+20,10,W*0.55+100,60],[20,H*0.73+10,100,H*0.73+60],[W*0.55+20,H*0.73+10,W*0.55+100,H*0.73+60]].forEach(b=>{c.fillRect(b[0],b[1],b[2]-b[0],b[3]-b[1]);});
  // Route path
  if(S.routeWps&&S.routeWps.length>1&&S.wpIdx<S.routeWps.length){
    c.strokeStyle='rgba(14,165,233,0.6)';c.lineWidth=3;c.setLineDash([8,5]);c.lineCap='round';
    c.beginPath();
    const mechXY=latLngToXY(S.mechMarkerLat,S.mechMarkerLng);
    c.moveTo(mechXY.x,mechXY.y);
    for(let i=S.wpIdx;i<S.routeWps.length;i++){const p=latLngToXY(S.routeWps[i].lat,S.routeWps[i].lng);c.lineTo(p.x,p.y);}
    c.stroke();c.setLineDash([]);
  }
  // User marker (blue dot)
  const uxy=latLngToXY(S.userLat||27.4924,S.userLng||77.6737);
  c.fillStyle='rgba(59,130,246,0.2)';c.beginPath();c.arc(uxy.x,uxy.y,14,0,Math.PI*2);c.fill();
  c.fillStyle='#3b82f6';c.beginPath();c.arc(uxy.x,uxy.y,7,0,Math.PI*2);c.fill();
  c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(uxy.x,uxy.y,7,0,Math.PI*2);c.stroke();
  c.fillStyle='rgba(148,148,160,0.9)';c.font='9px DM Mono, monospace';c.textAlign='center';c.fillText('YOU',uxy.x,uxy.y+22);
  // Mechanic marker (animated blue square)
  const mxy=latLngToXY(S.mechMarkerLat,S.mechMarkerLng);
  const glow=S.trkMode==='ws'?'rgba(14,165,233,0.3)':S.trkMode==='dr'?'rgba(249,115,22,0.3)':'rgba(239,68,68,0.3)';
  const mc=S.trkMode==='ws'?'#0ea5e9':S.trkMode==='dr'?'#f97316':'#ef4444';
  c.fillStyle=glow;c.beginPath();c.arc(mxy.x,mxy.y,20,0,Math.PI*2);c.fill();
  c.fillStyle=mc;roundRect(c,mxy.x-14,mxy.y-14,28,28,8);c.fill();
  c.strokeStyle='#fff';c.lineWidth=2;roundRect(c,mxy.x-14,mxy.y-14,28,28,8);c.stroke();
  c.font='14px sans-serif';c.textAlign='center';c.fillText('🔧',mxy.x,mxy.y+6);
  c.fillStyle='rgba(148,148,160,0.9)';c.font='9px DM Mono, monospace';c.fillText(S.mech.name.split(' ')[0].toUpperCase(),mxy.x,mxy.y+28);
  // Update coord display
  const trkCoordEl=document.getElementById('trkCoord');
  if(trkCoordEl)trkCoordEl.textContent='Lat:'+S.mechMarkerLat.toFixed(4)+' Lng:'+S.mechMarkerLng.toFixed(4);
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();}
function animateMechTo(tLat,tLng){
  const sLat=S.mechMarkerLat,sLng=S.mechMarkerLng;let step=0;const steps=12;
  clearInterval(S.animTimer);
  S.animTimer=setInterval(()=>{
    step++;const t=step/steps;
    S.mechMarkerLat=sLat+(tLat-sLat)*t;S.mechMarkerLng=sLng+(tLng-sLng)*t;
    drawMap();if(step>=steps)clearInterval(S.animTimer);
  },80);
}
function setTrkMode(mode){
  S.trkMode=mode;
  const dot=document.getElementById('trkDot');const lbl=document.getElementById('trkModeLbl');
  if(!dot)return;
  dot.className='trk-dot '+mode;
  const labels={ws:'WebSocket · Live GPS',poll:'HTTP Polling (backup)',dr:'Dead Reckoning (no GPS)',lost:'Signal lost…'};
  const colors={ws:'var(--grn)',poll:'var(--ylw)',dr:'var(--org)',lost:'var(--red)'};
  lbl.textContent=labels[mode]||mode;lbl.style.color=colors[mode]||'var(--tx2)';
  const gpsMode=document.getElementById('gpsModeVal');const gpsSig=document.getElementById('gpsSignalVal');
  if(gpsMode)gpsMode.textContent=mode==='ws'?'WebSocket':mode==='poll'?'HTTP Poll':mode==='dr'?'Dead Reckoning':'No signal';
  if(gpsSig)gpsSig.textContent=mode==='ws'?'Strong':mode==='poll'?'Medium':mode==='dr'?'Weak (estimating)':'No signal';
}
function updateGpsPanel(){
  const spd=document.getElementById('gpsSpeedVal');const upd=document.getElementById('gpsUpdatesVal');const acc=document.getElementById('gpsAccVal');
  if(spd)spd.textContent=S.trkMode==='lost'?'0 km/h':S.trkSpeed+' km/h';
  if(upd)upd.textContent=S.trkUpdates;
  if(acc)acc.textContent=S.trkMode==='ws'?'±15m':S.trkMode==='poll'?'±50m':S.trkMode==='dr'?'±150m':'unknown';
}

// Primary: WebSocket simulation
function startWS(){
  clearInterval(S.wsTimer);
  S.wsTimer=setInterval(()=>{
    if(!S.trkActive)return;
    S.trkUpdates++;S.trkSpeed=Math.round(18+Math.random()*20);
    // Advance along route
    if(S.wpIdx<S.routeWps.length-1){
      S.wpIdx++;const wp=S.routeWps[S.wpIdx];
      animateMechTo(wp.lat,wp.lng);S.mechLat=wp.lat;S.mechLng=wp.lng;
    } else {
      // Arrived
      toast('🔧 '+S.mech.name+' has arrived!');clearInterval(S.wsTimer);
    }
    updateGpsPanel();
    // Randomly simulate signal loss every ~20 updates
    if(S.trkUpdates>0&&S.trkUpdates%22===0)simulateSignalLoss();
  },1300);// ~3–5s real-world, sped up for demo
}
// Backup: HTTP Polling
function startPolling(){
  clearInterval(S.pollTimer);
  S.pollTimer=setInterval(()=>{
    if(!S.trkActive)return;
    S.trkUpdates++;S.trkSpeed=Math.round(12+Math.random()*15);
    if(S.wpIdx<S.routeWps.length-1){S.wpIdx++;const wp=S.routeWps[S.wpIdx];animateMechTo(wp.lat,wp.lng);S.mechLat=wp.lat;S.mechLng=wp.lng;}
    updateGpsPanel();
  },2500);
}
// Fallback: Dead Reckoning
function startDeadReckoning(){
  S.drLat=S.mechMarkerLat;S.drLng=S.mechMarkerLng;
  S.drHeading=Math.atan2(S.userLng-S.mechMarkerLng,S.userLat-S.mechMarkerLat);// direction to user
  S.drSpeed=0.00005;// ~5m per tick at lat/lng scale
  S.drLastT=Date.now();
  clearInterval(S.drTimer);
  S.drTimer=setInterval(()=>{
    if(!S.trkActive)return;
    const now=Date.now();const dt=(now-S.drLastT)/1000;S.drLastT=now;
    // New Position = Old + Speed × Time × Direction
    S.drLat+=S.drSpeed*dt*Math.cos(S.drHeading)*30;
    S.drLng+=S.drSpeed*dt*Math.sin(S.drHeading)*30;
    S.mechMarkerLat=S.drLat;S.mechMarkerLng=S.drLng;
    S.trkUpdates++;S.trkSpeed=Math.round(8+Math.random()*10);
    drawMap();updateGpsPanel();
  },500);
  // Restore GPS after 7s
  setTimeout(()=>{
    if(!S.trkActive)return;
    clearInterval(S.drTimer);
    document.getElementById('noSignalBanner').classList.remove('show');
    setTrkMode('ws');startWS();
    toast('📡 GPS signal restored!');
  },7000);
}
function simulateSignalLoss(){
  clearInterval(S.wsTimer);clearInterval(S.pollTimer);
  setTrkMode('lost');
  const banner=document.getElementById('noSignalBanner');if(banner)banner.classList.add('show');
  toast('⚠️ GPS weak — Dead Reckoning activated');
  setTimeout(()=>{setTrkMode('dr');startDeadReckoning();},1200);
}
// Start the tracking system
function startTracking(){
  S.trkActive=true;S.trkUpdates=0;S.trkMode='ws';S.wpIdx=0;
  buildRoute();
  setTrkMode('ws');startWS();
  // ETA countdown
  clearInterval(S.etaTrkTimer);
  S.etaTrkTimer=setInterval(()=>{
    if(S.etaVal>0){
      S.etaVal--;
      const eN = document.getElementById('etaNum'); if (eN) eN.textContent=String(S.etaVal).padStart(2,'0');
      const eT = document.getElementById('trkEtaLbl'); if (eT) eT.textContent=String(S.etaVal).padStart(2,'0')+' min';
    }
    else clearInterval(S.etaTrkTimer);
  },3200);
  // Device GPS for user's own position (continuous)
  if(navigator.geolocation){
    S.gpsWatcher=navigator.geolocation.watchPosition(pos=>{
      S.userLat=pos.coords.latitude;S.userLng=pos.coords.longitude;
      S.userLocStr='Lat: '+S.userLat.toFixed(4)+' · Lng: '+S.userLng.toFixed(4);
      const el = document.getElementById('trkUserLoc');
      if (el) el.textContent=S.userLocStr;
      drawMap();
    },()=>{},{enableHighAccuracy:true,maximumAge:5000});
  }
}
function stopTracking(){
  S.trkActive=false;
  clearInterval(S.wsTimer);clearInterval(S.pollTimer);clearInterval(S.drTimer);clearInterval(S.animTimer);clearInterval(S.etaTrkTimer);clearInterval(S._svcPollTimer);
  if(navigator.geolocation&&S.gpsWatcher)navigator.geolocation.clearWatch(S.gpsWatcher);
  if(S._canvasRO){S._canvasRO.disconnect();S._canvasRO=null;}
  const banner=document.getElementById('noSignalBanner');if(banner)banner.classList.remove('show');
}

// ── CALL / CHAT ──
function openCall(){
  S.muted=false;S.speaker=false;S.callSecs=0;
  document.getElementById('callStatus').textContent='● Calling…';
  document.getElementById('muteBtn').textContent='🔇';document.getElementById('muteLbl').textContent='Mute';
  document.getElementById('spkBtn').textContent='🔊';
  document.getElementById('callModal').classList.add('open');
  if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))setTimeout(()=>{window.location.href='tel:';},200);
  setTimeout(()=>{if(!document.getElementById('callModal').classList.contains('open'))return;document.getElementById('callStatus').textContent='● Connected · 0:00';clearInterval(S.callTimer);S.callTimer=setInterval(()=>{S.callSecs++;const m=Math.floor(S.callSecs/60),s=S.callSecs%60;const el=document.getElementById('callStatus');if(el)el.textContent='● '+(S.muted?'Muted · ':'Connected · ')+m+':'+(s<10?'0':'')+s;},1000);},3000);
}
function doHangup(){clearInterval(S.callTimer);document.getElementById('callModal').classList.remove('open');toast('📵 Call ended');}
function togMute(){S.muted=!S.muted;document.getElementById('muteBtn').textContent=S.muted?'🎙️':'🔇';document.getElementById('muteLbl').textContent=S.muted?'Unmute':'Mute';}
function togSpk(){S.speaker=!S.speaker;document.getElementById('spkBtn').textContent=S.speaker?'🔕':'🔊';toast(S.speaker?'🔊 Speaker on':'🔕 Speaker off');}
function openChat(){document.getElementById('chatModal').classList.add('open');setTimeout(()=>{const b=document.getElementById('chatBody');b.scrollTop=b.scrollHeight;},100);}
function closeChat(){document.getElementById('chatModal').classList.remove('open');}
const chatR=['On my way! 👍','Almost there!','Understood!','See you shortly 🚀','No problem!'];
function sendMsg(){const inp=document.getElementById('chatIn');const txt=inp.value.trim();if(!txt)return;const body=document.getElementById('chatBody');const t=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const m=document.createElement('div');m.className='msg me';m.innerHTML=txt+'<span class="msg-time">'+t+'</span>';body.appendChild(m);inp.value='';body.scrollTop=body.scrollHeight;setTimeout(()=>{const r=document.createElement('div');r.className='msg them';r.innerHTML=chatR[Math.floor(Math.random()*chatR.length)]+'<span class="msg-time">Just now</span>';body.appendChild(r);body.scrollTop=body.scrollHeight;},1200);}

// ── SHARE (WhatsApp) ──
function doShareWhatsApp(){
  const mechN=S.mech?S.mech.name:'your mechanic';const svc=S.service||'roadside assistance';
  const loc=S.userLocStr&&S.userLocStr!=='Detecting…'?S.userLocStr:'your location';
  const msg='🚗 *DriveCare Alert!*\n\nI\'ve booked '+svc+' via DriveCare.\n🔧 Mechanic *'+mechN+'* is on the way!\n\n📍 *My location:* '+loc+'\n🔗 *Live track:* https://drivecare.app/track/DC8821\n\n_Download DriveCare for roadside help_';
  const waUrl='https://wa.me/?text='+encodeURIComponent(msg);
  const win=window.open(waUrl,'_blank');
  if(!win||win.closed||typeof win.closed==='undefined'){window.location.href=waUrl;}
  closeOv('shareOv');toast('📱 Opening WhatsApp…');
}
function copyTrackLink(){const link=document.getElementById('shareLinkTxt').textContent;if(navigator.clipboard)navigator.clipboard.writeText(link).then(()=>toast('📋 Link copied!'));else toast('📋 drivecare.app/track/DC8821');closeOv('shareOv');}
function openHelpWhatsApp(){
  const msg='Hello DriveCare Support! 👋\nI need help with my account.\n\nName: '+(S.user?S.user.name:'User')+'\nPhone: '+(S.user?S.user.phone:'N/A');
  // Opens WhatsApp with support message; replace the number below with your actual WhatsApp business number
  const waUrl='https://wa.me/?text='+encodeURIComponent(msg);
  const win=window.open(waUrl,'_blank');
  if(!win||win.closed||typeof win.closed==='undefined'){window.location.href=waUrl;}
  toast('📱 Opening WhatsApp…');
}
function openMechHelpWhatsApp(){
  const msg='Hello DriveCare Mechanic Support! 🔧\nMechanic ID: '+(S.user?S.user.mechId||'—':'—')+'\nName: '+(S.user?S.user.name:'—');
  const waUrl='https://wa.me/?text='+encodeURIComponent(msg);
  const win=window.open(waUrl,'_blank');
  if(!win||win.closed||typeof win.closed==='undefined'){window.location.href=waUrl;}
  toast('📱 Opening WhatsApp…');
}

// ── CANCEL ──
function doCancel(){
  closeOv('cancelOv');stopTracking();clearInterval(S._svcPollTimer);
  if(S.activeMechId)DB.del('svcComplete_mech_'+S.activeMechId);
  S.activeJobId=null;S.activeMechId=null;S.svcCompletedByMech=false;S.paymentDone=false;S.payTiming='now';
  if(S.user&&S.user.history&&S.user.history.length)S.user.history[0].status='cancelled';
  saveUser();vsReset();showScreen('home');toast('❌ Request cancelled');
}

// ── SERVICE COMPLETE POLLING (User side) ──
function startSvcCompletePoller(){
  clearInterval(S._svcPollTimer);
  S._svcPollTimer=setInterval(()=>{
    if(!S.activeJobId) return;
    // 1. Check localStorage first for immediate UI rendering
    let localRec = null;
    if(S.activeMechId){
      localRec=DB.get('svcComplete_mech_'+S.activeMechId);
      if(localRec && (localRec.jobId===S.activeJobId || localRec.id===S.activeJobId)){
        _handlePolledRecord(localRec);
      }
    }

    // 2. ALWAYS poll Supabase for cross-device sync updates
    if (window.supabase && typeof window.supabase.from === 'function' && !window.supabase.isDummy) {
      window.supabase.from('service_requests').select('*').eq('id', S.activeJobId).single().then(({ data, error }) => {
        if (data && !error) {
          // Sync Supabase progress back to local storage so the UI stops relying on stale data
          if (!localRec) localRec = {};
          if (data.otp1Verified) localRec.otp1Verified = true;
          if (data.otp2) localRec.otp2 = data.otp2;
          if (data.otp2Revealed) localRec.otp2Revealed = true;
          if (data.status === 'completed' || data.complete) localRec.complete = true;
          DB.set('svcComplete_mech_'+S.activeMechId, localRec);
          
          // ALWAYS pass localRec (which contains the most advanced/optimistic state)
          // instead of `data` directly, otherwise stale cloud reads will cause the UI to blink
          _handlePolledRecord(localRec);
        }
      });
    }
  },1000);
}

function _handlePolledRecord(rec) {
  if (rec.status === 'completed' || rec.complete) {
    if (!S.svcCompletedByMech) {
      S.svcCompletedByMech = true;
      if (S.payTiming === 'after' && !S.paymentDone) {
        // Fallback in case mechanic somehow forced completion without OTP
        toast('🔧 Service complete! Please pay to confirm.');
      } else {
        toast('🔧 Mechanic has completed the service! You can now confirm.');
      }
    }
  }
  renderUserOtpState(rec);
}

function renderUserOtpState(rec = null) {
  const panel = document.getElementById('otpTrackerPanel');
  if (!panel) return;
  
  if (!rec && S.activeMechId) {
    rec = DB.get('svcComplete_mech_' + S.activeMechId);
  }
  
  if (!rec || (rec.jobId !== S.activeJobId && rec.id !== S.activeJobId)) return;

  const payOk = S.paymentDone || (S.payTiming === 'now');

  let html = '';

  if (!rec.otp1Verified) {
    html = `
      <div style="background:var(--bg3); border:1.5px solid var(--acc); border-radius:var(--r); padding:16px; text-align:center; margin-bottom:15px;">
        <div style="font-size:12px; color:var(--tx3); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">To Start Work</div>
        <div style="font-size:32px; font-weight:800; letter-spacing:8px; color:var(--acc); margin-bottom:10px;">${rec.otp1}</div>
        <div style="font-size:13px; opacity:0.8;">Share this OTP with the mechanic to begin service</div>
      </div>
      <div class="mark-locked">
        <span class="lock-ic">🔒</span>
        <div class="lock-txt"><strong>Waiting for mechanic to start</strong></div>
      </div>
    `;
  } else if (!rec.otp2Revealed) {
    if (S.payTiming === 'after' && !S.paymentDone) {
      html = `
        <div style="background:var(--bg3); border:1.5px solid var(--grn); border-radius:var(--r); padding:16px; text-align:center; margin-bottom:15px;">
          <div style="font-size:24px; margin-bottom:10px;">🛠️</div>
          <div style="font-size:16px; font-weight:600; color:var(--grn); margin-bottom:5px;">Work in Progress</div>
          <div style="font-size:13px; opacity:0.8;">The mechanic is working on your vehicle.</div>
        </div>
        <div class="cta-bar">
          <button class="btn" style="background:var(--org); color:#fff;" onclick="renderPostPayPanel()">💳 Pay Now to Reveal Final OTP</button>
        </div>
      `;
    } else {
      html = `
        <div style="background:var(--bg3); border:1.5px solid var(--grn); border-radius:var(--r); padding:16px; text-align:center; margin-bottom:15px;">
          <div style="font-size:24px; margin-bottom:10px;">🛠️</div>
          <div style="font-size:16px; font-weight:600; color:var(--grn); margin-bottom:5px;">Work in Progress</div>
          <div style="font-size:13px; opacity:0.8;">The mechanic has started the service.</div>
        </div>
        <div class="cta-bar">
          <button class="btn" style="background:var(--acc); color:#fff;" onclick="revealFinalOtp()">Verify Service & Reveal Final OTP</button>
        </div>
      `;
    }
  } else if (!rec.complete) {
    html = `
      <div style="background:var(--bg3); border:1.5px solid var(--org); border-radius:var(--r); padding:16px; text-align:center; margin-bottom:15px;">
        <div style="font-size:12px; color:var(--tx3); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">To Complete Service</div>
        <div style="font-size:32px; font-weight:800; letter-spacing:8px; color:var(--org); margin-bottom:10px;">${rec.otp2}</div>
        <div style="font-size:13px; opacity:0.8;">Share this OTP with the mechanic to finalize the job</div>
      </div>
      <div class="mark-locked">
        <span class="lock-ic">🔒</span>
        <div class="lock-txt"><strong>Waiting for mechanic to finish</strong></div>
      </div>
    `;
  } else {
    if (!payOk) {
      html = `
        <div class="mark-locked">
          <span class="lock-ic">💳</span>
          <div class="lock-txt"><strong>Payment required</strong>Complete payment to proceed</div>
        </div>
        <div class="cta-bar">
          <button class="btn" disabled style="opacity:0.5;">💳 COMPLETE PAYMENT FIRST…</button>
        </div>
      `;
    } else {
      html = `
        <div class="cta-bar">
          <button class="btn" style="background:var(--grn); color:#fff;" onclick="finishJob()">✓ MARK AS COMPLETED</button>
        </div>
      `;
    }
  }

  // Prevent UI flickering by only updating the DOM if the HTML actually changed
  if (panel._lastHtml !== html) {
    panel.innerHTML = html;
    panel._lastHtml = html;
  }
}

function revealFinalOtp() {
  if (!S.activeMechId) return;
  const rec = DB.get('svcComplete_mech_' + S.activeMechId);
  if (rec && rec.jobId === S.activeJobId) {
    rec.otp2Revealed = true;
    DB.set('svcComplete_mech_' + S.activeMechId, rec);
    
    // ── Sync to Supabase ──
    if (window.supabase && typeof window.supabase.from === 'function') {
      window.supabase.from('service_requests')
        .update({ otp2Revealed: true })
        .eq('id', S.activeJobId)
        .then(({ error }) => { if(error) console.error(error); });
    }

    renderUserOtpState(rec);
  }
}

function updateMarkCompleteBtn() {
  renderUserOtpState();
}
function finishJob(){
  if(!S.svcCompletedByMech){toast('⏳ Mechanic has not marked the service complete yet.');return;}
  if(S.payTiming==='after'&&!S.paymentDone){toast('💳 Please complete your payment first.');return;}
  clearInterval(S._svcPollTimer);
  stopTracking();
  // Clean up shared flag now that job is fully done
  if(S.activeMechId)DB.del('svcComplete_mech_'+S.activeMechId);
  S.activeJobId=null;S.activeMechId=null;S.svcCompletedByMech=false;S.paymentDone=false;S.payTiming='now';
  showScreen('rating');
  
  setTimeout(() => {
    const rm = document.getElementById('ratingMech');
    if(rm && S.mech) rm.textContent=S.mech.name;
    S.selectedRating=0;
    renderStars(0);
    const sl = document.getElementById('starLbl');
    if(sl) { sl.textContent='Tap a star to rate'; sl.style.color='var(--tx3)'; }
    const fta = document.getElementById('feedbackTa');
    if(fta) fta.value='';
  }, 150);
}

// ── RATING ──
function rateStar(n){
  S.selectedRating=n;
  renderStars(n);
  const lbl=document.getElementById('starLbl');
  lbl.textContent=n+' star'+(n>1?'s':'')+' — '+STAR_LABELS[n];
  lbl.style.color=n>=4?'var(--grn)':n>=3?'var(--ylw)':n>=2?'var(--org)':'var(--red)';
}
function hoverStar(n){if(!S.selectedRating)renderStars(n,true);}
function unhoverStar(){if(!S.selectedRating)renderStars(0);}
function renderStars(n,h){document.querySelectorAll('.star-r').forEach((el,i)=>{const f=i<n;el.textContent=f?'★':'☆';el.classList.toggle('lit',f&&!h);el.style.color=f?(h?'rgba(250,204,21,.6)':'var(--ylw)'):'var(--tx3)';})}
function submitRating(){
  if(!S.selectedRating){toast('⭐ Please tap a star to rate');return;}
  if(S.user&&S.user.history&&S.user.history.length){
    S.user.history[0].rating=S.selectedRating;
    S.user.history[0].ratingLabel=STAR_LABELS[S.selectedRating];
  }
  saveUser();
  toast('🙏 '+STAR_LABELS[S.selectedRating]+' — Thank you for your feedback!');
  setTimeout(()=>{
    vsReset();        // clear all wizard selections → home starts from Brand step
    showScreen('home');
  },1400);
}
function skipRating(){
  vsReset();          // clear all wizard selections → home starts from Brand step
  showScreen('home');
}



// ── MECHANIC DASHBOARD ──
function refreshMechDash(){
  if(!S.user||S.role!=='mechanic')return;
  const users=DB.get('users')||{};const d=getDigits(S.user.phone);if(users[d])S.user=users[d];
  const midEl=document.getElementById('mechIdDisplay');if(midEl)midEl.textContent=S.user.mechId||'—';
  S.mechOnline=S.user.online!==false;
  const sw=document.getElementById('mechSw');const lbl=document.getElementById('mechStatusLbl');
  if(sw)sw.className='sw '+(S.mechOnline?'on':'off');
  if(lbl){lbl.textContent=S.mechOnline?'Online':'Offline';lbl.style.color=S.mechOnline?'var(--grn)':'var(--tx3)';}
  const today=new Date().toDateString();
  const todayJobs=(S.user.history||[]).filter(h=>h.status==='accepted'&&new Date(h.date).toDateString()===today);
  const todayEarn=todayJobs.reduce((s,h)=>s+(h.netEarned||0),0);
  const e1=document.getElementById('mechDayEarn');if(e1)e1.textContent='₹'+todayEarn;
  const e2=document.getElementById('mechTotalJobs');if(e2)e2.textContent=(S.user.history||[]).filter(h=>h.status==='accepted').length;
  const rats=(S.user.history||[]).filter(h=>h.rating).map(h=>h.rating);const avg=rats.length?(rats.reduce((a,b)=>a+b,0)/rats.length).toFixed(1):'—';
  const e3=document.getElementById('mechRatingDisp');if(e3)e3.textContent=avg;
  renderMechRequests();

  // ── REAL-TIME POLLING: Refresh requests every 5 seconds if on home screen ──
  if (!S._mechDashPoller) {
    S._mechDashPoller = setInterval(() => {
      const activeScreen = document.querySelector('.screen.active');
      if (activeScreen && activeScreen.id === 'mechHome' && S.role === 'mechanic') {
        renderMechRequests();
      } else {
        clearInterval(S._mechDashPoller);
        S._mechDashPoller = null;
      }
    }, 5000);
  }
}
function renderMechRequests(){
  const list=document.getElementById('mechReqList');if(!list)return;
  if(!S.mechOnline){
    list.innerHTML='<div style="text-align:center;padding:30px 20px;color:var(--tx3);font-size:13px;">🔴 You are offline. Go online to receive requests.</div>';
    return;
  }

  // Fetch LIVE requests from Supabase (or fallback to localStorage)
  if (window.supabase && typeof window.supabase.from === 'function' && !window.supabase.isDummy) {
    window.supabase
      .from('service_requests')
      .select('*')
      .eq('status', 'pending')
      .order('ts', { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error('Supabase fetch error:', error);
          _renderRequestsInternal(DB.get('active_requests') || []);
        } else {
          _renderRequestsInternal(data || []);
        }
      });
  } else {
    // Fallback to localStorage
    const liveReqs = (DB.get('active_requests') || []).filter(r => !r.accepted);
    _renderRequestsInternal(liveReqs);
  }
}

function _renderRequestsInternal(liveReqs) {
  const list=document.getElementById('mechReqList'); if(!list) return;

  // Filter for the current mechanic
  const filteredLive = liveReqs.filter(r => {
    return !r.accepted && (!r.targetMechId || r.targetMechId === S.user.mechId);
  });

  // All possible simulated requests, each tagged with a brand id
  const MOCK_REQS=[
    {id:'R-T1', brand:'tata',     service:'Puncture repair',  icon:'🔩', category:'Car',    model:'Nexon',       user:'Arjun Sharma',  dist:'0.9 km', eta:'6',  price:'₹199', vehNum:'MH 12 AB 1234', phone:'+91 98220 11223', lat:19.0760, lng:72.8777},
    {id:'R-T2', brand:'tata',     service:'Battery dead',     icon:'🔋', category:'SUV',    model:'Harrier',     user:'Sunita Rao',    dist:'1.8 km', eta:'12', price:'₹349', phone:'+91 91234 56789', lat:19.0800, lng:72.8800},
    {id:'R-T3', brand:'tata',     service:'Engine issue',     icon:'🔧', category:'Truck',  model:'Prima',       user:'Baldev Singh',  dist:'3.2 km', eta:'21', price:'₹799', vehNum:'MH 14 XY 9876', phone:'+91 88888 77777', lat:19.0900, lng:72.8900},
    {id:'R-M1', brand:'mahindra', service:'Puncture repair',  icon:'🔩', category:'SUV',    model:'Scorpio',     user:'Priya Verma',   dist:'1.1 km', eta:'8',  price:'₹249', phone:'+91 77777 66666', lat:19.1000, lng:72.9000},
    {id:'R-M2', brand:'mahindra', service:'Engine issue',     icon:'🔧', category:'Tractor',model:'265 DI',      user:'Ramprasad',     dist:'2.5 km', eta:'17', price:'₹699', phone:'+91 66666 55555', lat:19.1100, lng:72.9100},
    {id:'R-M3', brand:'mahindra', service:'Out of fuel',      icon:'⛽', category:'SUV',    model:'Thar',        user:'Kavita Joshi',  dist:'1.4 km', eta:'10', price:'₹199', vehNum:'KA 01 CD 5678'},
    {id:'R-H1', brand:'hyundai',  service:'AC issue',         icon:'❄️', category:'SUV',    model:'Creta',       user:'Rajiv Gupta',   dist:'2.0 km', eta:'14', price:'₹699'},
    {id:'R-H2', brand:'hyundai',  service:'Puncture repair',  icon:'🔩', category:'Car',    model:'i20',         user:'Meena Iyer',    dist:'0.7 km', eta:'5',  price:'₹199', vehNum:'DL 4C AB 1122'},
    {id:'R-S1', brand:'maruti',   service:'Battery dead',     icon:'🔋', category:'Car',    model:'Swift',       user:'Deepak Kumar',  dist:'1.3 km', eta:'9',  price:'₹299'},
    {id:'R-S2', brand:'maruti',   service:'Lights/Wiring',    icon:'💡', category:'Car',    model:'WagonR',      user:'Anita Mishra',  dist:'2.2 km', eta:'15', price:'₹299', vehNum:'UP 16 Z 9988'},
    {id:'R-Ho1',brand:'honda',    service:'Puncture repair',  icon:'🔩', category:'Bike',   model:'Shine',       user:'Rohit Yadav',   dist:'0.5 km', eta:'4',  price:'₹149'},
    {id:'R-Ho2',brand:'honda',    service:'Engine issue',     icon:'🔧', category:'Bike',   model:'Hornet',      user:'Vinay Tiwari',  dist:'1.6 km', eta:'11', price:'₹349'},
    {id:'R-B1', brand:'bajaj',    service:'Out of fuel',      icon:'⛽', category:'Bike',   model:'Pulsar',      user:'Santosh Patel', dist:'0.8 km', eta:'6',  price:'₹149', vehNum:'RJ 14 XY 1234'},
    {id:'R-B2', brand:'bajaj',    service:'Puncture repair',  icon:'🔩', category:'Auto',   model:'Maxima',      user:'Karim Khan',    dist:'1.9 km', eta:'13', price:'₹149'},
    {id:'R-He1',brand:'hero',     service:'Battery dead',     icon:'🔋', category:'Bike',   model:'Splendor',    user:'Amit Chauhan',  dist:'0.6 km', eta:'5',  price:'₹199'},
    {id:'R-He2',brand:'hero',     service:'Puncture repair',  icon:'🔩', category:'Scooter',model:'Maestro',     user:'Pooja Singh',   dist:'1.1 km', eta:'8',  price:'₹149'},
    {id:'R-T4', brand:'tvs',      service:'Puncture repair',  icon:'🔩', category:'Scooter',model:'Jupiter',     user:'Sushma Reddy',  dist:'1.7 km', eta:'12', price:'₹149'},
    {id:'R-OT1',brand:'other',    service:'Engine issue',     icon:'🔧', category:'Truck',  model:'Other Truck', user:'Harpal Singh',  dist:'3.0 km', eta:'20', price:'₹799'},
  ];

  const ALL_REQS = [...liveReqs, ...MOCK_REQS];

  // Filter to mechanic's preferred brands (fallback: show all)
  const prefs=S.user.preferredBrands||[];
  const filtered=prefs.length
    ? ALL_REQS.filter(r=>prefs.includes(r.brand))
    : ALL_REQS;

  if(!filtered.length){
    list.innerHTML=`<div style="text-align:center;padding:30px 20px;">
      <div style="font-size:36px;opacity:.3;margin-bottom:10px;">🔍</div>
      <div style="font-size:13px;color:var(--tx3);">No requests match your preferred brands right now.<br>Check back soon!</div>
    </div>`;
    return;
  }

  // Group by brand, keeping the VS_BRANDS order
  const grouped={};
  VS_BRANDS.forEach(b=>{
    const reqs=filtered.filter(r=>r.brand===b.id);
    if(reqs.length) grouped[b.id]={brand:b,reqs};
  });

  // Build HTML: brand header → cards under each brand
  let html='';
  let isFirstCard=true; // first card gets NEW badge

  Object.values(grouped).forEach(({brand:b,reqs})=>{
    html+=`<div class="req-brand-header">
      <span class="rbh-logo">${b.logo}</span>
      <span style="font-weight:600;">${b.name}</span>
      <span class="rbh-count">${reqs.length} request${reqs.length>1?'s':''}</span>
    </div>`;

    reqs.forEach(r=>{
      const earn=Math.round(parseInt(r.price.replace('₹',''))*(1-S.commRate));
      const badgeClass=isFirstCard?'new':'pending';
      const badgeText=isFirstCard?'NEW':'PENDING';
      
      const vehicle=`${r.category} · ${r.model}` + (r.vehNum ? ` (${r.vehNum})` : '');
      const safeArgs=[r.id,r.service,r.icon,vehicle,r.user,r.price,r.brand,r.otp1,r.otp2,r.otpExpiry]
        .map(v=>`'${String(v||'').replace(/'/g,"\\'")}'`).join(',');

      html+=`
        <div class="req-card ${isFirstCard?'new-req':''}" id="req-${r.id}">
          <div class="req-badge" style="background:var(--${isFirstCard?'org':'acc'});">${badgeText}</div>
          <div class="req-svc">
            <span style="font-size:24px;opacity:.8;">${r.icon}</span>
            <span style="font-size:18px;font-weight:600;">${r.service}</span>
          </div>
          
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <div style="width:20px;height:20px;background:rgba(255,255,255,.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;">${b.logo}</div>
            <div style="font-size:12px;font-weight:700;color:var(--acc);">${b.name} ${r.model} <span style="font-weight:400;color:var(--tx3);opacity:.6;">· ${r.category}</span> ${r.vehNum ? `<span style="display:inline-block; margin-left:6px; padding:2px 6px; background:rgba(255,255,255,.1); border-radius:4px; font-family:var(--fm); font-size:10px; color:#fff;">${r.vehNum}</span>` : ''}</div>
          </div>
          
          <div class="req-meta">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="opacity:.6;">👤</span> <b>${r.user}</b>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="opacity:.6;">📞</span> <a href="tel:${r.phone||''}" style="color:inherit;text-decoration:none;">${r.phone || 'N/A'}</a>
            </div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="opacity:.6;">📍</span> ${r.dist} away · ETA ~${r.eta} min
            </div>
            ${(r.lat || r.lng) ? `
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;font-size:10px;opacity:0.6;">
              <span style="opacity:.6;">🛰️</span> Lat: ${r.lat?Number(r.lat).toFixed(4):'?'}, Lng: ${r.lng?Number(r.lng).toFixed(4):'?'}
            </div>
            ` : ''}
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="opacity:.6;">💰</span> ${r.price} <span style="color:var(--tx3);opacity:.6;">(you earn ₹${earn})</span>
            </div>
          </div>
          
          <div class="req-actions">
            <button class="req-acc" onclick="mechAccept(${safeArgs})">✓ ACCEPT</button>
            <button class="req-dec" onclick="mechDecline('${r.id}','${r.service}','${r.icon}','${r.user}')">✕ DECLINE</button>
          </div>
        </div>
      `;
      isFirstCard=false;
    });
  });

  list.innerHTML=html;
}
function mechAccept(reqId,service,icon,vehicle,userName,price,brandId,otp1,otp2,otpExpiry){
  const card=document.getElementById('req-'+reqId);if(card){card.style.opacity='.5';card.style.pointerEvents='none';}
  const total=parseInt(price.replace('₹',''));const net=Math.round(total*(1-S.commRate));
  const jobId = reqId; // Use the ID from the request
  const bObj=VS_BRANDS.find(b=>b.id===brandId)||{logo:'🚗',name:brandId||'Unknown'};
  if(!S.user.history)S.user.history=[];
  S.user.history.unshift({jobId,service,serviceIcon:icon,vehicle,userName,price,netEarned:net,brandId,brandName:bObj.name,brandLogo:bObj.logo,status:'accepted',mechComplete:false,date:Date.now()});
  S.user.grossEarnings=(S.user.grossEarnings||0)+total;S.user.walletBal=(S.user.walletBal||0)+net;
  if(!S.user.walletTxns)S.user.walletTxns=[];
  S.user.walletTxns.unshift({type:'credit',label:bObj.name+' · '+service,amount:net,date:Date.now()});
  S.activeJob={jobId,service,serviceIcon:icon,vehicle,userName,price,net,reqId,brandId,brandName:bObj.name,brandLogo:bObj.logo};
  S.svcCompletedByMech=false;
  const mechId=S.user.mechId||'unknown';
  // ── MERGE with existing record to preserve user-generated OTPs ──
  // The user writes otp1/otp2/otpExpiry into this key in proceedToTracking.
  // Overwriting those values would break OTP verification.
  const existingRecRaw = DB.get('svcComplete_mech_'+mechId) || {};
  const existingRec = existingRecRaw.jobId === jobId ? existingRecRaw : {};
  
  DB.set('svcComplete_mech_'+mechId, {
    ...existingRec,
    complete: false,
    jobId,
    mechId,
    service,
    vehicle,
    userName,
    price,
    brandId,
    otp1: existingRec.otp1 || otp1 || null,
    otp2: existingRec.otp2 || otp2 || null,
    otp1Verified: false,
    otp2Revealed: false,
    otpRetries: 0,
    otpExpiry: existingRec.otpExpiry || parseInt(otpExpiry) || 0,
    ts: Date.now()
  });
  
  // ── Mark as accepted in Supabase ──
  if (window.supabase && typeof window.supabase.from === 'function') {
    window.supabase
      .from('service_requests')
      .update({ status: 'accepted', targetMechId: mechId })
      .eq('id', reqId)
      .then(({ error }) => { if(error) console.error(error); });
  }

  // ── Remove from live requests (local fallback) ──
  const liveReqs = (DB.get('active_requests') || []).filter(r => r.id !== reqId);
  DB.set('active_requests', liveReqs);

  saveUser();if(typeof adminAddLog==='function')adminAddLog('service',`⚡ ${S.user?S.user.name:'Mechanic'} accepted: ${service} for ${userName}`);refreshMechDash();toast('✅ Accepted! Go to Service tab to mark complete.');
  // Save session so page refresh restores the mechSvcComplete screen
  saveSession('mechSvcComplete');
  setTimeout(()=>{
    if(card){card.innerHTML='<div style="color:var(--grn);font-weight:600;font-size:13px;padding:4px 0;">✓ Accepted! Mark complete in <span style="color:var(--acc);">Service tab</span>.</div>';card.style.opacity='1';card.style.pointerEvents='auto';card.style.borderColor='var(--grn)';}
    showMechTab('svcComplete');
  },600);
}
function mechDecline(reqId,service,icon,userName){
  const card=document.getElementById('req-'+reqId);
  if(!S.user.history)S.user.history=[];S.user.history.unshift({service,serviceIcon:icon,vehicle:'—',userName,status:'declined',date:Date.now(),price:'₹0'});
  saveUser();toast('❌ Declined — forwarding to next mechanic…');
  if(card){card.style.opacity='.4';card.style.pointerEvents='none';setTimeout(()=>{card.innerHTML='<div style="color:var(--red);font-size:12px;padding:4px 0;">✕ Declined — forwarded to next mechanic.</div>';card.style.opacity='1';},600);}
}
function togMechOnline(){
  S.mechOnline=!S.mechOnline;S.user.online=S.mechOnline;saveUser();
  const sw=document.getElementById('mechSw');const lbl=document.getElementById('mechStatusLbl');
  if(sw)sw.className='sw '+(S.mechOnline?'on':'off');
  if(lbl){lbl.textContent=S.mechOnline?'Online':'Offline';lbl.style.color=S.mechOnline?'var(--grn)':'var(--tx3)';}
  toast(S.mechOnline?'🟢 You are now online and receiving requests':'⚫ You are now offline');
  renderMechRequests();
}

// ── SERVICE COMPLETE (Mechanic side) ──
function renderMechSvcComplete(){
  const body=document.getElementById('mechSvcCompleteBody');if(!body)return;
  // Refresh active job from state
  const job=S.activeJob;
  if(!job){
    body.innerHTML=`<div class="no-active-job"><div class="naj-ic">✅</div><div class="naj-title">NO ACTIVE SERVICE</div><div class="naj-sub">When you accept a request, the active job<br>will appear here for you to mark complete.</div></div>`;
    return;
  }
  
  const rec = DB.get('svcComplete_mech_' + (S.user?.mechId || S.activeMechId));
  const otp1Verified = rec ? rec.otp1Verified : false;
  const otp2Revealed = rec ? rec.otp2Revealed : false;
  const complete = rec ? rec.complete : false;
  
  let contentHtml = '';
  
  if (!otp1Verified) {
    // State 1: Need OTP 1 to start work
    contentHtml = `
      <div style="margin-bottom:20px; text-align:center;">
        <div style="font-size:14px; margin-bottom:10px; color:var(--tx2);">Ask the user for <strong>OTP 1</strong> to start the service.</div>
        <input type="text" id="mechOtp1Input" placeholder="Enter 4-digit OTP" maxlength="4" style="text-align:center; font-size:24px; letter-spacing:8px; padding:12px; width:100%; border-radius:var(--r); border:1.5px solid var(--b); background:var(--bg3); color:var(--tx1); outline:none;">
      </div>
      <button onclick="mechVerifyOtp1()" class="btn-complete" style="background:var(--acc);">🚀 VERIFY TO START WORK</button>
    `;
  } else if (!complete) {
    // State 2: Work started, waiting for completion OTP 2
    contentHtml = `
      <div style="margin-bottom:20px; text-align:center;">
        <div style="color:var(--grn); font-weight:600; margin-bottom:15px; font-size:16px;">🛠️ Work Started</div>
        <div style="font-size:14px; margin-bottom:10px; color:var(--tx2);">Ask the user to reveal and share <strong>OTP 2</strong> to complete.</div>
        <input type="text" id="mechOtp2Input" placeholder="Enter 4-digit OTP" maxlength="4" style="text-align:center; font-size:24px; letter-spacing:8px; padding:12px; width:100%; border-radius:var(--r); border:1.5px solid var(--b); background:var(--bg3); color:var(--tx1); outline:none;">
      </div>
      <button onclick="mechVerifyOtp2()" class="btn-complete">✓ VERIFY TO COMPLETE SERVICE</button>
    `;
  } else {
    // State 3: Success
    contentHtml = `
      <div class="success-msg-box" style="margin-bottom:20px;">
         <strong>✓ You have marked this service complete.</strong>
         <p>The user can now confirm and rate the service.</p>
      </div>
      <button onclick="mechClearActiveJobAndGoHome()" class="btn-complete" style="background:var(--acc);">🏠 RETURN TO DASHBOARD</button>
    `;
  }

  body.innerHTML=`
    <div class="svc-complete-card">
      <div class="svc-complete-header">
        <div class="svc-complete-ic">${job.serviceIcon}</div>
        <div>
          <div class="svc-complete-title">${job.service}</div>
          <div class="svc-complete-sub">👤 ${job.userName} · ${job.vehicle}</div>
        </div>
      </div>
      
      <div style="display:flex;flex-direction:column;gap:1px;background:var(--b);border-radius:var(--r);overflow:hidden;margin-bottom:20px;">
        <div style="background:var(--bg3);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="opacity:.6;font-size:16px;">💰</span>
            <span style="font-size:11px;color:var(--tx3);text-transform:uppercase;letter-spacing:1px;">Service price</span>
          </div>
          <div style="font-size:18px;font-weight:600;">${job.price}</div>
        </div>
        <div style="background:var(--bg3);padding:14px 18px;display:flex;justify-content:space-between;align-items:center;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="opacity:.6;font-size:16px;">🏦</span>
            <span style="font-size:11px;color:var(--tx3);text-transform:uppercase;letter-spacing:1px;">Your earnings <span style="text-transform:none;opacity:.6;">(after 20% commission)</span></span>
          </div>
          <div style="font-size:18px;font-weight:700;color:var(--grn);">₹${job.net}</div>
        </div>
      </div>

      <div class="status-tag ${complete?'completed':'inprogress'}">
        <span style="font-size:12px;">${complete?'✓':'🛠️'}</span>
        ${complete?'Service Marked Complete':'In Progress — Service Ongoing'}
      </div>

      ${contentHtml}
    </div>`;
}

function mechVerifyOtp1() {
  const input = document.getElementById('mechOtp1Input').value.trim();
  if(!input) { toast('⚠️ Please enter OTP'); return; }
  
  const mid = S.user?.mechId || S.activeMechId;
  const rec = DB.get('svcComplete_mech_' + mid);
  if(!rec) {
    console.error('No service record found for mechanic:', mid);
    toast('❌ Error: Job record not found. Try refreshing.');
    return;
  }

  // Debug logging
  console.log('Verifying OTP 1:', { entered: input, expected: rec.otp1, match: input === String(rec.otp1) });

  if (rec.otpExpiry && Date.now() > rec.otpExpiry) {
    toast('❌ OTP Expired'); return;
  }
  if (rec.otpRetries >= 5) {
    toast('❌ Too many incorrect attempts. Job locked.'); return;
  }
  if (String(input).trim() !== String(rec.otp1 || '').trim()) {
    rec.otpRetries = (rec.otpRetries || 0) + 1;
    DB.set('svcComplete_mech_' + mid, rec);
    toast('❌ Incorrect OTP'); return;
  }
  
  // Generate Completion OTP 2 now that work has started
  const otp2 = Math.floor(1000 + Math.random() * 9000).toString();
  
  rec.otp1Verified = true;
  rec.otp2 = otp2;
  rec.otpRetries = 0; 
  DB.set('svcComplete_mech_' + mid, rec);

  // ── Sync to Supabase ──
  if (window.supabase && typeof window.supabase.from === 'function') {
    window.supabase.from('service_requests')
      .update({ otp1Verified: true, otp2: otp2, status: 'in_progress' })
      .eq('id', rec.jobId || S.activeJob?.jobId)
      .then(({ error }) => {
        if (error) console.error('Supabase OTP1 update error:', error);
      });
  }

  toast('✅ Work Started');
  renderMechSvcComplete();
}

function mechVerifyOtp2() {
  const input = document.getElementById('mechOtp2Input').value.trim();
  if(!input) { toast('⚠️ Please enter OTP'); return; }
  
  const mid = S.user?.mechId || S.activeMechId;
  const rec = DB.get('svcComplete_mech_' + mid);
  if(!rec) return;

  console.log('Verifying OTP 2:', { entered: input, expected: rec.otp2, match: input === String(rec.otp2) });

  if (rec.otpExpiry && Date.now() > rec.otpExpiry) {
    toast('❌ OTP Expired'); return;
  }
  if (rec.otpRetries >= 5) {
    toast('❌ Too many incorrect attempts. Job locked.'); return;
  }
  if (String(input).trim() !== String(rec.otp2 || '').trim()) {
    rec.otpRetries = (rec.otpRetries || 0) + 1;
    DB.set('svcComplete_mech_' + mid, rec);
    toast('❌ Incorrect OTP'); return;
  }
  
  rec.complete = true;
  rec.otpRetries = 0;
  DB.set('svcComplete_mech_' + mid, rec);
  
  // ── Sync to Supabase ──
  if (window.supabase && typeof window.supabase.from === 'function') {
    window.supabase.from('service_requests')
      .update({ complete: true, status: 'completed' })
      .eq('id', rec.jobId || S.activeJob?.jobId)
      .then(({ error }) => { if(error) console.error(error); });
  }

  S.svcCompletedByMech = true;
  if(S.user && S.user.history && S.activeJob && S.activeJob.jobId){
    const h=S.user.history.find(x=>x.jobId===S.activeJob.jobId);
    if(h) h.mechComplete=true;
  }
  saveUser();
  toast('✅ Service Complete');
  renderMechSvcComplete();
}

window.mechClearActiveJobAndGoHome = function() {
  const mid = S.user?.mechId || S.activeMechId;
  DB.del('svcComplete_mech_' + mid);
  S.activeJobId = null;
  S.activeJob = null;
  S.svcCompletedByMech = false;
  
  if (window.reactNavigate) {
    window.reactNavigate('mechHome');
  } else {
    refreshMechDash();
  }
};

// ── RENDER FUNCTIONS ──
function renderUserHistory(){
  const list=document.getElementById('userHistList');
  if(!list) return;
  const hist=(S.user&&S.user.history)||[];
  if(!hist.length){list.innerHTML='<div class="empty-state"><div style="font-size:48px;opacity:.35;margin-bottom:14px;">📋</div><div style="font-family:var(--dp);font-size:24px;color:var(--tx2);">NO HISTORY YET</div><div style="font-size:12px;color:var(--tx3);margin-top:6px;">Completed services appear here</div></div>';return;}
  list.innerHTML=hist.map(h=>{const d=new Date(h.date);const ds=d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+' · '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});const st=h.rating?'<br><span style="color:var(--ylw);font-size:11px;">'+'★'.repeat(h.rating)+'☆'.repeat(5-h.rating)+'</span> <span style="font-size:10px;color:var(--tx3);">'+(h.ratingLabel||'')+'</span>':'';const bc=h.status==='done'?'done':h.status==='cancelled'?'cancel':'done';return`<div class="hist-item"><div class="hi-top"><div class="hi-ic">${h.serviceIcon}</div><div><div class="hi-title">${h.service}</div><div class="hi-date">${ds}</div></div><div class="hi-badge ${bc}">${h.status==='done'?'Completed':h.status==='cancelled'?'Cancelled':'Done'}</div></div><div class="hi-bot"><div class="hi-mech">🔧 ${h.mechName}${h.mechId?' · <span style="font-family:var(--mn);font-size:10px;color:var(--tx3);">'+h.mechId+'</span>':''} · ${h.vehicle}${st}</div><div class="hi-price">${h.price}</div></div></div>`;}).join('');
}
function renderUserProfile(){
  if(!S.user)return;
  const av = document.getElementById('profAv');
  const nm = document.getElementById('profName');
  const ph = document.getElementById('profPhone');
  const uid = document.getElementById('profUserId');
  const wb = document.getElementById('profWalBal');
  if(!av || !nm || !ph || !uid || !wb) return;

  av.textContent=S.user.initials||'?';
  nm.textContent=S.user.name;
  ph.textContent=S.user.phone;
  uid.textContent='ID: '+(S.user.userId||'—');
  wb.textContent='₹'+(S.user.walletBal||0);
  const hist=(S.user.history)||[];const done=hist.filter(h=>h.status==='done');
  const total=done.reduce((s,h)=>s+parseInt(h.price.replace('₹','')||0),0);
  const rats=done.filter(h=>h.rating).map(h=>h.rating);const avg=rats.length?(rats.reduce((a,b)=>a+b,0)/rats.length).toFixed(1):'—';
  
  const jobs = document.getElementById('pJobs');
  const rat = document.getElementById('pRating');
  const sp = document.getElementById('pSpend');
  if(jobs) jobs.textContent=done.length;
  if(rat) rat.textContent=avg;
  if(sp) sp.textContent='₹'+total;
}

// ══════════════════════════════════════════════════════════════
// CHANGE PHONE NUMBER FLOW
// User or mechanic taps phone → enters new number → OTP → saved.
// The old phone key in users DB is removed; new key is written.
// ══════════════════════════════════════════════════════════════
let _cpPendingOtp=null, _cpPendingPhone=null;

function openChangePhone(){
  if(!S.user){toast('⚠️ Please log in first.');return;}
  // Reset overlay to step 1
  document.getElementById('cpStep1').style.display='block';
  document.getElementById('cpStep2').style.display='none';
  document.getElementById('cpNewPhone').value='';
  const phErr=document.getElementById('cpPhErr');
  if(phErr)phErr.style.display='none';
  document.getElementById('cpNewPhone').classList.remove('err');
  clearOtp('cp');
  const otpErr=document.getElementById('cpOtpErr');
  if(otpErr)otpErr.style.display='none';
  _cpPendingOtp=null;_cpPendingPhone=null;
  openOv('changePhoneOv');
  setTimeout(()=>{const el=document.getElementById('cpNewPhone');if(el)el.focus();},300);
}

function cpSendOtp(){
  const el=document.getElementById('cpNewPhone');
  const err=document.getElementById('cpPhErr');
  if(!validPhone(el)){
    el.classList.add('err');err.style.display='block';return;
  }
  el.classList.remove('err');err.style.display='none';
  const newDigits=getDigits(el.value);
  const oldDigits=getDigits(S.user.phone);
  // Prevent re-registering the same number
  if(newDigits===oldDigits){
    el.classList.add('err');
    err.textContent='This is already your current number.';
    err.style.display='block';return;
  }
  // Prevent stealing another account's number
  const users=DB.get('users')||{};
  if(users[newDigits]){
    el.classList.add('err');
    err.textContent='This number is already registered to another account.';
    err.style.display='block';return;
  }
  err.textContent='Enter a valid 10-digit Indian mobile number (starts with 6–9)';
  _cpPendingOtp=genOtp();
  _cpPendingPhone=newDigits;
  // Show OTP (demo mode — in production this fires SMS)
  document.getElementById('cpOtpMsg').textContent=
    '📱 OTP sent to '+el.value+' (demo: '+_cpPendingOtp+')';
  document.getElementById('cpStep1').style.display='none';
  document.getElementById('cpStep2').style.display='block';
  clearOtp('cp');
  const otpErr=document.getElementById('cpOtpErr');
  if(otpErr)otpErr.style.display='none';
  setTimeout(()=>{const b=document.getElementById('cp0');if(b)b.focus();},150);
}

function cpVerifyOtp(){
  const entered=getOtp('cp');
  const otpErr=document.getElementById('cpOtpErr');
  if(entered!==_cpPendingOtp){
    otpErr.style.display='block';
    clearOtp('cp');
    setTimeout(()=>{const b=document.getElementById('cp0');if(b)b.focus();},50);
    return;
  }
  otpErr.style.display='none';
  // ── Save new phone ──
  const users=DB.get('users')||{};
  const oldDigits=getDigits(S.user.phone);
  const newDigits=_cpPendingPhone;
  // Build formatted phone string +91XXXXXXXXXX
  const formatted='+91'+newDigits;
  // Remove old key, write under new key
  delete users[oldDigits];
  S.user.phone=formatted;
  // Rebuild initials haven't changed; just update phone
  users[newDigits]=S.user;
  DB.set('users',users);
  // Update currentUser pointer
  DB.set('currentUser',{phone:formatted});
  DB.set('user',S.user);
  saveUser();
  // Update every phone display element currently in the DOM
  ['profPhone','mechProfPhone'].forEach(id=>{
    const el=document.getElementById(id);
    if(el)el.textContent=formatted;
  });
  closeOv('changePhoneOv');
  toast('✅ Phone number updated to '+formatted);
  _cpPendingOtp=null;_cpPendingPhone=null;
}

function cpResendOtp(){
  _cpPendingOtp=genOtp();
  const el=document.getElementById('cpNewPhone');
  document.getElementById('cpOtpMsg').textContent=
    '📱 New OTP sent to '+(el?el.value:'+91'+_cpPendingPhone)+' (demo: '+_cpPendingOtp+')';
  clearOtp('cp');
  const otpErr=document.getElementById('cpOtpErr');
  if(otpErr)otpErr.style.display='none';
  toast('📱 OTP resent!');
  setTimeout(()=>{const b=document.getElementById('cp0');if(b)b.focus();},50);
}

function cpBack(){
  document.getElementById('cpStep2').style.display='none';
  document.getElementById('cpStep1').style.display='block';
  _cpPendingOtp=null;_cpPendingPhone=null;
  setTimeout(()=>{const el=document.getElementById('cpNewPhone');if(el)el.focus();},150);
}

function renderMechHistory(){
  const list=document.getElementById('mechHistList');
  if(!list) return;
  const hist=(S.user&&S.user.history)||[];
  if(!hist.length){list.innerHTML='<div style="padding:60px 20px;text-align:center;font-size:13px;color:var(--tx3);">No service history yet.</div>';return;}
  list.innerHTML=hist.map(h=>{
    const d=new Date(h.date);
    const ds=d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})+' · '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    const bc=h.status==='accepted'?'done':h.status==='declined'?'declined':'cancel';
    const bl=h.status==='accepted'?'Accepted':h.status==='declined'?'Declined':'Cancelled';
    const earn=h.netEarned?`<span style="color:var(--grn);font-family:var(--mn);font-size:12px;">+₹${h.netEarned}</span>`:'';
    const brandBadge=h.brandName?`<span style="background:var(--bg4);border:1px solid var(--b);border-radius:999px;padding:1px 7px;font-size:9px;font-family:var(--fm);color:var(--tx2);margin-left:5px;vertical-align:middle;">${h.brandName}</span>`:'';
    return`<div class="hist-item">
      <div class="hi-top">
        <div class="hi-ic">${h.serviceIcon||'🔧'}</div>
        <div style="flex:1;">
          <div class="hi-title">${h.service}${brandBadge}</div>
          <div class="hi-date">${ds}${h.userName?' · 👤 '+h.userName:''}</div>
        </div>
        <div class="hi-badge ${bc}">${bl}</div>
      </div>
      <div class="hi-bot"><div class="hi-mech">${h.vehicle||'—'}</div>${earn||'<span></span>'}</div>
    </div>`;
  }).join('');
}
function renderMechProfile(){
  if(!S.user)return;
  const list=document.getElementById('mpBrands');
  if(!list) return;
  const p=document.getElementById('mechProfile');
  if(!p)return;
  
  const done=(S.user.history||[]).filter(h=>h.status==='accepted'||h.status==='done');
  const rats=done.filter(h=>h.rating).map(h=>h.rating);
  const avg=rats.length?(rats.reduce((a,b)=>a+b,0)/rats.length).toFixed(1):'—';
  
  p.innerHTML=`
    <div class="mp-wrap">
      <div class="mp-header">
        <div class="mp-av-lg">${S.user.initials||'DM'}</div>
        <div class="mp-name">${S.user.name||'DEMO MECHANIC'}</div>
        <div class="mp-meta">
          <span>${S.user.phone}</span>
          <span class="mp-role-tag">Mechanic</span>
        </div>
        <div class="mp-meta" style="margin-top:2px;opacity:.6;">ID: ${S.user.mechId||'DC-M-001'}</div>
      </div>
      
      <div class="mp-stats">
        <div class="mp-stat-item">
          <span class="mp-stat-val">${done.length}</span>
          <span class="mp-stat-lbl">Jobs</span>
        </div>
        <div class="mp-stat-item">
          <span class="mp-stat-val">—</span>
          <span class="mp-stat-lbl">Rating</span>
        </div>
        <div class="mp-stat-item">
          <span class="mp-stat-val acc">₹${S.user.grossEarnings||0}</span>
          <span class="mp-stat-lbl">Earned</span>
        </div>
      </div>
      
      <div class="mp-section-list">
        <div class="mp-info-card">
          <div class="mp-info-ic">🏪</div>
          <div class="mp-info-content">
            <div class="mp-info-lbl">Shop name</div>
            <div class="mp-info-val">${S.user.shopName||'Demo Auto Works'}</div>
          </div>
        </div>
        <div class="mp-info-card">
          <div class="mp-info-ic">⚙️</div>
          <div class="mp-info-content">
            <div class="mp-info-lbl">Specialization</div>
            <div class="mp-info-val">${S.user.specialization||'All vehicle types'}</div>
          </div>
        </div>
        <div class="mp-info-card">
          <div class="mp-info-ic">🏎️</div>
          <div class="mp-info-content">
            <div class="mp-info-lbl">Preferred brands</div>
            <div class="mp-brands-wrap" id="mpBrands">
              ${(S.user.preferredBrands||['Tata','Mahindra','Maruti','Honda','Bajaj','Hero']).map((id,i)=>{
                const b=VS_BRANDS.find(x=>x.id===id)||{logo:'🚗',name:id};
                const cls=['acc','org','red','acc','org','red'][i%6];
                return `<span class="brand-pill ${cls}">${b.logo} ${b.name}</span>`;
              }).join('')}
            </div>
          </div>
        </div>
        <div class="mp-info-card">
          <div class="mp-info-ic">🏦</div>
          <div class="mp-info-content">
            <div class="mp-info-lbl">Bank (for payouts)</div>
            <div class="mp-info-val">${S.user.bankAccMasked||'xxxx1234'} · IFSC: ${S.user.bankIfsc||'SBIN0001234'}</div>
          </div>
        </div>
      </div>
      
      <div class="mp-menu">
        <div class="mp-menu-item" onclick="showMechTab('history')">
          <div class="mp-menu-ic">📋</div>
          <div class="mp-menu-lbl">Service History</div>
          <div class="mp-menu-arr">›</div>
        </div>
        <div class="mp-menu-item" onclick="showMechTab('earnings')">
          <div class="mp-menu-ic">💰</div>
          <div class="mp-menu-lbl">Earnings & Payout</div>
          <div class="mp-menu-arr">›</div>
        </div>
        <div class="mp-menu-item">
          <div class="mp-menu-ic">🛡️</div>
          <div class="mp-menu-lbl">Privacy & Safety</div>
          <div class="mp-menu-arr">›</div>
        </div>
      </div>
    </div>
  `;
}
function renderMechEarnings(){
  if(!S.user)return;
  const bal = document.getElementById('mechWalBal');
  const grossEl = document.getElementById('mechGross');
  const commEl = document.getElementById('mechComm');
  const netEl = document.getElementById('mechNet');
  const paidEl = document.getElementById('mechPaidOut');
  if(!bal || !grossEl || !commEl || !netEl || !paidEl) return;

  const gross=S.user.grossEarnings||0;const comm=Math.round(gross*S.commRate);const net=gross-comm;const paid=S.user.paidOut||0;
  bal.textContent='₹'+(S.user.walletBal||0);
  grossEl.textContent='₹'+gross;commEl.textContent='-₹'+comm;
  netEl.textContent='₹'+net;paidEl.textContent='₹'+paid;
  
  const poAvail = document.getElementById('poAvail');
  if(poAvail) poAvail.textContent='₹'+(S.user.walletBal||0);

  const pList=document.getElementById('payoutList');const payouts=S.user.payouts||[];
  if(pList) pList.innerHTML=payouts.length?payouts.map(p=>`<div class="payout-card"><div style="display:flex;align-items:center;margin-bottom:8px;font-size:14px;font-weight:600;">🏦 Payout<div class="payout-status ${p.status==='completed'?'done':'pending'}" style="margin-left:auto;">${p.status==='completed'?'✓ Completed':'⏳ Pending'}</div></div><div style="font-size:13px;color:var(--tx2);">₹<span style="color:var(--grn);font-family:var(--mn);">${p.amount}</span> · ${p.bankAcc}</div><div style="font-size:11px;color:var(--tx3);margin-top:4px;">${new Date(p.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div></div>`).join(''):'<div style="font-size:12px;color:var(--tx3);margin-bottom:14px;">No payouts yet.</div>';
  
  const eTxns=document.getElementById('mechEarnTxns');const txns=(S.user.walletTxns||[]).filter(t=>t.type==='credit');
  if(eTxns) eTxns.innerHTML=txns.length?txns.map(t=>{const d=new Date(t.date);const ds=d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' · '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});return`<div class="txn-item"><div class="txn-ic" style="background:var(--gdm);">↓</div><div class="txn-info"><div class="txn-name">${t.label}</div><div class="txn-date">${ds}</div></div><div class="txn-amt cr">+₹${t.amount}</div></div>`;}).join(''):'<div style="font-size:12px;color:var(--tx3);">No earnings yet.</div>';
}

// ── PAYOUT ──
function openPayoutModal(){
  if(!S.user)return;
  const avail = document.getElementById('poAvail');
  const bank = document.getElementById('poBank');
  if(avail) avail.textContent='₹'+(S.user.walletBal||0);
  if(bank) bank.textContent=S.user.bankAccMasked||'Not set';
  openOv('payoutModal');
}
function requestPayout(){
  if(!S.user) return;
  const amtEl = document.getElementById('payoutAmt');
  if(!amtEl) return;
  const amt = parseInt(amtEl.value);
  const bal = S.user.walletBal||0;

  if(isNaN(amt) || amt < 100){toast('⚠️ Minimum payout is ₹100'); return;}
  if(amt > bal){toast('⚠️ Insufficient balance'); return;}
  if(!S.user.bankAccFull){toast('⚠️ Please add bank details in profile first'); return;}

  const payout={amount:amt,bankAcc:S.user.bankAccMasked,ifsc:S.user.bankIfsc,name:S.user.name,date:Date.now(),status:'pending'};
  if(!S.user.payouts)S.user.payouts=[];S.user.payouts.unshift(payout);
  
  S.user.walletBal -= amt;
  S.user.paidOut = (S.user.paidOut||0) + amt;
  
  if(!S.user.walletTxns) S.user.walletTxns = [];
  S.user.walletTxns.unshift({type:'debit', label:'Payout Requested', amount:amt, date:Date.now()});

  saveUser();
  closeOv('payoutModal');
  renderMechEarnings();
  toast('✅ Payout of ₹'+amt+' requested!');
  
  // Auto-complete after 5s for demo
  setTimeout(()=>{
    if(S.user.payouts && S.user.payouts[0]) S.user.payouts[0].status='completed';
    saveUser();
    if(document.getElementById('mechEarningsScreen')?.classList.contains('active')) renderMechEarnings();
    toast('🏦 Payout of ₹'+amt+' completed!');
  },5000);
}


// ── MISC ──

// ── Privacy toggle ──
function togSw(el){el.classList.toggle('on');}

// ── FAQ accordion ──
function togFaq(el){
  const ans=el.nextElementSibling;
  if(!ans||!ans.classList.contains('faq-ans'))return;
  const open=ans.style.display==='block';
  // Close all
  document.querySelectorAll('.faq-ans').forEach(a=>a.style.display='none');
  // Open clicked (if was closed)
  if(!open)ans.style.display='block';
}




// ══════════════════════════════════════════════════════════════
// ADMIN PORTAL — Complete Implementation
// ══════════════════════════════════════════════════════════════

// ── Admin credentials (in production: server-side auth) ──


// ── Admin state ──
let ADM = {
  loggedIn: false,
  adminUser: null,
  currentTab: 'dashboard',
  notifTarget: 'all',
  notifType: 'info',
  assigningReqId: null,
  assigningJobId: null,
  assigningUserId: null,
  selectedMechForAssign: null,
  logs: [],
  notifications: [],
  blockedUsers: new Set()
};

// ── Pricing state (mirrors VS_SERVICES prices) ──
let ADM_PRICES = {
  Bike:   { Puncture:149, 'Battery dead':199, 'Out of fuel':149, 'Engine issue':349, 'Lights/Wiring':249 },
  Scooter:{ Puncture:149, 'Battery dead':199, 'Out of fuel':149, 'Engine issue':299 },
  Car:    { Puncture:199, 'Battery dead':299, 'Out of fuel':199, 'Engine issue':499, 'AC issue':599, 'Lights/Wiring':299 },
  SUV:    { Puncture:249, 'Battery dead':349, 'Out of fuel':199, 'Engine issue':599, 'AC issue':699, 'Lights/Wiring':349 },
  Truck:  { Puncture:399, 'Battery dead':499, 'Out of fuel':299, 'Engine issue':799 },
  Tractor:{ Puncture:349, 'Engine issue':699, 'Out of fuel':249, Hydraulics:799 },
  Auto:   { Puncture:149, 'Battery dead':199, 'Out of fuel':149, 'Engine issue':349 }
};

// ── Helper: get all users from DB ──
function adminGetAllUsers() {
  const users = DB.get('users') || {};
  return Object.values(users);
}
function adminGetUsers() {
  return adminGetAllUsers().filter(u => u.role === 'user' || !u.role || u.role === '');
}
function adminGetMechs() {
  return adminGetAllUsers().filter(u => u.role === 'mechanic');
}
function adminGetAllHistory() {
  const all = [];
  adminGetAllUsers().forEach(u => {
    (u.history || []).forEach(h => {
      all.push({
        ...h,
        _owner: u.name||'Unknown',
        _ownerPhone: u.phone||'',
        _ownerRole: u.role||'user'
      });
    });
  });
  return all.sort((a, b) => (b.date || 0) - (a.date || 0));
}
function adminGetAllTxns() {
  const all = [];
  adminGetAllUsers().forEach(u => {
    (u.walletTxns || []).forEach(t => {
      all.push({ ...t, _owner: u.name, _ownerRole: u.role });
    });
  });
  return all.sort((a, b) => (b.date || 0) - (a.date || 0));
}
function adminFmtDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function adminAddLog(type, msg) {
  ADM.logs.unshift({ type, msg, ts: Date.now() });
  if (ADM.logs.length > 200) ADM.logs = ADM.logs.slice(0, 200);
}

// ── LOGIN ──
async function adminLogin() {
  const u = (document.getElementById('adminUser').value || '').trim();
  const p = (document.getElementById('adminPass').value || '').trim();
  const ue = document.getElementById('adminUserErr');
  const pe = document.getElementById('adminPassErr');
  const le = document.getElementById('adminLoginErr');
  
  let ok = true;
  if (!u) { ue.style.display = 'block'; ok = false; } else ue.style.display = 'none';
  if (!p) { pe.style.display = 'block'; ok = false; } else pe.style.display = 'none';
  if (!ok) return;

  // ── Hardcoded fallback / Supabase Auth ──
  // Check hardcoded credentials first
  if (u === 'admin' && p === 'admin123') {
    le.style.display = 'none';
    ADM.loggedIn = true;
    ADM.adminUser = { name: 'Demo Admin', username: 'admin', role: 'superadmin' };
    
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    
    adminAddLog('admin', `✅ Admin login: Demo Admin at ${new Date().toLocaleTimeString()}`);
    
    showScreen('adminPortal');
    setTimeout(() => {
      const tbu = document.getElementById('adminTopbarUser');
      if (tbu) tbu.textContent = 'Demo Admin';
      const acts = document.getElementById('adminPendingActs');
      if (acts) acts.textContent = '0 Pending';
      adminTab('dashboard');
    }, 100);
    return;
  }

  // If not the demo account, attempt DB auth (requires configured Supabase)
  try {
    const { data, error } = await window.supabase
      .from('admin_users')
      .select('*')
      .eq('username', u)
      .eq('password', p)
      .single();

    if (error || !data) {
      console.error('Admin login error:', error);
      le.style.display = 'block';
      adminAddLog('login', `❌ Failed admin login attempt for "${u}"`);
      setTimeout(() => { if(le) le.style.display = 'none'; }, 3000);
      return;
    }

    // Success!
    le.style.display = 'none';
    ADM.loggedIn = true;
    ADM.adminUser = data;
    
    // Clear forms
    document.getElementById('adminUser').value = '';
    document.getElementById('adminPass').value = '';
    
    adminAddLog('admin', `✅ Admin login: ${data.name} at ${new Date().toLocaleTimeString()}`);
    
    // First navigate
    showScreen('adminPortal');
    
    // Then sync UI after a short delay
    setTimeout(() => {
      const tbu = document.getElementById('adminTopbarUser');
      if (tbu) tbu.textContent = data.name;
      adminTab('dashboard');
    }, 100);

  } catch (err) {
    console.error('Supabase connection error:', err);
    toast('❌ Database connection error. Check your credentials.');
  }
}

function adminLogout() {
  adminAddLog('admin', `👋 Admin logout: ${ADM.adminUser ? ADM.adminUser.name : 'unknown'}`);
  ADM.loggedIn = false;
  ADM.adminUser = null;
  showScreen('auth');
}

// ── SHOW ADMIN PORTAL (from app nav) ──
function openAdminPortal() {
  if (ADM.loggedIn) {
    showScreen('adminPortal');
    adminTab('dashboard');
  } else {
    showScreen('adminLogin');
  }
}

// ── TAB SWITCHING ──
function adminTab(tab) {
  ADM.currentTab = tab;
  // Update tab buttons
  document.querySelectorAll('.admin-tab-btn').forEach((btn, i) => {
    const tabs = ['dashboard','users','mechanics','services','payments','notifications','pricing','logs','integrity'];
    if (tabs[i]) btn.classList.toggle('active', tabs[i] === tab);
  });
  // Update panels
  document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
  const panels = {
    dashboard:'apDashboard', users:'apUsers', mechanics:'apMechanics',
    services:'apServices', payments:'apPayments', notifications:'apNotifications',
    pricing:'apPricing', logs:'apLogs', integrity:'apIntegrity'
  };
  const el = document.getElementById(panels[tab]);
  if (el) el.classList.add('active');
  // Reset scroll
  const sb = document.getElementById('adminBody');
  if (sb) sb.scrollTop = 0;
  // Also reset sub-scroll positions inside panels
  document.querySelectorAll('.admin-panel').forEach(p => { p.scrollTop = 0; });
  // Render content
  const renderers = {
    dashboard: renderAdminDashboard, users: renderAdminUsers,
    mechanics: renderAdminMechs, services: renderAdminServices,
    payments: renderAdminPayments, notifications: renderAdminNotifications,
    pricing: renderAdminPricing, logs: renderAdminLogs, integrity: renderAdminIntegrity
  };
  if (renderers[tab]) renderers[tab]();
}


// ── DASHBOARD ──
function renderAdminDashboard() {
  const users = adminGetUsers();
  const mechs = adminGetMechs();
  const history = adminGetAllHistory();
  const completed = history.filter(h => h.status === 'accepted' || h.status === 'done');
  const gross = mechs.reduce((s, m) => s + (m.grossEarnings || 0), 0);
  const commission = Math.round(gross * 0.20);

  // Stats
  const _se = id => document.getElementById(id);
  if(_se('statTotalUsers')) _se('statTotalUsers').textContent = users.length;
  if(_se('statTotalMechs')) _se('statTotalMechs').textContent = mechs.length;
  if(_se('statCompleted')) _se('statCompleted').textContent = completed.length;
  if(_se('statRevenue')) _se('statRevenue').textContent = '₹' + commission;
  if(_se('statUsersChg')) _se('statUsersChg').textContent = '+' + users.length + ' registered';
  if(_se('statMechsChg')) _se('statMechsChg').textContent = mechs.filter(m => m.online!==false).length + ' online now';

  // Tab badges
  if(_se('atbUsers')) _se('atbUsers').textContent = users.length;
  if(_se('atbMechs')) _se('atbMechs').textContent = mechs.length;

  // Chart: service types
  const svcCounts = {};
  history.forEach(h => { svcCounts[h.service] = (svcCounts[h.service] || 0) + 1; });
  const topSvcs = Object.entries(svcCounts).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxSvc = topSvcs[0]?topSvcs[0][1]:1;
  const svcColors = ['#0ea5e9','#22c55e','#f97316','#ef4444','#facc15'];
  document.getElementById('chartSvcType').innerHTML = topSvcs.length
    ? topSvcs.map(([name,count],i)=>`
        <div class="mini-bar-row">
          <div class="mini-bar-lbl">${name.split(' ')[0]}</div>
          <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.round(count/maxSvc*100)}%;background:${svcColors[i]||'var(--acc)'};"></div></div>
          <div class="mini-bar-val">${count}</div>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:8px 0;">No data yet</div>';

  // Chart: 7 day activity (simulated from history)
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const today = new Date().getDay();
  const dayCounts = days.map((d,i)=>{
    const target = ((today - (6-i) + 7) % 7);
    return history.filter(h=>{
      const wd = new Date(h.date||0).getDay();
      return wd === target;
    }).length;
  });
  const maxDay = Math.max(...dayCounts, 1);
  document.getElementById('chartActivity').innerHTML = days.map((d,i)=>`
    <div class="mini-bar-row">
      <div class="mini-bar-lbl">${d}</div>
      <div class="mini-bar-track"><div class="mini-bar-fill" style="width:${Math.round(dayCounts[i]/maxDay*100)}%;background:var(--acc);"></div></div>
      <div class="mini-bar-val">${dayCounts[i]}</div>
    </div>`).join('');

  // Recent requests
  const recent = history.slice(0, 5);
  document.getElementById('dashRecentRequests').innerHTML = recent.length
    ? recent.map(h => adminReqCardMini(h)).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:16px;text-align:center;">No service requests yet</div>';

  // Online mechanics
  const online = mechs.filter(m => m.online !== false);
  document.getElementById('onlineMechCount').textContent = online.length + ' online';
  document.getElementById('dashOnlineMechs').innerHTML = online.length
    ? online.map(m => `
        <div class="admin-card" style="display:flex;align-items:center;gap:10px;padding:10px 13px;margin-bottom:6px;">
          <div class="admin-av mech">${m.initials||'M'}</div>
          <div><div class="admin-card-name">${m.name}</div><div class="admin-card-meta">${m.shopName||'—'} · ${m.city||'—'}</div></div>
          <div style="margin-left:auto;display:flex;align-items:center;gap:5px;"><div style="width:7px;height:7px;border-radius:50%;background:var(--grn);animation:pulse 2s infinite;"></div><span style="font-size:11px;color:var(--grn);">Online</span></div>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:16px;text-align:center;">No mechanics online</div>';
}

function adminReqCardMini(h) {
  const statusMap = {
    done:'completed', accepted:'completed', declined:'cancelled',
    cancelled:'cancelled', inprogress:'inprogress', pending:'pending'
  };
  const sc = statusMap[h.status] || 'pending';
  const sl = { completed:'Completed', cancelled:'Cancelled/Declined', inprogress:'In Progress', pending:'Pending' }[sc];
  return `<div class="admin-req-card">
    <div class="admin-req-top">
      <div class="admin-req-ic">${h.serviceIcon||'🔧'}</div>
      <div style="flex:1;min-width:0;">
        <div class="admin-req-svc">${h.service||'Service'}</div>
        <div class="admin-req-meta">
          👤 ${h._owner||h.userName||'User'} · ${h.vehicle||'—'}<br>
          🕐 ${adminFmtDate(h.date)}
        </div>
      </div>
      <div class="admin-service-badge ${sc}">${sl}</div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--tx3);">
      <span>💰 ${h.price||'—'}</span>
      ${h.mechName||h.userName?`<span>🔧 ${h.mechName||'Unassigned'}</span>`:''}
    </div>
  </div>`;
}

// ── USERS ──
function renderAdminUsers() {
  let users = adminGetUsers();
  const q = (document.getElementById('userSearch')||{}).value||'';
  const sf = (document.getElementById('userStatusFilter')||{}).value||'all';
  if (q) users = users.filter(u => (u.name+u.phone+u.city||'').toLowerCase().includes(q.toLowerCase()));
  if (sf === 'blocked') users = users.filter(u => ADM.blockedUsers.has(u.phone));
  if (sf === 'active')  users = users.filter(u => !ADM.blockedUsers.has(u.phone));
  document.getElementById('userCount').textContent = users.length + ' users';
  document.getElementById('adminUsersList').innerHTML = users.length
    ? users.map(u => adminUserCard(u)).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:20px;text-align:center;">No users found</div>';
}

function adminUserCard(u) {
  const blocked = ADM.blockedUsers.has(u.phone);
  const jobs = (u.history||[]).filter(h=>h.status==='done'||h.status==='accepted').length;
  return `<div class="admin-card">
    <div class="admin-card-top">
      <div class="admin-av">${u.initials||'U'}</div>
      <div style="flex:1;min-width:0;">
        <div class="admin-card-name">${u.name}</div>
        <div class="admin-card-meta">${u.phone} · ${u.city||'—'} · ${jobs} job${jobs!==1?'s':''}</div>
        <div class="admin-card-id">${u.userId||'—'} · Wallet: ₹${u.walletBal||0}</div>
      </div>
      <div class="admin-status-badge ${blocked?'blocked':'active'}">${blocked?'Blocked':'Active'}</div>
    </div>
    <div class="admin-actions">
      <button class="admin-btn view" onclick="adminViewUser('${u.phone}')">👁 View</button>
      <button class="admin-btn notify" onclick="adminNotifyOne('${u.phone}','${u.name}')">📢 Notify</button>
      ${blocked
        ? `<button class="admin-btn unblock" onclick="adminToggleBlock('${u.phone}',false)">✅ Unblock</button>`
        : `<button class="admin-btn block" onclick="adminToggleBlock('${u.phone}',true)">🚫 Block</button>`
      }
    </div>
  </div>`;
}

// ── MECHANICS ──
function renderAdminMechs() {
  let mechs = adminGetMechs();
  const q = (document.getElementById('mechSearch')||{}).value||'';
  const sf = (document.getElementById('mechStatusFilter')||{}).value||'all';
  if (q) mechs = mechs.filter(m => (m.name+m.phone+m.shopName+m.mechId||'').toLowerCase().includes(q.toLowerCase()));
  if (sf === 'blocked') mechs = mechs.filter(m => ADM.blockedUsers.has(m.phone));
  if (sf === 'active')  mechs = mechs.filter(m => !ADM.blockedUsers.has(m.phone));
  if (sf === 'offline') mechs = mechs.filter(m => m.online === false);
  document.getElementById('mechCount').textContent = mechs.length + ' mechanics';
  document.getElementById('adminMechsList').innerHTML = mechs.length
    ? mechs.map(m => adminMechCard(m)).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:20px;text-align:center;">No mechanics found</div>';
}

function adminMechCard(m) {
  const blocked = ADM.blockedUsers.has(m.phone);
  const jobs = (m.history||[]).filter(h=>h.status==='accepted').length;
  const online = m.online !== false;
  return `<div class="admin-card">
    <div class="admin-card-top">
      <div class="admin-av mech">${m.initials||'M'}</div>
      <div style="flex:1;min-width:0;">
        <div class="admin-card-name">${m.name}</div>
        <div class="admin-card-meta">${m.phone} · ${m.shopName||'—'}</div>
        <div class="admin-card-id">${m.mechId||'—'} · ${m.specialization||'—'} · ${jobs} jobs · ₹${m.grossEarnings||0} earned</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
        <div class="admin-status-badge ${blocked?'blocked':online?'active':'pending'}">${blocked?'Blocked':online?'Online':'Offline'}</div>
      </div>
    </div>
    <div class="admin-actions">
      <button class="admin-btn view" onclick="adminViewUser('${m.phone}')">👁 View</button>
      <button class="admin-btn notify" onclick="adminNotifyOne('${m.phone}','${m.name}')">📢 Notify</button>
      ${blocked
        ? `<button class="admin-btn unblock" onclick="adminToggleBlock('${m.phone}',false)">✅ Unblock</button>`
        : `<button class="admin-btn block" onclick="adminToggleBlock('${m.phone}',true)">🚫 Block</button>`
      }
    </div>
  </div>`;
}

// ── SERVICES ──
function renderAdminServices() {
  let history = adminGetAllHistory();
  const q = (document.getElementById('svcSearch')||{}).value||'';
  const sf = (document.getElementById('svcStatusFilter')||{}).value||'all';
  if (q) history = history.filter(h=>(h.service+h._owner+h.vehicle||'').toLowerCase().includes(q.toLowerCase()));
  if (sf !== 'all') history = history.filter(h=>h.status===sf);
  document.getElementById('svcCount').textContent = history.length + ' requests';
  document.getElementById('adminSvcList').innerHTML = history.length
    ? history.map((h,i) => adminSvcCard(h,i)).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:20px;text-align:center;">No service requests found</div>';
}

function adminSvcCard(h, i) {
  const statusMap = {done:'completed',accepted:'completed',declined:'cancelled',cancelled:'cancelled'};
  const sc = statusMap[h.status] || h.status || 'pending';
  const sl = {completed:'Completed',cancelled:'Cancelled',inprogress:'In Progress',pending:'Pending',declined:'Declined'}[sc]||h.status;
  const statusOptions = ['pending','inprogress','done','cancelled'].map(s=>`<option value="${s}" ${(h.status===s||(s==='done'&&h.status==='accepted'))?'selected':''}>${{pending:'Pending',inprogress:'In Progress',done:'Completed',cancelled:'Cancelled'}[s]}</option>`).join('');
  // Use jobId + ownerPhone for reliable identification
  const safePhone = (h._ownerPhone||'').replace(/[^0-9+]/g,'');
  const safeJob = (h.jobId||h.date||i)+'';
  const score = getIntegrityScore(h);
  const scoreCls = score >= 90 ? 'high' : score >= 60 ? 'mid' : 'low';
  
  return `<div class="admin-req-card">
    <div class="admin-req-top">
      <div class="admin-req-ic">${h.serviceIcon||'🔧'}</div>
      <div style="flex:1;min-width:0;">
        <div class="admin-req-svc">${h.service||'Service'}</div>
        <div class="admin-req-meta">
          👤 ${h._owner||h.userName||'—'} (${h._ownerRole||'user'})<br>
          🚗 ${h.vehicle||'—'} · 💰 ₹${h.price||'0'}<br>
          🕐 ${adminFmtDate(h.date)}${h.mechName?`<br>🔧 ${h.mechName}`:''}
        </div>
      </div>
      <div style="text-align:right;">
        <div class="admin-service-badge ${sc}">${sl}</div>
        <div class="score-badge ${scoreCls}" style="margin-top:5px;cursor:help;" title="Data Integrity Score">${score}% Score</div>
      </div>
    </div>
    <div class="admin-actions">
      <select class="admin-filter-select" style="flex:1;font-size:11px;" onchange="adminUpdateSvcByJob(this,'${safePhone}','${safeJob}')">
        ${statusOptions}
      </select>
      <button class="admin-btn assign" onclick="adminOpenAssignByJob('${safePhone}','${safeJob}')">⚡ Assign</button>
      ${score < 70 ? `<button class="admin-btn view" style="background:var(--red);color:#fff;" onclick="adminTab('integrity')">⚠️ Resolve</button>` : ''}
    </div>
  </div>`;
}

// Update service status by jobId (reliable, not array index)
function adminUpdateSvcByJob(sel, ownerPhone, jobId) {
  const users = DB.get('users')||{};
  const rawD = ownerPhone.replace(/\D/g,'');
  const digits = rawD.length>10?rawD.slice(-10):rawD;
  const u = users[digits];
  if(!u||!u.history){toast('⚠️ User not found');return;}
  const newStatus = sel.value;
  // Find by jobId or by date string
  const h = u.history.find(x=>String(x.jobId)===String(jobId)||String(x.date)===String(jobId));
  if(!h){toast('⚠️ Service record not found');return;}

  // 🛡️ OMNI-AUDITOR Verification
  if (!adminVerifyAction({ type: 'status_change', newStatus }, h)) {
    sel.value = h.status==='accepted'?'done':h.status; // Revert select
    return;
  }

  h.status = newStatus==='done'?'accepted':newStatus;
  DB.set('users',users);
  adminAddLog('admin',`✏️ [Omni-Auditor] Status → ${newStatus} for ${u.name}`);
  toast('✅ Status updated to '+newStatus);
  renderAdminServices();
}

// Open assign modal by jobId
function adminOpenAssignByJob(ownerPhone, jobId) {
  ADM.assigningUserId = ownerPhone;
  ADM.assigningJobId = jobId;
  ADM.selectedMechForAssign = null;
  const users = DB.get('users')||{};
  const rawD = ownerPhone.replace(/\D/g,'');
  const digits = rawD.length>10?rawD.slice(-10):rawD;
  const u = users[digits];
  const h = u&&u.history&&u.history.find(x=>String(x.jobId)===String(jobId)||String(x.date)===String(jobId));
  document.getElementById('assignSvcInfo').textContent = h&&u
    ? `Assigning "${h.service}" for ${u.name} (${h.vehicle||'—'})`
    : 'Select a mechanic to assign.';
  const mechs = adminGetMechs().filter(m=>!ADM.blockedUsers.has(m.phone));
  document.getElementById('assignMechList').innerHTML = mechs.length
    ? mechs.map(m=>`
        <div class="assign-mech-item" id="ami-${m.mechId}" onclick="selAssignMech('${m.mechId}','${m.phone}')">
          <div class="admin-av mech" style="width:34px;height:34px;font-size:12px;">${m.initials||'M'}</div>
          <div style="flex:1;"><div class="am-name">${m.name}</div><div class="am-spec">${m.shopName||'—'} · ${m.specialization||'—'}</div></div>
          <div style="font-size:10px;color:${m.online!==false?'var(--grn)':'var(--tx3)'};">${m.online!==false?'● Online':'○ Offline'}</div>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:10px;">No mechanics available</div>';
  document.getElementById('assignMechModal').classList.add('open');
}

function adminUpdateSvcStatus(sel, ownerPhone, idx) {
  const users = DB.get('users') || {};
  const rawDigits = ownerPhone.replace(/\D/g,'');
  const digits = rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits;
  const u = users[digits];
  if (!u || !u.history || !u.history[idx]) { toast('⚠️ Could not find service record'); return; }
  const newStatus = sel.value;
  u.history[idx].status = newStatus === 'done' ? 'accepted' : newStatus;
  DB.set('users', users);
  adminAddLog('admin', `✏️ Admin changed service status → ${newStatus} for ${u.name}`);
  toast('✅ Status updated to ' + newStatus);
  renderAdminServices();
}

// adminOpenAssign replaced by adminOpenAssignByJob

function selAssignMech(mechId, phone) {
  ADM.selectedMechForAssign = { mechId, phone };
  document.querySelectorAll('.assign-mech-item').forEach(el => el.classList.remove('sel'));
  const el = document.getElementById('ami-' + mechId);
  if (el) el.classList.add('sel');
}

function confirmAssign() {
  if (!ADM.selectedMechForAssign) { toast('⚠️ Please select a mechanic first'); return; }
  const users = DB.get('users') || {};
  const rawD1 = (ADM.assigningUserId||'').replace(/\D/g,'');
  const digits = rawD1.length>10?rawD1.slice(-10):rawD1;
  const u = users[digits];
  const rawD2 = ADM.selectedMechForAssign.phone.replace(/\D/g,'');
  const mDigits = rawD2.length>10?rawD2.slice(-10):rawD2;
  const mech = users[mDigits];
  if (!u || !mech) { toast('⚠️ User or mechanic not found'); return; }
  // Find history entry by jobId or date
  const jobId = ADM.assigningJobId || ADM.assigningReqId;
  const h = u.history && u.history.find(x=>String(x.jobId)===String(jobId)||String(x.date)===String(jobId));
  if (h) {
    h.mechName = mech.name;
    h.mechId = mech.mechId;
    h.status = 'accepted';
    DB.set('users', users);
    adminAddLog('admin', `⚡ Admin assigned ${mech.name} to ${h.service} for ${u.name}`);
    toast('✅ ' + mech.name + ' assigned to request!');
  } else {
    toast('⚠️ Service record not found');
  }
  closeAdminModal('assignMechModal');
  renderAdminServices();
}

// ── PAYMENTS ──
function renderAdminPayments() {
  const mechs = adminGetMechs();
  const txns = adminGetAllTxns();
  const gross = mechs.reduce((s,m)=>s+(m.grossEarnings||0),0);
  const comm = Math.round(gross*0.20);
  const paidOut = mechs.reduce((s,m)=>s+(m.paidOut||0),0);
  const _pe = id => document.getElementById(id);
  if(_pe('payTotalGross')) _pe('payTotalGross').textContent = '₹'+gross;
  if(_pe('payTotalComm')) _pe('payTotalComm').textContent = '₹'+comm;
  if(_pe('payTotalPaid')) _pe('payTotalPaid').textContent = '₹'+paidOut;
  if(_pe('txnCount')) _pe('txnCount').textContent = txns.length+' transactions';
  document.getElementById('adminTxnList').innerHTML = txns.length
    ? txns.map(t=>{
        const d = new Date(t.date||0);
        const ds = d.toLocaleDateString('en-IN',{day:'numeric',month:'short'})+' · '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
        return `<div class="admin-txn-row">
          <div class="admin-txn-ic ${t.type}">${t.type==='credit'?'↓':'↑'}</div>
          <div style="flex:1;min-width:0;">
            <div class="admin-txn-name">${t.label||'Transaction'}</div>
            <div class="admin-txn-date">${t._owner||'—'} (${t._ownerRole||'user'}) · ${ds}</div>
          </div>
          <div class="admin-txn-amt ${t.type}">${t.type==='credit'?'+':'-'}₹${t.amount||0}</div>
        </div>`;
      }).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:20px;text-align:center;">No transactions yet</div>';
}

// ── NOTIFICATIONS ──
function selNotifTarget(t) {
  ADM.notifTarget = t;
  ['all','users','mechs','single'].forEach(k => {
    const el = document.getElementById('nt'+k.charAt(0).toUpperCase()+k.slice(1));
    if(el) el.classList.toggle('sel', k===t);
  });
  const sw = document.getElementById('notifSingleWrap');
  if (sw) sw.style.display = t==='single'?'block':'none';
}

function selNotifType(t) {
  ADM.notifType = t;
  ['info','alert','offer','update'].forEach(k=>{
    const el=document.getElementById('ntType'+k.charAt(0).toUpperCase()+k.slice(1));
    if(el) el.classList.toggle('sel', k===t);
  });
}

function sendAdminNotif() {
  const msg = (document.getElementById('notifMsg').value||'').trim();
  if (!msg) { toast('⚠️ Please type a notification message'); return; }
  const typeIcons = {info:'ℹ️',alert:'⚠️',offer:'🎁',update:'🔄'};
  const icon = typeIcons[ADM.notifType]||'📢';
  const targetLabel = {all:'All Users & Mechanics',users:'All Users',mechs:'All Mechanics',single:'Individual'}[ADM.notifTarget]||'All';
  ADM.notifications.unshift({ msg:`${icon} ${msg}`, target:targetLabel, ts:Date.now(), type:ADM.notifType });
  adminAddLog('admin', `📢 Admin sent "${ADM.notifType}" notification to ${targetLabel}: "${msg.slice(0,40)}${msg.length>40?'…':''}"`);
  document.getElementById('notifMsg').value='';
  toast(`${icon} Notification sent to ${targetLabel}!`);
  renderAdminNotifications();
}

function adminNotifyOne(phone, name) {
  adminTab('notifications');
  selNotifTarget('single');
  const inp = document.getElementById('notifSinglePhone');
  if (inp) inp.value = phone;
  toast(`📢 Compose notification for ${name}`);
}

function renderAdminNotifications() {
  const hist = document.getElementById('notifHistory');
  if (!hist) return;
  hist.innerHTML = ADM.notifications.length
    ? ADM.notifications.map(n=>`
        <div class="admin-card" style="padding:12px 14px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
            <div style="font-size:13px;flex:1;">${n.msg}</div>
            <div style="font-size:9px;color:var(--tx3);font-family:var(--fm);white-space:nowrap;">${adminFmtDate(n.ts)}</div>
          </div>
          <div style="font-size:10px;color:var(--tx3);margin-top:5px;">→ ${n.target}</div>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:20px;text-align:center;">No notifications sent yet</div>';
}

// ── PRICING ──
function renderAdminPricing() {
  const editor = document.getElementById('pricingEditor');
  if (!editor) return;
  let html = '';
  Object.entries(ADM_PRICES).forEach(([cat, services]) => {
    html += `<div style="padding:10px 0 4px;border-bottom:1px solid var(--b2);"><div style="font-size:10px;font-family:var(--fm);color:var(--acc);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">${cat}</div>`;
    Object.entries(services).forEach(([svc, price]) => {
      html += `<div class="price-row">
        <div><div class="price-row-label">${svc}</div></div>
        <div style="display:flex;align-items:center;gap:4px;">
          <span style="font-size:12px;color:var(--tx3);">₹</span>
          <input class="price-input" data-cat="${cat}" data-svc="${svc}" value="${price}" type="number" min="0" max="9999" />
        </div>
      </div>`;
    });
    html += '</div>';
  });
  editor.innerHTML = html;
}

function savePricing() {
  const inputs = document.querySelectorAll('.price-input');
  inputs.forEach(inp => {
    const cat = inp.dataset.cat;
    const svc = inp.dataset.svc;
    const val = parseInt(inp.value) || 0;
    if (ADM_PRICES[cat] && ADM_PRICES[cat][svc] !== undefined) {
      ADM_PRICES[cat][svc] = val;
    }
  });
  const commRate = parseInt((document.getElementById('commRateInput')||{}).value||20)/100;
  S.commRate = commRate;
  adminAddLog('admin', `🏷️ Admin updated pricing and commission rate to ${Math.round(commRate*100)}%`);
  toast('✅ Pricing updated successfully!');
}

// ── LOGS ──
function renderAdminLogs() {
  let logs = [...ADM.logs];
  const tf = (document.getElementById('logTypeFilter')||{}).value||'all';
  if (tf !== 'all') logs = logs.filter(l => l.type === tf);
  const _lc = document.getElementById('logCount');
  if(_lc) _lc.textContent = logs.length + ' entries';
  const _ll = document.getElementById('adminLogList');
  if(!_ll) return;
  const dotColors = {login:'var(--acc)',service:'var(--grn)',payment:'var(--ylw)',admin:'var(--red)'};
  _ll.innerHTML = logs.length
    ? logs.map(l=>`
        <div class="admin-log-row">
          <div class="admin-log-dot" style="background:${dotColors[l.type]||'var(--tx3)'};"></div>
          <div class="admin-log-text">${l.msg}</div>
          <div class="admin-log-time">${adminFmtDate(l.ts)}</div>
        </div>`).join('')
    : '<div style="font-size:12px;color:var(--tx3);padding:20px;text-align:center;">No log entries</div>';
}

function clearAdminLogs() {
  if (!confirm('Clear all admin logs?')) return;
  ADM.logs = [];
  toast('🗑 Logs cleared');
  renderAdminLogs();
}

// ── USER/MECH DETAIL VIEW ──
function adminViewUser(phone) {
  const users = DB.get('users')||{};
  const _raw = phone.replace(/\D/g,'');
  const digits = _raw.length>10?_raw.slice(-10):_raw;
  const u = users[digits];
  if (!u) { toast('⚠️ User not found'); return; }
  const isMech = u.role==='mechanic';
  const blocked = ADM.blockedUsers.has(phone);
  const av = document.getElementById('adModalAv');
  av.textContent = u.initials||'?';
  av.style.background = isMech ? 'linear-gradient(135deg,var(--org),#ea580c)' : 'linear-gradient(135deg,var(--acc),var(--blu))';
  document.getElementById('adModalName').textContent = u.name;
  document.getElementById('adModalRole').textContent = (isMech?'🔧 Mechanic':'👤 User') + ' · ' + (blocked?'🚫 Blocked':'✅ Active');
  const hist = (u.history||[]);
  const jobs = hist.filter(h=>h.status==='accepted'||h.status==='done');
  const rats = jobs.filter(h=>h.rating).map(h=>h.rating);
  const avg = rats.length?(rats.reduce((a,b)=>a+b,0)/rats.length).toFixed(1):'—';
  let body = `
    <div style="background:var(--bg3);border:1px solid var(--b);border-radius:var(--r);padding:13px;margin-bottom:12px;">
      <div class="crow" style="padding:7px 0;border-bottom:1px solid var(--b);"><div class="lb" style="font-size:10px;color:var(--tx3);">Phone</div><div class="vl">${u.phone}</div></div>
      <div class="crow" style="padding:7px 0;border-bottom:1px solid var(--b);"><div class="lb" style="font-size:10px;color:var(--tx3);">City</div><div class="vl">${u.city||'—'}</div></div>
      <div class="crow" style="padding:7px 0;border-bottom:1px solid var(--b);"><div class="lb" style="font-size:10px;color:var(--tx3);">ID</div><div class="vl" style="font-family:var(--fm);font-size:11px;">${isMech?(u.mechId||'—'):(u.userId||'—')}</div></div>
      <div class="crow" style="padding:7px 0;border-bottom:1px solid var(--b);"><div class="lb" style="font-size:10px;color:var(--tx3);">Wallet</div><div class="vl">₹${u.walletBal||0}</div></div>
      <div class="crow" style="padding:7px 0;border-bottom:${isMech?'1px solid var(--b)':'none'};"><div class="lb" style="font-size:10px;color:var(--tx3);">Jobs · Rating</div><div class="vl">${jobs.length} jobs · ${avg}⭐</div></div>
      ${isMech?`
      <div class="crow" style="padding:7px 0;border-bottom:1px solid var(--b);"><div class="lb" style="font-size:10px;color:var(--tx3);">Shop</div><div class="vl">${u.shopName||'—'}</div></div>
      <div class="crow" style="padding:7px 0;border-bottom:1px solid var(--b);"><div class="lb" style="font-size:10px;color:var(--tx3);">Specialization</div><div class="vl">${u.specialization||'—'}</div></div>
      <div class="crow" style="padding:7px 0;border-bottom:1px solid var(--b);"><div class="lb" style="font-size:10px;color:var(--tx3);">Gross Earnings</div><div class="vl" style="color:var(--grn);">₹${u.grossEarnings||0}</div></div>
      <div class="crow" style="padding:7px 0;border-bottom:1px solid var(--b);"><div class="lb" style="font-size:10px;color:var(--tx3);">Status</div><div class="vl" style="color:${u.online!==false?'var(--grn)':'var(--tx3)'};">${u.online!==false?'● Online':'○ Offline'}</div></div>
      
      <!-- BANK DETAILS (REQUIRED FOR PAYOUTS) SECTION -->
      <div style="margin-top:12px;background:var(--bg2);border:1px solid var(--b);border-radius:var(--r);padding:10px;">
        <div style="font-size:10px;color:var(--blu);font-family:var(--fm);text-transform:uppercase;margin-bottom:8px;font-weight:700;">🏦 BANK DETAILS (PAYOUTS)</div>
        <div class="crow" style="padding:5px 0;"><div class="lb" style="font-size:10px;color:var(--tx3);">Acc Number</div><div class="vl" style="font-family:var(--fm);">${u.bankAccFull ? (u.bankAccFull.slice(0, 4) + 'XXXX' + u.bankAccFull.slice(-4)) : 'Not provided'}</div></div>
        <div class="crow" style="padding:5px 0;"><div class="lb" style="font-size:10px;color:var(--tx3);">IFSC Code</div><div class="vl" style="font-family:var(--fm);">${u.bankIfsc||'Not provided'}</div></div>
        <div class="crow" style="padding:5px 0;"><div class="lb" style="font-size:10px;color:var(--tx3);">Verification</div><div class="vl" style="color:${u.bankAccFull?'var(--grn)':'var(--tx3)'};">${u.bankAccFull?'✅ Verified by NPCI':'—'}</div></div>
      </div>
      `:''}
    </div>`;
  if (hist.length) {
    body += `<div style="font-size:10px;color:var(--tx3);font-family:var(--fm);text-transform:uppercase;margin-bottom:8px;">Service History (${hist.length})</div>`;
    body += hist.slice(0,5).map(h=>`
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--b);">
        <span style="font-size:14px;">${h.serviceIcon||'🔧'}</span>
        <div style="flex:1;"><div style="font-size:12px;font-weight:500;">${h.service}</div><div style="font-size:10px;color:var(--tx3);">${adminFmtDate(h.date)}</div></div>
        <div class="admin-service-badge ${h.status==='accepted'||h.status==='done'?'completed':h.status==='declined'||h.status==='cancelled'?'cancelled':'pending'}" style="font-size:8px;">${h.status}</div>
      </div>`).join('');
  }
  body += `<div class="admin-actions" style="margin-top:12px;">
    ${blocked
      ? `<button class="admin-btn unblock" onclick="adminToggleBlock('${phone}',false);closeAdminModal('adminDetailModal')">✅ Unblock Account</button>`
      : `<button class="admin-btn block" onclick="adminToggleBlock('${phone}',true);closeAdminModal('adminDetailModal')">🚫 Block Account</button>`
    }
    <button class="admin-btn notify" onclick="adminNotifyOne('${phone}','${u.name}');closeAdminModal('adminDetailModal')">📢 Notify</button>
  </div>`;
  document.getElementById('adModalBody').innerHTML = body;
  document.getElementById('adminDetailModal').classList.add('open');
}

// ── BLOCK/UNBLOCK ──
function adminToggleBlock(phone, block) {
  const users = DB.get('users')||{};
  const _bd = phone.replace(/\D/g,'');
  const digits = _bd.length>10?_bd.slice(-10):_bd;
  const u = users[digits];
  if (!u) return;
  if (block) {
    ADM.blockedUsers.add(phone);
    adminAddLog('admin', `🚫 Admin BLOCKED ${u.name} (${phone})`);
    toast(`🚫 ${u.name} has been blocked`);
  } else {
    ADM.blockedUsers.delete(phone);
    adminAddLog('admin', `✅ Admin UNBLOCKED ${u.name} (${phone})`);
    toast(`✅ ${u.name} has been unblocked`);
  }
  // Re-render current panel
  if (ADM.currentTab==='users') renderAdminUsers();
  else if (ADM.currentTab==='mechanics') renderAdminMechs();
  else if (ADM.currentTab==='dashboard') renderAdminDashboard();
}

// ── MODAL HELPERS ──
function closeAdminModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Close modal on backdrop click
document.addEventListener('click', function(e) {
  ['adminDetailModal','assignMechModal'].forEach(id=>{
    const modal = document.getElementById(id);
    if (modal && e.target === modal) modal.classList.remove('open');
  });
});

// ── Admin activity logging hooks (safe, non-recursive) ──
// Called directly from auth functions — no function wrapping to avoid stack overflow

if (typeof window !== 'undefined') {
  Object.assign(window, {
    _restoreMechJob, requestGPS, _applyFallbackLocation, updateLocBar, buildRoute, showScreen, toast, openOv, closeOv, showTab, showMechTab, fmtPhone, validPhone, getDigits, genOtp, on, ob, getOtp, clearOtp, validateBank, switchAuthTab, selRole, renderBrandPicker, toggleBrandPick, getPickedBrands, genMechId, genUserId, sendLoginOtp, verifyLoginOtp, resendOtp, sendRegOtp, verifyRegOtp, demoLogin, applyUser, _syncSidebar, _syncSidebarActive, doLogout, vsRender, vsJumpTab, _vsBrandGrid, _vsCategoryGrid, _vsModelChips, _vsProblemGrid, _vsBookingSummary, _vsCompactPill, _vsSyncS, renderModels, vsSelBrand, vsSelCategory, vsSelModel, vsSelProblem, _vsScrollToNewStep, vsResetFrom, vsRequestNearest, _resetWizardAndJobState, vsReset, saveSession, _currentScreen, restoreSession, _restoreTrackingUI, _restoreBookingUI, goHome, selV, selS, goBook, selPayTiming, selPay, confirmBooking, getChkAmt, showCheckoutQr, launchUpiDeepLink, confirmQrPaid, proceed, proceedToTracking, renderPostPayPanel, selPostPay, livePostPayUpi, confirmPostPayment, finalisePostPayment, creditMechanic, saveUser, initTrackingCanvas, latLngToXY, drawMap, roundRect, animateMechTo, setTrkMode, updateGpsPanel, startWS, startPolling, startDeadReckoning, simulateSignalLoss, startTracking, stopTracking, openCall, doHangup, togMute, togSpk, openChat, closeChat, sendMsg, doShareWhatsApp, copyTrackLink, openHelpWhatsApp, openMechHelpWhatsApp, doCancel, startSvcCompletePoller, updateMarkCompleteBtn, finishJob, rateStar, hoverStar, unhoverStar, renderStars, submitRating, skipRating, refreshMechDash, renderMechRequests, mechAccept, mechDecline, togMechOnline, renderMechSvcComplete, revealFinalOtp, mechVerifyOtp1, mechVerifyOtp2, renderUserOtpState, renderUserHistory, renderUserProfile, openChangePhone, cpSendOtp, cpVerifyOtp, cpResendOtp, cpBack, renderMechHistory, renderMechProfile, renderMechEarnings, openPayoutModal, requestPayout, togSw, togFaq, adminGetAllUsers, adminGetUsers, adminGetMechs, adminGetAllHistory, adminGetAllTxns, adminFmtDate, adminAddLog, adminLogin, adminLogout, openAdminPortal, adminTab, renderAdminDashboard, adminReqCardMini, renderAdminUsers, adminUserCard, renderAdminMechs, adminMechCard, renderAdminServices, adminSvcCard, adminUpdateSvcByJob, adminOpenAssignByJob, adminUpdateSvcStatus, selAssignMech, confirmAssign, renderAdminPayments, selNotifTarget, selNotifType, sendAdminNotif, adminNotifyOne, renderAdminNotifications, renderAdminPricing, savePricing, renderAdminLogs, clearAdminLogs, adminViewUser, adminToggleBlock, closeAdminModal, renderAdminIntegrity, openIntegrityRecon, adminOverrideStatus, initApp
  });
}

// ── SYSTEM INTEGRITY OVERSIGHT (Admin) ───────────────────────────────
function renderAdminIntegrity() {
  const list = document.getElementById('adminIntegrityList');
  if (!list) return;

  // Data Correlation & Mock Results
  const mockIntegrityData = [
    { id: 'DC-102', user: 'Arjun S.', uLoc: 'Roadside A', uPaid: 199, mech: 'Manoj', mLoc: 'Roadside A', mEarned: 159, status: 'Completed', score: 100, flags: 'clean', _distToUser: 45, _signalStrength: 98 },
    { id: 'DC-103', user: 'Vikram R.', uLoc: 'Highway Km 42', uPaid: 349, mech: 'Rahul', mLoc: '2.5km away', mEarned: 279, status: 'In Progress', score: 45, flags: 'mismatch', _distToUser: 2500, _signalStrength: 85 },
    { id: 'DC-104', user: 'Ananya P.', uLoc: 'Sector 15', uPaid: 199, mech: 'Suresh', mLoc: 'Sector 15', mEarned: 159, status: 'Arrived', score: 10, flags: 'conflict', _distToUser: 15, _signalStrength: 3, _stateConflict: true },
    { id: 'DC-105', user: 'Amit K.', uLoc: 'Main St', uPaid: 249, mech: 'Manoj', mLoc: 'Main St', mEarned: 180, status: 'Disputed', score: 70, flags: 'dispute', _distToUser: 10, _signalStrength: 90, price: 249, payout: 180 }
  ];

  let html = '';
  mockIntegrityData.forEach(row => {
    const score = getIntegrityScore(row);
    const sCls = score >= 90 ? 'high' : score >= 60 ? 'mid' : 'low';
    const fCls = row.flags === 'clean' ? 'clean' : row.flags === 'mismatch' ? 'mismatch' : 'conflict';
    const fLbl = row.flags === 'clean' ? '✅ Clean' : row.flags === 'mismatch' ? '🚩 GPS Mismatch' : row.flags === 'conflict' ? '🚩 Signal Loss' : '⚠️ Financial Variance';

    html += `<tr>
      <td class="integrity-row-id">${row.id}</td>
      <td>
        <div class="integrity-data-block">
          <div class="idb-main">${row.user}</div>
          <div class="idb-sub">Paid: ₹${row.uPaid} · ${row.uLoc}</div>
        </div>
      </td>
      <td>
        <div class="integrity-data-block">
          <div class="idb-main">${row.mech}</div>
          <div class="idb-sub">Earned: ₹${row.mEarned} · ${row.mLoc}</div>
        </div>
      </td>
      <td><span class="score-badge ${sCls}">${score}%</span></td>
      <td><div class="flag-status ${fCls}">${fLbl}</div></td>
      <td>
        <div style="display:flex;gap:5px;">
          <button class="admin-btn view" onclick="openIntegrityRecon('${row.id}', ${row.uPaid}, ${row.mEarned})">💰 Recon</button>
          <button class="admin-btn approve" style="${score < 60 ? 'background:var(--red);color:#fff;' : ''}" onclick="adminOverrideStatus('${row.id}')">⚙️ Resolve</button>
        </div>
      </td>
    </tr>`;
  });
  list.innerHTML = html;

  // Update Stats
  const gpsM = mockIntegrityData.filter(d => d.flags === 'mismatch').length;
  const stateC = mockIntegrityData.filter(d => d.flags === 'conflict').length;
  const finA = mockIntegrityData.filter(d => Math.abs(d.uPaid * 0.8 - d.mEarned) > 1).length;

  document.getElementById('statGpsMismatch').textContent = gpsM;
  document.getElementById('statStateConflicts').textContent = stateC;
  document.getElementById('statFinancialAlerts').textContent = finA;

  // God-View Correlation Map
  const mapEl = document.getElementById('godMapView');
  if (mapEl) {
    mapEl.innerHTML = `<div style="text-align:center;">
      <div style="font-size:24px;margin-bottom:10px;">🌍</div>
      <div style="font-weight:700;color:var(--tx);">Global Controller Active</div>
      <div style="font-size:11px;color:var(--tx3);margin-top:5px;">Correlating 4 active signals...</div>
    </div>`;
  }
}

function openIntegrityRecon(jobId, uPaid, mEarned) {
  document.getElementById('reconJobId').textContent = 'Job ID: ' + jobId;
  document.getElementById('reconUserPaid').textContent = '₹' + uPaid;
  document.getElementById('reconMechEarned').textContent = '₹' + mEarned;
  document.getElementById('reconComm').textContent = '₹' + (uPaid - mEarned);
  openOv('integrityReconOv');
}

function adminOverrideStatus(jobId) {
  const staffId = ADM.adminUser ? ADM.adminUser.name : 'Unknown Staff';
  const reason = prompt('Admin Override: Enter reason for manual status change for ' + jobId);
  if (reason) {
    adminAddLog('admin', `🛠️ [Override] ${staffId} forced status change for ${jobId}. Reason: ${reason}`);
    toast('✅ Status override logged and applied.');
    renderAdminIntegrity();
  }
}

// ── OMNI-AUDITOR: MASTER SYSTEM INTEGRITY RULES ──────────────────────
const SYSTEM_RULES = {
  STATE_FLOW: {
    'pending': ['inprogress', 'cancelled', 'declined'],
    'inprogress': ['done', 'cancelled'],
    'accepted': ['done'], // 'accepted' is legacy for 'done'
    'done': [],
    'cancelled': [],
    'declined': []
  },
  MAX_ARRIVAL_DIST_M: 300,
  COMMISSION_RATE: 0.20,
  MIN_SIGNAL_STRENGTH: 20 // Percent
};

function getIntegrityScore(job) {
  let score = 100;
  // 1. Financial check
  if (job.price && job.payout) {
    const expectedPayout = Math.round(job.price * (1 - SYSTEM_RULES.COMMISSION_RATE));
    if (Math.abs(job.payout - expectedPayout) > 1) score -= 30;
  }
  // 2. Location check (mocked for demo if no real GPS)
  if (job.status === 'arrived' && job._distToUser > SYSTEM_RULES.MAX_ARRIVAL_DIST_M) score -= 40;
  // 3. State Conflict
  if (job._stateConflict) score -= 50;
  // 4. Signal check
  if (job._signalStrength < SYSTEM_RULES.MIN_SIGNAL_STRENGTH) score -= 15;
  
  return Math.max(0, score);
}

function adminVerifyAction(action, job) {
  const staffId = ADM.adminUser ? ADM.adminUser.name : 'Unknown';
  
  // Rule: WebSocket Lock
  if (S.wsStatus === 'disconnected' || (job && job._signalStrength < 5)) {
    toast('❌ ERROR: WebSocket Disconnected. Ghost updates blocked.');
    return false;
  }
  
  // Rule: State Machine Enforcement
  if (action.type === 'status_change') {
    const current = job.status || 'pending';
    const next = action.newStatus;
    const allowed = SYSTEM_RULES.STATE_FLOW[current] || [];
    if (!allowed.includes(next) && current !== next) {
      toast(`❌ ERROR: Invalid State Jump (${current} → ${next})`);
      return false;
    }
  }
  
  // Rule: Location Ghosting Check
  if (action.newStatus === 'arrived' || action.newStatus === 'done') {
    if (job._distToUser > SYSTEM_RULES.MAX_ARRIVAL_DIST_M) {
      toast('🚩 ERROR: Location Mismatch (>300m). Manual Verification Required.');
      adminAddLog('admin', `🛡️ [Security] ${staffId} attempt to mark arrived but GPS mismatch for job ${job.jobId}`);
      return false;
    }
  }

  return true;
}

// ══════════════════════════════════════════════════════════════════
// WINDOW EXPORTS — Expose all functions to global scope so React
// components (which call window.xxx?.()) can access them.
// Vite treats this file as an ES module, so without these explicit
// assignments every function stays trapped in module scope.
// ══════════════════════════════════════════════════════════════════
Object.assign(window, {
  // ── Boot / Core ──
  initApp,
  showScreen,
  showTab,
  showMechTab,
  toast,
  openOv,
  closeOv,

  // ── Vehicle Selection Wizard ──
  vsRender,
  vsSelBrand,
  vsSelCategory,
  vsSelModel,
  vsSetVehicleNumber,
  vsSkipVehicleNumber,
  vsSelProblem,
  vsJumpTab,
  vsRequestNearest,

  // ── Navigation ──
  goBook,
  goHome,

  // ── Auth ──
  fmtPhone,
  validPhone,
  sendLoginOtp,
  verifyLoginOtp,
  resendOtp,
  sendRegOtp,
  verifyRegOtp,
  selRole,
  demoLogin,
  doLogout,
  switchAuthTab,
  toggleBrandPick,
  renderBrandPicker,
  validateBank,

  // ── GPS ──
  requestGPS,

  // ── Booking ──
  confirmBooking,
  selPay,
  selPayTiming,
  confirmQrPaid,
  _restoreBookingUI,

  // ── Tracking ──
  startTracking,
  initTrackingCanvas,
  _restoreTrackingUI,
  finishJob,

  // ── Call / Chat ──
  openCall,
  closeChat,
  openChat,
  sendMsg,
  doHangup,
  togMute,
  togSpk,

  // ── Cancel / Share ──
  doCancel,
  doShareWhatsApp,
  copyTrackLink,

  openPayoutModal,
  requestPayout,

  // ── Phone Change ──
  openChangePhone,
  cpSendOtp,
  cpVerifyOtp,
  cpResendOtp,
  cpBack,

  // ── Render screens ──
  renderUserHistory,
  renderUserProfile,
  renderMechProfile,
  renderMechSvcComplete,
  renderMechHistory,
  renderMechEarnings,
  refreshMechDash,

  // ── Mechanic actions ──
  togMechOnline,
  mechAccept,
  mechDecline,
  mechVerifyOtp1,
  mechVerifyOtp2,

  // ── Rating ──
  rateStar,
  hoverStar,
  unhoverStar,
  skipRating,
  submitRating,

  // ── Help / Privacy ──
  togFaq,
  togSw,
  openHelpWhatsApp,
  openMechHelpWhatsApp,

  // ── Admin ──
  adminLogin,
  adminLogout,
  adminTab,
  renderAdminUsers,
  renderAdminMechs,
  renderAdminServices,
  renderAdminLogs,
  clearAdminLogs,
  closeAdminModal,
  adminViewUser,
  adminToggleBlock,
  adminNotifyOne,
  adminOpenAssignByJob,
  selAssignMech,
  confirmAssign,
  selPostPay,
  confirmPostPayment,
  renderAdminIntegrity,
  openIntegrityRecon,
  adminOverrideStatus,
  savePricing,
  sendAdminNotif,
  selNotifTarget,
  selNotifType,

  // ── Session ──
  saveSession,
  restoreSession,

  // ── OTP helpers (short names used in JSX) ──
  on,
  ob,

  // ── Admin logging ──
  adminAddLog,

  // ── Tracking helpers ──
  updateMarkCompleteBtn,
  startSvcCompletePoller,
  renderUserOtpState,
  revealFinalOtp,
  proceedToTracking,
  livePostPayUpi,
});
