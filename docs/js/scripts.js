const screen = document.getElementById("screen");


function domclear(div){
	let l = div.childNodes;
	while(l.length > 0){
		l[0].remove();
	}
}
function p(s){
	console.log(s);
}
function makeId(){
	return Math.random()*1000
}
function dombuild(parent, id = '', cls = ''){
	let div = document.createElement('div');
	div.id = id;
	div.className = cls;
	parent.appendChild(div);
	return div;
}


class User{
	constructor(){
		this.hero = new Hero();
		this.bag = new Bag();
		
		this.activeTower = false;
		this.activeFloor = undefined;
		this.floorTrack = 0;
	}
	
	//begin tower and move through tower floors
	
	mainmenu(){
		domclear(screen);
		new menu(screen, this.hero.lvl-1, 'tower', function(){u.startTower(parseInt(this.id))}, false, true);
		new menu(screen, this.hero.lvl, 'tower', function(){u.startTower(parseInt(this.id))}, false, true);
		new menu(screen, this.hero.lvl+1, 'tower', function(){u.startTower(parseInt(this.id))}, false, true);
		
		new menu(screen, 'openBagM', '', function(){u.bag.open()}, false, true);
		new menu(screen, 'openStatsM', '', function(){u.hero.statMenu()}, false, true);
	

	}
	
	startTower(lvl){
		domclear(screen);
		this.hero.spawn();
		this.activeTower = new Tower(lvl);
		
		this.activeTower.makeFloors();
		this.activeFloor = this.activeTower.floors[0];
		
		this.battleMenu(); 
		dombuild(screen, 'fightbg');
		setTimeout(function(){u.continueFloor()}, 500);
	}
	
	battleMenu(){
		
		let battleMenu = new menu(screen, 'battleMenu');
		battleMenu.build();
		new menu(battleMenu.dom, 'fast', 'attackOption', function(){u.hero.changeStance(this.id)}, false, true);
		new menu(battleMenu.dom, 'slow', 'attackOption', function(){u.hero.changeStance(this.id)}, false, true);
		new menu(battleMenu.dom, 'agressive', 'attackOption', function(){u.hero.changeStance(this.id)}, false, true);
		new menu(battleMenu.dom, 'defensive', 'attackOption', function(){u.hero.changeStance(this.id)}, false, true);
		
	}
	
	loot(enemy){
		this.hero.gainExp(enemy.lvl+enemy.rank);
		
		
		if(this.hero.luck+enemy.luck > Math.random()*100){new enemy.loot(enemy.lvl, enemy.rank)}
		else if(this.hero.luck*3 > Math.random()*100){this.hero.potions++};
	}
	
	kill(enemy){
		p(this.activeFloor.shift());
		p(this.activeFloor);
		
		this.loot(enemy);
		setTimeout(function(){u.continueFloor()}, 1000);
	}
		
	continueFloor(){
		try{
			this.activeFloor[0].spawn();
			
		}catch{
			this.floorMenu();
		}
	}
	
	floorMenu(){
		domclear(screen);
		
		let border = dombuild(screen, 'baseMenu');
		
		new menu(border, 'openBag', '', function(){u.bag.open()}, false, true);
		new menu(border, 'openStats', '',  function(){u.hero.statMenu()}, false, true);
		new menu(border, 'leaveTower', '', function(){u.endTower()}, false, true);
		
		
		new menu(screen, 'nextFloor', '', function(){u.newFloor()}, false, true);
		
		
	}
	
	newFloor(){
		domclear(screen);
	if(this.activeTower){	
		this.floorTrack++;
		this.activeFloor = this.activeTower.floors[this.floorTrack];
		if(this.floorTrack > 2){this.endTower()}
		else{this.hero.spawn(); this.battleMenu(); dombuild(screen, 'fightbg'); this.activeFloor[0].spawn()};
	}else{
		this.mainmenu();
	}};
	
	endTower(){
		alert('end tower');
		this.activeTower = false;
		this.activeFloor = false;
		this.mainmenu();
		
	}
	
	
	
}


//creating tower builds 10 floors with 5 enemies per floor


class Tower{
	constructor(lvl){
		this.lvl = lvl;
		if(this.lvl == 0){this.lvl++};
		this.floors = {};
		
		this.enemys = enemyTypes[Math.round(Math.random()*(enemyTypes.length-1))];
	}
	
	makeFloors(){
		let i = 0;
		while(i < 7){
			this.floors[i] = [];
			let n = 0;
			while(n < 5){
				this.floors[i].push(this.selectEnemy(i, n));
				n++
			}
			i++
		}
	}
	
	selectEnemy(floor, spot){
		let pool = 3;
		if(floor > 3){pool+=2};
		if(spot > 2){pool+=1};
		
		let enemy = this.enemys[Math.floor(Math.random()*pool)];
		return new enemy(this.lvl+floor);
		
	}
	
}

class HealthBar{
	constructor(maxhp, hp, o){
		this.maxHp = maxhp;
		this.hp = hp;
		this.par = o;
		this.t = o.className;
		
		this.create();
	}
	
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


class Character{
	constructor(){
		this.hp;
		this.atk;
		this.extraAtk = 0;
		this.def;
		this.extraDef = 0;
		this.atkSpd;
		this.atkSpdMod = 0;
		this.luck = 0;
		
		
		
		
	}
	
	attack(target){
		
		let unit = this;
		//uses attack speed stat to set Interval time of attack, breaks on 0 hp for either side
		this.fight = setInterval(function(){
			
			if(unit.hp > 0 && target.hp > 0){
				unit.attackanim(); try{unit.damageCalc(target)}catch{target.damage(unit.atk)}};
				
			if(target.hp <= 0){
		
				clearInterval(unit.fight)};
				
		}, unit.atkSpd-unit.atkSpdMod)
	}
	
	
	damage(amt){
		let total = amt-this.def;
		if(this.stance == 'defensestance'){total-=this.extraDef};
		if(total < 0){total = 0};
		this.hp-=total;
		this.healthbar.update(this.hp);
		if(this.hp <= 0){this.destroy()}
	}
	
	
}
	
//tracks hero stats and equipt gear
class Hero extends Character{
	constructor(){
		super()
		
		this.type = 'hero';
		this.lvl = 1;
		this.exp = 0;
		this.statPoints = 3;
		
		this.hp = 25;
		this.maxHp = 25;
		this.atk = 5;
		this.def = 0;
		this.extraAtk = 0;
		this.extraDef = 0;
		this.atkSpd = 5000;
		
		this.luck = 7;
		
		this.potions = 1;
		
		this.stance = 'normal';
		
		this.gear = {};
		this.gear['helm'] = undefined;
		this.gear['armor'] = undefined;
		this.gear['legs'] = undefined;
		this.gear['onhand'] = undefined;
		this.gear['offhand'] = undefined;
		
		this.gear['ring1'] = undefined;
		this.gear['ring2'] = undefined;
		this.gear['ring3'] = undefined;
		this.gear['ring4'] = undefined;
		this.gear['ring5'] = undefined;
		this.gear['ring6'] = undefined;
		
		
		
	}
	
	spawn(){
		let hero = document.createElement('div');
		hero.className = 'hero';
		screen.appendChild(hero);
		
		this.dom = hero;
		this.healthbar = new HealthBar(this.maxHp, this.hp, hero);
	}
	
	attackanim(){
		let unit = this;
		
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},150);
		setTimeout(function(){unit.dom.style.top = '100px'; unit.dom.style.left = '200px'; unit.dom.style.scale = '80%'},300);
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},450);
		setTimeout(function(){unit.dom.style.top = '240px'; unit.dom.style.left = '40px'; unit.dom.style.scale = '100%'},600);
	
	}
	
	attackChange(stance){
		if(this.stance == stance){this.stance = 'normal'}
		else{this.stance = stance};
	}
	
	damageCalc(target){
		let total = 0;	
		
		switch(this.stance){
			case 'normal': total = this.atk; break;
			case 'fast': total = this.atk*.6; this.atkSpd = 2000; break;
			case 'slow': total = this.atk*1.5; this.atkSpd = 8000; break;
			case 'agressive':total = this.atk+this.extraAtk; this.atkSpd = 5000; break;
			case 'defensive': total = this.atk; this.atkSpd = 6000; break;
			
			
		}
		target.damage(total);
	}
	
	equipt(item){
	if(item.type != 'ring'){
		try{this.unequipt(item)}catch{};
		item.equipt(this);
		this.gear[item.type] = item;
		document.getElementById(item.type).appendChild(document.getElementById(item.id))
	}else{
		let i = 1;
		while(i < 7){
			let slot = document.getElementById('ring'+i);
			
			p(slot);
			if(slot.childNodes.length > 0){i++}
			else{
					slot.appendChild(document.getElementById(item.id)); 
					item.equipt(this); 
					this.gear[item.type+i] = item;
					return
				}
		}
		
	}
	}
	
	
	
	changeStance(stance){
		if(this.stance == stance){this.stance = 'normal'}else{this.stance = stance};
		
		switch(this.stance){
			 
			 case 'fast' : this.atkSpd = 2000; break;
			 case 'slow' : this.atkSpd = 8000; break;
			 
			 default : this.atkSpd = 5000;
		}
		clearInterval(this.fight);
		this.attack(u.activeFloor[0]);
		
		p(this.atkSpd)
		
	}
	
	unequipt(item){
	try{
		this.gear[item.type].unequipt(this);
		document.getElementById('bag').appendChild(document.getElementById(this.gear[item.type].id));
		this.gear[item.type] = false;
	}
	catch{
		this.gear[item.id].unequipt(this);
		document.getElementById('bag').appendChild(item.childNodes[0]);
		this.gear[item.id] = false;
	}}
	
	
	
	statMenu(){
			domclear(screen);
			let main = dombuild(screen, 'statMenu');
			
			new menu(main, 'attack', 'stat', function(){if(u.hero.addStats()){u.hero.atk++, u.hero.updateStats()}}, false, true);
			new menu(main, 'extraAttack', 'stat', false, false, true);
			new menu(main, 'defense', 'stat', function(){if(u.hero.addStats()){u.hero.def++; u.hero.updateStats()}}, false, true);
			new menu(main, 'extraDefense', 'stat', false, false, true);
			
			new menu(main, 'Luck', 'stat', function(){if(u.hero.addStats()){u.hero.luck++; u.hero.updateStats()}}, false, true);
			new menu(main, 'attackSpeedBonus', 'stat', function(){if(u.hero.addStats()){u.hero.atkSpd++; u.hero.updateStats()}}, false, true);
			
			
			new menu(main, 'Health', 'stat', function(){if(u.hero.addStats()){u.hero.hp++; u.hero.maxHp+=2; u.hero.updateStats()}}, false, true);
			
			new menu(main, 'Points', 'stat', false, false, true);
			new menu(main, 'Potions', 'stat', function(){u.hero.potions--; u.hero.hp+=10;if(u.hero.hp > u.hero.maxHp){u.hero.hp = u.hero.maxHp}; u.hero.updateStats()}, false, true);
			
			new menu(screen, 'Back', '', function(){u.floorMenu()}, false, true);
			
			this.updateStats();
	}	
	
	updateStats(){
		document.getElementById('attack').innerHTML = this.atk+'<br> attack';
		document.getElementById('extraAttack').innerHTML = this.extraAtk+'<br> extra Attack';
		document.getElementById('defense').innerHTML = this.def+'<br> defense';
		document.getElementById('extraDefense').innerHTML = this.extraDef+'<br> extra Defense';
		document.getElementById('attackSpeedBonus').innerHTML = this.atkSpdMod+'<br> attack Speed Bonus';
		document.getElementById('Health').innerHTML = this.hp+"/"+this.maxHp+'<br> Health';
		document.getElementById('Points').innerHTML = this.statPoints+'<br> Points<br>'+this.exp+'/'+this.lvl*15;
		document.getElementById('Luck').innerHTML = this.luck+'<br> Luck';
		document.getElementById('Potions').innerHTML = this.potions+'<br> Health Potions';
	}
	
	addStats(){
		if(this.statPoints > 0){this.statPoints--; return true}else{return false};
	}
	
	gainExp(amt){
		this.exp+=amt;
		if(this.exp > this.lvl*15){this.lvl++; this.exp = 0; this.statPoints++};
		
	}
}


class Enemy extends Character{
	constructor(lvl){
		super();
		
		this.lvl = lvl;
		this.luck = 10;
		this.type = 'enemy';
	}
	spawn(){
		let enemy = document.createElement('div');
		enemy.className = 'enemy';
		screen.appendChild(enemy);
		
		this.dom = enemy;
		this.dom.style.backgroundImage = this.img;
		this.healthbar = new HealthBar(this.hp, this.hp, enemy);
		
		battle(u.hero, this);
	}
	
	attackanim(){
		let unit = this;
		
		setTimeout(function(){unit.dom.style.top = '80px'; unit.dom.style.left = '150px'; unit.dom.style.scale = '110%'},150);
		setTimeout(function(){unit.dom.style.top = '100px'; unit.dom.style.left = '90px'; unit.dom.style.scale = '130%'},300);
		setTimeout(function(){unit.dom.style.top = '80px'; unit.dom.style.left = '150px'; unit.dom.style.scale = '110%'},450);
		setTimeout(function(){unit.dom.style.top = '40px'; unit.dom.style.left = '220px'; unit.dom.style.scale = '100%'},600);
	}
	
	destroy(){
		p('kill');
		let unit = this;
		clearInterval(this.fight);
		u.kill(this);
		setTimeout(function(){unit.dom.style.backgroundImage = "url('dead.png')"}, 500);
		setTimeout(function(){unit.dom.remove()}, 1000);
	}
	
	
}

class Blackbat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('blackBat.png')";
		
		this.hp = lvl*3;
		this.atk = lvl*2;
		this.def = lvl;
		this.atkSpd = 5000-(lvl*750);
		
		this.loot = Ring;
	}
	
}

class Brownbat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('brownBat.png')";
		
		this.hp = lvl*2;
		this.atk = lvl;
		this.def = lvl*2;
		this.atkSpd = 5000-(lvl*500);
		
		this.loot = Ring;
	}
	
}

class Greybat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('greyBat.png')";
		
		this.hp = lvl*2;
		this.atk = lvl*2;
		this.def = lvl;
		this.atkSpd = 5000-(lvl*500);
		
		this.loot = Ring;
	}
	
}

class Pygmybat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('pygmyBat.png')";
		
		this.hp = lvl;
		this.atk = Math.ceil(lvl/2);
		this.def = lvl;
		this.atkSpd = 5000-(lvl*1000);
		
		this.loot = Ring;
	}
	
}

class Vampirebat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('vampireBat.png')";
		
		this.hp = lvl*2;
		this.atk = lvl*3;
		this.def = lvl;
		this.atkSpd = 5000-(lvl*500);
		
		this.loot = Dagger;
	}
	
}

class Largebat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('largeBat.png')";
		
		this.hp = lvl*5;
		this.atk = lvl;
		this.def = lvl*2;
		this.atkSpd = 5000-(lvl*250);
		
		this.loot = Shield;
	}
	
}

class Sonicbat extends Enemy{
	constructor(lvl){
		super(lvl);
		this.img = "url('sonicBat.png')";
		
		this.hp = lvl*3;
		this.atk = lvl*2;
		this.def = lvl*2;
		this.atkSpd = 5000-(lvl*750);
		
		this.loot = Spear;
	}
	
}




class Pygmyface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('pygmyface.png')";
		
		this.hp = lvl;
		this.atk = lvl/2;
		this.def = lvl/2;
		this.atkSpd = 6000-(lvl*500);
		
		this.loot = Ring;
	}
	
}

class Lineface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('lineface.png')";
		
		this.hp = lvl*2;
		this.atk = lvl;
		this.def = lvl;
		this.atkSpd = 6000-(lvl*100);
		
		this.loot = Ring;
	}
	
}

class Tongueface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('tongueface.png')";
		
		this.hp = lvl*2;
		this.atk = lvl*3;
		this.def = lvl/2;
		this.atkSpd = 8000-(lvl*100);
		
		this.loot = Axe;
	}
	
}

class Redeyesface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 1;
		this.img = "url('redeyesface.png')";
		
		this.hp = lvl*2;
		this.atk = lvl*4;
		this.def = lvl/2;
		this.atkSpd = 5000-(lvl*100);
		
		this.loot = Spear;
	}
	
}

class Darkface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('darkface.png')";
		
		this.hp = lvl*2;
		this.atk = lvl*4;
		this.def = lvl/2;
		this.atkSpd = 5000-(lvl*100);
		
		this.loot = Ring;
	}
	
}

class Madface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('madface.png')";
		
		this.hp = lvl*2;
		this.atk = lvl*4;
		this.def = lvl/2;
		this.atkSpd = 5000-(lvl*100);
		
		this.loot = Ring;
	}
	
}

class Fangface extends Enemy{
	constructor(lvl){
		super(lvl);
		this.rank = 2;
		this.img = "url('fangface.png')";
		
		this.hp = lvl*2;
		this.atk = lvl*4;
		this.def = lvl/2;
		this.atkSpd = 5000-(lvl*100);
		
		this.loot = Ring;
	}
	
}














function battle(hero, enemy){
	hero.attack(enemy);
	enemy.attack(hero);
}






class menu{
	constructor(parent, id, className = 'menu', onclick = false, onhover = false, build = false){
		this.dom = document.createElement('div');
		this.dom.id = id;
		this.dom.className = className;
		
		this.onclick = onclick;
		this.onhover = onhover;
		
		this.parent = parent;
		
		if(build){this.build()};
	}
	
	build(){
		if(this.onclick){this.dom.onclick = this.onclick};
		if(this.onhover){this.dom.onmouseover = this.onhover};
		
		this.parent.appendChild(this.dom);
	}
}

class popup{
	constructor(data,x, y){
		this.dom = document.createElement('div');
		this.dom.className = 'popup';
		this.dom.position = 'absolute';
		this.dom.x = x;
		this.dom.y = y;
		
		this.dom.innerHTML = data;
		screen.appendChild(this.dom);
	}
	destroy(){
		this.dom.remove();
	}
}






class Bag{
	constructor(){
		this.items = {};
		
		
	}
	
	add(item){
		this.items[item.id] = item;
	}
	
	populateBag(parent){
		
		for(let gear of Object.keys(this.items)){
			p(gear);
			let item = new menu(parent, gear, 'gear', function(){u.hero.equipt(u.bag.items[this.id])});
			item.dom.style.backgroundImage = "url('"+this.items[gear].img+".png')"
			item.build();
		}
	}
	
	open(){
		domclear(screen);
		let main = new menu(screen, 'charmenu',);
		main.build();
		
		let bag = new menu(screen, 'bag');
		bag.build();
		
		this.populateBag(bag.dom);
		
		for(let slot of Object.keys(u.hero.gear)){
			p(slot);
			let div = new menu(main.dom, slot, 'equiptSlot');
			
			if(slot.includes('ring')){div.dom.oncontextmenu = function(){event.preventDefault(); u.hero.unequipt(this)};
			}else{div.dom.oncontextmenu = function(){event.preventDefault(); u.hero.unequipt(u.hero.gear[slot])}};
			div.build();
			if(u.hero.gear[slot]){p(u.hero.gear[slot].id); document.getElementById('armor'); div.dom.appendChild(document.getElementById(u.hero.gear[slot].id))};
		}
		
		
		
		
			
		new menu(screen, 'Back', '', function(){u.floorMenu()}, false, true);
	}
}

class Loot{
	constructor(lvl, rank){
		this.lvl = lvl;
		this.rank = rank;
	
		
		this.id = Object.keys(u.bag.items).length;
		
		u.bag.add(this);
	}
	
	equipt(hero){
		hero.atk += this.atk;
		hero.def += this.def;
		hero.extraAtk += this.extraAtk;
		hero.extraDef += this.extraDef;
		hero.atkSpdMod += this.atkSpdMod;
	}
	
	unequipt(hero){
		hero.atk -= this.atk;
		hero.def -= this.def;
		hero.extraAtk -= this.extraAtk;
		hero.extraDef -= this.extraDef;
		hero.atkSpdMod -= this.atkSpdMod;
	}
	
}
	
class Helm extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type = 'helm';
		this.img = 'helm';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = this.stat;
		this.atk = this.stat/2;
		
		this.extraDef = this.stat;
		this.extraAtk = 0;
		
		this.atkSpdMod = 0;
	}
	
}

class Armor extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type = 'armor';
		this.img = 'armor';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = this.stat*2;
		this.atk = 0;
		
		this.extraDef = this.stat*3;
		this.extraAtk = 0;
		
		this.atkSpdMod = 0;
	}
	
}

class Legs extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type = 'legs';
		this.img = 'legs';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = this.stat;
		this.atk = this.stat;
		
		this.extraDef = 0;
		this.extraAtk = 0;
		
		this.atkSpdMod = 0;
	}
	
}

class Sword extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type = 'onhand';
		this.img = 'sword';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = 0;
		this.atk = this.stat;
		
		this.extraDef = 0;
		this.extraAtk = this.stat*2;
		
		this.atkSpdMod = this.stat*10;
	}
	
}

class Spear extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type = 'onhand';
			this.img = 'spear';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = 0;
		this.atk = Math.ceil(this.stat*1.5);
		
		this.extraDef = 0;
		this.extraAtk = this.stat;
		
		this.atkSpdMod = this.stat*50;
	}
	
}
class Axe extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type='onhand';
		this.img = 'axe';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = this.stat/2;
		this.atk = this.stat*2;
		
		this.extraDef = 0;
		this.extraAtk = this.stat*2;
		
		this.atkSpdMod = 0;
	}
	
}

class Dagger extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type = 'offhand';
		this.img = 'dagger';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = 0;
		this.atk = Math.ceil(this.stat*.75);
		
		this.extraDef = 0;
		this.extraAtk = this.stat/2;
		
		this.atkSpdMod = this.stat*100;
	}
	
}


class Shield extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type = 'offhand';
		this.img = 'shield';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = this.stat*2;
		this.atk = 0;
		
		this.extraDef = this.stat*2;
		this.extraAtk = 0;
		
		this.atkSpdMod = 0;
	}
	
}

class Ring extends Loot{
	constructor(lvl, rank){
		super(lvl, rank);
		this.type = 'ring';
		this.img = 'ring';
		
		this.stat = (this.lvl+this.rank)*2; 
		
		this.def = this.stat;
		this.atk = this.stat;
		
		this.extraDef = this.stat;
		this.extraAtk = this.stat;
		
		this.atkSpdMod = this.stat;
	}
	
}






let bats = [Pygmybat, Greybat, Brownbat, Blackbat, Largebat, Sonicbat, Vampirebat];
let faces = [Pygmyface, Lineface, Tongueface, Redeyesface, Fangface, Madface, Darkface];

let enemyTypes = [bats, faces];




let u = new User();

u.mainmenu();
p(u);	



u.bag.add(new Sword(1, 2));

u.bag.add(new Ring(2, 1));

	
	
	
	
	
	
	
	
	
	