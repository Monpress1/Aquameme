/* Everything for sale. Prices are in MACO (whole tokens). Edit the numbers here to re-price the shop. */
window.CATALOG={
  PU:{ magnet:{name:'Magnet',c:'#ff4fd8',t:9,d:'Pulls in nearby M coins for 9 seconds.'},
       shield:{name:'Shield',c:'#3de8ff',t:12,d:'Absorbs one crash within 12 seconds.'},
       nitro:{name:'Nitro',c:'#ffb300',t:5,d:'5 seconds of boosted speed. Smash through everything.'},
       x2:{name:'Double score',c:'#ffc933',t:12,d:'Doubles score and M coins for 12 seconds.'},
       jet:{name:'Rocket',c:'#ff7a3d',t:7,d:'7 seconds of free flight.'},
       shoe:{name:'Mega boots',c:'#46f0a0',t:15,d:'15 seconds of mega jump: clear cars and gates.'} },
  chars:[
    {id:'robot',name:'Robo',file:'models/robot.glb',mb:0.5,rarity:'common',price:0,height:2.4,rot:180,fit:'bbox',desc:'The scout bot every runner starts with.'},
    {id:'xbot',name:'X-Bot',file:'models/xbot.glb',mb:2.9,rarity:'rare',price:150,height:2.1,rot:180,fit:'bones',desc:'Sleek chrome frame built for speed.'},
    {id:'soldier',name:'Soldier',file:'models/soldier.glb',mb:2.1,rarity:'rare',price:200,height:2.2,rot:0,fit:'bbox',desc:'Field-tested and impossible to slow down.'},
    {id:'sprinter',name:'Sprinter',file:'models/sprinter.glb',mb:6.5,rarity:'epic',price:300,height:2.2,rot:180,fit:'skin',desc:'Pure sprint form from the first stride.'},
    {id:'ethan',name:'Ethan',file:'models/ethan.glb',mb:2.0,rarity:'epic',price:350,height:2.2,rot:180,fit:'bones',desc:'Runs like something is right behind him.'},
    {id:'rider',name:'Nova Rider',file:'models/rider.glb',mb:10.5,rarity:'legendary',price:500,height:2.1,rot:180,fit:'skin',desc:'Glides above the street on a sci-fi hoverboard.'},
    {id:'inspector',name:'Desert Inspector',file:'models/inspector.glb',mb:14.7,rarity:'legendary',price:600,height:2.4,rot:180,fit:'skin',still:true,desc:'Rides in from the wasteland on a battered bike.'}
  ],
  items:[
    {id:'keys5',cat:'time',name:'Key pack',qty:'×5',desc:'Each key continues a run after a crash.',icon:'key',price:50,grant:{keys:5}},
    {id:'keys15',cat:'time',name:'Key pack',qty:'×15',desc:'Each key continues a run after a crash.',icon:'key',price:120,grant:{keys:15},tag:'Popular'},
    {id:'keys40',cat:'time',name:'Key pack',qty:'×40',desc:'Each key continues a run after a crash.',icon:'key',price:280,grant:{keys:40},tag:'Best value'},
    {id:'min10',cat:'time',name:'Play time',qty:'10 min',desc:'Extra minutes of run time.',icon:'clock',price:40,grant:{minutes:10}},
    {id:'min30',cat:'time',name:'Play time',qty:'30 min',desc:'Extra minutes of run time.',icon:'clock',price:100,grant:{minutes:30},tag:'Popular'},
    {id:'min120',cat:'time',name:'Play time',qty:'2 hours',desc:'Extra minutes of run time.',icon:'clock',price:360,grant:{minutes:120},tag:'Best value'},
    {id:'magnet5',cat:'power',name:'Magnet',qty:'×5',icon:'magnet',price:30,grant:{inv:{magnet:5}}},
    {id:'shield5',cat:'power',name:'Shield',qty:'×5',icon:'shield',price:40,grant:{inv:{shield:5}}},
    {id:'nitro5',cat:'power',name:'Nitro',qty:'×5',icon:'nitro',price:40,grant:{inv:{nitro:5}}},
    {id:'x25',cat:'power',name:'Double score',qty:'×5',icon:'x2',price:50,grant:{inv:{x2:5}}},
    {id:'shoe5',cat:'power',name:'Mega boots',qty:'×5',icon:'shoe',price:60,grant:{inv:{shoe:5}}},
    {id:'jet5',cat:'power',name:'Rocket',qty:'×5',icon:'jet',price:70,grant:{inv:{jet:5}}},
    {id:'jetpack',cat:'boost',name:'Jetpack',qty:'Permanent',desc:'Fly any time with the rocket button. Refuels while you run.',icon:'jetpack',price:400,grant:{boost:{jet:true}},owned:p=>p.boosts.jet},
    {id:'fuel1',cat:'boost',name:'Fuel tank I',qty:'+1.5 s',desc:'Longer jetpack flights.',icon:'fuel',price:150,grant:{boost:{fuel:1}},owned:p=>p.boosts.fuel>=1},
    {id:'fuel2',cat:'boost',name:'Fuel tank II',qty:'+3 s',desc:'Longer jetpack flights.',icon:'fuel',price:250,grant:{boost:{fuel:2}},owned:p=>p.boosts.fuel>=2,locked:p=>p.boosts.fuel<1&&'Needs Fuel tank I'},
    {id:'fuel3',cat:'boost',name:'Fuel tank III',qty:'+4.5 s',desc:'Longer jetpack flights.',icon:'fuel',price:400,grant:{boost:{fuel:3}},owned:p=>p.boosts.fuel>=3,locked:p=>p.boosts.fuel<2&&'Needs Fuel tank II'}
  ]
};
CATALOG.items.forEach(i=>{if(i.cat==='power'){const k=Object.keys(i.grant.inv)[0];i.desc=CATALOG.PU[k].d+' Start a run with it.'}});
