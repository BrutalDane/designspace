/* ================= ENTRY TYPES =================
   One taxonomy. Each type defines its layout (info + groups), its allowed parents (the hierarchy),
   and how the co-GM works on it (lenses + quality checks). The checklist in Worldbuilding is the
   type's own section list, so there is nothing separate to maintain. */
const G=(name,fields,gm)=>[name,fields,!!gm];
const TYPES = {
 campaign:{label:'Campaign State',group:'Campaign',fam:'dash',groups:[]},
 arc:{label:'Arc',group:'Threads',fam:'doc',parents:[],kids:'Threads',info:['Phase','Theme'],groups:[
  G('The arc',[['conflict','Core conflict'],['theme','Theme and questions'],['acts','Acts']]),
  G('Stakes',[['unresolved','If unresolved'],['badly','If resolved badly']],1)],
  co:{blurb:'The shape of a campaign act: conflict, theme and stakes.',lenses:['Arc alignment','Lore continuity'],tests:['Player choices must matter']}},
 thread:{label:'Thread / Front',group:'Threads',fam:'front',parents:['arc'],kids:'Clues',info:['Status','Pressure','Driven by'],groups:[
  G('The front',[['impulse','Impulse: why it moves'],['portents','Portents'],['doom','If ignored']]),
  G('At the table',[['signs','Visible signs'],['next','Next beat'],['use','GM use']],1)],
  co:{blurb:'A pressure that moves on its own clock, with portents and a doom.',lenses:['Faction operator','Living world'],tests:['The world does not wait: it has a clock','Legible stakes: every tick has a visible sign']}},
 clue:{label:'Clue / Revelation',group:'Threads',fam:'clue',parents:['thread'],groups:[
  G('The revelation',[['truth','The truth it reveals'],['points','What it points toward']])],
  co:{blurb:'A truth and at least three independent routes to it.',lenses:['Revelation design','Session architecture'],tests:['No chokepoints: three independent routes']}},

 world:{label:'World / Plane',group:'Places',fam:'place',parents:[],kids:'Regions',info:['Type','Parent'],groups:[
  G('Overview',[['description','Description'],['cosmology','Cosmology'],['history','History']]),
  G('Places',[['CHILDREN','Regions']]),
  G('At the table',[['campaign','In this campaign'],['secrets','Secrets']],1)],
  co:{blurb:'The world or plane the campaign lives in.',lenses:['Lore weaving','Lore continuity'],tests:['Label canon, extrapolation and homebrew']}},
 region:{label:'Region',group:'Places',fam:'place',parents:['world','region'],kids:'Places',info:['Type','Parent','Terrain','Climate','Authority','Population','Danger'],groups:[
  G('Overview',[['description','Description'],['history','History']]),
  G('The land',[['geography','Geography'],['climate','Climate and seasons'],['flora','Fauna and flora'],['phenomena','Local phenomena'],['resources','Natural resources']]),
  G('People and powers',[['peoples','Peoples and cultures'],['power','Who holds power'],['CHILDREN','Settlements and sites'],['PEOPLE','People here']]),
  G('Travel',[['routes','Roads and routes'],['hazards','Hazards']]),
  G('At the table',[['impression','First impression'],['now','What is happening now'],['pressures','Creature pressures'],['rumours','Rumours'],['hooks','Hooks'],['secrets','Secrets'],['ignored','If the party does nothing']],1)],
  co:{blurb:'Land, powers, pressures and routes for a whole area.',lenses:['Location design','Lore continuity','Faction operator'],tests:['What happens here if the party does nothing?','Every pressure has a visible sign']}},
 settlement:{label:'Settlement',group:'Places',fam:'place',parents:['region'],kids:'Districts and places',info:['Type','Parent','Population','Governance','Economy','Defence'],groups:[
  G('Overview',[['description','Description'],['history','History']]),
  G('Society',[['demographics','Demographics'],['government','Government'],['culture','Culture and customs'],['religion','Religion'],['factions','Factions and guilds']]),
  G('Economy',[['industry','Industry and trade'],['infrastructure','Infrastructure']]),
  G('Places',[['districts','Districts'],['CHILDREN','Districts and points of interest'],['architecture','Architecture'],['surroundings','Surroundings']]),
  G('Defence',[['defences','Defences']]),
  G('At the table',[['impression','First impression'],['now','Current situation'],['PEOPLE','Notable people here'],['rumours','Rumours'],['hooks','Hooks'],['secrets','Secrets'],['ignored','If the party does nothing']],1)],
  co:{blurb:'Purpose, governance, economy, defence, people and an ongoing problem.',lenses:['Location design','NPC & faction'],tests:['Carry prior business: it has a life without the party']}},
 district:{label:'District',group:'Places',fam:'place',parents:['settlement'],kids:'Places',info:['Type','Parent','Population','Watch'],groups:[
  G('Overview',[['description','Description'],['character','Character'],['history','History']]),
  G('Life here',[['residents','Who lives here'],['factions','Factions and networks'],['CHILDREN','Points of interest']]),
  G('At the table',[['impression','First impression'],['now','Current pressure'],['PEOPLE','Notable people here'],['rumours','Rumours'],['hooks','Hooks'],['secrets','Secrets']],1)],
  co:{blurb:'A quarter of a city with its own character, people and pressure.',lenses:['Location design','NPC & faction'],tests:['Has a current pressure the party can notice']}},
 building:{label:'Building / Landmark',group:'Places',fam:'place',parents:['district','settlement','region'],kids:'Parts',info:['Type','Parent','Owner','Built'],groups:[
  G('Overview',[['description','Description'],['purpose','Purpose'],['history','History']]),
  G('Design',[['architecture','Design and architecture'],['layout','Layout and rooms'],['entries','Entries and exits'],['sensory','Sensory details']]),
  G('At the table',[['impression','First impression'],['PEOPLE','Who is here'],['rumours','Rumours'],['hooks','Hooks'],['secrets','Secrets'],['ignored','If the party does nothing']],1)],
  co:{blurb:'A single building or landmark, ready for the table.',lenses:['Location design','Scene writing'],tests:['Sensory detail you can read aloud']}},
 site:{label:'Site',group:'Places',fam:'place',parents:['region','settlement','district'],kids:'Places',info:['Type','Parent','Controlled by'],groups:[
  G('Overview',[['description','Description'],['history','History']]),
  G('The place',[['layout','Layout'],['sensory','Sensory details'],['inhabitants','Inhabitants']]),
  G('At the table',[['impression','First impression'],['do','What players can do'],['nav','Getting there'],['PEOPLE','Who is here'],['hooks','Hooks'],['secrets','Secrets'],['ignored','If the party does nothing']],1)],
  co:{blurb:'An outdoor or improvised place: a camp, a crossing, a grove.',lenses:['Location design','Scene writing'],tests:['What happens here if the party does nothing?']}},
 dungeon:{label:'Dungeon',group:'Places',fam:'place',parents:['region','settlement','district'],kids:'Levels',info:['Type','Parent','Controlled by','Threat','Level range'],groups:[
  G('Overview',[['premise','Premise'],['history','History']]),
  G('Structure',[['approach','Approach'],['logic','Spatial logic'],['CHILDREN','Levels'],['sensory','Sensory details']]),
  G('Occupants',[['inhabitants','Inhabitants'],['factions','Factions inside'],['PEOPLE','Named people here']]),
  G('At the table',[['impression','First impression'],['discoveries','Discoveries'],['hazards','Hazards and tension'],['treasure','Treasure'],['ignored','If the party does nothing']],1)],
  co:{blurb:'A living space with logic, inhabitants, discoveries and consequences.',lenses:['Living dungeon','Encounter design','Rules'],tests:['What happens here if the party does nothing?','No chokepoints: key discoveries have three routes']}},
 level:{label:'Dungeon level',group:'Places',fam:'place',parents:['dungeon','level'],kids:'Sub-levels',info:['Type','Parent','Depth'],groups:[
  G('The level',[['description','Description'],['AREAS','Keyed areas'],['sensory','Sensory details']]),
  G('At the table',[['inhabitants','Who is here'],['hazards','Hazards'],['secrets','Secrets']],1)],
  co:{blurb:'One floor or section of a dungeon, with keyed areas.',lenses:['Living dungeon','Encounter design'],tests:['Every area has something to do or learn']}},

 faction:{label:'Faction',group:'Factions',fam:'faction',parents:['faction','deity'],kids:'Branches',info:['Type','Parent','Leader','Headquarters','Scope','Allies','Rivals','Disposition to party'],groups:[
  G('Overview',[['history','History']]),
  G('Organisation',[['structure','Structure'],['leaders','Leadership'],['MEMBERS','Members'],['resources','Assets and resources'],['territories','Territories']]),
  G('Culture',[['culture','Culture and customs'],['methods','Methods']]),
  G('Relations',[['relations','Relationships']]),
  G('At the table',[['goals','Goals'],['move','Current move'],['hooks','Hooks']],1)],
  co:{blurb:'Goals turned into moves, offers, threats and a clock.',lenses:['Faction operator','NPC & faction'],tests:['The world does not wait: it has a move this arc']}},
 deity:{label:'Deity / Religion',group:'Beliefs',fam:'doc',parents:['deity'],kids:'Deities and orders',info:['Domains','Symbol','Alignment','Holy day','Worshipped by'],groups:[
  G('Faith',[['dogma','Tenets and dogma'],['worship','Worship and rites'],['priesthood','Priesthood'],['holy','Holy sites']]),
  G('Lore',[['myths','Myths'],['history','History']]),
  G('At the table',[['campaign','In this campaign'],['signs','Omens and signs']],1)],
  co:{blurb:'Domains, dogma, worshippers and what faith looks like at the table.',lenses:['Lore weaving','Lore continuity'],tests:['Label canon, extrapolation and homebrew']}},
 culture:{label:'Culture',group:'Beliefs',fam:'doc',parents:['culture'],kids:'Subcultures',info:['Found in','Language','Population','Related faction'],groups:[
  G('Identity',[['values','Values and ideals'],['names','Naming traditions'],['language','Language']]),
  G('Daily life',[['customs','Customs and etiquette'],['dress','Dress'],['food','Food and drink'],['art','Art and architecture']]),
  G('Life and death',[['coming','Coming of age'],['funerary','Funerary customs']]),
  G('Place in the world',[['history','History'],['outsiders','How outsiders see them']]),
  G('At the table',[['campaign','In this campaign']],1)],
  co:{blurb:'Values, customs, names and how others see them.',lenses:['Lore weaving'],tests:['Shows up in play, not only in lore']}},
 lore:{label:'Lore',group:'World',fam:'doc',parents:['lore'],kids:'Events',info:['Kind','When','Where','Involved'],groups:[
  G('The event',[['happened','What happened'],['causes','Causes']]),
  G('Memory',[['believe','What people believe'],['now','Consequences now']]),
  G('The truth',[['truth','The truth'],['leads','Where it leads']],1),
  G('At the table',[['signs','Signs at the table']],1)],
  co:{blurb:'Events, eras and world truths, with belief and truth kept apart.',lenses:['Lore weaving','Lore continuity'],tests:['Belief differs from truth somewhere useful']}},

 npc:{label:'NPC',group:'People',fam:'person',info:['Role','Ancestry','Age','Location','Faction','Status'],triad:[['want','Wants'],['fear','Fears'],['secret','Secret']],groups:[
  G('Description',[['appearance','Appearance'],['personality','Personality']]),
  G('Story',[['who','Who they are'],['history','History']]),
  G('Relationships',[['bonds','Relationships'],['CARRIES','Carries']]),
  G('At the table',[['knows','What they know'],['will','What they will do'],['wont','What they won\'t do'],['hooks','Hooks'],['stats','Stat basis']],1)],
  co:{blurb:'People with wants, fears, voice and business of their own.',lenses:['NPC & faction','Lore continuity','Rules'],tests:['Carry prior business','Voice usable in one line']}},
 pc:{label:'Player character',group:'Party',fam:'person',info:['Player','Class and level','Ancestry','Background','Status'],triad:[['drive','Drive'],['burden','Burden'],['secret','Secret (GM)']],groups:[
  G('Description',[['appearance','Appearance'],['personality','Personality']]),
  G('Story',[['background','Background'],['arc','Arc and open beats']]),
  G('Relationships',[['bonds','Bonds'],['CARRIES','Carries']]),
  G('At the table',[['hooks','Hooks for the GM']],1)]},
 party:{label:'Party',group:'Party',fam:'party',info:['Location','Goal','Reputation'],groups:[
  G('The group',[['bonds','Bonds'],['tensions','Tensions'],['resources','Shared resources'],['secrets','Shared secrets']])]},
 creature:{label:'Creature',group:'Bestiary',fam:'doc',parents:['creature'],kids:'Kinds',info:['Type','CR','Habitat','Stat basis','Rarity'],groups:[
  G('Description',[['appearance','Appearance']]),
  G('Ecology',[['why','Why it is here'],['ecology','Ecology and diet'],['behaviour','Behaviour'],['society','Society']]),
  G('At the table',[['situation','The situation it creates'],['run','How to run it']],1)],
  co:{blurb:'Why it is here, what situation it creates, and how to run it.',lenses:['Lore weaving','Encounter design','Rules'],tests:['Checked against the ruleset\'s monster list']}},
 item:{label:'Magic item',group:'Items',fam:'item',info:['Rarity','Kind','Attunement','Holder'],groups:[
  G('Lore',[['story','Why it matters'],['look','Description'],['history','History']]),
  G('Mechanics',[['effects','Effects'],['rules','Rules basis']]),
  G('At the table',[['found','How it is found or opened'],['pressure','Pressure it creates']],1)],
  co:{blurb:'Story, mechanics and balance checked against the campaign ruleset.',lenses:['Magic item design','Rules','Lore continuity'],tests:['Balanced against the campaign ruleset','The item creates pressure, not only power']}},
 rule:{label:'Rule reference',group:'Rules',fam:'rule',parents:['rule'],kids:'House rulings',info:['Source','Category'],groups:[G('Rule',[['summary','Summary'],['table','At the table']])]},
 ruling:{label:'House ruling',group:'Rules',fam:'doc',parents:['rule'],info:['Parent','Decided','Label'],groups:[G('Ruling',[['ruling','The ruling'],['why','Why']])]},
};
const AUTO=['AREAS','CHILDREN','PEOPLE','MEMBERS','CARRIES'];
Object.values(TYPES).forEach(T=>{T.f=T.groups.flatMap(g=>g[1]);T.glance=T.info||[];if(T.parents&&T.parents.length&&!T.glance.includes('Parent'))T.glance.splice(1,0,'Parent');});
const GROUP_ORDER=['Campaign','Threads','Places','Factions','People','Party','Beliefs','World','Bestiary','Items','Rules'];

/* Worldbuilding studios are derived from the types: one per type that has a co-GM definition, plus a free thread.
   The checklist is the type's own section list. */
const STUDIOS={};
Object.entries(TYPES).forEach(([k,T])=>{if(!T.co)return;const check=[...(T.triad||[]),...T.f.filter(([key])=>!AUTO.includes(key))].map(x=>x[1]);
 STUDIOS[k]={name:T.label,type:k,blurb:T.co.blurb,lenses:T.co.lenses,tests:T.co.tests,check,keys:[...(T.triad||[]),...T.f.filter(([key])=>!AUTO.includes(key))].map(x=>x[0])};});
STUDIOS.free={name:'Free thread',type:null,blurb:'Think out loud without a structure.',lenses:['Supervisor'],check:[],keys:[],tests:[]};
