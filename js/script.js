/* Smart Campus – AR + Shortest Path JS */

const nodes = { 
  Waiting:      {id:'Waiting',      name:'Waiting Room',      x:360, y:120},
  Lab1:         {id:'Lab1',         name:'Lab 1',             x:520, y:120},
  Lab2:         {id:'Lab2',         name:'Lab 2',             x:700, y:120},
  Lab3:         {id:'Lab3',         name:'Lab 3',             x:880, y:120},
  Millennium:   {id:'Millennium',   name:'Millennium Block',  x:1000,y:120},
  Corner:       {id:'Corner',       name:'Corridor Corner',   x:1000,y:200},
  Principal:    {id:'Principal',    name:'Principal Chamber', x:80,  y:120},
  VicePrincipal:{id:'VicePrincipal',name:'Vice Principal',   x:220, y:120},
  Lab4:         {id:'Lab4',         name:'Lab 4',             x:1000,y:320},
  Lab5:         {id:'Lab5',         name:'Lab 5',             x:1000,y:440},
  Lab6:         {id:'Lab6',         name:'Lab 6',             x:1000,y:560},
  Seminar:      {id:'Seminar',      name:'Seminar Hall',      x:1000,y:640},
  StaffEnd:     {id:'StaffEnd',     name:'Staff Rooms',       x:920, y:640},
  Rest:         {id:'Rest',         name:'Rest Room',         x:1080,y:640},
  Stairs:       {id:'Stairs',       name:'Stairs',            x:1160,y:560},
  Lift:         {id:'Lift',         name:'Lift',              x:1160,y:440}
};

// --- Define all edges as an array of pairs ---

// … paste your nodes & edges here (unchanged) …

function distance(a,b){ return Math.hypot(a.x-b.x, a.y-b.y); }

// Build adjacency
const edges = [
  ['Waiting','Lab1'],
  ['Lab1','Lab2'],
  ['Lab2','Lab3'],
  ['Lab3','Millennium'],
  ['Millennium','Corner'],
  ['Principal','VicePrincipal'],
  ['VicePrincipal','Waiting'],
  ['Corner','Lab4'],
  ['Lab4','Lab5'],
  ['Lab5','Lab6'],
  ['Lab6','Seminar'],
  ['Waiting','Lab4'],
  ['Lab1','Lab5'],
  ['Lab2','Lab6'],
  ['Lab3','Seminar'],
  ['Seminar','StaffEnd'],
  ['Seminar','Rest'],
  ['Lift','Lab5'],
  ['Stairs','Lab6']
];

// --- Utility for distance ---
function distance(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

// --- Build adjacency graph (this fixes your error) ---
const graph = {};
for (const k in nodes) {
  graph[k] = [];
}
edges.forEach(([u, v]) => {
  const w = distance(nodes[u], nodes[v]);
  graph[u].push({ to: v, w });
  graph[v].push({ to: u, w });
});
Object.keys(nodes).forEach(k => graph[k]=[]);
edges.forEach(([u,v])=>{
  const w = distance(nodes[u], nodes[v]);
  graph[u].push({to:v,w}); graph[v].push({to:u,w});
});

// DOM references
const svgEl=document.getElementById('svgmap'),
      edgesG=document.getElementById('edges'),
      nodesG=document.getElementById('nodes'),
      pathLayer=document.getElementById('pathlayer'),
      arrow=document.getElementById('arrow'),
      pathOut=document.getElementById('pathout');

// --- Render map ---
function renderMap(){
  edgesG.innerHTML='';
  nodesG.innerHTML='';
  edges.forEach(([u,v]) => {
    const a=nodes[u], b=nodes[v];
    const line=document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', a.x);
    line.setAttribute('y1', a.y);
    line.setAttribute('x2', b.x);
    line.setAttribute('y2', b.y);

    line.setAttribute('stroke','#cbd5e1');
    line.setAttribute('stroke-width',Math.max(3, Math.min(6, distance(a,b)/60)));
    line.setAttribute('stroke-linecap', 'round');
    edgesG.appendChild(line);
  });
  for(const k in nodes){
    const n=nodes[k];
    const g=document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('transform',`translate(${n.x},${n.y})`);
    const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('r',12); c.setAttribute('fill','#0b76ef');
    c.setAttribute('stroke','#fff'); c.setAttribute('stroke-width',3);
    g.appendChild(c);
    const t=document.createElementNS('http://www.w3.org/2000/svg','text');
    t.setAttribute('x',18); t.setAttribute('y',6);
    t.setAttribute('font-size',13); t.setAttribute('fill','#073b6b');
    t.textContent=n.name;
    g.appendChild(t);
    nodesG.appendChild(g);
  }
}
renderMap();

// --- Populate dropdowns ---
const startSel=document.getElementById('start'),
      endSel=document.getElementById('end');
Object.keys(nodes).forEach(k=>{
  const o=document.createElement('option');
  o.value=k; o.textContent=nodes[k].name;
  startSel.append(o.cloneNode(true)); endSel.append(o);
});
startSel.value='Principal'; endSel.value='Seminar';

// --- Dijkstra ---
function dijkstra(start){
  const dist={},prev={},Q=new Set(Object.keys(graph));
  for(const v of Q){ dist[v]=Infinity; prev[v]=null; }
  dist[start]=0;
  while(Q.size){
    let u=null,best=Infinity;
    for(const x of Q) if(dist[x]<best){best=dist[x];u=x;}
    if(u===null) break;
    Q.delete(u);
    for(const e of graph[u]){
      const alt=dist[u]+e.w;
      if(alt<dist[e.to]){dist[e.to]=alt;prev[e.to]=u;}
    }
  }
  return {dist,prev};
}
function shortestPath(s,t){
  const {dist,prev}=dijkstra(s);
  if(!isFinite(dist[t])) return null;
  const path=[]; for(let u=t;u;u=prev[u]) path.unshift(u);
  return {path,dist:dist[t]};
}

// --- Interaction ---
let currentPos=null,currentRoute=null,currentStepIndex=0,nextTarget=null;

svgEl.addEventListener('click',ev=>{
  const pt=svgEl.createSVGPoint(); pt.x=ev.clientX; pt.y=ev.clientY;
  const m=svgEl.getScreenCTM(); if(!m) return;
  const loc=pt.matrixTransform(m.inverse());
  currentPos={x:loc.x,y:loc.y}; drawCurrentPos();
});

function drawCurrentPos(){
  const old=document.getElementById('curpos'); if(old) old.remove();
  if(!currentPos) return;
  const c=document.createElementNS('http://www.w3.org/2000/svg','circle');
  c.id='curpos'; c.setAttribute('cx',currentPos.x);
  c.setAttribute('cy',currentPos.y); c.setAttribute('r',10);
  c.setAttribute('fill','#999'); c.setAttribute('stroke','#fff');
  c.setAttribute('stroke-width',3);
  svgEl.appendChild(c);
}

// --- Compute path ---
document.getElementById('compute').onclick=()=>{
  const s=startSel.value,e=endSel.value,res=shortestPath(s,e);
  pathLayer.innerHTML=''; if(!res){pathOut.textContent='No path';return;}
  pathOut.textContent=`Path (${res.dist.toFixed(1)}px): `
    +res.path.map(k=>nodes[k].name).join(' → ');
  const pts=res.path.map(k=>`${nodes[k].x},${nodes[k].y}`).join(' ');
  const poly=document.createElementNS('http://www.w3.org/2000/svg','polyline');
  poly.setAttribute('points',pts); poly.setAttribute('fill','none');
  poly.setAttribute('stroke','#3ac1ff'); poly.setAttribute('stroke-width','6');
  pathLayer.appendChild(poly);
  currentRoute=res.path; currentStepIndex=1; updateNextTarget();
};

document.getElementById('clear').onclick=()=>{
  pathLayer.innerHTML=''; pathOut.textContent='';
  currentRoute=null; currentStepIndex=0; nextTarget=null;
  arrow.style.display='none';
};

// --- AR logic ---
const video=document.getElementById('camera');
let stream=null,orientationHandler=null;

async function startCamera(){
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
    video.srcObject=stream; video.style.display='block';
  }catch(e){ alert('Camera permission denied'); }
}
function stopCamera(){
  if(stream){stream.getTracks().forEach(t=>t.stop());}
  video.srcObject=null; video.style.display='none';
}

function updateNextTarget(){
  if(!currentRoute||currentStepIndex>=currentRoute.length){
    nextTarget=null; arrow.style.display='none'; return;
  }
  nextTarget=nodes[currentRoute[currentStepIndex]];
  arrow.style.display='block';
}

function angleToTarget(heading){
  if(!currentPos||!nextTarget) return 0;
  const dx=nextTarget.x-currentPos.x, dy=nextTarget.y-currentPos.y;
  const ang=(Math.atan2(-dy,dx)*180/Math.PI+90+360)%360;
  return (ang-heading+360)%360;
}

function handleOrientation(ev){
  let heading=null;
  if(ev.webkitCompassHeading) heading=ev.webkitCompassHeading;
  else if(ev.alpha!=null) heading=(360-ev.alpha);
  const rot=angleToTarget(heading||0);
  arrow.style.transform=`translateX(-50%) rotate(${rot}deg)`;
}

async function startAR(){
  await startCamera();
  // requestPermission only on iOS
  if(typeof DeviceOrientationEvent!=='undefined'
     && typeof DeviceOrientationEvent.requestPermission==='function'){
    try{
      const perm=await DeviceOrientationEvent.requestPermission();
      if(perm!=='granted') alert('Orientation denied.');
    }catch(e){ console.warn(e); }
  }
  if(!orientationHandler){
    orientationHandler=handleOrientation;
    window.addEventListener('deviceorientation',orientationHandler,true);
  }
  updateNextTarget();
}

function stopAR(){
  stopCamera();
  if(orientationHandler){
    window.removeEventListener('deviceorientation',orientationHandler,true);
    orientationHandler=null;
  }
  arrow.style.display='none';
}

document.getElementById('startAR').onclick=startAR;
document.getElementById('stopAR').onclick=stopAR;

// --- Step progression ---
setInterval(()=>{
  if(!currentPos||!nextTarget) return;
  const d=Math.hypot(nextTarget.x-currentPos.x,nextTarget.y-currentPos.y);
  if(d<40){
    currentStepIndex++; updateNextTarget();
  }
},700);
