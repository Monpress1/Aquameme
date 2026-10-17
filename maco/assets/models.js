/* Lazy character loader: a model is only downloaded when someone selects/plays it. */
window.MacoModels=(function(){
  const cache={};let gl;
  const cfg=id=>CATALOG.chars.find(c=>c.id===id);
  // Measures the model as it is actually drawn (skinning applied), so mixed-unit rigs get the right scale.
  function measure(o){o.updateMatrixWorld(true);const box=new THREE.Box3(),v=new THREE.Vector3();
    o.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,pa=g.attributes.position;
      if(m.isSkinnedMesh&&m.boneTransform){m.skeleton.update();const st=Math.max(1,Math.floor(pa.count/4000));for(let i=0;i<pa.count;i+=st){v.fromBufferAttribute(pa,i);m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);box.expandByPoint(v)}}
      else{if(!g.boundingBox)g.computeBoundingBox();box.union(g.boundingBox.clone().applyMatrix4(m.matrixWorld))}});
    return box}
  function load(id,onProg){
    if(cache[id])return cache[id];
    const c=cfg(id);gl=gl||new THREE.GLTFLoader();
    const p=new Promise((res,rej)=>{gl.load(c.file,gt=>{
      const o=gt.scene,h=new THREE.Group();h.add(o);
      const bb=c.fit==='skin'?measure(o):new THREE.Box3().setFromObject(o);let hg=bb.max.y-bb.min.y,mn=bb.min.y;
      if(c.fit==='bones'){o.updateMatrixWorld(true);let lo=1e9,hi=-1e9,n=0;const v=new THREE.Vector3();o.traverse(b=>{if(b.isBone){v.setFromMatrixPosition(b.matrixWorld);lo=Math.min(lo,v.y);hi=Math.max(hi,v.y);n++}});if(n>10&&hi-lo>.05){hg=hi-lo;mn=lo}}
      if(!(hg>0))hg=1;
      const sc=c.height/hg*(c.k||1);o.scale.setScalar(sc);o.position.y=-mn*sc+(c.y||0);h.rotation.y=THREE.MathUtils.degToRad(c.rot||0);
      o.traverse(m=>{if(m.isMesh){m.frustumCulled=false;[].concat(m.material).forEach(q=>{if(q.map){q.emissiveMap=q.map;q.emissive=new THREE.Color(0xffffff);q.emissiveIntensity=.3}else if(q.color){q.emissive=q.color.clone();q.emissiveIntensity=.25}})}});
      const mixer=new THREE.AnimationMixer(o),acts={};gt.animations.forEach(a=>{acts[a.name.toLowerCase().replace(/.*\|/,'')]=mixer.clipAction(a)});
      const ks=Object.keys(acts);if(c.still){Object.keys(acts).forEach(k=>delete acts[k])}else if(!acts.running){const a=acts.run||(ks.length?acts[ks[0]]:null);if(a)acts.running=a}
      res({id,g:h,mixer,acts})},ev=>{if(onProg&&ev.total)onProg(ev.loaded,ev.total)},rej)});
    p.catch(()=>{delete cache[id]});cache[id]=p;return p}
  return{load,cfg,free:id=>{delete cache[id]}}
})();
