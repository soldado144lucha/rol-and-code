
// 1. Configurar los credenciales de Supabase
const SUPABASE_URL = "https://pvvvkgfmrlejpabiotiv.supabase.co";
const SUPABASE_KEY = "sb_publishable_OYUPMdM09_vHPyTBULblsw_eEtjZRmW";

// 2. Crear el cliente global
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Comprobación rápida en consola para ver si se cargó bien
console.log("Supabase inicializado correctamente:", supabase);
// Variable global para recordar qué usuario está jugando
let jugadorActualId = null;
// ... Aquí continúa el resto de tu código original (const G = { ... })
// ══════════════════════════════════════════════════════════
// AUDIO
// ══════════════════════════════════════════════════════════
const Audio=((ctx)=>{
  let muted=false,musicRunning=false,musicGain,musicTimeout,currentTheme=-1;
  function getCtx(){if(!ctx)ctx=new(window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();return ctx;}
  function play(freq,type,dur,vol=0.25,delay=0){
    if(muted)return;
    try{const c=getCtx(),o=c.createOscillator(),g=c.createGain();
    o.connect(g);g.connect(c.destination);o.type=type;o.frequency.value=freq;
    g.gain.setValueAtTime(0,c.currentTime+delay);g.gain.linearRampToValueAtTime(vol,c.currentTime+delay+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+delay+dur);
    o.start(c.currentTime+delay);o.stop(c.currentTime+delay+dur+0.05);}catch(e){}
  }
  function noise(dur,vol=0.12){
    if(muted)return;
    try{const c=getCtx(),buf=c.createBuffer(1,c.sampleRate*dur,c.sampleRate),data=buf.getChannelData(0);
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1);
    const src=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter();
    f.type='bandpass';f.frequency.value=600;src.buffer=buf;src.connect(f);f.connect(g);g.connect(c.destination);
    g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(0.001,c.currentTime+dur);
    src.start();src.stop(c.currentTime+dur+0.05);}catch(e){}
  }
  // Theme music data: [notes, tempo, type, vol]
  const THEMES=[
    {notes:[110,130,165,130,110,98,110,130],tempo:1900,type:'triangle',vol:0.035,name:'Exploración'},  // M1 green calm
    {notes:[80,90,100,90,80,75,80,85],tempo:1500,type:'sawtooth',vol:0.03,name:'Catacumbas'},           // M2 blue tense
    {notes:[120,140,160,140,120,110,130,150],tempo:1300,type:'square',vol:0.028,name:'Batalla'},        // M3 amber intense
    {notes:[60,70,80,70,55,65,75,65],tempo:1000,type:'sawtooth',vol:0.04,name:'Boss'},                 // M4 violet dark
  ];
  function startTheme(themeIdx){
    if(muted)return;
    if(themeIdx===currentTheme&&musicRunning)return;
    stopMusic();
    currentTheme=themeIdx;musicRunning=true;
    const th=THEMES[themeIdx]||THEMES[0];
    let step=0;
    function tick(){
      if(!musicRunning||muted)return;
      try{
        const c=getCtx();
        if(!musicGain){musicGain=c.createGain();musicGain.connect(c.destination);}
        musicGain.gain.value=th.vol;
        const o=c.createOscillator(),o2=c.createOscillator();
        o.type=th.type;o2.type='sine';
        const n=th.notes[step%th.notes.length];
        o.frequency.value=n;o2.frequency.value=n*1.5;
        o.connect(musicGain);o2.connect(musicGain);
        o.start();o.stop(c.currentTime+th.tempo/1000*.85);
        o2.start();o2.stop(c.currentTime+th.tempo/1000*.4);
        step++;
      }catch(e){}
      musicTimeout=setTimeout(tick,th.tempo);
    }
    tick();
  }
  function stopMusic(){musicRunning=false;clearTimeout(musicTimeout);try{if(musicGain)musicGain.gain.value=0;}catch(e){}}
  return {
    dice(){for(let i=0;i<5;i++)play(200+Math.random()*300,'square',0.04,0.12,i*0.04);},
    attack(){play(180,'sawtooth',0.1,0.22);noise(0.08);},
    magic(){[440,554,659,880].forEach((f,i)=>play(f,'sine',0.18,0.18,i*0.05));},
    heal(){[523,659,784].forEach((f,i)=>play(f,'sine',0.22,0.18,i*0.07));},
    hit(){play(90,'sawtooth',0.12,0.28);noise(0.12,0.18);},
    death(){[180,130,90,55].forEach((f,i)=>play(f,'sawtooth',0.18,0.22,i*0.09));},
    victory(){[523,659,784,1047].forEach((f,i)=>play(f,'triangle',0.35,0.28,i*0.12));},
    defeat(){[280,220,160,110].forEach((f,i)=>play(f,'sawtooth',0.35,0.22,i*0.18));},
    scroll(){play(660,'sine',0.12,0.12);play(880,'sine',0.1,0.1,0.09);},
    bossPhase(){[100,80,60].forEach((f,i)=>play(f,'sawtooth',0.3,0.35,i*0.15));play(200,'triangle',0.2,0.15,0.5);},
    synergy(){[440,554,659,784,880].forEach((f,i)=>play(f,'sine',0.25,0.22,i*0.06));},
    startIntroMusic(){
      if(muted)return;
      // Intro: gentle, mystical — different from all mission themes
      const introNotes=[196,220,246,220,196,175,196,220];
      stopMusic();currentTheme=99;musicRunning=true;
      let step=0;
      function tick(){
        if(!musicRunning||muted)return;
        try{
          const c=getCtx();if(!musicGain){musicGain=c.createGain();musicGain.connect(c.destination);}
          musicGain.gain.value=0.04;
          const o=c.createOscillator(),o2=c.createOscillator();
          o.type='sine';o2.type='triangle';
          o.frequency.value=introNotes[step%introNotes.length];
          o2.frequency.value=introNotes[step%introNotes.length]*1.33;
          o.connect(musicGain);o2.connect(musicGain);
          o.start();o.stop(c.currentTime+2.0);
          o2.start();o2.stop(c.currentTime+1.0);
          step++;
        }catch(e){}
        musicTimeout=setTimeout(tick,2200);
      }
      tick();
    },
    startTheme,stopMusic,
    toggle(){muted=!muted;if(muted)stopMusic();else{if(currentTheme===99)this.startIntroMusic();else startTheme(Math.max(0,currentTheme));}return muted;},
    get muted(){return muted;}
  };
})(null);

// ══════════════════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════════════════
const CHARS=[
  {id:'cipherion',name:'Cipherion',title:'Guardián de Umbrales',cycle:'SMR',role:'✚ Healer · Distancia',emoji:'🛡',accent:'#3ecf8e',glow:'rgba(62,207,142,.2)',hp:24,maxHp:24,atk:3,def:5,mov:2,range:6,combatType:'Distancia',
   quote:'"Las puertas me hablan. Las digitales y las otras también."',
   story:'Antiguo custodio del reino, dominaba los sistemas de defensa del palacio. Su propia hermana asesinó al rey y usurpó el trono, obligándolo al exilio.\n\nVaga como guardián caído, abriendo caminos para otros mientras espera ajustar cuentas.',
   don:'Percibe barreras invisibles y detecta por qué una puerta o red permanece cerrada.',
   tec:'Controla sistemas microinformáticos y redes arcanas: firewalls y accesos cifrados.',
   som:'Abre el paso mejor que nadie, pero una vez dentro pierde el rumbo.',
   cards:[{id:'c1',name:'Firewall Arcano',isBasic:false,effect:'shield',val:3,desc:'Escudo de 3 puntos.'},{id:'c2',name:'Cifrado Profundo',isBasic:false,effect:'damage',val:5,desc:'5 daño al enemigo más cercano.'},{id:'c3',name:'Resonancia Rúnica',isBasic:false,effect:'heal',val:5,desc:'Cura 5 PV.'},{id:'c4',name:'Escudo de Red',isBasic:true,effect:'shield',val:3,desc:'★ Básica. Bloquea 3 de daño.'}]},
  {id:'nexia',name:'Nexia',title:'Médium de Máquinas',cycle:'ASIR',role:'🛡 Tanque · Melé',emoji:'⚙',accent:'#60a5fa',glow:'rgba(96,165,250,.2)',hp:32,maxHp:32,atk:5,def:7,mov:2,range:1,combatType:'Melé',
   quote:'"Este servidor lleva tres días sufriendo. Puedo oírlo."',
   story:'Desterrada de Augustria por una reina tiránica, juró regresar. Su dominio sobre sistemas mecánicos la hizo temida.\n\nTras encontrar a dos hermanos de Sylvarien, convirtió la venganza en revolución.',
   don:'Escucha el último recuerdo de una máquina rota como si viviera.',
   tec:'Domina administración de sistemas y hardware improvisado bajo presión.',
   som:'Solo conecta con lo físico; lo virtual se le escapa.',
   cards:[{id:'n1',name:'Golpe Mecánico',isBasic:false,effect:'damage',val:8,desc:'8 daño adyacente.'},{id:'n2',name:'Interfaz de Combate',isBasic:false,effect:'buff',val:3,desc:'+3 ataque próximo golpe.'},{id:'n3',name:'Resonancia',isBasic:false,effect:'heal',val:6,desc:'Cura 6 PV.'},{id:'n4',name:'Barrera de Hierro',isBasic:true,effect:'shield',val:2,desc:'★ Básica. Bloquea 2.'}]},
  {id:'damarion',name:'Damarion',title:'Tejedor de Código',cycle:'DAM·DAW',role:'✦ DPS/Control · Dist.',emoji:'🔮',accent:'#f59e0b',glow:'rgba(245,158,11,.2)',hp:20,maxHp:20,atk:6,def:3,mov:2,range:6,combatType:'Distancia',
   quote:'"Todo tiene una lógica. Hasta la magia tiene sintaxis."',
   story:'Nacido en Sylvarien junto a su hermano Dawrian. La guerra muskeniana destruyó su hogar pero no su ingenio.\n\nUsa código y magia para abrir caminos donde otros ven ruinas.',
   don:'Ve el código oculto del mundo y reescribe variables al vuelo.',
   tec:'Programa en múltiples lenguajes arcanotécnicos y descifra sistemas.',
   som:'Se abstrae tanto en el código que olvida el mundo físico.',
   cards:[{id:'d1',name:'Script de Ruptura',isBasic:false,effect:'damage',val:7,desc:'7 daño. Enemigo pierde turno.'},{id:'d2',name:'Bucle Infinito',isBasic:false,effect:'stun',val:2,desc:'Inmoviliza 2 turnos.'},{id:'d3',name:'Recompilación',isBasic:false,effect:'heal',val:4,desc:'Cura 4 PV.'},{id:'d4',name:'Exploit',isBasic:true,effect:'damage',val:4,desc:'★ Básica. 4 daño.'}]},
  {id:'aionx',name:'Aion-X',title:'Vidente de Patrones',cycle:'IA·BigData',role:'✦ DPS · Distancia',emoji:'🤖',accent:'#a855f7',glow:'rgba(168,85,247,.2)',hp:18,maxHp:18,atk:8,def:2,mov:3,range:8,combatType:'Distancia',
   quote:'"Ya he visto cómo termina esto. Depende de vosotros."',
   story:'Creado por los muskenianos para predecirlo todo. Se rebeló. Encontró refugio con Cipherion.\n\nUna mente forjada para obedecer que eligió su propio destino.',
   don:'Ve futuros posibles como patrones antes de que ocurran.',
   tec:'Analiza datos, detecta anomalías y genera modelos que aprenden solos.',
   som:'Sin datos reales, su visión se vuelve humo.',
   cards:[{id:'a1',name:'Red Neuronal',isBasic:false,effect:'damage',val:10,desc:'10 daño a distancia.'},{id:'a2',name:'Predicción',isBasic:false,effect:'buff',val:4,desc:'+4 al próximo ataque.'},{id:'a3',name:'Análisis',isBasic:false,effect:'debuff',val:2,desc:'-2 DEF a todos los enemigos.'},{id:'a4',name:'Esquiva',isBasic:false,effect:'dodge',val:0,desc:'Esquiva el siguiente ataque.'}]},
  {id:'dawrian',name:'Dawrian',title:'El Intérprete',cycle:'Bachillerato',role:'⌘ Soporte · Mixto',emoji:'⚡',accent:'#ef6c63',glow:'rgba(239,108,99,.2)',hp:26,maxHp:26,atk:4,def:4,mov:3,range:4,combatType:'Mixto',
   quote:'"El sistema no está roto. Está hablando. Solo hay que escucharle."',
   story:'Combatió en la guerra que arrasó Sylvarien. Perdió un brazo, lo sustituyó por prótesis arcana.\n\nHermano mayor de Damarion. Resistencia personificada.',
   don:'Comprende códigos, runas y símbolos como si fueran una sola lengua.',
   tec:'Une ideas y convierte conocimientos dispersos en soluciones.',
   som:'Sin su equipo, entiende el problema pero no puede resolverlo solo.',
   cards:[{id:'dw1',name:'Brazo Mecánico',isBasic:false,effect:'damage',val:9,desc:'9 daño y aturde 1 turno.'},{id:'dw2',name:'Descifrar Debilidad',isBasic:false,effect:'double-damage',val:0,desc:'Doble daño en próximo ataque.'},{id:'dw3',name:'Táctica',isBasic:false,effect:'buff',val:3,desc:'+3 ATK próximo golpe.'},{id:'dw4',name:'Resistencia',isBasic:true,effect:'shield+heal',val:3,desc:'★ Básica. Bloquea 3 y cura 2.'}]},
];

// SYNERGY CARDS — appear when specific pairs are in the team
const SYN_CARDS=[
  {id:'sy1',pair:['dawrian','damarion'],name:'Hermanos de Sylvarien',isBasic:false,effect:'damage',val:15,isSyn:true,
   desc:'★ Sinergia. Los hermanos combaten como uno. 15 daño y aturde al jefe 1 turno.'},
  {id:'sy2',pair:['cipherion','aionx'],name:'Padre e Hijo Digital',isBasic:false,effect:'shield',val:8,isSyn:true,
   desc:'★ Sinergia. Escudo de 8 puntos para todo el equipo durante 2 turnos.'},
  {id:'sy3',pair:['nexia','dawrian'],name:'Tecnómante y Veterano',isBasic:false,effect:'heal',val:12,isSyn:true,
   desc:'★ Sinergia. Nexia repara a Dawrian. Cura 12 PV y elimina un estado negativo.'},
  {id:'sy4',pair:['nexia','damarion'],name:'Máquina y Código',isBasic:false,effect:'debuff',val:4,isSyn:true,
   desc:'★ Sinergia. Combinan sus talentos. -4 DEF y ATK a todos los enemigos.'},
  {id:'sy5',pair:['aionx','damarion'],name:'Visión Cuántica',isBasic:false,effect:'buff',val:6,isSyn:true,
   desc:'★ Sinergia. Predicción y código unidos. +6 ATK al equipo en el próximo turno.'},
];


// ── COMBAT SPEECHES ──────────────────────────────────
const SPEECHES={
  cipherion:{atk:['Acceso denegado.','Las runas no mienten.','Umbral roto.'],heal:['Firewall restaurado.','Aún de pie.'],crit:['¡BRECHA CRÍTICA!'],fall:['El umbral... se cierra...']},
  nexia:     {atk:['¡Protocolo ofensivo!','¡Sistemas: ATAQUE!','Tu código es mi código.'],heal:['Reparando.','Sistemas en línea.'],crit:['¡SOBRECARGA TOTAL!'],fall:['Los servidores... apagan...']},
  damarion:  {atk:['Bonito exploit.','404: defensa no encontrada.','Bug fatal detectado.'],heal:['Parche aplicado.','Recompilando...'],crit:['¡EJECUCIÓN CRÍTICA!'],fall:['Excepción... no controlada...']},
  aionx:     {atk:['Lo había calculado.','Patrón: eliminado.','Probabilidad: 98%.'],heal:['Optimizando.','Error corregido.'],crit:['¡PREDICCIÓN PERFECTA!'],fall:['Modelo... colapsando...']},
  dawrian:   {atk:['¡Por Sylvarien!','Este brazo no falla.','He visto cosas peores.'],heal:['Aguantamos.','En pie, siempre.'],crit:['¡GOLPE DEL VETERANO!'],fall:['No... todavía no...']},
};
const ENEMY_SPK={
  default:['¡Intrusos!','¡Por la Reina!','¡Nadie pasa!','¡Deteneos!'],
  boss:   ['Arrodillaos.','Sois polvo.','¡AUGUSTRIA ES MÍA!','Vuestra sangre alimentará el trono.','Nunca ganaréis.'],
};

// ── CINEMATIC SCRIPTS ────────────────────────────────
const CINEMATICS=[
  {loc:'Túneles del Palacio — Augustria',
   txt:'Los espías de la Reina os han localizado. El tiempo se agota. Tres centinelas bloquean el único acceso al núcleo de control del palacio.\n\nSi lo tomáis, la red rúnica queda a vuestra merced. No hay marcha atrás.',
   dlg:[{id:'cipherion',line:'"Las runas de aquí... las diseñé yo mismo."'},{id:'damarion',line:'"Perfecto. Entonces sabes cómo romperlas."'},{id:'cipherion',line:'"...Sí."'}]},
  {loc:'Catacumbas de Sylvarien — Profundidades',
   txt:'Bajo las ruinas de vuestro hogar destruido, algo antiguo y mecánico se despierta. El Guardián instalado por los muskenianos nunca descansa, nunca olvida.\n\nDamarion cree tener el código. Dawrian no está tan seguro.',
   dlg:[{id:'dawrian',line:'"Este lugar era nuestra biblioteca."'},{id:'damarion',line:'"Era. Ahora es una trampa. Confía en mí."'},{id:'dawrian',line:'"Eso es lo que me preocupa, hermanito."'}]},
  {loc:'La Torre de Augustria — Nivel superior',
   txt:'El Orbe de Sombra late con pulso maligno desde lo alto. Sin él, el ejército de la Reina se disuelve en días.\n\nNexia ha calculado una ventana de exactamente 35 minutos. Ese es vuestro único momento.',
   dlg:[{id:'nexia',line:'"El escudo cae en 35 minutos. Ni uno más."'},{id:'aionx',line:'"He procesado 47 rutas. Solo dos tienen éxito."'},{id:'nexia',line:'"¿Cuál recomendáis, Vidente?"'},{id:'aionx',line:'"La más peligrosa, por supuesto."'}]},
  {loc:'Sala del Trono — Corazón de Augustria',
   txt:'La Reina os espera. No hay trampa, no hay emboscada. Os conoce. Conoce vuestras historias, vuestras pérdidas, vuestro dolor. Y sonríe.\n\nCipherion aprieta los puños. Su hermana está al final de este camino.',
   dlg:[{id:'cipherion',line:'"Llevo años esperando este momento."'},{id:'nexia',line:'"No se trata solo de ti. Todos hemos perdido algo."'},{id:'dawrian',line:'"En pie, grupo. Por Sylvarien. Por todos."'},{id:'damarion',line:'"...Por todos."'}]},
];

// ── SAVING THROWS ────────────────────────────────────
const SAVE_THROWS=[
  {id:'boss_atk',dc:12,emoji:'👑',dsc:'La Reina lanza un rayo de energía demoníaca directamente hacia ti.',ok:'¡Lo esquivas! Sin daño adicional.',ko:'El rayo te golpea. +5 daño y Aturdido 1 turno.',failEfx:'stunned'},
  {id:'trap_exp', dc:10,emoji:'🪤',dsc:'Una trampa rúnica oculta explota bajo tus pies.',ok:'La ves a tiempo. La saltas sin daño.',ko:'-5 PV. Quedas Envenenado 2 turnos.',failEfx:'poisoned'},
  {id:'poison',   dc:14,emoji:'☠', dsc:'El enemigo libera una nube de veneno arcano.',ok:'Tu resistencia aguanta la nube tóxica.',ko:'El veneno penetra. Envenenado 3 turnos (−2 PV/turno).',failEfx:'poisoned'},
  {id:'fear',     dc:11,emoji:'👻',dsc:'Un grito espectal resuena en la catacumba.',ok:'Tu voluntad resiste el terror.',ko:'Quedas Atemorizado 2 turnos: no puedes acercarte al enemigo.',failEfx:'feared'},
];

// ── MORAL DECISIONS ─────────────────────────────────
const DECISIONS=[
  {ico:'🗝',ttl:'Prisionero encadenado',dsc:'Un prisionero atrapado os pide ayuda. Liberarle lleva tiempo pero podría conocer los planes de la Reina.',
   opts:[{lbl:'🕊 Liberarle — perdéis 3 min pero +2 ATK todo el equipo.',cls:'good',efx:'buff_atk'},{lbl:'⏩ Seguir adelante — sin cambios.',cls:'risky',efx:'noop'}]},
  {ico:'🧪',ttl:'Vial rúnico misterioso',dsc:'Un vial brillante en el suelo. 70% poción de cura, 30% trampa de la Reina.',
   opts:[{lbl:'💊 Bebérselo — 70% cura 10 PV · 30% daño 5 PV.',cls:'risky',efx:'gamble'},{lbl:'🚫 Ignorarlo — prudencia ante todo.',cls:'good',efx:'noop'}]},
  {ico:'📜',ttl:'Mapa interceptado',dsc:'Un mensajero lleva un mapa con posiciones enemigas. Si lo robáis, la niebla de guerra desaparece.',
   opts:[{lbl:'🗺 Robar el mapa — niebla eliminada.',cls:'good',efx:'reveal'},{lbl:'👣 Dejarlo pasar — efecto sorpresa conservado.',cls:'risky',efx:'noop'}]},
];

// ── WEATHER ──────────────────────────────────────────
const WEATHERS=[
  {id:'clear',  lbl:'Despejado',   ico:'',   movPen:0, atkPen:0},
  {id:'rain',   lbl:'Lluvia arcana',ico:'🌧', movPen:-1,atkPen:0,  desc:'La lluvia rúnica: −1 movimiento a todos.'},
  {id:'fog',    lbl:'Niebla espesa',ico:'🌫', movPen:0, atkPen:-2, desc:'Niebla: −2 ATK a ataques a distancia.'},
  {id:'storm',  lbl:'Tormenta',    ico:'⛈', movPen:0, atkPen:0,  desc:'Tormenta: rayos esporádicos cada ronda impar.'},
];

const SYN={'dawrian-damarion':{t:'pos',b:'+2 ATK'},'damarion-dawrian':{t:'pos',b:'+2 ATK'},'nexia-dawrian':{t:'pos',b:'+1 todo'},'nexia-damarion':{t:'pos',b:'+1 todo'},'dawrian-nexia':{t:'pos',b:'+1 todo'},'damarion-nexia':{t:'pos',b:'+1 todo'},'cipherion-aionx':{t:'pos',b:'+2 DEF'},'aionx-cipherion':{t:'pos',b:'+2 DEF'},'aionx-dawrian':{t:'neg',b:'-1 ATK'},'dawrian-aionx':{t:'neg',b:'-1 ATK'}};
const PCOLORS=['#3ecf8e','#60a5fa','#f59e0b','#a855f7','#ef6c63'];

const MISSIONS=[
  {num:'I',name:'La Brecha del Sistema',stamp:'🔓',diff:'★☆☆☆',theme:0,musicTheme:0,
   obj:'Elimina a todos los guardias y accede al núcleo central.',
   lore:'Los espías de la Reina han detectado vuestra posición. Tres centinelas bloquean el paso al núcleo de control.\n\nActuad con rapidez. Los refuerzos están en camino.',
   reward:'Acceso al nivel 2. +6 PV. Cartas recuperadas.',tl:1800,
   walls:[[3,2],[4,2],[3,4],[7,4],[8,4],[5,6]],traps:[[5,3],[8,2]],fires:[],
   enemies:[{id:'e1',name:'Guardia Rúnico',emoji:'💂',hp:14,maxHp:14,atk:3,def:1,type:'enemy',x:7,y:1},{id:'e2',name:'Centinela',emoji:'🦾',hp:18,maxHp:18,atk:4,def:2,type:'enemy',x:6,y:3},{id:'e3',name:'Araña de Red',emoji:'🕷',hp:10,maxHp:10,atk:5,def:0,type:'enemy',x:9,y:5}]},
  {num:'II',name:'Las Catacumbas de Código',stamp:'💀',diff:'★★☆☆',theme:1,musicTheme:1,
   obj:'Derrota al Guardián de las Catacumbas.',
   lore:'Bajo las ruinas de Sylvarien yace un Guardián que nunca descansa.\n\nDamarion cree haber encontrado el código de apagado. Tenéis que llegar hasta él.',
   reward:'+8 PV y acceso al archivo secreto.',tl:2100,
   walls:[[2,1],[2,2],[8,1],[8,2],[4,4],[6,4]],traps:[[4,2],[6,2],[5,4]],fires:[[3,3],[7,3]],
   enemies:[{id:'e4',name:'Trampa Rúnica',emoji:'⚡',hp:8,maxHp:8,atk:6,def:0,type:'enemy',x:5,y:2},{id:'e5',name:'Espectro',emoji:'👻',hp:12,maxHp:12,atk:4,def:1,type:'enemy',x:8,y:3},{id:'e6',name:'Guardián Ancestral',emoji:'🗿',hp:28,maxHp:28,atk:6,def:4,type:'enemy',x:5,y:0}]},
  {num:'III',name:'La Torre de Augustria',stamp:'🏰',diff:'★★★☆',theme:2,musicTheme:2,
   obj:'Destruye el Orbe de Sombra en lo alto de la Torre.',
   lore:'El Orbe de Sombra mantiene vivo al ejército demoníaco. Sin él sus fuerzas se desvanecerán.\n\nNexia ha calculado una ventana sin escudo. Ese es vuestro momento.',
   reward:'El ejército empieza a desvanecerse. Recuperáis toda la vida.',tl:2100,
   walls:[[1,2],[1,3],[9,2],[9,3],[4,1],[6,1],[4,5],[6,5]],traps:[[3,3],[7,3]],fires:[[2,4],[8,4],[5,3]],
   enemies:[{id:'e7',name:'Guardia de Élite',emoji:'⚔',hp:22,maxHp:22,atk:5,def:3,type:'enemy',x:3,y:4},{id:'e8',name:'Guardia de Élite',emoji:'⚔',hp:22,maxHp:22,atk:5,def:3,type:'enemy',x:7,y:4},{id:'e9',name:'Orbe de Sombra',emoji:'🔮',hp:20,maxHp:20,atk:7,def:5,type:'enemy',x:5,y:0}]},
  {num:'IV',name:'El Corazón de Augustria',stamp:'👑',diff:'★★★★',isFinal:true,theme:3,musicTheme:3,
   obj:'Derrotad a la Reina Demoníaca y liberad el reino para siempre.',
   lore:'La Reina os espera en su sala del trono. Tomó el poder mediante traición, masacre y conquista.\n\nTodo lo que habéis vivido os ha traído aquí. No habrá segunda oportunidad.',
   reward:'¡VICTORIA! Augustria es libre para siempre.',tl:2700,
   walls:[[2,1],[2,2],[8,1],[8,2],[3,4],[7,4]],traps:[[4,3],[6,3]],fires:[[2,3],[8,3],[5,2]],
   enemies:[
     {id:'eb1',name:'Guardia Demoníaco',emoji:'😈',hp:24,maxHp:24,atk:6,def:3,type:'enemy',x:3,y:2},
     {id:'eb2',name:'Guardia Demoníaco',emoji:'😈',hp:24,maxHp:24,atk:6,def:3,type:'enemy',x:7,y:2},
     {id:'boss',name:'La Reina Demoníaca',emoji:'👑',hp:60,maxHp:60,atk:9,def:5,type:'boss',x:5,y:0,
      phases:[
        {threshold:1.0,name:'Fase I',desc:'La Reina en calma... por ahora.',atk:9,def:5,mov:1},
        {threshold:0.66,name:'Fase II',desc:'¡La Reina libera su poder demoníaco!',atk:12,def:4,mov:2},
        {threshold:0.33,name:'Fase III',desc:'¡MODO BERSERKER! ¡Nada puede detenerla!',atk:16,def:2,mov:3},
      ],currentPhase:0}
   ]},
];
const EATK=['ataca con furia','lanza un contraataque','carga con toda su fuerza','ejecuta protocolo de combate','flanquea al más cercano'];
const BATK=[
  ['invoca tormenta oscura','desata el poder del trono','lanza energía demoníaca'],
  ['lanza DOBLE rayo de sombra','invoca escudo de espinas','embiste con furia desatada','convoca refuerzos espectrales'],
  ['DEVASTACIÓN TOTAL','LLUVIA DE OSCURIDAD','GOLPE MORTAL DEL TRONO','teletransporta y golpea a todos'],
];
const MAP_NODES=[{idx:0,x:18,y:62},{idx:1,x:38,y:36},{idx:2,x:62,y:56},{idx:3,x:82,y:29}];
const MAP_PATHS=[[0,1],[1,2],[2,3]];

// ══════════════════════════════════════════════════════════
// SAVE
// ══════════════════════════════════════════════════════════
const Save={
  key:'rolcodigo_v3',
  load(){try{return JSON.parse(localStorage.getItem(this.key)||'null');}catch(e){return null;}},
  save(d){try{localStorage.setItem(this.key,JSON.stringify(d));}catch(e){}},
  clear(){try{localStorage.removeItem(this.key);}catch(e){}}
};

// ══════════════════════════════════════════════════════════
// GAME ENGINE
// ══════════════════════════════════════════════════════════
const G=(()=>{
  const $=id=>document.getElementById(id);
  let players=[],numPlayers=1,activePlayer=0,pendCharId=null,pendMission=null,diceRolledForChar=false,lastCharDiceVal=0,
      mission=null,mIdx=null,enemies=[],walls=new Set,traps=new Set,fires=new Set,
      turn=1,order=[],oidx=0,moved=false,acted=false,pendCard=null,
      timer=null,tLeft=0,phase='init',BW=11,BH=8,
      diceCB=null,lastDiceVal=0,completedMissions=new Set,
      fireTimer=null,weatherTimer=null,synCards=[],
      fogCells=new Set(),revealedCells=new Set(),
      currentWeather=WEATHERS[0],
      pendSaveThrow=null,saveThrowCB=null,
      pendCinCB=null,cinTimers=[],
      sessionStats={dmgDealt:0,dmgHealed:0,cardsPlayed:0,enemiesKilled:0,turns:0,crits:0,savesOk:0,savesFail:0},
      turnRollDone=false,turnRollVal=0,turnCanAttack=true,turnCanMove=true,turnMaxAdvCards=1;

  function go(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$(id).classList.add('active');}
  function ap(){return players[activePlayer]||players[0];}

  function init(){
    buildRunes();
    $('snd-btn').onclick=()=>{const m=Audio.toggle();$('snd-btn').textContent=m?'🔇':'🔊';};
    const sv=Save.load();
    if(sv&&sv.completedMissions)completedMissions=new Set(sv.completedMissions);
    $('dbtn').addEventListener('click',closeDice);
    $('sc-start').addEventListener('click',()=>{
      $('scroll-overlay').style.display='none';
      showCin(pendMission,()=>startMission());
    });
    $('csc-back').addEventListener('click',closeCharScroll);
    $('csc-confirm').addEventListener('click',confirmChar);
    $('btn-confirm').addEventListener('click',()=>{go('sw');buildWorldMap();});
    buildPlayerNumBtns();
    Audio.startIntroMusic();
    // Insert status effects bar into left panel after statblock
    const sbb=document.getElementById('statbadge')?.closest('.sbb');
    if(sbb){
      const bar=document.createElement('div');bar.id='sfx-bar';bar.className='sfx-bar';
      sbb.insertAdjacentElement('afterend',bar);
    }
  }

  function charSelectDice(){
    diceRolledForChar=false;
    rollDice(20,(val)=>{
      diceRolledForChar=true;lastCharDiceVal=val;
      const hint=document.getElementById('select-hint');
      if(hint)hint.textContent='🎲 Resultado: '+val+' — '+(val>=15?'¡Puedes elegir cualquier personaje!':val>=8?'Elige sabiamente.':'Resultado bajo, pero el destino es el destino...')+' Haz clic en un personaje.';
    });
  }
  function buildRunes(){
    const f=$('rune-field');if(!f)return;
    const gl=['⟨/⟩','⌘','⟳','◈','△','⊕','⊗','☽','⌬'],co=['rgba(62,207,142,.3)','rgba(96,165,250,.25)','rgba(168,85,247,.2)','rgba(245,158,11,.25)'];
    for(let i=0;i<22;i++){const e=document.createElement('div');e.className='rn';e.textContent=gl[i%gl.length];e.style.left=Math.random()*100+'%';e.style.top=Math.random()*100+'%';e.style.setProperty('--d',(6+Math.random()*10)+'s');e.style.setProperty('--dl',(Math.random()*8)+'s');e.style.setProperty('--c',co[i%co.length]);f.appendChild(e);}
  }

  function buildPlayerNumBtns(){
    const c=$('player-btns');if(!c)return;c.innerHTML='';
    [1,2,3,4,5].forEach(n=>{const b=document.createElement('button');b.className='ds';b.textContent=n+'P';b.onclick=()=>setPlayers(n);c.appendChild(b);});
  }

  function goSelect(){go('sc');setPlayers(1);}

  function setPlayers(n){
    numPlayers=n;players=[];renderPlayerSlots();buildChars();
    $('btn-confirm').classList.add('h');updateSelectHint();updateSynPreview();
  }

  function renderPlayerSlots(){
    const c=$('mp-players');c.innerHTML='';
    for(let i=0;i<numPlayers;i++){
      const d=document.createElement('div');d.className='mp-slot'+(players[i]?' filled':'');
      d.innerHTML=players[i]
        ?`<div class="mp-slot-num" style="color:${PCOLORS[i]}">J${i+1}</div><div class="mp-slot-emoji">${players[i].char.emoji}</div><div class="mp-slot-name" style="color:${PCOLORS[i]}">${players[i].char.name}</div><button class="mp-slot-rm" onclick="G.removePlayer(${i})">✕</button>`
        :`<div class="mp-slot-num">J${i+1}</div><div class="mp-slot-emoji" style="opacity:.25">?</div><div class="mp-slot-name" style="color:#444">Vacío</div>`;
      c.appendChild(d);
    }
  }

  function removePlayer(i){players.splice(i,1);if(players.length<numPlayers)$('btn-confirm').classList.add('h');renderPlayerSlots();updateSelectHint();updateSynPreview();buildChars();}

  function updateSelectHint(){
    const h=$('select-hint');
    h.textContent=players.length>=numPlayers?'¡Todos asignados! Pulsa Confirmar.':'Seleccionando Jugador '+(players.length+1)+' — haz clic en un personaje';
  }

  function updateSynPreview(){
    const ids=players.map(p=>p.char.id);
    const active=SYN_CARDS.filter(s=>s.pair.every(id=>ids.includes(id)));
    synCards=active;
    const wrap=$('syn-preview'),list=$('syn-list');
    if(!active.length){wrap.style.display='none';return;}
    wrap.style.display='block';
    list.innerHTML=active.map(s=>`<div style="background:rgba(168,85,247,.15);border:1px solid rgba(168,85,247,.4);border-radius:6px;padding:3px 8px;font-family:var(--fd);font-size:9px;color:#e4b8ff;">✨ ${s.name}</div>`).join('');
  }

  function buildChars(){
    const g=$('chars-grid');if(!g)return;g.innerHTML='';
    CHARS.forEach(c=>{
      const taken=players.some(p=>p.char.id===c.id);
      const el=document.createElement('div');el.className='cc'+(taken?' disabled-card':'');
      el.style.setProperty('--ca',c.accent);el.style.setProperty('--cg',c.glow);
      if(taken)el.style.opacity='.3';
      // Check if has synergy cards with current team
      const hasSyn=synCards.some(s=>s.pair.includes(c.id))||SYN_CARDS.some(s=>s.pair.includes(c.id)&&players.some(p=>s.pair.includes(p.char.id)));
      el.innerHTML=`${hasSyn&&!taken?'<div class="syn-badge">✨ Sinergia</div>':''}<div class="ce">${c.emoji}</div><div class="cn">${c.name}</div><div class="ctit">${c.title}</div><div class="ccy">${c.cycle}</div><div style="font-size:8px;color:#888;margin-top:2px">❤${c.hp} ⚔${c.atk} 🛡${c.def}</div>`;
      if(!taken)el.addEventListener('click',()=>openCharScroll(c.id));
      g.appendChild(el);
    });
  }

  function openCharScroll(id){
    if(!diceRolledForChar){
      log('🎲 ¡Primero debes lanzar el D20 para elegir personaje!','sys');
      // Flash the dice button
      const diceBtn=document.querySelector('#sc .bs');if(diceBtn){diceBtn.style.boxShadow='0 0 20px rgba(168,85,247,.8)';setTimeout(()=>diceBtn.style.boxShadow='',1500);}
      return;
    }
    const c=CHARS.find(x=>x.id===id);pendCharId=id;
    $('csc-emoji').textContent=c.emoji;$('csc-emoji').style.filter=`drop-shadow(0 0 14px ${c.accent})`;
    $('csc-cycle').textContent=c.cycle;$('csc-name').textContent=c.name+' — '+c.title;
    $('csc-role').textContent=c.role;$('csc-story').innerHTML=c.story.replace(/\n\n/g,'<br><br>');
    $('csc-don').textContent=c.don;$('csc-tec').textContent=c.tec;$('csc-som').textContent=c.som;$('csc-quote').textContent=c.quote;
    $('csc-stats').innerHTML=`<div class="ser" style="text-align:center"><strong>❤ Vida</strong><br>${c.hp}</div><div class="ser" style="text-align:center"><strong>⚔ ATK</strong><br>${c.atk}</div><div class="ser" style="text-align:center"><strong>🛡 DEF</strong><br>${c.def}</div><div class="ser" style="text-align:center"><strong>🏃 MOV</strong><br>${c.mov}</div>`;
    $('csc-cards').innerHTML=c.cards.map(cd=>`<div class="ser"><span style="font-family:var(--fd);font-size:9px;font-weight:700">${cd.name}</span> <span style="font-size:8px;color:#7a5520">${cd.isBasic?'★ Básica':'Avanzada'}</span><br><span style="font-size:9px">${cd.desc}</span></div>`).join('');
    $('char-scroll-overlay').style.display='flex';Audio.scroll();
  }

  function closeCharScroll(){$('char-scroll-overlay').style.display='none';pendCharId=null;}

  function confirmChar(){
    if(!pendCharId)return;
    const c=CHARS.find(x=>x.id===pendCharId);
    if(players.some(p=>p.char.id===c.id)){closeCharScroll();return;}
    players.push({char:c,hp:c.maxHp,maxHp:c.maxHp,hand:c.cards.map(x=>({...x})),status:'Operativo',pos:{x:1+players.length,y:6}});
    closeCharScroll();renderPlayerSlots();buildChars();updateSelectHint();updateSynPreview();
    if(players.length===numPlayers)$('btn-confirm').classList.remove('h');
    Audio.heal();
  }

  // ── WORLD MAP ──
  function goMap(){clearInterval(timer);clearInterval(fireTimer);clearInterval(weatherTimer);go('sw');buildWorldMap();}

  function buildWorldMap(){
    const map=$('wmap'),svg=$('wmap-paths');
    map.querySelectorAll('.wnode').forEach(n=>n.remove());svg.innerHTML='';
    const W=map.offsetWidth||800,H=map.offsetHeight||360;
    MAP_PATHS.forEach(([a,b])=>{
      const na=MAP_NODES[a],nb=MAP_NODES[b];
      const line=document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1',na.x/100*W);line.setAttribute('y1',na.y/100*H);
      line.setAttribute('x2',nb.x/100*W);line.setAttribute('y2',nb.y/100*H);
      line.setAttribute('stroke',completedMissions.has(a)?'rgba(62,207,142,.5)':'rgba(255,255,255,.08)');
      line.setAttribute('stroke-width','2');line.setAttribute('stroke-dasharray','6 4');
      svg.appendChild(line);
    });
    MAP_NODES.forEach((n,i)=>{
      const m=MISSIONS[i];
      const done=completedMissions.has(i),avail=i===0||completedMissions.has(i-1);
      const el=document.createElement('div');el.className='wnode';
      el.style.left=n.x+'%';el.style.top=n.y+'%';
      const cls=done?'done':avail?(m.isFinal?'boss-node':'avail'):'lock';
      el.innerHTML=`<div class="wnc ${cls}" style="font-size:${done?'20px':'26px'}">${done?'✔':m.stamp}</div><div class="wnt">${m.name}</div><div class="wnd">${m.diff}</div>`;
      if(avail||done)el.addEventListener('click',()=>{openMissionScroll(i);Audio.scroll();});
      map.appendChild(el);
    });
  }

  function openMissionScroll(idx){
    pendMission=idx;const m=MISSIONS[idx];
    $('sc-stamp').textContent=m.stamp;$('sc-num').textContent='MISIÓN '+m.num;
    $('sc-title').textContent=m.name;$('sc-obj').textContent=m.obj;
    $('sc-lore').innerHTML=m.lore.replace(/\n\n/g,'<br><br>');
    $('sc-enemies').innerHTML=m.enemies.map(e=>`<div class="ser">${e.emoji} <strong>${e.name}</strong> — ❤${e.hp} ⚔${e.atk} 🛡${e.def}${e.phases?` <span style="color:var(--violet)">⚠ 3 Fases</span>`:''}</div>`).join('');
    $('sc-reward').textContent=m.reward;
    $('scroll-overlay').style.display='flex';
  }

  function startMission(){
    $('scroll-overlay').style.display='none';
    const idx=pendMission;mIdx=idx;mission=MISSIONS[idx];
    enemies=mission.enemies.map(e=>({...e,currentPhase:e.phases?0:undefined}));
    walls=new Set((mission.walls||[]).map(([x,y])=>x+','+y));
    traps=new Set((mission.traps||[]).map(([x,y])=>x+','+y));
    fires=new Set((mission.fires||[]).map(([x,y])=>x+','+y));
    players.forEach((p,i)=>{
      p.pos={x:1+i,y:6};
      p.hand=[...p.char.cards.map(c=>({...c})),...synCards.map(c=>({...c}))];
    });
    sessionStats={dmgDealt:0,dmgHealed:0,cardsPlayed:0,enemiesKilled:0,turns:0};
    activePlayer=0;turn=1;phase='initiative';order=[];oidx=0;
    clearInterval(timer);clearInterval(fireTimer);tLeft=mission.tl;updateTimer();
    go('sg');
    // Apply mission theme
    const bfw=$('bfw');
    bfw.className=`bfw theme-${mission.theme||0}`;
    Audio.startTheme(mission.musicTheme||0);
    $('boss-phase-wrap').classList.add('h');
    buildPlayerTabs();renderAll();
    $('btn-endturn').disabled=true;$('btn-init').disabled=false;
    $('initstrip').innerHTML='<div class="il2">Orden de Iniciativa</div>';
    $('mname').textContent=mission.name;$('tval').textContent=1;
    log('⚔ MISIÓN '+mission.num+': '+mission.name,'sys');
    log(mission.obj,'sys');
    if(synCards.length)log('✨ Cartas de sinergia activas: '+synCards.map(s=>s.name).join(', '),'syn');
    log('🎲 Lanzad la iniciativa.','sys');
    initFog();
    pickWeather();
    buildWeatherLayer();
    if(mIdx>0 && Math.random()<0.65) setTimeout(showDecision,400);
  }

  function startTimer(){
    clearInterval(timer);
    timer=setInterval(()=>{tLeft--;updateTimer();if(tLeft<=0){clearInterval(timer);finishGame(false,'Se acabó el tiempo.');}},1000);
    clearInterval(fireTimer);
    fireTimer=setInterval(()=>{
      players.forEach(p=>{if(fires.has(p.pos.x+','+p.pos.y)){p.hp=Math.max(0,p.hp-2);log('🔥 '+p.char.name+' quema: -2 PV','enm');updateHp();updateStatus();}});
    },9000);
  }
  function updateTimer(){
    const m=Math.floor(tLeft/60).toString().padStart(2,'0'),s=(tLeft%60).toString().padStart(2,'0');
    const el=$('trval');el.textContent=m+':'+s;el.classList.toggle('urg',tLeft<=120);
  }

  function buildPlayerTabs(){
    const tabs=$('ptabs');tabs.innerHTML='';
    players.forEach((p,i)=>{
      const t=document.createElement('button');t.className='ptab'+(i===activePlayer?' active':'');
      t.style.borderBottomColor=i===activePlayer?PCOLORS[i]:'transparent';
      t.style.color=i===activePlayer?PCOLORS[i]:undefined;
      t.textContent=p.char.emoji+' J'+(i+1);
      t.onclick=()=>{activePlayer=i;buildPlayerTabs();renderAll();};
      tabs.appendChild(t);
    });
  }

  // ── INITIATIVE ──
  function rollInit(){
    rollDice(20,proll=>{
      const ord=[];
      players.forEach((p,i)=>ord.push({id:'p'+i,name:p.char.name,emoji:p.char.emoji,roll:Math.floor(Math.random()*20)+1,isP:true,pidx:i}));
      enemies.forEach(e=>ord.push({id:e.id,name:e.name,emoji:e.emoji,roll:Math.floor(Math.random()*20)+1,isP:false,eref:e}));
      ord.sort((a,b)=>b.roll-a.roll);
      order=ord;oidx=0;renderInit();
      log('🎲 Iniciativa: '+ord.map(o=>o.name+'('+o.roll+')').join(' > '),'sys');
      applyDiceCardEffect(proll);
      phase='player-turn';startTimer();activateTurn();$('btn-init').disabled=true;
    });
  }
  function renderInit(){
    const s=$('initstrip');s.innerHTML='<div class="il2">Orden de Iniciativa</div>';
    order.forEach((o,i)=>{
      const d=document.createElement('div');d.className='ii'+(i===oidx?' active':'');
      d.innerHTML=`<span>${o.emoji}</span><span class="in" style="color:${o.isP?PCOLORS[o.pidx||0]:'var(--red)'}">${o.name}</span><span class="ir">${o.roll}</span>`;
      s.appendChild(d);
    });
  }
  function activateTurn(){
    const cur=order[oidx];if(!cur){nextRound();return;}
    if(cur.isP){
      activePlayer=cur.pidx||0;moved=false;acted=false;phase='waiting-roll';
      // Reset turn flags
      const prevP=players[cur.pidx||0];
      if(prevP){prevP._lowRoll=false;prevP._diceBonus='normal';prevP._atkbuff=prevP._atkbuff||0;}
      turnRollDone=false;turnRollVal=0;turnCanAttack=true;turnCanMove=true;turnMaxAdvCards=1;
      $('btn-endturn').disabled=true; // bloqueado hasta que tire el dado
      buildPlayerTabs();renderAll();
      log('🟢 Turno de '+cur.name+' — ¡Tira el D20 de combate!','mov');
      showTurnRollOverlay(ap());
    } else {
      phase='enemy-turn';$('btn-endturn').disabled=true;
      setTimeout(()=>enemyTurn(cur.eref),600);
    }
    renderInit();
  }
  function endTurn(){
    if(phase!=='player-turn'){
      if(phase==='waiting-roll')log('🎲 ¡Debes tirar el D20 de combate primero!','sys');
      return;
    }
    sessionStats.turns++;$('tval').textContent=turn;
    // Reset turn roll state for next turn
    turnRollDone=false;turnRollVal=0;turnCanAttack=true;turnCanMove=true;turnMaxAdvCards=1;
    const cur=ap();if(cur){cur._diceBonus='normal';}
    log('⏭ Fin de turno','sys');advance();
  }
  function advance(){oidx++;if(oidx>=order.length)nextRound();else activateTurn();renderInit();}
  function nextRound(){
    oidx=0;turn++;$('tval').textContent=turn;log('— Ronda '+turn+' —','sys');
    players.forEach(p=>tickStatusEffects(p));
    if(currentWeather.id==='storm'&&turn%2===1&&Math.random()<0.28){
      const t=players.find(p=>p.hp>0);
      if(t){t.hp=Math.max(0,t.hp-3);log('⛈ Rayo de tormenta golpea a '+t.char.name+': −3 PV','enm');updateHp();}
    }
    activateTurn();
  }

  // ── BOSS PHASES ──
  function checkBossPhase(boss){
    if(!boss.phases)return;
    const ratio=boss.hp/boss.maxHp;
    let newPhase=0;
    if(ratio<=0.33)newPhase=2;
    else if(ratio<=0.66)newPhase=1;
    if(newPhase>boss.currentPhase){
      boss.currentPhase=newPhase;
      const ph=boss.phases[newPhase];
      boss.atk=ph.atk;boss.def=ph.def;
      showPhaseAlert(ph.name,ph.desc,newPhase);
      Audio.bossPhase();
      // Update boss token class
      $('boss-phase-wrap').classList.remove('h');
      $('boss-phase-val').textContent=['I','II','III'][newPhase];
      log('👑 '+ph.name+' — '+ph.desc,'enm');
    }
    // Update boss HP bar color
    renderBossBar(boss);
  }

  function showPhaseAlert(name,desc,phaseIdx){
    const al=$('phase-alert'),txt=$('phase-alert-text'),sub=$('phase-alert-sub');
    const cols=['','#ff6b35','#ff0040'];
    txt.textContent='⚠ '+name.toUpperCase()+' ACTIVADA ⚠';
    txt.style.color=cols[phaseIdx]||'#ff0040';
    sub.textContent=desc;
    al.style.display='flex';
    setTimeout(()=>al.style.display='none',2800);
  }

  function renderBossBar(boss){
    let bw=document.querySelector('.boss-bar-wrap');
    if(!bw){
      const ep=document.querySelector('.ep');if(!ep)return;
      bw=document.createElement('div');bw.className='boss-bar-wrap';
      ep.insertBefore(bw,ep.firstChild);
    }
    const ratio=boss.hp/boss.maxHp;
    const phaseColor=['#a855f7','#ff6b35','#ff0040'][boss.currentPhase||0];
    bw.innerHTML=`<div class="boss-bar-lbl"><span>👑 ${boss.name}</span><span>Fase ${['I','II','III'][boss.currentPhase||0]}</span></div>
    <div class="boss-bar-track">
      <div class="boss-bar-fill" style="width:${ratio*100}%;background:${phaseColor}"></div>
      <div class="boss-phase-marker" style="left:66%"></div>
      <div class="boss-phase-marker" style="left:33%"></div>
    </div>`;
  }

  // ── ENEMY AI ──
  function enemyTurn(e){
    if(!e||e.hp<=0){advance();return;}
    if(e.stunned>0){e.stunned--;log('⚡ '+e.name+' inmovilizado.','enm');setTimeout(advance,500);return;}
    let target=null,bestDist=999;
    players.forEach(p=>{if(p.hp<=0)return;const d=Math.abs(p.pos.x-e.x)+Math.abs(p.pos.y-e.y);if(d<bestDist){bestDist=d;target=p;}});
    if(!target){advance();return;}
    const mov=e.phases?e.phases[e.currentPhase||0].mov:1;
    for(let step=0;step<mov;step++){
      const dx=Math.sign(target.pos.x-e.x),dy=Math.sign(target.pos.y-e.y);
      const moves=[[dx,dy],[dx,0],[0,dy],[dx,-dy],[-dx,dy]];
      let moved2=false;
      for(const[mx,my] of moves){
        const nx=e.x+mx,ny=e.y+my;
        if(nx<0||ny<0||nx>=BW||ny>=BH)continue;
        if(walls.has(nx+','+ny))continue;
        if(enemies.some(o=>o!==e&&o.hp>0&&o.x===nx&&o.y===ny))continue;
        if(players.some(p=>p.pos.x===nx&&p.pos.y===ny))break;
        e.x=nx;e.y=ny;moved2=true;break;
      }
      if(!moved2)break;
    }
    renderBoard();
    const dist=Math.max(Math.abs(target.pos.x-e.x),Math.abs(target.pos.y-e.y));
    if(dist<=1){
      const phaseIdx=e.currentPhase||0;
      const actPool=e.type==='boss'?(BATK[phaseIdx]||BATK[0]):EATK;
      const act=actPool[Math.floor(Math.random()*actPool.length)];
      const raw=e.atk+Math.floor(Math.random()*4)*(phaseIdx+1);
      const shield=target._shield||0;target._shield=0;
      const dmg=Math.max(0,raw-target.char.def-shield);
      target.hp=Math.max(0,target.hp-dmg);
      updateHp();updateStatus();
      showEnemySpeech(e);
      log((e.type==='boss'?'👑':'💀')+' '+e.name+' '+act+' → '+target.char.name+': '+(dmg>0?dmg+' daño':'bloqueado'),'enm');
      Audio.hit();
      flashCell(target.pos.x,target.pos.y,'hit');
      animAttackLine(e,target.pos,e.type==='boss'?'#a855f7':'var(--red)');
      if(target.hp<=0){log('💀 '+target.char.name+' eliminado!','enm');Audio.death();spawnDeathParticles(target.pos.x,target.pos.y,target.char.emoji);}
      if(e.phases){
        checkBossPhase(e);
        // Boss phase 2+ triggers saving throws
        if(e.type==='boss'&&(e.currentPhase||0)>=1&&Math.random()<0.4){
          const stId=(e.currentPhase||0)>=2?'poison':'boss_atk';
          triggerSaveThrow(stId,()=>{advance();});return;
        }
      }
    }
    setTimeout(()=>{if(players.every(p=>p.hp<=0)){finishGame(false,'Todo el grupo ha caído.');}else advance();},900);
  }

  // ── BOARD ──
  function renderBoard(){
    const bf=$('battlefield');bf.innerHTML='';
    const board=document.createElement('div');board.className=`board theme-${mission?.theme||0}`;
    board.style.gridTemplateColumns=`repeat(${BW},50px)`;board.style.gridTemplateRows=`repeat(${BH},50px)`;
    const cur=ap();
    for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){
      const k=x+','+y;
      const isW=walls.has(k),isT=traps.has(k),isF=fires.has(k);
      const cell=document.createElement('div');
      cell.className='cell'+(isW?' wall':isT?' trap':isF?' fire':'');
      cell.dataset.x=x;cell.dataset.y=y;
      if(isW)cell.innerHTML='<span class="wall-icon">🧱</span>';
      else if(isF)cell.innerHTML='<span class="wall-icon" style="opacity:.55">🔥</span>';
      else if(isT)cell.innerHTML='<span class="wall-icon" style="opacity:.35">⚠</span>';
      if(!isW&&phase==='player-turn'&&!moved){
        const d=Math.max(Math.abs(x-cur.pos.x),Math.abs(y-cur.pos.y));
        if(d>0&&d<=cur.char.mov&&!enemies.some(e=>e.x===x&&e.y===y&&e.hp>0)&&!players.some(p=>p!==cur&&p.pos.x===x&&p.pos.y===y))
          cell.classList.add('reach');
      }
      players.forEach((p,pi)=>{
        if(p.pos.x===x&&p.pos.y===y&&p.hp>0){
          if(pi===activePlayer)cell.classList.add('cur');
          const t=document.createElement('div');
          t.className=`tok player p${pi}`;
          if(order[oidx]&&order[oidx].isP&&order[oidx].pidx===pi)t.classList.add('active-turn');
          t.textContent=p.char.emoji;
          const h=document.createElement('div');h.className='thp'+(p.hp<p.maxHp*.35?' low':'');h.style.color=PCOLORS[pi];h.textContent=p.hp;t.appendChild(h);cell.appendChild(t);
        }
      });
      if(!isW){
        const en=enemies.find(e=>e.x===x&&e.y===y&&e.hp>0);
        if(en){
          const d=Math.max(Math.abs(x-cur.pos.x),Math.abs(y-cur.pos.y));
          const pRange=cur&&cur.char?cur.char.range||1:1;
          if(d<=pRange&&turnCanAttack&&!acted)cell.classList.add('inrange');
          const t=document.createElement('div');
          const phClass=en.type==='boss'?` phase${en.currentPhase||0+1}`:'';
          t.className=`tok ${en.type}${phClass}`;
          if(order[oidx]&&!order[oidx].isP&&order[oidx].id===en.id)t.classList.add('active-turn');
          if(en.stunned>0)t.style.opacity='.5';
          t.textContent=en.emoji;
          const h=document.createElement('div');h.className='thp'+(en.hp<en.maxHp*.4?' low':'');h.textContent=en.hp;t.appendChild(h);
          const bar=document.createElement('div');bar.className='ehb';
          const fill=document.createElement('div');fill.className='ehf';
          fill.style.width=(en.hp/en.maxHp*100)+'%';
          const bossColor=en.currentPhase===2?'#ff0040':en.currentPhase===1?'#ff6b35':'#a855f7';
          fill.style.background=en.type==='boss'?bossColor:'#ef6c63';
          bar.appendChild(fill);cell.appendChild(t);cell.appendChild(bar);
        }
      }
      cell.addEventListener('click',()=>onCell(x,y));board.appendChild(cell);
    }
    bf.appendChild(board);
    renderEnemyPanel(bf);
    // Fog: reveal around all living players then render
    players.forEach(p=>{if(p.hp>0)revealAround(p.pos.x,p.pos.y,3);});
    setTimeout(()=>renderFog(),0);
  }

  function renderEnemyPanel(bf){
    const ep=document.createElement('div');ep.className='ep';
    ep.innerHTML='<div class="epl">ENEMIGOS EN CAMPO</div>';
    // Boss bar first
    const boss=enemies.find(e=>e.type==='boss'&&e.hp>0);
    if(boss){
      const ratio=boss.hp/boss.maxHp;
      const phaseColor=['#a855f7','#ff6b35','#ff0040'][boss.currentPhase||0];
      const bw=document.createElement('div');bw.className='boss-bar-wrap';
      bw.innerHTML=`<div class="boss-bar-lbl"><span>👑 ${boss.name}</span><span style="color:${phaseColor}">Fase ${['I','II','III'][boss.currentPhase||0]} — ATK:${boss.atk}</span></div><div class="boss-bar-track"><div class="boss-bar-fill" style="width:${ratio*100}%;background:${phaseColor}"></div><div class="boss-phase-marker" style="left:66%"></div><div class="boss-phase-marker" style="left:33%"></div></div>`;
      ep.appendChild(bw);
    }
    const alive=enemies.filter(e=>e.hp>0&&e.type!=='boss');
    if(!alive.length&&!boss){ep.innerHTML+='<div class="er" style="color:var(--green)">✔ Todos eliminados</div>';}
    else alive.forEach(e=>{
      const p=e.hp/e.maxHp,row=document.createElement('div');row.className='er '+e.type;
      row.innerHTML=`<span class="ei">${e.emoji}</span><span class="en2">${e.name}${e.stunned>0?' ⚡':''}</span><div class="ebw"><div class="eb" style="width:${p*100}%;background:${p<.35?'#ef6c63':'#f59e0b'}"></div></div><span class="ehp2">${e.hp}/${e.maxHp}</span><span class="est">⚔${e.atk} 🛡${e.def}</span>`;
      row.addEventListener('click',()=>{
        if(phase!=='player-turn')return;
        if(!turnCanAttack){log('🚫 No puedes atacar este turno (D20='+turnRollVal+').','sys');return;}
        if(acted){log('⚠ Ya has actuado este turno.','sys');return;}
        const cur2=ap();
        if(cur2&&cur2._lowRoll&&moved){log('⚠ Solo puedes mover O atacar con dado '+turnRollVal+'.','sys');return;}
        const dist=Math.max(Math.abs(e.x-cur2.pos.x),Math.abs(e.y-cur2.pos.y));
        const maxR=cur2.char.range||1;
        if(dist>maxR){log('🚫 '+e.name+' está fuera de tu alcance. Acércate primero ('+cur2.char.combatType+', max '+maxR+' casillas).','sys');return;}
        attackEnemy(e);
      });ep.appendChild(row);
    });
    bf.appendChild(ep);
  }

  function onCell(x,y){
    if(phase!=='player-turn')return;
    const cur=ap();const k=x+','+y;
    // Movimiento
    if(canPlayerMove()){
      const d=Math.max(Math.abs(x-cur.pos.x),Math.abs(y-cur.pos.y));
      const effectiveMov=Math.max(1,cur.char.mov+(currentWeather.id==='rain'?-1:0));
      if(d>0&&d<=effectiveMov&&!walls.has(k)&&!enemies.some(e=>e.x===x&&e.y===y&&e.hp>0)&&!players.some(p=>p!==cur&&p.pos.x===x&&p.pos.y===y)){
        cur.pos={x,y};moved=true;
        if(traps.has(k)){cur.hp=Math.max(0,cur.hp-3);log('⚠ '+cur.char.name+' activa trampa: -3 PV','enm');Audio.hit();updateHp();updateStatus();}
        log('🏃 '+cur.char.name+' → ('+(x+1)+','+(y+1)+')','mov');renderBoard();return;
      }
    } else if(!turnCanMove){
      log('🚫 No puedes moverte este turno (D20='+turnRollVal+').','sys');return;
    } else if(cur&&cur._lowRoll&&acted){
      log('⚠ Ya atacaste este turno. Con dado '+turnRollVal+' solo puedes hacer UNA acción.','sys');
    }
    // Ataque
    const en=enemies.find(e=>e.x===x&&e.y===y&&e.hp>0);
    if(en){
      if(!turnCanAttack){
        log('🚫 No puedes atacar este turno. (D20='+turnRollVal+' — Pifia)','sys');return;
      }
      if(acted){log('⚠ Ya has actuado este turno.','sys');return;}
      if(cur&&cur._lowRoll&&moved){
        log('⚠ Ya te moviste. Con dado '+turnRollVal+' solo puedes hacer UNA acción (mover O atacar).','sys');return;
      }
      // Verificar alcance REAL del personaje
      const dist=Math.max(Math.abs(en.x-cur.pos.x),Math.abs(en.y-cur.pos.y));
      const maxRange=cur.char.range||1;
      if(dist>maxRange){
        log('🚫 '+en.name+' está fuera de tu alcance. '+cur.char.name+' ('+cur.char.combatType+') llega hasta '+maxRange+' casilla'+(maxRange>1?'s':'')+'.','sys');
        return;
      }
      attackEnemy(en);
    }
  }

  function attackEnemy(en){
    const cur=ap();
    // Rango ya verificado en onCell — aquí solo el D20 de ataque
    const isRange=cur.char.combatType==='Distancia'||(cur.char.combatType==='Mixto');
    // D20 attack roll (separado del D20 de turno)
    const atkRoll=Math.floor(Math.random()*20)+1;
    const isCrit=atkRoll===20, isMiss=atkRoll===1;
    if(isMiss){
      acted=true;
      log('💨 '+cur.char.name+' FALLA el ataque. (D20=1 — Pifia)','sys');
      showSpeech(cur.char.id,'atk',cur.pos,true);renderBoard();return;
    }
    const wPen=isRange?currentWeather.atkPen:0;
    const bonus=isCrit?cur.char.atk:0;
    const raw=cur.char.atk+(cur._atkbuff||0)+Math.floor(Math.random()*4)+bonus+wPen;cur._atkbuff=0;
    const dmg=Math.max(1,raw-en.def);
    en.hp-=dmg;acted=true;sessionStats.dmgDealt+=dmg;
    if(isCrit){sessionStats.crits++;showCritFX();
      const cefx=['stunned','pushed','extra'];const ce=cefx[Math.floor(Math.random()*cefx.length)];
      if(ce==='stunned'){en.stunned=1;log('🌟 CRÍTICO! '+en.name+' queda Aturdido.','spc');}
      else if(ce==='pushed'){en.x=Math.min(BW-1,en.x+1);log('🌟 CRÍTICO! '+en.name+' empujado.','spc');}
      else{log('🌟 CRÍTICO! Daño doble aplicado.','spc');}
    }
    floatTxt((isCrit?'★ ':'')+'-'+dmg,isCrit?'var(--amber)':'var(--red)',en.x,en.y);
    flashCell(en.x,en.y,'hit');
    animAttackLine(cur.pos,en,'var(--green)');
    showSpeech(cur.char.id,isCrit?'crit':'atk',cur.pos,false);
    log('⚔ '+cur.char.name+(isCrit?' ★CRÍTICO':'')+' → '+en.name+': '+dmg+' daño (PV:'+Math.max(0,en.hp)+'/'+en.maxHp+')','atk');
    Audio.attack();
    // Reveal fog around hit enemy
    revealAround(en.x,en.y,2);
    if(en.hp<=0){
      en.hp=0;sessionStats.enemiesKilled++;
      log('💀 '+en.name+' eliminado!','spc');
      order=order.filter(o=>o.id!==en.id);
      Audio.death();spawnDeathParticles(en.x,en.y,en.emoji);checkWin();
    } else if(en.phases){checkBossPhase(en);}
    renderBoard();renderFog();
  }

  function spawnDeathParticles(gx,gy,emoji){
    const board=document.querySelector('.board');if(!board)return;
    const cell=board.querySelector(`.cell[data-x="${gx}"][data-y="${gy}"]`);if(!cell)return;
    const parts=['💥','✨','⚡','🔥','💫'];
    for(let i=0;i<8;i++){
      const p=document.createElement('div');p.className='death-particle';
      const angle=Math.random()*Math.PI*2,dist=30+Math.random()*50;
      p.style.setProperty('--tx',Math.cos(angle)*dist+'px');
      p.style.setProperty('--ty',Math.sin(angle)*dist-40+'px');
      p.style.setProperty('--dur',(0.6+Math.random()*0.4)+'s');
      p.style.left='50%';p.style.top='50%';
      p.textContent=i<2?emoji:parts[Math.floor(Math.random()*parts.length)];
      cell.appendChild(p);setTimeout(()=>p.remove(),1100);
    }
  }

  function flashCell(x,y,type){
    const board=document.querySelector('.board');if(!board)return;
    const cell=board.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);if(!cell)return;
    const f=document.createElement('div');f.className=type==='hit'?'hit-flash':'heal-flash';
    cell.appendChild(f);setTimeout(()=>f.remove(),350);
  }

  function animAttackLine(from,to,color){
    const board=document.querySelector('.board');if(!board)return;
    const fc=board.querySelector(`.cell[data-x="${from.x}"][data-y="${from.y}"]`);
    const tc=board.querySelector(`.cell[data-x="${to.x}"][data-y="${to.y}"]`);
    if(!fc||!tc)return;
    const br=board.getBoundingClientRect(),fr=fc.getBoundingClientRect(),tr=tc.getBoundingClientRect();
    const x1=fr.left-br.left+fr.width/2,y1=fr.top-br.top+fr.height/2;
    const x2=tr.left-br.left+tr.width/2,y2=tr.top-br.top+tr.height/2;
    const len=Math.hypot(x2-x1,y2-y1),angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI;
    const line=document.createElement('div');
    line.style.cssText=`position:absolute;left:${x1}px;top:${y1}px;width:${len}px;height:2px;background:${color};transform:rotate(${angle}deg);transform-origin:left center;border-radius:1px;z-index:50;pointer-events:none;animation:hf .45s ease-out forwards;`;
    board.appendChild(line);
    const proj=document.createElement('div');
    proj.style.cssText=`position:absolute;left:${x1}px;top:${y1-10}px;font-size:14px;z-index:200;pointer-events:none;transition:left .22s linear,top .22s linear;`;
    proj.textContent=color.includes('green')||color==='var(--green)'?'✨':'💢';
    board.appendChild(proj);
    requestAnimationFrame(()=>{proj.style.left=x2+'px';proj.style.top=(y2-10)+'px';});
    setTimeout(()=>{line.remove();proj.remove();},480);
  }

  // ── CARDS ──
  function renderHand(){
    const h=$('hand'),cur=ap();h.innerHTML='';
    const bonus=(cur&&cur._diceBonus)||'normal';
    if(bonus==='pifia'&&!acted){
      h.innerHTML='<div style="text-align:center;padding:16px;color:var(--red);font-family:var(--fd);font-size:11px;border:1px solid rgba(239,108,99,.2);border-radius:8px">💀 PIFIA — Sin acción de cartas este turno</div>';return;
    }
    const advancedLimit=bonus==='critical'?99:bonus==='high'?2:1;
    cur.hand.forEach(card=>{
      const blockedByDice=(!card.isBasic&&bonus==='low')||(!card.isBasic&&bonus==='pifia')||(turnMaxAdvCards===0&&!card.isBasic&&!card.isSyn);
      const blockedByActed=acted&&!card.isBasic&&!card.isSyn;
      const blocked=blockedByActed||blockedByDice||(cur.status==='Crítico'&&!card.isBasic&&!card.isSyn);
      const el=document.createElement('div');
      el.className=`ci ${card.isBasic?'basic':card.isSyn?'syn-card':'advanced'}${blocked?' disabled':''}`;
      el.innerHTML=`<div class="cbg ${card.isBasic?'basic':card.isSyn?'syn':'advanced'}">${card.isBasic?'★ Básica':card.isSyn?'✨ Sinergia':'Avanzada'}</div><div class="ci2">${card.name}</div><div class="cd">${card.desc}</div>`;
      el.addEventListener('click',()=>openCard(card));h.appendChild(el);
    });
    // Dice bonus indicator
    if(bonus!=='normal'&&bonus!=='pifia'){
      const ind=document.createElement('div');
      ind.style.cssText='font-size:10px;text-align:center;padding:6px;border-radius:6px;margin-top:4px;';
      if(bonus==='critical')ind.style.cssText+='color:var(--amber);background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.3);';
      else if(bonus==='high')ind.style.cssText+='color:var(--green);background:rgba(62,207,142,.08);border:1px solid rgba(62,207,142,.2);';
      else if(bonus==='low')ind.style.cssText+='color:var(--red);background:rgba(239,108,99,.08);border:1px solid rgba(239,108,99,.2);';
      ind.textContent=bonus==='critical'?'🌟 CRÍTICO: 2 cartas avanzadas extra':bonus==='high'?'⚡ 1 carta avanzada extra':bonus==='low'?'⚠ Solo básicas este turno':'';
      h.appendChild(ind);
    }
  }

  function openCard(card){
    const cur=ap();
    if(phase!=='player-turn'){log('No es tu turno.','sys');return;}
    if(acted&&!card.isBasic){log('Ya jugaste una carta avanzada.','sys');return;}
    pendCard=card;
    $('mch').textContent=card.name+(card.isSyn?' ✨':'');
    $('mcb').innerHTML=`<p><strong>${card.isBasic?'★ Básica (no se descarta)':card.isSyn?'✨ Carta de Sinergia (potente, se descarta)':'Avanzada (se descarta)'}</strong></p><p style="margin-top:8px">${card.desc}</p>`;
    $('modal-card').classList.remove('h');
  }
  function closeCard(){$('modal-card').classList.add('h');pendCard=null;}

  function playCard(){
    const card=pendCard,cur=ap();if(!card)return;
    closeCard();sessionStats.cardsPlayed++;
    log('✨ '+cur.char.name+' usa: '+card.name,'spc');
    if(card.isSyn)Audio.synergy();else Audio.magic();
    switch(card.effect){
      case 'damage':{const e=enemies.find(x=>x.hp>0);if(!e){log('Sin enemigos.','sys');break;}const d=card.val+Math.floor(Math.random()*3);e.hp=Math.max(0,e.hp-d);sessionStats.dmgDealt+=d;floatTxt('-'+d,'var(--red)',e.x,e.y);flashCell(e.x,e.y,'hit');log('⚔ '+d+' daño a '+e.name,'atk');if(card.isSyn&&e.stunned===undefined)e.stunned=1;if(e.hp<=0){e.hp=0;sessionStats.enemiesKilled++;log('💀 '+e.name+' eliminado!','spc');order=order.filter(o=>o.id!==e.id);Audio.death();spawnDeathParticles(e.x,e.y,e.emoji);checkWin();}break;}
      case 'heal':{const g=Math.min(card.val,cur.maxHp-cur.hp);cur.hp=Math.min(cur.maxHp,cur.hp+card.val);sessionStats.dmgHealed+=g;flashCell(cur.pos.x,cur.pos.y,'heal');showSpeech(cur.char.id,'heal',cur.pos,false);log('💚 +'+g+' PV ('+cur.hp+'/'+cur.maxHp+')','heal');Audio.heal();updateHp();updateStatus();break;}
      case 'shield':cur._shield=(cur._shield||0)+card.val;log('🛡 Escudo +'+card.val,'mov');break;
      case 'shield+heal':cur._shield=(cur._shield||0)+card.val;cur.hp=Math.min(cur.maxHp,cur.hp+2);sessionStats.dmgHealed+=2;updateHp();updateStatus();flashCell(cur.pos.x,cur.pos.y,'heal');log('🛡 Escudo+2PV','heal');Audio.heal();break;
      case 'buff':cur._atkbuff=(cur._atkbuff||0)+card.val;log('⬆ +'+card.val+' ATK','spc');break;
      case 'stun':{const e=enemies.find(x=>x.hp>0);if(e){e.stunned=card.val;log('⚡ '+e.name+' inmovilizado '+card.val+'t','spc');}break;}
      case 'debuff':enemies.filter(e=>e.hp>0).forEach(e=>{e.def=Math.max(0,e.def-card.val);e.atk=Math.max(0,(e.atk||0)-card.val);log('📉 '+e.name+' -'+card.val+' DEF/ATK','spc');});break;
      case 'double-damage':cur._atkbuff=(cur._atkbuff||0)+cur.char.atk;log('✦ Doble daño activado!','spc');break;
      case 'dodge':cur._shield=(cur._shield||0)+99;log('💨 Esquiva total','spc');break;
    }
    acted=true;
    if(!card.isBasic)cur.hand=cur.hand.filter(x=>x.id!==card.id);
    renderHand();renderBoard();
  }

  function updateHp(){
    const cur=ap();const r=cur.hp/cur.maxHp;
    $('hpbar').style.width=(r*100)+'%';$('hpbar').className='hb'+(r<=.25?' low':r<=.55?' mid':'');
    $('hpval').textContent=cur.hp+'/'+cur.maxHp;
    $('atkval').textContent=cur.char.atk+(cur._atkbuff?'+'+cur._atkbuff:'');$('defval').textContent=cur.char.def;
  }
  function updateStatus(){
    const cur=ap();const r=cur.hp/cur.maxHp;
    let s='Operativo';if(cur.hp<=0)s='Eliminado';else if(r<=.25)s='Crítico';else if(r<=.55)s='Herido';
    cur.status=s;const b=$('statbadge');b.textContent=s;b.className='sbg '+s.toLowerCase();
  }
  function renderAll(){
    const cur=ap();if(!cur)return;
    $('portrait').textContent=cur.char.emoji;$('portrait').style.borderColor=PCOLORS[activePlayer];$('portrait').style.boxShadow='0 0 12px '+cur.char.glow;
    $('pname').textContent=cur.char.name;$('ptitle').textContent=cur.char.title;$('pcycle').textContent=cur.char.cycle;
    updateHp();updateStatus();
    const mp=$('movpips');mp.innerHTML='';
    for(let i=0;i<4;i++){const p=document.createElement('div');p.className='pip'+(i>=cur.char.mov?' e':'');mp.appendChild(p);}
    const sb=$('synblock');sb.innerHTML='<div class="snt">Sinergias</div>';
    let found=false;
    CHARS.forEach(o=>{if(o.id===cur.char.id)return;const syn=SYN[cur.char.id+'-'+o.id];if(syn){found=true;const el=document.createElement('div');el.className='sni '+syn.t;el.textContent=o.emoji+' '+o.name+': '+syn.b;sb.appendChild(el);}});
    // Syn cards active
    synCards.forEach(s=>{const el=document.createElement('div');el.className='sni syn';el.textContent='✨ '+s.name+' disponible';sb.appendChild(el);});
    if(!found&&!synCards.length){const el=document.createElement('div');el.className='sni neu';el.textContent='Sin sinergias';sb.appendChild(el);}
    renderBoard();renderHand();
  }
  function floatTxt(txt,col,gx,gy){
    const board=document.querySelector('.board');if(!board)return;
    const el=document.createElement('div');el.className='ft';el.textContent=txt;el.style.color=col;
    el.style.left=(gx*52+16)+'px';el.style.top=(gy*52+6)+'px';board.appendChild(el);setTimeout(()=>el.remove(),1100);
  }

  // ── VICTORY ──
  function checkWin(){
    if(enemies.filter(e=>e.hp>0).length>0)return;
    clearInterval(timer);clearInterval(fireTimer);
    completedMissions.add(mIdx);
    const sv=Save.load()||{};sv.completedMissions=[...completedMissions];Save.save(sv);
    saveHistory(true);
    setTimeout(()=>{
      if(mission.isFinal){Audio.victory();finishGame(true,'¡La Reina ha caído! Augustria es libre para siempre.');}
      else{
        Audio.victory();
        players.forEach(p=>{p.hp=Math.min(p.maxHp,p.hp+6);p.hand=[...p.char.cards.map(c=>({...c})),...synCards.map(c=>({...c}))];});
        $('endcontent').innerHTML=`<div style="font-size:42px">${mission.stamp}</div><div class="et v">¡Misión Completada!</div><div class="esb">${mission.reward}</div><div style="font-size:12px;color:var(--muted);margin-bottom:16px">⚔ ${sessionStats.dmgDealt} daño · 💚 ${sessionStats.dmgHealed} PV curados · 🃏 ${sessionStats.cardsPlayed} cartas · 💀 ${sessionStats.enemiesKilled} eliminados</div><div class="ebs"><button class="bp" onclick="G.closeEndAndMap()">🗺 Mapa →</button></div>`;
        $('modal-end').classList.remove('h');
      }
    },700);
  }
  function finishGame(v,msg){
    clearInterval(timer);clearInterval(fireTimer);phase='end';$('btn-endturn').disabled=true;
    if(!v){Audio.defeat();saveHistory(false);}
    $('endcontent').innerHTML=`<div style="font-size:42px">${v?'🏆':'💀'}</div><div class="et ${v?'v':'d'}">${v?'⚔ VICTORIA':'💀 DERROTA'}</div><div class="esb">${msg}</div><div style="font-size:12px;color:var(--muted);margin-bottom:16px">⚔ ${sessionStats.dmgDealt} daño · 💚 ${sessionStats.dmgHealed} curados · 🃏 ${sessionStats.cardsPlayed} cartas · 💀 ${sessionStats.enemiesKilled} eliminados</div><div class="ebs"><button class="bp" onclick="location.reload()">Nueva</button><button class="bs" onclick="G.closeEndAndMap()">🗺 Mapa</button></div>`;
    $('modal-end').classList.remove('h');
  }
  function closeEndAndMap(){$('modal-end').classList.add('h');$('endcontent').innerHTML='';goMap();}

  // ── HISTORY ──
  function saveHistory(victory){
    const sv=Save.load()||{};if(!sv.history)sv.history=[];
    sv.history.unshift({
      date:new Date().toLocaleDateString('es-ES',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}),
      mission:mission?.name||'—',missionNum:mission?.num||'?',stamp:mission?.stamp||'⚔',
      chars:players.map(p=>p.char.emoji+p.char.name).join(', '),
      victory,stats:{...sessionStats}
    });
    if(sv.history.length>10)sv.history.length=10;
    Save.save(sv);
  }
  function goHistory(){
    go('sh');const sv=Save.load();const grid=$('hist-grid');
    grid.innerHTML='';
    if(!sv||!sv.history||!sv.history.length){grid.innerHTML='<div class="empty-hist">📖 Sin partidas registradas todavía.<br>¡Completa tu primera misión!</div>';return;}
    sv.history.forEach(h=>{
      const d=document.createElement('div');d.className='hist-card';
      d.innerHTML=`<div class="hist-result">${h.victory?'🏆':'💀'}</div><div class="hist-info"><div class="hist-date">${h.date}</div><div class="hist-title">${h.stamp} Misión ${h.missionNum}: ${h.mission}</div><div class="hist-chars">${h.chars}</div><div class="hist-stats">⚔ ${h.stats?.dmgDealt||0} daño · 💚 ${h.stats?.dmgHealed||0} curados · 🃏 ${h.stats?.cardsPlayed||0} cartas · 💀 ${h.stats?.enemiesKilled||0} eliminados</div></div><div class="hist-badge ${h.victory?'v':'d'}">${h.victory?'Victoria':'Derrota'}</div>`;
      grid.appendChild(d);
    });
  }
  function clearHistory(){const sv=Save.load()||{};sv.history=[];Save.save(sv);goHistory();}

  // ── DICE ──
  // D20 card influence: high roll = more cards available, low roll = restrictions
  function applyDiceCardEffect(val){
    const cur=ap();if(!cur)return;
    if(val===20){
      cur._diceBonus='critical'; log('🌟 ¡CRÍTICO! Puedes jugar 2 cartas avanzadas este turno.','spc');
    } else if(val>=15){
      cur._diceBonus='high'; log('⚡ D20='+val+': puedes jugar 1 carta avanzada extra este turno.','spc');
    } else if(val>=8){
      cur._diceBonus='normal'; log('✔ D20='+val+': turno normal.','sys');
    } else if(val>=4){
      cur._diceBonus='low'; log('⚠ D20='+val+': solo puedes jugar cartas básicas ★ este turno.','sys');
    } else {
      cur._diceBonus='pifia'; log('💀 ¡PIFIA! D20='+val+': pierdes la acción de cartas este turno.','sys');
    }
    renderHand();
  }
  function rollDice(sides,cb){
    const val=Math.floor(Math.random()*sides)+1;lastDiceVal=val;diceCB=cb||null;
    $('dtype').textContent='D'+sides;$('dbig').textContent='';$('dbig').className='dbig';$('dflavor').textContent='';$('dfn').textContent='?';
    $('d3d').className='d3 rol';$('doverlay').style.display='flex';Audio.dice();
    let t=0;const iv=setInterval(()=>{$('dfn').textContent=Math.floor(Math.random()*sides)+1;if(++t>=18){clearInterval(iv);$('dfn').textContent=val;$('d3d').className='d3 set';$('dbig').textContent=val;if(sides===20){if(val===20){$('dbig').className='dbig cr';$('dflavor').textContent='🌟 ¡CRÍTICO PERFECTO!';}else if(val===1){$('dbig').className='dbig pf';$('dflavor').textContent='💀 ¡PIFIA TOTAL!';}else $('dflavor').textContent=val>=15?'⚡ Gran resultado!':val>=8?'✔ Aceptable.':'⚠ Resultado bajo...';}}},80);
  }
  function closeDice(){$('doverlay').style.display='none';$('d3d').className='d3';if(diceCB){const f=diceCB;diceCB=null;f(lastDiceVal);}}

  function log(msg,type){const l=$('log'),e=document.createElement('div');e.className='le '+type;e.textContent=msg;l.insertBefore(e,l.firstChild);while(l.children.length>40)l.removeChild(l.lastChild);}


  // ══════════════════════════════════════════════════
  // CINEMATIC SYSTEM
  // ══════════════════════════════════════════════════
  function showCin(mIdx2,cb){
    const cin=CINEMATICS[mIdx2];
    if(!cin){if(cb)cb();return;}
    pendCinCB=cb;cinTimers.forEach(clearTimeout);cinTimers=[];
    const el=$('cin');
    $('cin-loc').textContent=cin.loc;
    $('cin-txt').textContent='';
    $('cin-dlg').innerHTML='';
    el.style.display='flex';
    // Typewriter
    let i=0;
    function type(){if(i<cin.txt.length){$('cin-txt').textContent+=cin.txt[i++];cinTimers.push(setTimeout(type,16));}};
    type();
    // Dialogues
    cin.dlg.forEach((d,di)=>{
      cinTimers.push(setTimeout(()=>{
        const c2=CHARS.find(x=>x.id===d.id);if(!c2)return;
        const div=document.createElement('div');div.className='cin-card';
        div.innerHTML=`<div class="cin-card-em">${c2.emoji}</div><div><div class="cin-card-name" style="color:${c2.accent}">${c2.name}</div><div class="cin-card-line">${d.line}</div></div>`;
        $('cin-dlg').appendChild(div);
        requestAnimationFrame(()=>div.classList.add('show'));
        Audio.scroll();
      },1800+di*1500));
    });
    const total=Math.max(3500,cin.txt.length*16+cin.dlg.length*1500+1200);
    cinTimers.push(setTimeout(()=>endCin(),total+600));
  }
  function endCin(){
    $('cin').style.display='none';
    cinTimers.forEach(clearTimeout);cinTimers=[];
    if(pendCinCB){const f=pendCinCB;pendCinCB=null;f();}
  }
  function skipCin(){endCin();}

  // ══════════════════════════════════════════════════
  // FOG OF WAR
  // ══════════════════════════════════════════════════
  function initFog(){
    fogCells.clear();revealedCells.clear();
    for(let y=0;y<BH;y++)for(let x=0;x<BW;x++)fogCells.add(x+','+y);
    players.forEach(p=>revealAround(p.pos.x,p.pos.y,3));
  }
  function revealAround(cx,cy,r){
    for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
      const nx=cx+dx,ny=cy+dy;
      if(nx>=0&&ny>=0&&nx<BW&&ny<BH){
        fogCells.delete(nx+','+ny);revealedCells.add(nx+','+ny);
      }
    }
  }
  function renderFog(){
    const board=document.querySelector('.board');if(!board)return;
    board.querySelectorAll('.fog-cell').forEach(f=>f.remove());
    const cw=50,ch=50,gap=2,pad=9;
    fogCells.forEach(k=>{
      const [x,y]=k.split(',').map(Number);
      const fc=document.createElement('div');fc.className='fog-cell';
      fc.style.cssText=`left:${pad+x*(cw+gap)}px;top:${pad+y*(ch+gap)}px;width:${cw}px;height:${ch}px;`;
      board.appendChild(fc);
    });
    // Semi-fog for edge of revealed
    revealedCells.forEach(k=>{
      const [x,y]=k.split(',').map(Number);
      const neighbors=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,1],[-1,1],[1,-1]];
      neighbors.forEach(([dx,dy])=>{
        const nk=(x+dx)+','+(y+dy);
        if(fogCells.has(nk)){
          const fc=document.createElement('div');fc.className='fog-cell semi';
          fc.style.cssText=`left:${pad+(x+dx)*(cw+gap)}px;top:${pad+(y+dy)*(ch+gap)}px;width:${cw}px;height:${ch}px;`;
          board.appendChild(fc);
        }
      });
    });
  }

  // ══════════════════════════════════════════════════
  // WEATHER
  // ══════════════════════════════════════════════════
  function pickWeather(){
    clearInterval(weatherTimer);
    const roll=Math.random();
    currentWeather=roll<0.45?WEATHERS[0]:WEATHERS[1+Math.floor(Math.random()*(WEATHERS.length-1))];
    if(currentWeather.desc)log(currentWeather.ico+' '+currentWeather.desc,'sys');
    buildWeatherLayer();
    weatherTimer=setInterval(()=>pickWeather(),45000);
  }
  function buildWeatherLayer(){
    let layer=$('weather-layer');
    if(!layer){layer=document.createElement('div');layer.id='weather-layer';const bf=document.getElementById('battlefield');if(bf)bf.style.position='relative',bf.appendChild(layer);}
    layer.innerHTML='';
    if(currentWeather.id==='clear')return;
    const badge=document.createElement('div');badge.className='weather-badge';badge.textContent=currentWeather.ico+' '+currentWeather.lbl;layer.appendChild(badge);
    if(currentWeather.id==='rain'||currentWeather.id==='storm'){
      for(let i=0;i<50;i++){
        const d=document.createElement('div');d.className='rain-drop';
        d.style.cssText=`left:${Math.random()*100}%;height:${12+Math.random()*18}px;animation-duration:${0.4+Math.random()*.7}s;animation-delay:${Math.random()*2}s;`;
        layer.appendChild(d);
      }
    }
  }

  // ══════════════════════════════════════════════════
  // SAVING THROWS
  // ══════════════════════════════════════════════════
  function triggerSaveThrow(id,cb){
    const st=SAVE_THROWS.find(s=>s.id===id)||SAVE_THROWS[0];
    pendSaveThrow=st;saveThrowCB=cb;
    $('st-dsc').textContent=st.emoji+' '+st.dsc;
    $('st-dc').textContent='DC '+st.dc+' — Necesitas '+st.dc+' o más';
    $('st-num').textContent='';$('st-num').className='st-num';
    $('st-vrd').textContent='';$('st-vrd').className='st-vrd';
    $('st-roll-btn').style.display='block';
    $('st-overlay').style.display='flex';
    Audio.bossPhase();
  }
  function doSaveRoll(){
    const st=pendSaveThrow;if(!st)return;
    const roll=Math.floor(Math.random()*20)+1;
    const ok=roll>=st.dc||roll===20;const nat20=roll===20,nat1=roll===1;
    $('st-roll-btn').style.display='none';
    $('st-num').textContent=roll;
    $('st-num').className='st-num '+(ok?'ok':'ko');
    const vrd=nat20?'🌟 CRÍTICO — '+st.ok:nat1?'💀 PIFIA — '+st.ko:(ok?'✅ ÉXITO — '+st.ok:'❌ FALLO — '+st.ko);
    $('st-vrd').textContent=vrd;$('st-vrd').className='st-vrd '+(ok?'ok':'ko');
    if(ok)sessionStats.savesOk++;else sessionStats.savesFail++;
    Audio.dice();
    const cur=ap();
    if(!ok&&cur){
      cur.statusEffects=cur.statusEffects||[];
      if(st.failEfx==='stunned'){cur.statusEffects.push({type:'stunned',turns:1});log('⚡ '+cur.char.name+' queda Aturdido 1 turno.','enm');}
      if(st.failEfx==='poisoned'){cur.statusEffects.push({type:'poisoned',turns:3});log('☠ '+cur.char.name+' queda Envenenado 3 turnos.','enm');}
      if(st.failEfx==='feared'){cur.statusEffects.push({type:'feared',turns:2});log('👻 '+cur.char.name+' queda Atemorizado 2 turnos.','enm');}
      renderSfxBar();
    }
    setTimeout(()=>{$('st-overlay').style.display='none';if(saveThrowCB){const f=saveThrowCB;saveThrowCB=null;f(ok);}},2400);
  }

  // STATUS EFFECTS
  function tickStatusEffects(player){
    if(!player.statusEffects||!player.statusEffects.length)return;
    player.statusEffects=player.statusEffects.filter(se=>{
      if(se.type==='poisoned'){player.hp=Math.max(0,player.hp-2);log('☠ '+player.char.name+' veneno: −2 PV','enm');}
      se.turns--;return se.turns>0;
    });
    updateHp();renderSfxBar();
  }
  function renderSfxBar(){
    const bar=$('sfx-bar');if(!bar)return;bar.innerHTML='';
    const cur=ap();if(!cur)return;
    (cur.statusEffects||[]).forEach(se=>{
      const el=document.createElement('div');el.className='sfx '+se.type;
      const ico={stunned:'⚡',poisoned:'☠',feared:'👻',burning:'🔥',frozen:'❄'}[se.type]||'•';
      el.textContent=ico+' '+se.type+(se.turns?' ('+se.turns+'t)':'');bar.appendChild(el);
    });
  }

  // ══════════════════════════════════════════════════
  // DECISION SYSTEM
  // ══════════════════════════════════════════════════
  function showDecision(){
    const dec=DECISIONS[Math.floor(Math.random()*DECISIONS.length)];
    $('dec-ico').textContent=dec.ico;$('dec-ttl').textContent=dec.ttl;$('dec-dsc').textContent=dec.dsc;
    const opts=$('dec-opts');opts.innerHTML='';
    dec.opts.forEach(o=>{
      const b=document.createElement('button');b.className='dec-btn '+o.cls;b.textContent=o.lbl;
      b.onclick=()=>applyDecision(o.efx);opts.appendChild(b);
    });
    $('dec-overlay').style.display='flex';Audio.scroll();
  }
  function applyDecision(efx){
    $('dec-overlay').style.display='none';
    if(efx==='buff_atk'){players.forEach(p=>p.char={...p.char,atk:p.char.atk+2});log('✅ Decisión: +2 ATK a todo el equipo.','spc');}
    else if(efx==='gamble'){
      if(Math.random()<0.7){players.forEach(p=>p.hp=Math.min(p.maxHp,p.hp+10));log('✅ La poción era real: +10 PV.','heal');}
      else{players.forEach(p=>p.hp=Math.max(1,p.hp-5));log('❌ Era una trampa: −5 PV.','enm');}
    }else if(efx==='reveal'){fogCells.clear();renderBoard();log('✅ Mapa interceptado: niebla eliminada.','spc');}
    renderAll();
  }

  // ══════════════════════════════════════════════════
  // COMBAT SPEECHES
  // ══════════════════════════════════════════════════
  function showSpeech(charId,type,pos,isMiss){
    const sp=SPEECHES[charId];if(!sp)return;
    const lines=isMiss?['¡Errado!','¡Fallé!']:sp[type]||sp.atk;
    const line=lines[Math.floor(Math.random()*lines.length)];
    const board=document.querySelector('.board');if(!board)return;
    const cell=board.querySelector(`.cell[data-x="${pos.x}"][data-y="${pos.y}"]`);if(!cell)return;
    const bub=document.createElement('div');bub.className='speech-bubble';bub.textContent=line;
    bub.style.cssText=`left:${pos.x*52+8}px;top:${Math.max(0,pos.y*52-34)}px;`;
    board.appendChild(bub);setTimeout(()=>bub.remove(),2300);
  }
  function showEnemySpeech(e){
    const lines=e.type==='boss'?ENEMY_SPK.boss:ENEMY_SPK.default;
    const line=lines[Math.floor(Math.random()*lines.length)];
    const board=document.querySelector('.board');if(!board)return;
    const cell=board.querySelector(`.cell[data-x="${e.x}"][data-y="${e.y}"]`);if(!cell)return;
    const bub=document.createElement('div');bub.className='speech-bubble';
    bub.style.color=e.type==='boss'?'#f0a0ff':'#ffb0b0';
    bub.textContent='"'+line+'"';
    bub.style.cssText+=`left:${e.x*52+8}px;top:${Math.max(0,e.y*52-34)}px;`;
    board.appendChild(bub);setTimeout(()=>bub.remove(),2300);
  }

  // ══════════════════════════════════════════════════
  // CRITICAL HIT VISUAL
  // ══════════════════════════════════════════════════
  function showCritFX(){
    const fl=document.createElement('div');fl.className='crit-flash';document.body.appendChild(fl);
    const lb=document.createElement('div');lb.className='crit-lbl';lb.textContent='★ GOLPE CRÍTICO ★';document.body.appendChild(lb);
    Audio.magic();
    setTimeout(()=>{fl.remove();lb.remove();},950);
  }


  // ══════════════════════════════════════════════════
  // TURN ROLL SYSTEM — dado obligatorio al inicio de turno
  // ══════════════════════════════════════════════════
  function showTurnRollOverlay(player){
    const ov=$('turn-roll-overlay');
    $('tr-emoji').textContent=player.char.emoji;
    $('tr-name').textContent=player.char.name+' — '+player.char.title;
    $('tr-result-num').textContent='';$('tr-result-num').className='tr-result-num';
    $('tr-result-label').textContent='';
    $('tr-actions').innerHTML='';
    $('tr-roll-btn').style.display='block';
    $('tr-confirm-btn').classList.add('h');
    // Show range info
    const rangeInfo=document.createElement('div');
    rangeInfo.style.cssText='font-size:10px;color:var(--muted);margin-bottom:12px;font-style:italic;';
    rangeInfo.textContent='Tipo de combate: '+(player.char.combatType||'Mixto')+' · Alcance: '+(player.char.range||1)+' casillas';
    $('tr-actions').appendChild(rangeInfo);
    ov.style.display='flex';
  }

  function doTurnRoll(){
    const player=ap();
    const roll=Math.floor(Math.random()*20)+1;
    turnRollVal=roll;turnRollDone=true;
    $('tr-roll-btn').style.display='none';
    Audio.dice();
    // Animate dice spinning
    const numEl=$('tr-result-num');
    let ticks=0;
    const iv=setInterval(()=>{
      numEl.textContent=Math.floor(Math.random()*20)+1;
      if(++ticks>=16){
        clearInterval(iv);
        numEl.textContent=roll;
        applyTurnRoll(roll,player);
      }
    },70);
  }

  function applyTurnRoll(roll, player){
    const numEl=$('tr-result-num');
    const lbl=$('tr-result-label');
    const acts=$('tr-actions');
    acts.innerHTML='';

    // Determine what the player can do based on roll
    let cls,labelText,canMove,canAttack,maxAdv,canCards;

    if(roll===20){
      cls='crit';labelText='🌟 ¡CRÍTICO NATURAL! Turno perfecto.';
      canMove=true;canAttack=true;maxAdv=3;canCards=true;
      // Bonus: extra damage on attack
      player._atkbuff=(player._atkbuff||0)+player.char.atk; // daño doble
    } else if(roll>=15){
      cls='high';labelText='⚡ ¡Gran resultado! Turno completo.';
      canMove=true;canAttack=true;maxAdv=2;canCards=true;
    } else if(roll>=8){
      cls='mid';labelText='✔ Resultado normal. Turno estándar.';
      canMove=true;canAttack=true;maxAdv=1;canCards=true;
    } else if(roll>=4){
      cls='low';labelText='⚠ Resultado bajo. Solo puedes mover O atacar, no ambas.';
      canMove=true;canAttack=true;maxAdv=0;canCards=true; // pero solo básicas
      // Flag: must choose move OR attack (not both)
      player._lowRoll=true;
    } else {
      // 1-3 (pifia con 1 siendo la peor)
      cls='pifia';
      if(roll===1){
        labelText='💀 ¡PIFIA TOTAL! No puedes atacar ni jugar cartas avanzadas.';
        canMove=true;canAttack=false;maxAdv=0;canCards=false;
      } else {
        labelText='💀 Pifia. No puedes atacar este turno.';
        canMove=true;canAttack=false;maxAdv=0;canCards=true; // solo básicas
      }
    }

    numEl.className='tr-result-num '+cls;
    numEl.textContent=roll;
    lbl.textContent=labelText;

    // Save to state
    turnCanMove=canMove;turnCanAttack=canAttack;turnMaxAdvCards=maxAdv;
    player._diceBonus= cls==='crit'?'critical':cls==='high'?'high':cls==='mid'?'normal':cls==='low'?'low':'pifia';

    // Show action summary
    const actionRows=[
      {icon:'🏃',text:`Mover hasta ${player.char.mov+(currentWeather.id==='rain'?-1:0)} casillas`,ok:canMove},
      {icon:'⚔',text:`Atacar (alcance: ${player.char.range||1} casilla${(player.char.range||1)>1?'s':''})`,ok:canAttack},
      {icon:'🃏',text:maxAdv>0?`Hasta ${maxAdv} carta${maxAdv>1?'s':''} avanzada${maxAdv>1?'s':''}${cls==='crit'?' + daño doble!':''}`:roll===1?'Sin cartas avanzadas ni básicas':'Solo cartas básicas ★',ok:maxAdv>0||(canCards&&maxAdv===0)},
    ];
    if(roll>=4&&roll<8){
      actionRows.push({icon:'⚠',text:'No puedes mover Y atacar en el mismo turno',ok:false});
    }
    if(roll===20){
      actionRows.push({icon:'🌟',text:'Daño de ataque DUPLICADO este turno',ok:true});
    }

    actionRows.forEach(ar=>{
      const row=document.createElement('div');
      row.className='tr-action-row '+(ar.ok?'ok':'no');
      row.innerHTML=`<span class="tr-action-icon">${ar.icon}</span><span>${ar.text}</span>`;
      acts.appendChild(row);
    });

    // Show confirm button
    $('tr-confirm-btn').classList.remove('h');
    if(roll===1)Audio.defeat();
    else if(roll===20)Audio.magic();
    else Audio.scroll();
  }

  function confirmTurnRoll(){
    $('turn-roll-overlay').style.display='none';
    const cur=ap();
    if(cur&&cur._lowRoll){
      log('⚠ D20='+turnRollVal+' — Elige: mover O atacar, no ambas.','sys');
    }
    phase='player-turn';
    $('btn-endturn').disabled=false;
    renderHand();renderBoard();
  }

  // ══════════════════════════════════════════════════
  // PATCH onCell: bloquear movimiento si ya atacó (low roll)
  // y bloquear ataque si ya se movió (low roll)
  // ══════════════════════════════════════════════════
  function canPlayerMove(){
    if(!turnCanMove)return false;
    const cur=ap();
    // Low roll: solo una acción. Si ya actuó (atacó), no puede moverse.
    if(cur&&cur._lowRoll&&acted)return false;
    return !moved;
  }
  function canPlayerAttack(en){
    if(!turnCanAttack)return false;
    if(acted)return false;
    const cur=ap();
    // Low roll: si ya se movió, no puede atacar
    if(cur&&cur._lowRoll&&moved)return false;
    // RANGO: verificar alcance real del personaje
    const dist=Math.max(Math.abs(en.x-cur.pos.x),Math.abs(en.y-cur.pos.y));
    const maxRange=cur.char.range||1;
    return dist<=maxRange;
  }
  function getAttackRangeForPlayer(){
    const cur=ap();return cur?cur.char.range||1:1;
  }

  document.addEventListener('DOMContentLoaded',init);
  return {go,goSelect,goMap,goHistory,clearHistory,closeEndAndMap,setPlayers,removePlayer,charSelectDice,rollDice,rollInit,endTurn,openCard,closeCard,playCard,buildWorldMap,skipCin,doSaveRoll,doTurnRoll,confirmTurnRoll};
})();
window.G = G;// Añade esta función para enviar datos a la nube
// ==========================================
// SISTEMA DE AUTENTICACIÓN (LOGIN/REGISTRO)
// ==========================================

// 1. FUNCIÓN PARA REGISTRAR UN NUEVO JUGADOR
async function registrarUsuario() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const mensajeTxt = document.getElementById('auth-mensaje');

  mensajeTxt.innerText = "Invocando registro...";
  mensajeTxt.style.color = "#aaa";

  // Llamada oficial a Supabase para crear usuario
  const { data, error } = await supabaseClient.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    mensajeTxt.innerText = "❌ Error: " + error.message;
    mensajeTxt.style.color = "#ff4a4a";
  } else {
    mensajeTxt.innerText = "¡Registro con éxito! Ya puedes iniciar sesión.";
    mensajeTxt.style.color = "#4aff4a";
    console.log("Usuario registrado:", data.user);
  }
}

// 2. FUNCIÓN PARA INICIAR SESIÓN
async function iniciarSesion() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const mensajeTxt = document.getElementById('auth-mensaje');

  mensajeTxt.innerText = "Conectando...";
  mensajeTxt.style.color = "#aaa";

  // Llamada oficial a Supabase para loguear
  const { data, error } = await supabaseClient.auth.signInWithPassword({
   email: email,
    password: password,
  });

  if (error) {
    mensajeTxt.innerText = "❌ Acceso denegado: " + error.message;
    mensajeTxt.style.color = "#ff4a4a";
  } else {
    mensajeTxt.innerText = "¡Bienvenido, Héroe!";
    mensajeTxt.style.color = "#4aff4a";
    console.log("Sesión iniciada con éxito. Datos del usuario:", data.user);
    
   
    
    document.getElementById('auth-container').style.display = 'none';
  }
}

// ==========================================
// SECCIÓN DE FIN DE ARCHIVO (CORREGIDO)
// ==========================================

async function cerrarSesion() {
  if (window.supabaseClient) {
    await supabaseClient.auth.signOut();
  } else if (window.supabase) {
    await supabase.auth.signOut();
  }
  document.getElementById('auth-container').style.display = 'block';
  if (document.getElementById('game-container')) {
    document.getElementById('game-container').style.display = 'none';
  }
}

async function registrarFinDePartida(nombre, daño, resultadoPartida) {
  if (!jugadorActualId) {
    console.error("No se pueden guardar datos: No hay ningún usuario logueado.");
    return;
  }
  console.log("Registrando partida para el jugador:", jugadorActualId);
}
