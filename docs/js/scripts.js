const screen = document.getElementById("screen");

//default function to clear all elements from a dom
function domclear(div){
	let l = div.childNodes;
	while(l.length > 0){
		l[0].remove();
	}
}

//default function to return random from listStyleType
function getRandom(list){
	let i = list.length;
	i = Math.round(Math.random()*(i-1));
	return list[i];
}


class menu{
	constructor(parent, id, className = 'menu', onclick = false, build = true){
		this.dom = document.createElement('div');
		this.dom.id = id;
		this.dom.className = className;
		
		this.onclick = onclick;
		
		this.parent = parent;
		
		if(build){this.build()};
	}
	
	build(){
		if(this.onclick){this.dom.onclick = this.onclick};
		
		this.parent.appendChild(this.dom);
	}
}

//user class manages player moving through tower, and holds the hero and bag 
class User{
	constructor(){
		this.hero = new Hero();
		this.bag = new Bag();
		
		this.activeTower;
		this.activeFloor;
		this.floorTrack =1;
		this.chest = false;
	}
	
	//main menu loads tower start buttons, bag menu, stats menu
	mainmenu(){
		domclear(screen);
		
		let main = new menu(screen, 'towerMenu', '', false);
		let baseLvl = this.hero.lvl+5;
		while(baseLvl > 0 && baseLvl > this.hero.lvl-5){
			let tower = new menu(main.dom, baseLvl+' '+getRandom(Object.keys(enemies)), 'tower', function(){u.startTower(this.id)}, false);
			tower.dom.innerHTML += baseLvl;
			tower.build();
			
			baseLvl--;
		}
		
		new menu(screen, 'openBagM', '', function(){u.bag.open()});
		new menu(screen, 'openStatsM', '', function(){u.hero.statMenu()}); 
	}
	
	
	//start tower creates a new tower and assigns the user an active tower and floor then builds battle menu and starts floor
	startTower(idTag){
		domclear(screen);
		this.activeTower = new Tower(idTag);
		this.activeFloor = this.activeTower.floors[1];
		console.log(this.activeTower);
		
		
		this.battleMenu();
		this.continueFloor();
	}
	
	//checks if tower is complete and if not sets the active floor to the enxt floor of the active tower
	newFloor(){
		domclear(screen);
		this.floorTrack++;
		if(this.floorTrack > 10){this.endTower()}
		else{
			this.activeFloor = this.activeTower.floors[this.floorTrack]; 
			this.battleMenu();
			
			this.continueFloor();
		};
		
	}
	//spwans enemies in or ends floor
	continueFloor(){
		try{
			this.activeFloor[0].spawn();
		}catch{
			this.floorMenu();
		}
	}
	
	//spawns hero in and creates buttons for attack options
	battleMenu(){
		this.hero.spawn();
		let main = new menu(screen, 'battleMenu');
		
		this.chest = true;
		new menu(main.dom, 'fast', 'attackOption', function(){u.hero.changeStance(this.id)});
		new menu(main.dom, 'agressive', 'attackOption', function(){u.hero.changeStance(this.id)});
		new menu(main.dom, 'defensive', 'attackOption', function(){u.hero.changeStance(this.id)});
	}
	
	//creates menus for bag, stats and leaving tower options as well as continuing tower at next floor
	floorMenu(){
		domclear(screen);
		let main = new menu(screen, 'floorMenu');
		if(this.chest){new menu(screen, 'chest', '', function(){u.openChest()})};
		
		new menu(main.dom, 'openBag', '', function(){u.bag.open()});
		new menu(main.dom, 'openStats', '', function(){u.hero.statMenu()});
		new menu(main.dom, 'leaveTower', '', function(){u.endTower()});
		new menu(screen, 'nextFloor', '', function(){u.newFloor()});
	}
	
	//finishes tower, resets tower movement variables
	endTower(){
		domclear(screen);
		this.activeTower = false;
		this.activeFloor = false;
		this.floorTrack = 1;
		alert('tower clear');
		
		this.mainmenu();
	}
	
	
	kill(enemy){
		this.activeFloor.shift();
		if(this.hero.luck+enemy.luck > Math.random()*100){u.bag.add(new enemy.loot())}
		setTimeout(function(){u.continueFloor()}, 1200);
	}
	
	openChest(){
		this.chest = false;
		this.bag.add(new Helm(2), true);
		document.getElementById('chest').remove();
	}
	
	
	
}


//tower class creates a tower of a givven level from givven enemy type, based on tower menu ID
class Tower{
	constructor(idTag){
		this.floors = {};
		
		let start = idTag.split(' ');
		
		this.enemyPool = enemies[start[1]]; 
		this.lvl = parseInt(start[0]);
		
		this.makeFloors();
	}
	
	
	// make floors creates 10 floors with up to 6 enemies on each floor
	makeFloors(){	
		
		this.floors[1] = [];
		while(this.floors[1].length < 3){
			this.floors[1].push(new this.enemyPool[0](Math.floor(this.lvl/2)+1));
		}
		
		let i = 2;
		while(i < 10){
			this.floors[i] = [];
			let n = 0;
			while(n < Math.round(Math.random()*3)+3){
				this.floors[i].push(this.selectEnemy(i, n));
				n++
			}
			i++
		}
	}
	
	//select enemy returns a random enenmy from the enemy pool based on floor lvl, and spot on floor
	selectEnemy(floor, spot){
		let pool = 3;
		if(floor > 3){pool+=2};
		if(spot > 2){pool+=1};
		
		let enemy = this.enemyPool[Math.floor(Math.random()*pool)];
		if(spot == 4){floor++};
		return new enemy(Math.floor(this.lvl/2)+floor);
		
	}
	
	
	
}

//default parent class of hero and enemy, contains attack and damage functions
class Character{
	constructor(){
		
	}
	//attacks a target, then checks if target is still alive and if so attacks the target again
	attack(target){
		let speed = this.atkSpd;
		if(speed < 1000){speed = 1000};
		
		
		let unit = this;
		this.fight = setTimeout(function(){
			if(unit.hp > 0 && target.hp > 0){unit.attackanim(); target.damage(unit)};
			if(target.hp > 0){unit.attack(target)};
		}, speed);
	}
	
	damage(enemy){
		let total = enemy.atk;
		total-= this.def;
		if(this.stance == 'defensive'){total-=this.def};
		if(total < 0){total = 0};
		//total+=enemy.tec;
		this.hp-=total;
		this.healthbar.update(this.hp);
		if(this.hp <= 0){this.destroy()}
	}
	
	setStats(){
		this.atk = Math.ceil((this.gatk)+(this.str)+(this.dex/2));
		this.def = Math.ceil((this.gdef)+(this.tof));
		this.maxhp = Math.ceil((this.tof/2)+(this.stm/2)+(this.str/2)+(this.lvl*2));
		
	}
	
	
	
}
//healthbar class used for all characters, created on spawn 
class HealthBar{
	constructor(maxhp, hp, o){
		this.maxHp = maxhp;
		this.hp = hp;
		this.par = o;
		this.t = o.className;
		
		this.create();
	}
	
	//creates parent red bar and child green bar then appends both to spawned unit
	create(){
		this.bar = document.createElement('div');
		this.bar.id = this.t+'healthbar';
		this.par.appendChild(this.bar);
		
		this.track = document.createElement('div');
		this.track.className = 'hptrack';
		this.track.style.width = "100%";
		this.bar.appendChild(this.track);
		this.update(this.hp);
	}
	
	//divides maxHp of healthbar by given hp and updates green bar width and innerHTML accordingly
	update(hp){
		this.hp = hp;
		if(this.hp < 0){this.hp = 0};
		
		this.track.style.width = ((this.hp/this.maxHp)*100).toString()+'%';
		this.track.innerHTML = this.hp+'/'+this.maxHp;
	}
	
	remove(){
		document.getElementById(this.o+'healthbar').remove();
	}
	
}

//default playable character monitors and controlls all stat changes to player
class Hero extends Character{
	constructor(){
		super();
		
		this.str = 5;
		this.dex = 5;
		this.tof = 3;
		this.agl = 5;
		this.stm = 10;
		this.tec = 1;
		this.luck = 7;
		
		this.gatk = 0;
		this.gdef = 0;
		
		this.lvl = 1;
		this.exp = 0;
		this.statPoints = 5;

		this.atkSpd = 4000;
		
		this.setStats();
		this.hp=this.maxhp;
	
		this.stance = 'normal';
		
		this.gear = {};
		this.gear['Helm'] = undefined;
		this.gear['Armor'] = undefined;
		this.gear['Legs'] = undefined;
		this.gear['Onhand'] = undefined;
		this.gear['Offhand'] = undefined;
		
		this.rings = {};
		this.rings[0] = undefined;
		this.rings[1] = undefined;
		this.rings[2] = undefined;
		this.rings[3] = undefined;
		this.rings[4] = undefined;
		this.rings[5] = undefined;
	}
	
	spawn(){
		this.dom = new menu(screen, 'hero', 'hero');
		this.dom = this.dom.dom;
		this.healthbar = new HealthBar(this.maxhp, this.hp, this.dom);
	}
	
	attackanim(){
		let unit = this;
		
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},150);
		setTimeout(function(){unit.dom.style.top = '100px'; unit.dom.style.left = '200px'; unit.dom.style.scale = '80%'},300);
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},450);
		setTimeout(function(){unit.dom.style.top = '240px'; unit.dom.style.left = '40px'; unit.dom.style.scale = '100%'},600);
	
	}
	
	//sets stance to the selected option and changes atkSpd and damage values depending on current stance
	changeStance(stance){
		if(this.stance != 'normal'){document.getElementById(this.stance).className = 'attackOption'};
		if(this.stance == stance){this.stance = 'normal'}else{this.stance = stance};
	
		switch(this.stance){
			 
			case 'fast': this.atkSpd = 3000-(this.agl*50); this.atk = Math.ceil(this.gatk+this.lvl);break;
			case 'agressive': this.atkSpd = 5000-(this.agl*30);this.atk = Math.ceil((this.gatk*2)+(this.str)+(this.dex));break;
			case 'defensive': this.atkSpd = 4000-(this.agl*10);this.atk = Math.ceil((this.str)+(this.dex/2));break;
			case 'normal': this.atkSpd = 4000-(this.agl*20);this.atk = Math.ceil((this.gatk)+(this.str)+(this.dex/2));break;

		}
		
		clearInterval(this.fight);
		this.attack(u.activeFloor[0]);
		document.getElementById(this.stance).classList.add('selectedAttack');
	}
	
	
	//opens stat menu, used to reset menu on stat updates
	statMenu(){
		domclear(screen);
		this.setStats();
		let stats = Object.keys(this);
		let statVal = Object.values(this);
		
		for(let i = 0; i < 7; i++){
			let baseStat = new menu(screen, stats[i], 'stat', function(){u.hero.usePoint(this.id)}, false);
			baseStat.dom.innerHTML = stats[i]+'<br>'+statVal[i];
			baseStat.build();
		}

		for(let i = 7; i < 18; i++){
			let comStat = new menu(screen, stats[i], 'stat', false, false);
			comStat.dom.innerHTML = stats[i] + '<br>' + statVal[i];
			comStat.build();
		}
		document.getElementById('maxhp').remove();
		document.getElementById('hp').innerHTML = this.hp+'/'+this.maxhp+'<br> health';
		
		new menu(screen, 'back', 'back', function(){if(u.activeTower){u.floorMenu()}else{u.mainmenu()}});
	}
	
	
	
	usePoint(stat){
	if(this.statPoints >0){
		this.statPoints--;
		this.statUp(stat, 1);
		this.statMenu();
	}}
	
	statUp(stat, amt){
		switch(stat){
			case 'str' : this.str += amt; break;
			case 'dex' : this.dex += amt; break;
			case 'tof' : this.tof += amt; break;
			case 'agl' : this.agl += amt; break;
			case 'stm' : this.stm += amt; break;
			case 'tec' : this.tec += amt; break;
			case 'gatk' : this.gatk += amt; break;
			case 'gdef' : this.gdef += amt; break;
		}
	}
	
	statDown(stat, amt){
		switch(stat){
			case 'str' : this.str -= amt; break;
			case 'dex' : this.dex -= amt; break;
			case 'tof' : this.tof -= amt; break;
			case 'agl' : this.agl -= amt; break;
			case 'stm' : this.stm -= amt; break;
			case 'tec' : this.tec -= amt; break;
			case 'gatk' : this.gatk -= amt; break;
			case 'gdef' : this.gdef -= amt; break;
		}
	}
	
	gainExp(amt){
		this.exp+=amt;
		if(this.exp > this.lvl*15){
			this.lvl++; 
			this.exp = 0; 
			this.statPoints+=5; 
			this.statUp('str', 1); 
			this.statUp('stm', 1); 
		}
	}
	
}

//base class of all enemies, each enemy extends this class by giving custom stats and drops
class Enemy extends Character{
	constructor(lvl){
		super()
		
		this.lvl = lvl;
		this.luck = 40;
		this.gatk = 0;
		this.gdef = 0;
		this.tec = 0;
		
		
	}
	spawn(){
		this.dom = new menu(screen, 'enemy', 'enemy');
		this.dom = this.dom.dom;
		this.dom.style.backgroundImage = this.img;
		this.healthbar = new HealthBar(this.maxhp, this.hp, enemy);
		
		u.hero.attack(this);
		this.attack(u.hero);
		console.log(this);
	}
	
	attackanim(){
		let unit = this;
		
		setTimeout(function(){unit.dom.style.top = '80px'; unit.dom.style.left = '150px'; unit.dom.style.scale = '110%'},150);
		setTimeout(function(){unit.dom.style.top = '100px'; unit.dom.style.left = '90px'; unit.dom.style.scale = '130%'},300);
		setTimeout(function(){unit.dom.style.top = '80px'; unit.dom.style.left = '150px'; unit.dom.style.scale = '110%'},450);
		setTimeout(function(){unit.dom.style.top = '40px'; unit.dom.style.left = '220px'; unit.dom.style.scale = '100%'},600);
	}
	
	destroy(){
		let unit = this;
		clearInterval(this.fight);
		u.kill(this);
		setTimeout(function(){unit.dom.style.backgroundImage = "url('css/assets/dead.png')"}, 500);
		setTimeout(function(){unit.dom.remove()}, 1000);
	}
	
}

class Pygmybat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/pygmyBat.png')";
		
		this.str = 1*Math.ceil(lvl/2);
		this.dex = 2*lvl;
		this.tof = 1*Math.ceil(lvl/2);
		this.agl = 3*(lvl*2);
		this.stm = 2*lvl;
		this.tec = Math.ceil(lvl/3);
		
		this.atkSpd = 4000-(this.agl*40);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Batfang;
	}
	
}

class Greybat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/greyBat.png')";
		
		this.str = 2*lvl;
		this.dex = 2*lvl;
		this.tof = 2*lvl;
		this.agl = 2*lvl;
		this.stm = 2*lvl;
		this.loot = Batfang;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 5000-(this.agl*30);
	}
	
}



class Blackbat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/blackBat.png')";
		
		
		this.str = 3*lvl;
		this.dex = 1*lvl;
		this.tof = 3*lvl;
		this.agl = 2*lvl;
		this.stm = 2*lvl;
		this.loot = Batfang;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 5000-(this.agl*20);
	}
	
}

class Brownbat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/brownBat.png')";
	
		this.str = lvl;
		this.dex = 3*lvl;
		this.tof = 4*lvl;
		this.agl = lvl;
		this.stm = 3*lvl;
		this.loot = Batfang;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 5000-(this.agl*30);
	}
	
}

class Largebat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('css/assets/largeBat.png')";
		
		this.str = 3*lvl;
		this.dex = 2*lvl;
		this.tof = 4*lvl;
		this.agl = 2*lvl;
		this.stm = 5*lvl;
		this.loot = Batfang;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 5000-(this.agl*30);
	}
	
}

class Sonicbat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.img = "url('css/assets/sonicBat.png')";
		
		this.str = 2*lvl;
		this.dex = 5*lvl;
		this.tof = 3*lvl;
		this.agl = 3*lvl;
		this.stm = 3*lvl;
		this.loot = Batfang;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 5000-(this.agl*50);
	}
	
}

class Vampirebat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('css/assets/vampireBat.png')";
		
		
		this.str = 5*lvl;
		this.dex = 4*lvl;
		this.tof = 3*lvl;
		this.agl = 5*lvl;
		this.stm = 4*lvl;
		this.loot = Batfang;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 4000-(this.agl*30);
	}
	
}

//enemy dictionary used in tower class
let enemies = new Object();
enemies['bat'] = [Pygmybat,Greybat,Brownbat,Blackbat,Largebat,Sonicbat,Vampirebat];


//attached to user, controlls all loot picked up, facilitates dom interactions of all loot,
class Bag{
	constructor(){
		this.gear = {};
		this.drops = {};
		this.inspecting = false;
	}
	add(item, gear = false){
		if(gear){this.gear[item.id] = item}
		else{this.drops[item.id] = item}
	}
	
	//opens full bag
	open(){
		domclear(screen);
		new menu(screen, 'charMenu');
		new menu(screen, 'ringSlots');
		
		new menu(screen, 'bag');
		this.populateGear();
		
		for(let slot of Object.keys(u.hero.gear)){
			let div = new menu(document.getElementById('charMenu'), slot, 'equiptSlot');
			if(u.hero.gear[slot]){
				div.dom.appendChild(document.getElementById(u.hero.gear[slot].id))
				document.getElementById(u.hero.gear[slot].id).oncontextmenu = function(){event.preventDefault(); u.bag.gear[this.id].unequipt()};
			};
		}
		
		for(let slot of Object.keys(u.hero.rings)){
			let div = new menu(document.getElementById('ringSlots'), 'Ring'+slot, 'ringslot');
			console.log(u.hero.rings[slot]);
			if(u.hero.rings[slot]){
				div.dom.appendChild(document.getElementById(u.hero.rings[slot].id))
				document.getElementById(u.hero.rings[slot].id).oncontextmenu = function(){event.preventDefault(); u.bag.gear[this.id].unequipt(slot)};	
			};
		}
		
		
		new menu(screen, 'swap', 'swap', function(){u.bag.forge()});
		new menu(screen, 'back', 'back', function(){if(u.activeTower){u.floorMenu()}else{u.mainmenu()}});
	}
	
	forge(){
		domclear(screen);
		
		let main = new menu(screen, 'inspectMenu');
		new menu(main.dom, 'inspectGear');
		new menu(main.dom, 'gearStats');
		new menu(main.dom, 'attachmentMenu');
		
		new menu(screen, 'bag');
		
	
		new menu(screen, 'swap', 'swap', function(){u.bag.open()});
		new menu(screen, 'drops', 'drops', function(){u.bag.populateDrops()});
		new menu(screen, 'back', 'back', function(){if(u.activeTower){u.floorMenu()}else{u.mainmenu()}});
		this.populateGearInspect();
	}
	
	//generates gear for equipt menu
	populateGear(){
		domclear(document.getElementById('bag'));
		this.inspecting = false;
		for(let gear of Object.values(this.gear)){
			let item = new menu(document.getElementById('bag'), gear.id, 'gear', function(){gear.equipt()}, false);
			item.dom.style.backgroundImage = gear.img;
			item.dom.innerHTML = gear.lvl+':'+gear.rank;
			item.build();
		}
	}
	
	populateGearInspect(){
		domclear(document.getElementById('bag'));
		for(let gear of Object.values(this.gear)){
			if(this.inspecting && this.inspecting.id == gear.id){continue};
			let item = new menu(document.getElementById('bag'), gear.id, 'gear', function(){gear.inspect()}, false);
			item.dom.style.backgroundImage = gear.img;
			item.dom.innerHTML = gear.lvl+':'+gear.rank;
			item.build();
		}
		document.getElementById('drops').onclick = function(){u.bag.populateDrops()};
	}
	
	populateDrops(){
		domclear(document.getElementById('bag'));
		for(let drop of Object.values(this.drops)){
		if(drop.attached == undefined){
			let item = new menu(document.getElementById('bag'), drop.id, 'drop', function(){drop.attach()}, false);
			item.dom.style.backgroundImage = drop.img;
			item.dom.innerHTML = drop.stat+' : '+drop.bonus;
			item.build();
		}}
		document.getElementById('drops').onclick = function(){u.bag.populateGearInspect()};
	}
}

//base class for all weapons and armor added to bag, includes equipt and unequipt functions for gear tied to hero statUp and down functions
class Gear{
	constructor(lvl){
		this.lvl = lvl;
		this.rank = Math.ceil(Math.random()*5);
		this.id = Object.keys(u.bag.gear).length.toString();
		this.stats = {'str': 0, 'dex': 0, 'tof': 0, 'agl': 0, 'stm': 0, 'tec': 0};
		this.attachments = [];
		this.equipted = false;
	}
	
	equipt(){
		let slot = document.getElementById(this.type);
		
		
		if(slot.childNodes[0]){u.bag.gear[slot.childNodes[0].id].unequipt()};
		
		document.getElementById(this.id).oncontextmenu = function(){event.preventDefault(); u.bag.gear[this.id].unequipt()};
		slot.appendChild(document.getElementById(this.id));
		u.hero.statUp('gdef', this.gdef);
		u.hero.statUp('gatk', this.gatk);
		u.hero.gear[this.type] = this;
		
		
		for(let stat of Object.keys(this.stats)){if(this.stats[stat] > 0){u.hero.statUp(stat, this.stats[stat])}}
		this.equipted = true;
	}
	
	unequipt(){
		let div = document.getElementById(this.id);
		div.oncontextmenu = false;
		document.getElementById('bag').appendChild(div);
		u.hero.statDown('gdef', this.gdef);
		u.hero.statDown('gatk', this.gatk);
		u.hero.gear[this.type] = undefined;
		this.equipted = false;
	}
	
	inspect(){
		if(this.equipted){this.unequipt()};
		let div = document.getElementById('inspectGear');
		
		if(div.childNodes[0]){document.getElementById('bag').appendChild(div.childNodes[0]); domclear(document.getElementById('attachmentMenu'))};
		div.appendChild(document.getElementById(this.id));
		u.bag.inspecting = this;
		for(let i = 0; i<this.slots; i++){new menu(document.getElementById('attachmentMenu'), this.id+i, 'attatchmentSlot')};
		for(let attach of this.attachments){
			let attachment = new menu(document.getElementById(this.id+attach.attached), attach.id, 'drop', false, true);
			attachment.dom.innerHTML = attach.stat + ' : ' + attach.bonus;
			attachment.dom.oncontextmenu = function(){event.preventDefault(); u.bag.drops[this.id].detach()}
		};
		this.showStats();
	}
	
	showStats(){
		let stats = Object.keys(this);
		let num = Object.values(this);
		
		let gearStats = document.getElementById('gearStats');
		gearStats.innerHTML = '';
		for(let i = 0; i < stats.length-1; i++){
			if(stats[i] == 'stats' || stats[i] == 'attachments' || stats[i] == 'equipted'){continue};
			gearStats.innerHTML+= stats[i]+' : '+num[i]+'<br>';
		}
		for(let stat of Object.keys(this.stats)){
			if(this.stats[stat] != 0){gearStats.innerHTML+= stat+' : '+this.stats[stat]+'<br>';}
		}
		
		
	}
}

class Helm extends Gear{
	constructor(lvl){
		super(lvl);
		
		this.type = 'Helm';
		
		this.gdef = this.lvl*this.rank;
		this.gatk = this.rank*2;
		this.slots = 2;
		
		this.img = 'url("css/assets/helm.png")';
	}
	
}

class Armor extends Gear{
	constructor(lvl){
		super(lvl);
		
		this.type = 'Armor';
		
		this.gdef = this.lvl*this.rank*2;
		this.gatk = 0;
		this.slots = 3;
		
		this.img = 'url("css/assets/armor.png")';
	}
	
}

class Legs extends Gear{
	constructor(lvl){
		super(lvl);
		
		this.type = 'Legs';
		
		this.gdef = this.lvl*this.rank*2;
		this.gatk = 0;
		this.slots = 2;
		
		this.img = 'url("css/assets/legs.png")';
	}
	
}

class Sword extends Gear{
		constructor(lvl){
		super(lvl);
		
		this.type = 'Onhand';
		
		this.gdef = 0;
		this.gatk = this.lvl*this.rank*2;
		this.slots = 1;
		
		this.img = 'url("css/assets/sword.png")';
	}
	
}

class Spear extends Gear{
		constructor(lvl){
		super(lvl);
		
		this.type = 'Onhand';
		
		this.gdef = this.lvl*this.rank;
		this.gatk = this.lvl*this.rank;
		this.slots = 2;
		
		this.img = 'url("css/assets/spear.png")';
	}
	
}

class Axe extends Gear{
		constructor(lvl){
		super(lvl);
		
		this.type = 'Onhand';
		
		this.gdef = this.lvl*this.rank;
		this.gatk = this.lvl*this.rank*2;
		this.slots = 1;
		
		this.img = 'url("css/assets/axe.png")';
	}
	
}

class Dagger extends Gear{
		constructor(lvl){
		super(lvl);
		
		this.type = 'Offhand';
		
		this.gdef = 0;
		this.gatk = this.lvl*this.rank;
		this.slots = 0;
		
		this.img = 'url("css/assets/dagger.png")';
	}
	
}

class Shield extends Gear{
		constructor(lvl){
		super(lvl);
		
		this.type = 'Offhand';
		
		this.gdef = 0;
		this.gatk = this.lvl*this.rank;
		this.slots = 0;
		
		this.img = 'url("css/assets/shield.png")';
	}
	
}
//customized equip and unequpt functions for rings
class Ring extends Gear{
	constructor(lvl){
		super(lvl);
		
		this.type = 'Ring';
		
		this.stat = 'str';
		this.bonus = 5;
		
		this.img = 'url("css/assets/ring.png")';
	}
	
	equipt(){
		for(let i = 0; i < 6; i++){
			let slot = document.getElementById('Ring'+i);
			if(slot.childNodes.length > 0){continue}
			else{
				slot.appendChild(document.getElementById(this.id)); 
				u.hero.statUp(this.stat, this.bonus);
				u.hero.rings[i] = this;
				document.getElementById(this.id).oncontextmenu = function(){event.preventDefault(); u.bag.gear[this.id].unequipt(i)};
				document.getElementById(this.id).onclick = false;
				return;
			}
		}
	}
	
	unequipt(i){
		let div = document.getElementById(this.id);
		div.oncontextmenu = false;
		document.getElementById('bag').appendChild(div);
		u.hero.statDown(this.stat, this.bonus);
		u.hero.rings[i] = undefined;
		div.onclick = function(){u.bag.gear[this.id].equipt()}
	}
	
}


//base class for all enemy drops, includes attach and unattach functions and dom handling for drop attachments to gear
class Drop{
	constructor(){
		this.id = 'drop'+Object.values(u.bag.drops).length.toString();
		this.attached = undefined;
	}
	attach(){
	if(u.bag.inspecting){	
		let div = document.getElementById(this.id);
		let gear = u.bag.inspecting;
		
		for(let i = 0; i < gear.slots; i++){
			let slot = document.getElementById(gear.id+i);
			if(slot.childNodes.length > 0){continue}
			else{
				slot.appendChild(div);
				gear.stats[this.stat] += this.bonus;
				gear.showStats();
				gear.attachments.push(this);
				this.attached = i;
				div.oncontextmenu = function(){event.preventDefault(); u.bag.drops[this.id].detach()}
				return;
			}
		}
	}}
	
	detach(){
		let gear = u.bag.inspecting;
		let div = document.getElementById(this.id);
		gear.stats[this.stat]-=this.bonus;
		document.getElementById('bag').appendChild(div);
		div.oncontextmenu = false;
		gear.attachments.splice(this.attached, 1);
		gear.showStats();
		this.attached = undefined;
	}
	
}

class Batfang extends Drop{
	constructor(){
		super();
		this.stat = 'dex';
		this.bonus = 2;
	}
	
}


class Batclaw extends Drop{
	constructor(){
		super();
		this.stat = 'str';
		this.bonus = 2;
	}
	
}

class Batwing extends Drop{
	constructor(){
		super();
		this.stat = 'agl';
		this.bonus = 2;
	}
	
}


let u = new User();
u.bag.add(new Helm(1), true);
u.bag.add(new Armor(1), true);
u.bag.add(new Legs(1), true);
u.bag.add(new Sword(1), true);
u.bag.add(new Spear(1), true);
u.bag.add(new Axe(1), true);
u.bag.add(new Dagger(1), true);
u.bag.add(new Shield(1), true);

u.bag.add(new Batfang());
u.bag.add(new Batclaw());

u.mainmenu();
