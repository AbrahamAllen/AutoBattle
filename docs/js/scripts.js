

const screen = document.getElementById("screen");

//default function to clear all elements from a dom
function domclear(div){
	let l = div.childNodes;
	while(l.length > 0){
		l[0].remove();
	}
}

//default function to return random from list
function getRandom(list){
	let i = list.length;
	i = Math.round(Math.random()*(i-1));
	return list[i];
}

//menu class that: this.dom = getElementById: givven onclick
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


class popup{
	constructor(x, y, txt, r = false, parent = screen){
		this.dom = document.createElement('div');
		this.dom.style.top = y+'px';
		this.dom.style.left = x+'px';
		this.dom.innerHTML = txt;
		this.dom.className = 'popup';
		this.dom.onclick = function(){this.remove()};
		if(r){let div = this.dom; setTimeout(function(){div.remove()}, 3000)}
		parent.appendChild(this.dom);
	}
	

	
}






//user class manages player moving through tower, and holds the hero and bag 
class User{
	constructor(){
		this.hero = new Hero();
		this.bag = new Bag();
		
		this.towerIndex = 3;
		this.clearedTowers = [];
		this.activeTower;
		this.activeFloor;
		this.floorTrack;
		this.chest = false;
		this.gold = 10;
	}
	
	//main menu loads tower start buttons, bag menu, stats menu
	mainmenu(){
		domclear(screen);
		screen.style.backgroundImage = "url('css/assets/mainmenu.png')";
		
		let main = new menu(screen, 'towerMenu', '', false);
		new menu(screen, 'shop', '', function(){shop.open()});
		let i = 1;
		while(i <= this.towerIndex){
		if(!this.clearedTowers.includes(i)){
			let enemy = getRandom(Object.keys(enemies));
			let tower = new menu(main.dom, i+' '+enemy, 'tower', function(){u.startTower(this.id)}, false);
			tower.dom.innerHTML += i;
			tower.dom.style.backgroundImage = "url('css/assets/"+enemy+"tower.png')"
			tower.build();
			
		}i++};
		
/* 		let baseLvl = this.hero.lvl+5;
		while(baseLvl > 0 && baseLvl > this.hero.lvl-5){
			let enemy = getRandom(Object.keys(enemies));
			let tower = new menu(main.dom, baseLvl+' '+enemy, 'tower', function(){u.startTower(this.id)}, false);
			tower.dom.innerHTML += baseLvl;
			tower.dom.style.backgroundImage = "url('css/assets/"+enemy+"tower.png')"
			tower.build();
			
			baseLvl--;
		} */
		
		new menu(screen, 'openBagM', '', function(){u.bag.open()});
		new menu(screen, 'openStatsM', '', function(){u.hero.statMenu()}); 
		new menu(screen, 'saveGame', '', function(){saveGame()});
	}
	
	
	//creates a new tower and assigns the user an active tower and floor then builds battle menu and starts floor
	startTower(idTag){
		domclear(screen);
		this.activeTower = new Tower(idTag);
		this.activeFloor = this.activeTower.floors[1];
		this.floorTrack = 1;
		console.log(this.activeTower);
		
		
		this.battleMenu();
		this.continueFloor();
	}
	
	//checks if tower is complete and if not sets the active floor to the next floor of the active tower
	newFloor(){
		domclear(screen);
		this.floorTrack++;
		if(this.floorTrack > 10){this.clearTower()}
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
	
	//spawns hero, reactivates chest and creates buttons for attack options
	battleMenu(){
		
		let main = new menu(screen, 'battleMenu');
		screen.style.backgroundImage = "url('css/assets/fightBg.png')";
		
		this.chest = true;
		new menu(main.dom, 'normal', 'attackOption selectedAttack', function(){u.hero.changeStance(this.id)});
		new menu(main.dom, 'fast', 'attackOption', function(){u.hero.changeStance(this.id)});
		new menu(main.dom, 'agressive', 'attackOption', function(){u.hero.changeStance(this.id)});
		new menu(main.dom, 'defensive', 'attackOption', function(){u.hero.changeStance(this.id)});
		
		this.hero.spawn();
	}
	
	//creates menus for bag, stats leaving tower, continuing tower, chest
	floorMenu(){
		domclear(screen);
		let main = new menu(screen, 'floorMenu');
		let display = new menu(screen, 'floorEnd');
		if(this.chest){this.activeTower.createChest()};
		this.activeTower.floorPreview(this.floorTrack);
		
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
		
		this.hero.heal(this.hero.maxhp/2);
		this.mainmenu();
	} 
	
	clearTower(){
		domclear(screen);
		this.towerIndex += (3-(this.towerIndex-this.activeTower.lvl));
		this.clearedTowers.push(this.activeTower.lvl);
		console.log(this.towerIndex);
		this.activeTower = false;
		this.activeFloor = false;
		this.floorTrack = 1;

		alert('tower clear');
		
		this.hero.heal(this.hero.maxhp);
		shop.restock();
		this.mainmenu();
	}
	
	//removes enemy from active floor, loots enemy and repeates continueFloor
	kill(enemy){
		this.activeFloor.shift();
		this.hero.gainExp(enemy);
		this.hero.heal(Math.floor(this.hero.stm/5));
		if(this.hero.luck+enemy.luck > Math.random()*100){
			new popup(19, 10, 'dropped loot', true)
			if(enemy.loot.name != 'Ring'){u.bag.add(new enemy.loot(getRandom(BaseStats),enemy.rank))}
			else{u.bag.add(new enemy.loot(enemy.lvl, Math.ceil(Math.random()*3)))}
		}else{};
		setTimeout(function(){u.continueFloor()}, 1200);
	}
	
	//adds gear to user bag
	openChest(chest){
		this.chest = false;
		this.bag.add(new chest.loot(chest.lvl, chest.rank));
		document.getElementById('chest').remove();
	}
	
	
}


//tower class creates a tower of a givven level from givven enemy type, based on tower menu ID
class Tower{
	constructor(idTag){
		this.floors = {};
		this.chests = {};
		
		let start = idTag.split(' ');
		
		this.enemyPool = enemies[start[1]]; 
		this.lvl = parseInt(start[0]);
		
		this.makeFloors();
	}
	
	
	// make floors creates 10 floors with up to 6 enemies on each floor
	makeFloors(){	
		
		this.floors[1] = [];
		while(this.floors[1].length < 3){
			this.floors[1].push(new this.enemyPool[0](this.lvl+(this.floors[1].length)));
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
		this.makeChests();
		this.floors[10] = [new this.enemyPool[this.enemyPool.length-1](Math.round(this.lvl*10*.75))];
	}
	
	//select enemy returns a random enenmy from the enemy pool based on floor lvl, and spot on floor
	selectEnemy(floor, spot){
		let pool = 3;
		let low = 0;
		if(floor > 3){pool+=2};
		if(floor > 6){low+=2};
		if(spot > 2){pool+=2};
		
		let n = Math.floor(Math.random()*pool)+low;
		let enemy = this.enemyPool[n];
		
		let lvl = this.lvl*floor;
		if(spot>2){lvl+=Math.round(spot/2)};
		if(Math.random > .51){lvl+=Math.round(Math.random()*2)}else{lvl-=Math.round(Math.random()*-2)};
		
		return new enemy(lvl);
		
	}
	
	makeChests(){
		for(let key of Object.keys(this.floors)){
			let floor = this.floors[key];
			let rarity = 0;
			rarity+=floor.length;
			for(let enemy of floor){rarity+=enemy.rank};
			rarity=Math.floor(rarity/5);
			if(rarity > 3){rarity = 3};
			if(rarity < 1){rarity = 1};
			let sum = 0;
			for(let enemy of floor){sum+=enemy.lvl};
			let m = Math.floor(sum/floor.length);
			if(key > 5){m+=1};
			this.chests[key] = {loot: Object.values(GearList)[Math.round(Math.random()*7)], rank: rarity, lvl: m}	
		}
		this.chests[10] = {loot: Object.values(GearList)[Math.round(Math.random()*7)], rank: 3, lvl: this.lvl+5};
	}
	
	createChest(i){
		new menu(document.getElementById('floorEnd'), 'chest', '', function(){u.openChest(u.activeTower.chests[u.floorTrack])});
	}
	
	floorPreview(i){
		console.log(this.floors[i+1]);
		let preview = new menu(document.getElementById('floorEnd'), 'preview');
		preview.build();
		
		for(let enemy of this.floors[i+1]){
			let previewEnemy = new menu(preview.dom, enemy.constructor.name, 'preview');
			previewEnemy.dom.style.backgroundImage = enemy.img;
			previewEnemy.build();
		}
	}
	
}

//default parent class of hero and enemy, contains attack and damage functions
class Character{
	constructor(){
		
	}
	//attacks a target, then checks if target is still alive and if so attacks the target again
	attack(target){
		clearTimeout(this.fight);
		let speed = this.atkSpd;
		if(speed < 1000){speed = 1000};
		
		
		let unit = this;
		this.fight = setTimeout(function(){
			console.log(unit.stance);
			if(unit.hp > 0 && target.hp > 0){unit.attackanim(); target.damage(unit)};
			if(target.hp > 0){unit.attack(target)};
		}, speed);
	}
	//takes damage based on enemy atk and enemy tec and this def
	damage(enemy){
		let total = enemy.atk;
		total-= this.def;
		if(this.stance == 'defensive'){total-=this.def};
		if(total < 0){total = 0};
		total+=enemy.tec;
		this.hp-=total;
		this.healthbar.update(this.hp);
		if(this.hp <= 0){this.destroy()}
	}
	
	//sets atk def and max hp stats 
	setStats(){
		this.atk = Math.ceil((this.gatk)+(this.str)+(this.dex/2));
		if(this.stance){
				switch(this.stance){	 
					case 'fast': this.atkSpd = 2500-(this.agl*50); this.atk = Math.ceil(this.gatk+this.lvl);break;
					case 'agressive': this.atkSpd = 6000-(this.agl*30);this.atk = Math.ceil((this.gatk*2)+(this.str)+(this.dex));break;
					case 'defensive': this.atkSpd = 3000-(this.agl*10);this.atk = Math.ceil((this.str)+(this.dex/2));break;
					case 'normal': this.atkSpd = 3000-(this.agl*20);this.atk = Math.ceil((this.gatk)+(this.str)+(this.dex/2));break;
				}
		}
		this.def = Math.ceil((this.gdef)+(this.tof)+(this.dex/2));
		this.maxhp = Math.ceil((this.tof)+(this.stm)+(this.str)+(this.lvl*2));
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
	
	newmax(max){
		this.maxHp = max;
		this.update(this.hp);
	}
	
}

//default playable character monitors and controlls all stat changes to player
class Hero extends Character{
	constructor(){
		super();
		
		
		//base stats that impact atk def max maxhp
		this.str = 5;
		this.dex = 5;
		this.tof = 3;
		this.agl = 5;
		this.stm = 10;
		this.tec = 1;
		this.luck = 7;
		
		
		//stats gained from gear 
		this.gatk = 0;
		this.gdef = 0;
		
		
		//tracking exp lvl and upgrades
		this.lvl = 1;
		this.exp = 0;
		this.statPoints = 5;
		
		//default value impacted by agl
		this.atkSpd = 4000;
		
		//builds combat stats
		this.setStats();
		this.hp=this.maxhp;
		this.stance = 'normal';
		
		//gear dict 
		this.gear = {};
		this.gear['Helm'] = undefined;
		this.gear['Armor'] = undefined;
		this.gear['Legs'] = undefined;
		this.gear['Onhand'] = undefined;
		this.gear['Offhand'] = undefined;
		
		//ring dict
		this.rings = {};
		this.rings[0] = undefined;
		this.rings[1] = undefined;
		this.rings[2] = undefined;
		this.rings[3] = undefined;
		this.rings[4] = undefined;
		this.rings[5] = undefined;
	}
	
	//builds dom of hero and healthbar
	spawn(){
		this.dom = new menu(screen, 'hero', 'hero');
		this.dom = this.dom.dom;
		this.healthbar = new HealthBar(this.maxhp, this.hp, this.dom);
		this.changeStance('normal');
	}
	
	//animates attack
	attackanim(){
		let unit = this;		
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},150);
		setTimeout(function(){unit.dom.style.top = '100px'; unit.dom.style.left = '200px'; unit.dom.style.scale = '80%'},300);
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},450);
		setTimeout(function(){unit.dom.style.top = '240px'; unit.dom.style.left = '40px'; unit.dom.style.scale = '100%'},600);
	}
	
	//sets stance to the selected option and changes atkSpd and damage values depending on current stance
	changeStance(stance){
		this.stance = stance;
		switch(stance){			 
			case 'fast': this.atkSpd = 2500-(this.agl*50); this.atk = Math.ceil(this.gatk+this.lvl);break;
			case 'agressive': this.atkSpd = 6000-(this.agl*30);this.atk = Math.ceil((this.gatk*2)+(this.str)+(this.dex));break;
			case 'defensive': this.atkSpd = 3000-(this.agl*10);this.atk = Math.ceil((this.str)+(this.dex/2));break;
			case 'normal': this.atkSpd = 3000-(this.agl*20);this.atk = Math.ceil((this.gatk)+(this.str)+(this.dex/2));break;
		}
		try{
			document.getElementsByClassName('selectedAttack')[0].className = 'attackOption';
			this.attack(u.activeFloor[0]);
			document.getElementById(this.stance).classList.add('selectedAttack');
		}catch{
			this.statMenu();
		}
	}
	
	//changes stance on stats screen
	swapStance(){
		let stances = ['normal', 'fast', 'agressive', 'defensive'];
		let i = stances.indexOf(this.stance)+1;
		if(i > 3){i = 0};
		this.changeStance(stances[i]);
		
	}
	
	
	//opens stat menu, used to reset menu on stat updates
	statMenu(){
		domclear(screen);
		screen.style.backgroundImage = "url('css/assets/userbg.png')";
		this.setStats();
		let stats = Object.keys(this);
		let statVal = Object.values(this);
		
		for(let i = 0; i < 6; i++){
			let baseStat = new menu(screen, stats[i], 'stat', function(){u.hero.usePoint(this.id)}, false);
			baseStat.dom.innerHTML = '<br>'+stats[i]+'<br>'+statVal[i];
			baseStat.dom.ondblclick = function(){event.preventDefault(); u.hero.allPoints(this.id)};
			baseStat.build();
		}
		
		new menu(screen, 'statExplainer');
		let luck = new menu(screen, stats[6], 'stat', function(){u.hero.usePoint(this.id)}, false);
		luck.dom.innerHTML = '<br>'+stats[6]+'<br>'+statVal[6];
		luck.build();
		
		
		for(let i = 7; i < 18; i++){
			let comStat = new menu(screen, stats[i], 'stat', false, false);
			comStat.dom.innerHTML = '<br>'+stats[i] + '<br>' + statVal[i];
			comStat.build();
		}
		document.getElementById('maxhp').remove();
		document.getElementById('hp').innerHTML = '<br>'+this.hp+'/'+this.maxhp+'<br> health';
		
		new menu(screen, 'back', 'back', function(){if(u.activeTower){u.floorMenu()}else{u.mainmenu()}});
		
		document.getElementById('stance').onclick = function(){u.hero.swapStance()};
	}
	
	
	//drops point and gains stat
	usePoint(stat){
	if(this.statPoints >0){
		this.statPoints--;
		this.statUp(stat, 1);
		this.statMenu();
	}}
	
	allPoints(stat){
		let n = this.statPoints;
		this.statPoints = 0;
		this.statUp(stat, n);
		this.statMenu();
	}
	
	
	//gets stat string and upgrades stat by amt 
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
			case 'luck' : this.luck += amt; break;
		}
	}
	
	//gets stat string and loses stat by amt
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
			case 'luck' : this.luck -= amt; break;
		}
	}
	
	//gets enemy and adds exp based on lvl and rank, levels up and adds stat points
	gainExp(enemy){
		this.exp+=(enemy.lvl*enemy.rank+this.tec);
		if(this.exp >= this.lvl*15){
			new popup(10, 10, 'LEVEL UP', true);
			this.lvl++; 
			this.exp = 0; 
			this.statPoints+=5; 
			this.str+=1;
			this.dex+=1;
			this.stm+=1;
			this.tof+=1;
			this.setStats();
			this.healthbar.newmax(this.maxhp);
			this.heal(this.stm+this.lvl);
		}
	}
	
	//heals by amt
	heal(amt){
		this.hp+=amt;
		if(this.hp > this.maxhp){this.hp = this.maxhp};
		this.healthbar.update(this.hp);
	}
	
	destroy(){
		clearTimeout(this.fight);
		this.str-=2;
		this.dex-=2;
		this.tof-=2;
		this.stm-=2;
		this.setStats();
		
		this.lvl-=1;
		if(this.lvl < 1){this.lvl = 1};
		setTimeout(function(){	
			u.endTower();
			new popup(75, 50, 'YOU DIED');
			u.hero.hp = u.hero.maxhp;
		}, 1000);
	}
	
	zeroStats(){
		this.str = 0;
		this.dex = 0;
		this.tof = 0;
		this.agl = 0;
		this.stm = 0;
		this.tec = 0;
	}
	
}

//base class of all enemies, each enemy extends this class by giving custom stats and drops
class Enemy extends Character{
	constructor(lvl){
		super()
		
		this.lvl = lvl;
		this.luck = 20;
		this.gatk = 0;
		this.gdef = 0;
		this.tec = 0;
	}
	
	//builds enemy dom and healtbat
	spawn(){
		this.dom = new menu(screen, 'enemy', 'enemy');
		this.dom = this.dom.dom;
		this.dom.innerHTML = 'level '+this.lvl+' '+this.constructor.name;
		this.dom.style.backgroundImage = this.img;
		this.healthbar = new HealthBar(this.maxhp, this.hp, enemy);
		u.hero.attack(this);
		this.attack(u.hero);
		console.log(this);
	}
	
	//animates attack
	attackanim(){
		let unit = this;
		setTimeout(function(){unit.dom.style.top = '80px'; unit.dom.style.left = '150px'; unit.dom.style.scale = '110%'},150);
		setTimeout(function(){unit.dom.style.top = '100px'; unit.dom.style.left = '90px'; unit.dom.style.scale = '130%'},300);
		setTimeout(function(){unit.dom.style.top = '80px'; unit.dom.style.left = '150px'; unit.dom.style.scale = '110%'},450);
		setTimeout(function(){unit.dom.style.top = '40px'; unit.dom.style.left = '220px'; unit.dom.style.scale = '100%'},600);
	}
	
	//animates death and sets user kill
	destroy(){
		let unit = this;
		clearInterval(this.fight);
		u.kill(this);
		setTimeout(function(){unit.dom.style.backgroundImage = "url('css/assets/dead.png')"}, 500);
		setTimeout(function(){unit.dom.remove()}, 1000);
	}
	
}

//BAT ENEMIES
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
		
		this.loot = Drop;
	}
	
}

class Greybat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/greyBat.png')";
		
		this.str = 3*lvl;
		this.dex = 3*lvl;
		this.tof = 3*lvl;
		this.agl = 3*lvl;
		this.stm = 3*lvl;
		this.loot = Drop;
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
		
		
		this.str = 5*lvl;
		this.dex = 2*lvl;
		this.tof = 3*lvl;
		this.agl = 2*lvl;
		this.stm = 2*lvl;
		this.loot = Drop;
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
		this.tof = 6*lvl;
		this.agl = lvl;
		this.stm = 3*lvl;
		this.tec = Math.floor(lvl/2);
		this.loot = Drop;
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
		
		this.str = 5*lvl;
		this.dex = 3*lvl;
		this.tof = 5*lvl;
		this.agl = 2*lvl;
		this.stm = 5*lvl;
		this.loot = Drop;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 5000-(this.agl*30);
	}
	
}

class Sonicbat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('css/assets/sonicBat.png')";
		
		this.str = 2*lvl;
		this.dex = 7*lvl;
		this.tof = 3*lvl;
		this.agl = 4*lvl;
		this.stm = 3*lvl;
		this.loot = Drop;
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
		
		
		this.str = 6*lvl;
		this.dex = 4*lvl;
		this.tof = 3*lvl;
		this.agl = 5*lvl;
		this.stm = 4*lvl;
		this.loot = Drop;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 4000-(this.agl*30);
	}
	
}

class Knightbat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 3;
		this.img = "url('css/assets/knightbat.png')";
		
		
		this.str = 10*lvl;
		this.dex = 7*lvl;
		this.tof = 10*lvl;
		this.agl = 5*lvl;
		this.stm = 7*lvl;
		this.loot = Ring;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 4000-(this.agl*30);
	}
	
}

class Gargoyle extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 3;
		this.img = "url('css/assets/gargoyle.png')";
		
		
		this.str = 10*lvl;
		this.dex = 10*lvl;
		this.tof = 10*lvl;
		this.agl = 2*lvl;
		this.stm = 8*lvl;
		this.loot = Ring;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 4000-(this.agl*10);
	}
	
}

class Vampire extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 5;
		this.img = "url('css/assets/vampire.png')";
		
		
		this.str = 15*lvl;
		this.dex = 10*lvl;
		this.tof = 7*lvl;
		this.agl = 10*lvl;
		this.stm = 7*lvl;
		this.loot = Vampiretooth;
		this.setStats();
		this.hp = this.maxhp;
		
		this.atkSpd = 4000-(this.agl*50);
	}
	
}



class Pygmyface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/pygmyface.png')";
		
		this.str = 2*lvl;
		this.dex = 2*lvl;
		this.tof = 2*lvl;
		this.agl = 2*lvl;
		this.stm = 2*lvl;
		
		this.atkSpd = 5000-(this.agl*40);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Drop;
	}
}
	
class Lineface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/lineface.png')";
		
		this.str = 4*lvl;
		this.dex = 2*lvl;
		this.tof = 3*lvl;
		this.agl = 2*lvl;
		this.stm = 3*lvl;
		
		this.atkSpd = 5000-(this.agl*40);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Drop;
	}
}

class Tongueface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/tongueface.png')";
		
		this.str = 3*lvl;
		this.dex = 5*lvl;
		this.tof = 3*lvl;
		this.agl = 5*lvl;
		this.stm = 3*lvl;
		
		this.atkSpd = 5000-(this.agl*40);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Drop;
	}
}

class Redeyesface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('css/assets/redeyesface.png')";
		
		this.str = 5*lvl;
		this.dex = 5*lvl;
		this.tof = 5*lvl;
		this.agl = 3*lvl;
		this.stm = 5*lvl;
		
		this.atkSpd = 5000-(this.agl*40);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Drop;
	}
}

class Fangface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('css/assets/fangface.png')";
		
		this.str = 8*lvl;
		this.dex = 3*lvl;
		this.tof = 3*lvl;
		this.agl = 5*lvl;
		this.stm = 5*lvl;
		
		this.atkSpd = 5000-(this.agl*40);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Drop;
	}
}

class Madface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('css/assets/madface.png')";
		
		this.str = lvl;
		this.dex = 5*lvl;
		this.tof = 5*lvl;
		this.agl = 5*lvl;
		this.stm = 5*lvl;
		this.tec = lvl;
		
		this.atkSpd = 5000-(this.agl*40);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Drop;
	}
}

class Darkface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('css/assets/darkface.png')";
		
		this.str = 6*lvl;
		this.dex = 6*lvl;
		this.tof = 4*lvl;
		this.agl = 5*lvl;
		this.stm = 4*lvl;
		
		this.atkSpd = 5000-(this.agl*40);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Drop;
	}
}

class Jaws extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 3;
		this.img = "url('css/assets/jaws.png')";
		
		this.str = 15*lvl;
		this.dex = 5*lvl;
		this.tof = 5*lvl;
		this.agl = 7*lvl;
		this.stm = 5*lvl;
		
		this.atkSpd = 5000-(this.agl*50);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Ring;
	}
}

class Lasereye extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 3;
		this.img = "url('css/assets/lasereye.png')";
		
		this.str = 8*lvl;
		this.dex = 10*lvl;
		this.tof = 7*lvl;
		this.agl = 5*lvl;
		this.stm = 7*lvl;
		
		this.atkSpd = 5000-(this.agl*30);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Ring;
	}
}

class Monsterface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 5;
		this.img = "url('css/assets/monsterface.png')";
		
		this.str = 15*lvl;
		this.dex = 10*lvl;
		this.tof = 10*lvl;
		this.agl = 7*lvl;
		this.stm = 10*lvl;
		
		this.atkSpd = 5000-(this.agl*30);
		
		this.setStats();
		this.hp = this.maxhp;
		
		this.loot = Emojieye;
	}
}

	
	
	
//enemy dictionary used in tower class
let enemies = new Object();
enemies['bat'] = [Pygmybat,Greybat,Brownbat,Blackbat,Largebat,Sonicbat,Vampirebat, Knightbat, Gargoyle, Vampire];
enemies['face'] = [Pygmyface, Lineface, Tongueface, Redeyesface, Fangface, Madface, Darkface, Jaws, Lasereye, Monsterface];


//attached to user, controlls all loot picked up, facilitates dom interactions of all loot, tied by div ID to object ID
class Bag{
	constructor(){
		this.gear = {};
		this.drops = {};
		this.inspecting = false;
		this.material = undefined;
	}
	
	//adds gear and drop 
	add(item){
		if(item.gear){this.gear[item.id] = item}
		else{this.drops[item.id] = item}
	}
	
	//opens full bag 
	open(){
		domclear(screen);
		screen.style.backgroundImage = "url('css/assets/userbg.png')";
		new menu(screen, 'charMenu');
		new menu(screen, 'ringSlots');
		
		new menu(screen, 'bag');
		this.populateGear();
		
		//makes gear
		for(let slot of Object.keys(u.hero.gear)){
			let div = new menu(document.getElementById('charMenu'), slot, 'equiptSlot');
			if(u.hero.gear[slot]){
				div.dom.appendChild(document.getElementById(u.hero.gear[slot].id))
				document.getElementById(u.hero.gear[slot].id).onclick = function(){u.bag.gear[this.id].unequipt()};
			};
		}
		
		//makes rings
		for(let slot of Object.keys(u.hero.rings)){
			let div = new menu(document.getElementById('ringSlots'), 'Ring'+slot, 'ringslot');
			if(u.hero.rings[slot]){
				div.dom.appendChild(document.getElementById(u.hero.rings[slot].id))
				document.getElementById(u.hero.rings[slot].id).onclick = function(){u.bag.gear[this.id].unequipt(slot)};	
			};
		}
		
		
		new menu(screen, 'swap', 'swap', function(){u.bag.forge()});
		new menu(screen, 'back', 'back', function(){if(u.activeTower){u.floorMenu()}else{u.mainmenu()}});
	}
	
	//opens the forge: used for enchating inspecting and upgrading gear 
	forge(){
		domclear(screen);
		
		let main = new menu(screen, 'inspectMenu');
		new menu(main.dom, 'inspectGear', '', function(){
			let div = document.getElementById('inspectGear');
			if(div.childNodes[0]){document.getElementById('bag').appendChild(div.childNodes[0]); domclear(document.getElementById('attachmentMenu'))};
			u.bag.inspecting = undefined;
		});
		new menu(main.dom, 'gearStats');
		new menu(main.dom, 'attachmentMenu');
		new menu(main.dom,  'scrap', '', function(){u.bag.scrap(this.id)});
		new menu(screen, 'bag');
		new menu(screen, 'swap', 'swap', function(){u.bag.open()});
		new menu(screen, 'back', 'back', function(){if(u.activeTower){u.floorMenu()}else{u.mainmenu()}});
		this.populateGearInspect();
	}
	
	//generates gear for equipt menu
	populateGear(){
		domclear(document.getElementById('bag'));
		this.inspecting = undefined;
		for(let gear of Object.values(this.gear)){
			if(!gear){continue};
			let item = new menu(document.getElementById('bag'), gear.id, 'gear', function(){gear.equipt()}, false);
			item.dom.style.backgroundImage = gear.img;
			item.dom.innerHTML = gear.lvl+':'+gear.rank;
			item.build();
		}
	}
	
	//generates drops and gear for forge  
	populateGearInspect(){
		domclear(document.getElementById('bag'));
		for(let gear of Object.values(this.gear)){
			if(!gear){continue};
			if(this.inspecting && this.inspecting.id == gear.id){continue};
			let item = new menu(document.getElementById('bag'), gear.id, 'gear', function(){gear.inspect()}, false);
			item.dom.style.backgroundImage = gear.img;
			item.dom.innerHTML = gear.lvl+':'+gear.rank;
			item.build();
		}
		this.populateDrops();
	}
	
	//generates drops
	populateDrops(){
		for(let drop of Object.values(this.drops)){	
		if(drop && drop.attached == undefined){
			
			let item = new menu(document.getElementById('bag'), drop.id, 'drop', function(){drop.attach()}, false);
			item.dom.style.backgroundImage = drop.img;
			item.dom.innerHTML = drop.stat+' : '+drop.bonus;
			item.build();
		}}
	}
	
	populateGearSell(){
		domclear(document.getElementById('bag'));
		for(let gear of Object.values(this.gear)){
			if(!gear || gear.equipted){continue};
			let item = new menu(document.getElementById('bag'), gear.id, 'gear', function(){shop.sell(gear)}, false);
			item.dom.style.backgroundImage = gear.img;
			item.dom.innerHTML = gear.lvl+':'+gear.rank+ '<br>' + gear.lvl*gear.rank*gear.stage*2;
			item.build();
		}
		new menu(screen, 'back', 'back', function(){if(u.activeTower){u.floorMenu()}else{u.mainmenu()}});
	}
	
	
	//checks compbatability of two items and allows them to merge 
	merge(item){
		console.log(item);
		
		try{
			if(this.inspecting){
				if(this.inspecting.id == item.id){return false};		
				if(this.inspecting.lvl == item.lvl && this.inspecting.rank == item.rank && this.inspecting.stage == item.stage && this.inspecting.stat == item.stat && this.inspecting.constructor.name == item.constructor.name){
				
					document.getElementById('inspectGear').appendChild(document.getElementById(item.id));
					document.getElementById(item.id).style.marginTop = '50px';
					this.material = item;
					document.getElementById('attachmentMenu').remove();
					new menu(document.getElementById('inspectMenu'), 'forge', '', function(){u.bag.upgrade()});
					
					return true;
				}
				
			}
		}catch{
			return false;
		}
	}
	
	
	upgrade(){
		try{this.upgradeItem()}
		catch{this.upgradeDrop()}
	}
	
	upgradeItem(){
		if(this.inspecting && this.material){
			
			
			let gear = new GearList[this.inspecting.constructor.name](this.inspecting.lvl, this.inspecting.rank, this.inspecting.stage+1); 
			u.bag.add(gear);
			console.log(gear);
			
			this.inspecting.destroy(); this.material.destroy();
			this.inspecting = false; this.material = false;
			this.forge();
		}
	}
	
	upgradeDrop(){
		if(this.inspecting && this.material){
			let drop = new Drop(this.inspecting.stat, this.inspecting.rank, this.inspecting.stage+1);
			this.inspecting.destroy(); this.inspecting = undefined;
			this.material.destroy(); this.material = undefined;
			this.add(drop);
			console.log(drop);
			this.forge();
		}
	}
	
	cancelForge(){
		document.getElementById(this.material.id).style.marginTop = '0px';
		document.getElementById('bag').appendChild(document.getElementById(this.material.id));
		this.material = undefined; 
		new menu(document.getElementById('inspectMenu'), 'attachmentMenu');
		document.getElementById('forge').remove();
		
	}
	
	scrap(id){
		console.log(this.gear[id]);
	}
}

//base class for all weapons and armor added to bag, includes equipt and unequipt functions for gear tied to hero statUp and down functions
class Gear{
	constructor(lvl, rank, stage = 1){
		this.lvl = lvl;
		this.rank = rank;
		this.stage = stage;
		this.gear = true;
		this.id = Object.keys(u.bag.gear).length.toString();
		this.stats = {'str': 0, 'dex': 0, 'tof': 0, 'agl': 0, 'stm': 0, 'tec': 0};
		this.attachments = [];
		this.equipted = false;
	}
	
	//full control of adding gear to hero and calling statUp and statDown
	equipt(){
		let slot = document.getElementById(this.type);
		if(slot.childNodes[0]){u.bag.gear[slot.childNodes[0].id].unequipt()};
		
		document.getElementById(this.id).onclick = function(){u.bag.gear[this.id].unequipt()};
		slot.appendChild(document.getElementById(this.id));
		u.hero.statUp('gdef', this.gdef);
		u.hero.statUp('gatk', this.gatk);
		u.hero.gear[this.type] = this;
		
		for(let stat of Object.keys(this.stats)){if(this.stats[stat] > 0){u.hero.statUp(stat, this.stats[stat])}}
		this.equipted = true;
	}
	
	unequipt(){
		try{
			let div = document.getElementById(this.id);
			div.onclick = function(){u.bag.gear[this.id].equipt()};;
			document.getElementById('bag').appendChild(div);
		}catch{};
		u.hero.statDown('gdef', this.gdef);
		u.hero.statDown('gatk', this.gatk);
		u.hero.gear[this.type] = undefined;
		this.equipted = false;
	}
	
	//adds gear or drop to inspection menu and opens gear slot menu
	inspect(){
		console.log(u.bag.inspecting);
		if(this.equipted){this.unequipt()};
		if(u.bag.merge(this)){return};
		if(u.bag.material){alert(); u.bag.cancelForge()}
		let div = document.getElementById('inspectGear');
		if(div.childNodes[0]){document.getElementById('bag').appendChild(div.childNodes[0]); domclear(document.getElementById('attachmentMenu'))};
		div.appendChild(document.getElementById(this.id));
		u.bag.inspecting = this;
		for(let i = 0; i<this.slots; i++){new menu(document.getElementById('attachmentMenu'), this.id+i, 'attatchmentSlot')};
		for(let attach of this.attachments){
			let attachment = new menu(document.getElementById(this.id+attach.attached), attach.id, 'drop', false, true);
			attachment.dom.innerHTML = attach.stat + ' : ' + attach.bonus;
			attachment.dom.style.backgroundImage = attach.img;
			attachment.dom.onclick = function(){u.bag.drops[this.id].detach()};
		};
		this.showStats();
	}
	
	//gives stats
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
	
	
	clear(){
		for(let attachment of this.attachments){
			attachment.unattach();
		}
	}
	
	destroy(){
		this.clear();
		if(this.attach){this.detach};
		u.bag.gear[this.id] = undefined;
	}
}


//ALL GEAR
class Helm extends Gear{
	 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Helm';
		
		this.gdef = this.lvl*this.rank;
		this.gatk = this.rank*2;
		this.slots = 1+this.stage;
		
		this.img = 'url("css/assets/helm.png")';
	}
	
}

class Armor extends Gear{
	 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Armor';
		
		this.gdef = this.lvl*this.rank*2;
		this.gatk = 0;
		this.slots = 2+this.stage;
		
		this.img = 'url("css/assets/armor.png")';
	}
	
}

class Legs extends Gear{
	 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Legs';
		
		this.gdef = this.lvl*this.rank*2;
		this.gatk = 0;
		this.slots = 1+this.stage;
		
		this.img = 'url("css/assets/legs.png")';
	}
	
}

class Sword extends Gear{
		 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Onhand';
		
		this.gdef = 0;
		this.gatk = this.lvl*this.rank*2;
		this.slots = this.stage;
		
		this.img = 'url("css/assets/sword.png")';
	}
	
}

class Spear extends Gear{
		 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Onhand';
		
		this.gdef = this.lvl*this.rank;
		this.gatk = this.lvl*this.rank;
		this.slots = 1+this.stage;
		
		this.img = 'url("css/assets/spear.png")';
	}
	
}

class Axe extends Gear{
		 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Onhand';
		
		this.gdef = this.lvl*this.rank;
		this.gatk = this.lvl*this.rank*2;
		this.slots = this.stage;
		
		this.img = 'url("css/assets/axe.png")';
	}
	
}

class Dagger extends Gear{
		 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Offhand';
		
		this.gdef = 0;
		this.gatk = this.lvl*this.rank;
		this.slots = this.stage-1;
		
		this.img = 'url("css/assets/dagger.png")';
	}
	
}

class Shield extends Gear{
		 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Offhand';
		
		this.gdef = this.lvl*this.rank;
		this.gatk = 0;
		this.slots = this.stage;
		
		this.img = 'url("css/assets/shield.png")';
	}
	
}
//customized equip and unequpt upgrade functions for rings
class Ring extends Gear{
	 constructor(lvl, rank, stage){
		 super(lvl, rank, stage);
		
		this.type = 'Ring';
		
		this.stat = getRandom(BaseStats);
		this.bonus = Math.round((this.lvl/3)*this.rank);
		
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
				document.getElementById(this.id).onclick = function(){u.bag.gear[this.id].unequipt(i)};
				return;
			}
		}
	}
	
	unequipt(i){
		let div = document.getElementById(this.id);
		div.onclick = function(){u.bag.gear[this.id].equipt(i)};;
		document.getElementById('bag').appendChild(div);
		u.hero.statDown(this.stat, this.bonus);
		u.hero.rings[i] = undefined;
		div.onclick = function(){u.bag.gear[this.id].equipt()}
	}
	
	upgrade(){
		this.stage++;
		this.bonus = Math.floor(this.bonus+this.bonus/2);
	}
	
}

let GearList = {'Helm': Helm, 'Armor': Armor,'Legs': Legs,'Sword': Sword, 'Shield': Shield,'Spear': Spear,'Dagger': Dagger,'Axe': Axe};

let BaseStats = ['str', 'dex', 'tof', 'agl', 'stm', 'tec'];

//base class for all enemy drops, includes attach and unattach functions and dom handling for drop attachments to gear
class Drop{
	constructor(stat, rank, stage = 1){
		this.id = 'drop'+Object.values(u.bag.drops).length.toString();
		this.attached = undefined;
		this.stage = stage;
		this.rank = rank;
		this.stat = stat;
		this.bonus = stage*rank;
		this.img = 'url("css/assets/'+stat+'gem.png")';
	}
	
	//dom controls gear and adds stat or removes stat from gear  
	attach(){
		if(u.bag.inspecting){
			if(u.bag.merge(this)){return};
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
					div.onclick = function(){u.bag.drops[this.id].detach()}
					return;
				}
			}
		}else{
			this.inspect();
		}
	}
	
	detach(){
		let gear = u.bag.inspecting;
		let div = document.getElementById(this.id);
		let drop = this;
		div.onclick = function(){drop.attach()}
		gear.stats[this.stat]-=this.bonus;
		document.getElementById('bag').appendChild(div);
		gear.attachments.splice(this.attached, 1);
		gear.showStats();
		this.attached = undefined;
	}
	
	inspect(){
		if(u.bag.merge(this)){return};
		if(u.bag.material){u.bag.cancelForge()}
		let div = document.getElementById('inspectGear');
		if(div.childNodes[0]){document.getElementById('bag').appendChild(div.childNodes[0]); domclear(document.getElementById('attachmentMenu'))};
		div.appendChild(document.getElementById(this.id));
		u.bag.inspecting = this;
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
	}
	
	destroy(){
		document.getElementById(this.id).remove();
		u.bag.drops[this.id] = undefined;
	}
	
}

class Vampiretooth extends Drop{
	constructor(stat, rank, stage = 1){
		super(stat, rank, stage = 1);
		this.stage = stage;
		this.stat = 'stm';
		this.bonus = (this.rank+this.stage)*3;
		this.img = 'url("css/assets/vampiretooth.png")';
	}
}
class Emojieye extends Drop{
	constructor(stat, rank, stage = 1){
		super(stat, rank, stage = 1);
		this.stage = stage;
		this.stat = 'dex';
		this.bonus = (this.rank+this.stage)*3;
		this.img = 'url("css/assets/emojieye.png")';
	}
}



class Shop{
	constructor(){
		this.restock();
	}
	open(){
		domclear(screen);
		new menu(screen, 'shopmenu');
		this.showStock();
		new menu(screen, 'bag');
		document.getElementById('bag').style.backgroundImage = 'url("css/assets/bagShop.png")';
		new menu(screen, 'gold');
		document.getElementById('gold').innerHTML = u.gold;
		u.bag.populateGearSell();
		
	}
	
	showStock(){
		let main = new menu(screen, 'itemmenu');		

		for(let gear of this.stock){
			let item = new menu(main.dom, gear.id, 'gear', function(){shop.buy(gear)}, false);
			item.dom.style.backgroundImage = gear.img;
			item.dom.innerHTML = gear.lvl+':'+gear.rank + '<br>' + gear.lvl*gear.rank*gear.stage*2;
			item.build();
		}
	}
	
	restock(){
		this.stock = [];
		while(this.stock.length < 12){
			this.stock.push(this.craft());
		}			
	}
	
	craft(){
		let lvl = Math.ceil(Math.random()*u.towerIndex+2);
		let rank = Math.ceil(Math.random()*3);
		let list = Object.values(GearList);
		let gear = new list[Math.round(Math.random()*7)](lvl, rank);
		gear.id = 'stock'+this.stock.length;
		return gear; 
	}
	
	sell(item){
		document.getElementById(item.id).remove();
		u.bag.gear[item.id] = undefined;
		if(item.equipted){item.unequipt()};
		item.clear();
		let value = item.lvl*item.rank*item.stage;
		u.gold+=value;
		this.open();
	}
	
	buy(item){
		let value = item.lvl*item.rank*item.stage*2;
		if(u.gold >= value){	
			let i = parseInt(item.id.split('k')[1]);
			document.getElementById(item.id).remove();
			this.stock.splice(i, 1);
			item.id = Object.keys(u.bag.gear).length.toString();
			u.bag.add(item);
			u.gold-=value;
			}
		this.open();
	}
	
}







/* 
u.bag.add(new Helm(1, 2));
u.bag.add(new Armor(1, 2));
u.bag.add(new Legs(1, 2));
u.bag.add(new Sword(1, 2));
u.bag.add(new Spear(1, 2));
u.bag.add(new Axe(1, 2));
u.bag.add(new Dagger(1, 2));
u.bag.add(new Shield(1, 2)); 
u.bag.add(new Ring(1, 2)); */


function launch(){
	new menu(screen, 'title');
	new menu(screen, 'loadGame', '', function(){loadGame()});
	new menu(screen, 'newGame', '', function(){newGame()});
}

function startNew(){
	domclear(screen);
	if(window.localStorage.save){new popup(100, 10, 'HEADS UP! <br> Some data is saved that will be deleted')}
	
	let main = new menu(screen, 'tutorialOpen', '', false);
	
	let yes = new menu(main.dom, 'yes', 'tutorialOption', function(){tutorial()});
	yes.dom.style.backgroundImage = 'url("css/assets/playTutorial.png")';
	
	let no = new menu(main.dom, 'no', 'tutorialOption', function(){newGame()});
	no.dom.style.backgroundImage = 'url("css/assets/skipTutorial.png")';
	
	new menu(screen, 'back', '', function(){domclear(screen);launch()});
}

function checkRestart(){
	let div = new menu(screen, 'deleteSave', 'popup', function(){deleteSave(); newGame()}, false);
	div.dom.innerHTML = 'SAVE DATA DETECTED <br> Delete Data?';
	div.build();
	
	new menu(screen, 'back', '', function(){domclear(screen);launch()});
}

function newGame(){
	domclear(screen);
	if(window.localStorage.save){checkRestart(); return};
	shop = new Shop();
	u.bag.add(new Armor(1, 2));
	u.bag.add(new Sword(1, 2));
	
	u.bag.add(new Drop('str', 1));
	u.mainmenu();
	
	new popup(20, 100, 'long press for help! <br> click me to make me disapear.')
	console.log(window.localStorage);
}

function loadGame(){
	let data = window.localStorage;
	u = new User();
	u.hero.zeroStats();
	shop = new Shop();
	
	if(!data.save){return};
	
	let gears = data.gear.split(':');
	gears.pop();
	
	for(let gear of gears){
		let list = gear.split(',');
		let item = GearList[list[0]];
		u.bag.add(new item(list[1],list[2],list[3]));
	}
	
	let drops = data.drop.split(':');
	drops.pop();
	for(let drop of drops){
		let list = drop.split(',');
		console.log(list);
		u.bag.add(new Drop(list[0], parseInt(list[1]), parseInt(list[2])));
	}
	
	let stats = data.stat.split(':');
	console.log(stats);
	stats.pop();
	for(let stat of stats){
		let list = stat.split(',');
		u.hero.statUp(list[0], parseInt(list[1]));
	}
	
	u.gold = parseInt(data.gold);
	u.towerIndex = parseInt(data.towerIndex);
	
	u.hero.lvl = parseInt(data.lvl);
	u.hero.exp = parseInt(data.exp);
	u.hero.statPoints = parseInt(data.statPoints);
	
	u.mainmenu();
}

function deleteSave(){
	for(let key of Object.keys(window.localStorage)){
		delete window.localStorage[key];
	}
}

function saveGame(){
	let saveData = '';
	for(let equiptGear of Object.values(u.hero.gear)){
		if(equiptGear){equiptGear.unequipt()};
	}
	
	saveData = '';
	for(let gear of Object.values(u.bag.gear)){
		if(!gear){continue};
		let string = gear.constructor.name+','+gear.lvl+','+gear.rank+','+gear.stage+':';
		saveData += string;
	}
	window.localStorage.gear = saveData;
	
	saveData = '';
	for(let drop of Object.values(u.bag.drops)){
		if(!drop){continue};
		let string = drop.stat+','+drop.rank+','+drop.stage+':';
		saveData += string;
	}
	window.localStorage.drop = saveData;
	
	saveData = '';
	let stats = Object.values(u.hero);
	let statnames = Object.keys(u.hero);
	for(let i = 0; i < 7; i++){
		let string = statnames[i]+','+stats[i]+':';
		saveData += string;
	}
	window.localStorage.stat = saveData;
	
	window.localStorage.exp = u.hero.exp;
	window.localStorage.lvl = u.hero.lvl;
	window.localStorage.statPoints = u.hero.statPoints;
	
	
	window.localStorage.gold = u.gold;
	window.localStorage.towerIndex = u.towerIndex;
	window.localStorage.save = true;
	
	new popup(100, 600, 'SAVED GAME!', true);
	
}



let Tutorial = {
	'active': true,
	'towerMenu' : 'click on any of the towers above to start fighting or on the options below to upgrade your character, save your game in the bottom left',
	'charMenu' : 'click any of the gear below to equip it. There are 5 types of gear, Helmets, Armor, Grieves and Onhand and Offhand weapons. hold down on some equipt gear to unequipt it. Click the swap to open up the forge',
	'inspectMenu' : 'tap any of the gear below to see advanced stats, while inspecting you can attach gems to you gear. you can also combind two of the same gear to upgrade it',
	'str': 'press any of the top 6 stats to increase it by one as long as you have the stat points',
	'shopmenu': 'tap anything to buy, or your gear to sell. Equipt gear wont show up here',
	'battleMenu': 'the fights will happen automatically until you clear the floor. pressing any of the attack options will change your damage and attack speed.<br> IT WILL ALSO RESET YOUR ATTACK TIMER',
	'floorMenu': 'dont forget to get your chest! you can also leave the tower or head to the next floor',
	
} 
	
screen.oncontextmenu = function(){event.preventDefault(); new popup(10, 200, Tutorial[screen.childNodes[0].id])};
	


let u = new User();
let shop;
launch();

