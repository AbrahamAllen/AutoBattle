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
		this.floorTrack = 1;
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
		p(this.activeTower);
		
		this.chest = true;
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
		
		
		let stairs = dombuild(screen, 'stairs');
		if(this.chest){this.chest = new menu(screen, 'chest', '', function(){u.bag.add(new Helm(u.floorTrack+u.activeTower.lvl)); u.chest = false; this.remove()},false, true)};
		stairs.innerHTML = this.floorTrack+1+'<br>floor';
		
		let border = dombuild(screen, 'baseMenu');
		
		new menu(border, 'openBag', '', function(){u.bag.open()}, false, true);
		new menu(border, 'openStats', '',  function(){u.hero.statMenu()}, false, true);
		new menu(border, 'leaveTower', '', function(){u.endTower()}, false, true);
		new menu(border, 'openItemMenu', '', function(){u.bag.itemMenu()}, false, true);
		
		
		new menu(screen, 'nextFloor', '', function(){u.newFloor()}, false, true);
		
		
	}
	
	newFloor(){
		domclear(screen);
		if(this.activeTower){
			this.chest = true;
			this.floorTrack++;
			this.activeFloor = this.activeTower.floors[this.floorTrack];
			if(this.floorTrack > 10){this.endTower()}
			else{this.hero.spawn(); this.battleMenu(); dombuild(screen, 'fightbg'); this.activeFloor[0].spawn()};
		}else{
			this.mainmenu();
		}
	};
	
	endTower(){
		this.activeTower = false;
		this.activeFloor = false;
		this.floorTrack = 1;
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
		while(i < 10){
			this.floors[i] = [];
			let n = 0;
			while(n < 3){
				this.floors[i].push(this.selectEnemy(i, n));
				n++
			}
			i++
		}
		this.floors[10] = [new this.enemys[this.enemys.length-1](this.lvl+5)];
	}
	
	selectEnemy(floor, spot){
		let pool = 3;
		if(floor > 3){pool+=2};
		if(spot > 2){pool+=1};
		
		let enemy = this.enemys[Math.floor(Math.random()*pool)];
		if(spot == 4){floor++};
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
		this.str;
		this.dex;
		this.tof;
		this.agl;
		this.stm;
		this.tec;
		
		this.gatk;
		this.gdef;
		
		this.atk;
		this.def;
		this.maxhp;
		this.hp;
		
		this.atkSpd;
		
		this.luck;
		
		this.potions;
		
		
		
		
	}
	
	attack(target){
		let speed = this.atkSpd;
		let unit = this;
		speed -= unit.stm;
		if(speed < 1000){speed = 1000};
		//uses attack speed stat to set Interval time of attack, breaks on 0 hp for either side
		this.fight = setInterval(function(){
			
			if(unit.hp > 0 && target.hp > 0){
				unit.attackanim(); target.damage(unit)};
				
			if(target.hp <= 0){
		
				clearInterval(unit.fight)};
				
		}, speed)
	}
	
	
	damage(enemy){
		let total = enemy.atk;
		total-= this.def;
		p(this.def);
		total+=enemy.tec;
		
		if(this.stance == 'defensive'){total-=this.def};
		if(total < 0){total = 0};
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
	
//tracks hero stats and equipt gear
class Hero extends Character{
	constructor(){
		super()
		
		this.type = 'hero';
		this.lvl = 1;
		this.exp = 0;
		this.statPoints = 3;
		
		this.str = 5;
		this.dex = 5;
		this.tof = 3;
		this.agl = 5;
		this.stm = 10;
		this.tec = 1;
		
		this.gatk = 0;
		this.gdef = 0;
		
		
		
		this.atk;
		this.def;
		this.maxhp;
		this.hp;
		
		this.atkSpd = 4000;
		
		this.setStats();
		this.hp=this.maxhp;
		
		this.luck = 7;
		
		this.potions = 1;
		
		this.stance = 'normal';
		
		this.gear = {};
		this.gear['Helm'] = undefined;
		this.gear['Armor'] = undefined;
		this.gear['Legs'] = undefined;
		this.gear['Onhand'] = undefined;
		this.gear['Offhand'] = undefined;
		
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
		this.healthbar = new HealthBar(this.maxhp, this.hp, hero);
	}
	
	attackanim(){
		let unit = this;
		
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},150);
		setTimeout(function(){unit.dom.style.top = '100px'; unit.dom.style.left = '200px'; unit.dom.style.scale = '80%'},300);
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},450);
		setTimeout(function(){unit.dom.style.top = '240px'; unit.dom.style.left = '40px'; unit.dom.style.scale = '100%'},600);
	
	}
	
	attackChange(stance){
		p(true)
		
		if(this.stance == stance){this.stance = 'normal'}
		else{this.stance = stance};
		switch(stance){
			case 'fast': this.atkSpd = 3000-(this.agl*50); this.atk = Math.ceil(this.gatk+this.lvl);break;
			case 'agressive': this.atkSpd = 5000-(this.agl*30);this.atk = Math.ceil((this.gatk*2)+(this.str)+(this.dex));break;
			case 'defensive': this.atkSpd = 4000-(this.agl*10);this.atk = Math.ceil((this.str)+(this.dex/2));break;
			case 'normal': this.atkSpd = 4000-(this.agl*20);this.atk = Math.ceil((this.gatk)+(this.str)+(this.dex/2));break;
		}
		 
	}
	
	
	equipt(item){
		if(item.constructor.name != 'Ring'){
			try{this.unequipt(item)}catch{};
			item.equipt(this);
			this.gear[item.constructor.name] = item;
			document.getElementById(item.constructor.name).appendChild(document.getElementById(item.id))
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
	
	statUp(stat, item){
		p(stat);
		
		switch(stat){
			case 'str' : this.str += item.str; break;
			case 'dex' : this.dex += item.dex; break;
			case 'tof' : this.tof += item.tof; break;
			case 'agl' : this.agl += item.agl; break;
			case 'stm' : this.stm += item.stm; break;
			case 'tec' : this.tec += item.tec; break;
			case 'gatk' : this.gatk += item.gatk; break;
			case 'gdef' : this.gdef += item.gdef; break;
		}
	}
	
	statDown(stat, item){
		p(stat);
		
		switch(stat){
			case 'str' : this.str -= item.str; break;
			case 'dex' : this.dex -= item.dex; break;
			case 'tof' : this.tof -= item.tof; break;
			case 'agl' : this.agl -= item.agl; break;
			case 'stm' : this.stm -= item.stm; break;
			case 'tec' : this.tec -= item.tec; break;
			case 'gatk' : this.gatk -= item.gatk; break;
			case 'gdef' : this.gdef -= item.gdef; break;
		}
	}
	
	loseBonusStats(stat, item){
		p(stat);
	}
	
	
	
	changeStance(stance){
		
		if(this.stance != 'normal'){document.getElementById(this.stance).className = 'attackOption'};
		if(this.stance == stance){this.stance = 'normal'}else{this.stance = stance};
		
		
		
		switch(this.stance){
			 
			 case 'fast' : this.atkSpd = 2000; break;
			 case 'slow' : this.atkSpd = 8000; break;
			 
			 default : this.atkSpd = 5000;
		}
		
		//maybe bug here?
		clearInterval(this.fight);
		this.attack(u.activeFloor[0]);
		
		p(this.stance);
		document.getElementById(this.stance).classList.add('selectedAttack');
		
		
	}
	
	unequipt(item){
	try{
		this.gear[item.constructor.name].unequipt(this);
		document.getElementById('bag').appendChild(document.getElementById(this.gear[item.constructor.name].id));
		this.gear[item.constructor.name] = false;
	}
	catch{
		this.gear[item.id].unequipt(this);
		document.getElementById('bag').appendChild(item.childNodes[0]);
		this.gear[item.id] = false;
	}}
	
	
	
	statMenu(){
			domclear(screen);
			let main = dombuild(screen, 'statMenu');
			
			new menu(main, 'str', 'stat', function(){if(u.hero.addStats()){u.hero.str++; u.hero.updateStats()}},false, true);
			new menu(main, 'dex', 'stat', function(){if(u.hero.addStats()){u.hero.dex++; u.hero.updateStats()}},false, true);
			new menu(main, 'tof', 'stat', function(){if(u.hero.addStats()){u.hero.tof++; u.hero.updateStats()}},false, true);
			new menu(main, 'agl', 'stat', function(){if(u.hero.addStats()){u.hero.agl++; u.hero.updateStats()}},false, true);
			new menu(main, 'stm', 'stat', function(){if(u.hero.addStats()){u.hero.stm++; u.hero.updateStats()}},false, true);
			new menu(main, 'tec', 'stat', function(){if(u.hero.addStats()){u.hero.tec++; u.hero.updateStats()}},false, true);
			
			
			new menu(main, 'attack', 'stat', false, false, true);
			new menu(main, 'gearattack', 'stat', false, false, true);
			new menu(main, 'Potions', 'stat', function(){u.hero.potions--; u.hero.hp+=10;if(u.hero.hp > u.hero.maxhp){u.hero.hp = u.hero.maxhp}; u.hero.updateStats()}, false, true);
			new menu(main, 'defense', 'stat', false, false, true);
			new menu(main, 'geardefense', 'stat', false, false, true);
			
			
			
			new menu(main, 'Health', 'stat', false, false, true);
			
			new menu(main, 'Points', 'stat', false, false, true);
			
			new menu(main, 'Level', 'stat', false, false, true);
			new menu(main, 'Luck', 'stat', function(){if(u.hero.addStats()){u.hero.luck++; u.hero.updateStats()}}, false, true);
			
			new menu(screen, 'Back', '', function(){u.floorMenu()}, false, true);
			
			this.updateStats();
	}	
	
	updateStats(){
		this.setStats();
		document.getElementById('str').innerHTML = this.str+'<br> strength';
		document.getElementById('dex').innerHTML = this.dex+'<br> dexterity';
		document.getElementById('tof').innerHTML = this.tof+'<br> toughness';
		document.getElementById('agl').innerHTML = this.agl+'<br> agility';
		document.getElementById('stm').innerHTML = this.stm+'<br> stamina';
		document.getElementById('tec').innerHTML = this.tec+'<br> technique';
		
		document.getElementById('attack').innerHTML = this.atk+'<br> attack';
		document.getElementById('gearattack').innerHTML = this.gatk+'<br> gear attack';
		document.getElementById('defense').innerHTML = this.def+'<br> defense';
		document.getElementById('geardefense').innerHTML = this.gdef+'<br> gear defense';
		document.getElementById('Health').innerHTML = this.hp+"/"+this.maxhp+'<br> Health';
		document.getElementById('Points').innerHTML = this.statPoints+'<br> Points<br>'+this.exp+'/'+this.lvl*15;
		document.getElementById('Luck').innerHTML = this.luck+'<br> Luck';
		document.getElementById('Potions').innerHTML = this.potions+'<br> Health Potions';
		document.getElementById('Level').innerHTML = this.lvl+'<br> Level';
	}
	
	addStats(){
		if(this.statPoints > 0){this.statPoints--; return true}else{return false};
	}
	
	gainExp(amt){
		this.exp+=amt;
		if(this.exp > this.lvl*15){this.lvl++; this.exp = 0; this.statPoints+=3};
		
	}
}


class Enemy extends Character{
	constructor(lvl){
		super();
		
		this.lvl = lvl;
		this.luck = 40;
		this.type = 'enemy';
		this.gatk = 0;
		this.gdef = 0;
		this.tec = 0;
	}
	spawn(){
		let enemy = document.createElement('div');
		enemy.className = 'enemy';
		screen.appendChild(enemy);
		
		this.dom = enemy;
		this.dom.style.backgroundImage = this.img;
		this.healthbar = new HealthBar(this.maxhp, this.hp, enemy);
		
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
		this.drops = {};
		
	}
	
	add(item){
		this.items[item.id] = item;
	}
	
	gain(part){
		this.drops[part.id] = part;
	}
	
	populateBag(parent){
		domclear(document.getElementById('bag'));
		for(let gear of Object.keys(this.items)){
			p(gear);
			let item = new menu(parent, gear, 'gear', function(){u.hero.equipt(u.bag.items[this.id])});
			item.dom.style.backgroundImage = "url('"+this.items[gear].img+".png')";
			item.dom.innerHTML = '<br>'+this.items[gear].constructor.name;
			item.build();
		}
	}
	
	populateBagB(parent){
		let bag = document.getElementById('bag');
		domclear(bag);
		for(let gear of Object.keys(this.items)){
			p(gear);
			let item = new menu(parent, gear, 'gear', function(){u.bag.inspect(u.bag.items[this.id])});
			item.dom.style.backgroundImage = "url('"+this.items[gear].img+".png')";
			item.dom.innerHTML = '<br>'+this.items[gear].id;
			item.build();
		}
		
		new menu(bag, 'Parts', '', function(){u.bag.populateBagC(bag)}, false, true);
	}
	
	populateBagC(parent){
		let bag = document.getElementById('bag');
		domclear(bag);
		for(let gear of Object.keys(this.drops)){
			p(gear);
			let item = new menu(parent, gear, 'gear', function(){u.hero.inspecting.attatch(u.bag.drops[gear])});
			item.dom.style.backgroundColor = 'grey';
			item.dom.innerHTML = '<br>'+this.drops[gear].constructor.name;
			item.build();
		}
		
		
		new menu(bag, 'Parts', '', function(){u.bag.populateBagB(bag)}, false, true);
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
	
	itemMenu(){
		domclear(screen);
		let main = new menu(screen, 'itemMenu');
		main.build();
		
		let bag = new menu(screen, 'bag');
		bag.build();
		this.populateBagB(bag.dom);
		
		
		new menu(main.dom, 'inspectItem', '', false, false, true);
		new menu(main.dom, 'itemStats', '', false, false, true);
		new menu(main.dom, 'itemSlot', '', false, false, true);
		
		
		
		
		new menu(screen, 'Back', '', function(){u.floorMenu()}, false, true);
		
	}
	
	inspect(item){
		u.hero.inspecting = item;
		let main = document.getElementById('inspectItem');
		if(main.childNodes.length > 0){document.getElementById('bag').appendChild(main.childNodes[0])};
		if(item.attatchment){document.getElementById('itemSlot').appendChild(document.getElementById(item.attatchment.id))};
		main.appendChild(document.getElementById(item.id));
		document.getElementById('itemStats').innerHTML = item.constructor.name;
		
		let stats = Object.keys(item);
		let num = Object.values(item);
		
		for(let i = 0; i < stats.length; i++){
			document.getElementById('itemStats').innerHTML+= stats[i];
			document.getElementById('itemStats').innerHTML+= ' : ';
			document.getElementById('itemStats').innerHTML+= num[i];
			document.getElementById('itemStats').innerHTML+= '<br>';
		}
		
	}
}

/* class Loot{
	constructor(lvl, rank){
		this.lvl = lvl;
		this.rank = rank;
		
		this.statUp = new Object();
	
		
		this.id = Object.keys(u.bag.items).length;
		
		u.bag.add(this);
	}
	
	equipt(hero){
		hero.gatk += this.atk;
		hero.gdef += this.def;
		hero.bonusStats(this.statUp);
	}
	
	unequipt(hero){
		hero.atk -= this.atk;
		hero.def -= this.def;
		hero.loseBonusStats(this.statUp);
	}
	
	getStats(){
		p(Object.values(this));

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

 */

class Gear{
	constructor(lvl){
		this.id = Object.keys(u.bag.items).length;
	}
	
	equipt(hero){
		let hstat = Object.keys(hero);
		let gstat = Object.keys(this);
		p(hstat);
		p(gstat);
		for(let i of hstat){
			if(gstat.includes(i)){
				hero.statUp(i, this);
			}
		}
	}
	
	unequipt(hero){
		let hstat = Object.keys(hero);
		let gstat = Object.keys(this);
		p(hstat);
		p(gstat);
		for(let i of hstat){
			if(gstat.includes(i)){
				hero.statDown(i, this);
			}
		}
	}
	
	attatch(part){
		if(this.attatchment){this.detatch()};
			this.attatchment = part;
	}
}


class Helm extends Gear{
	constructor(lvl){
		super(lvl);
		
		this.img = 'helm';
		this.rank = Math.ceil(Math.random()*5);
		this.gdef = this.rank*lvl;
		this.gatk = this.rank+2;
		this.slots = Math.ceil(this.rank/(Math.random()*5))+1;
		
	}

}

class Armor extends Gear{
	constructor(lvl){
		super(lvl);
		
		this.img = 'armor';
		this.rank = Math.ceil(Math.random()*5);
		this.gdef = this.rank*lvl*2;
		this.slots = Math.ceil(this.rank/(Math.random()*5))+1;
		
	}

}

class Legs extends Gear{
	constructor(lvl){
		super(lvl);
		
		this.img = 'legs';
		this.rank = Math.ceil(Math.random()*5);
		this.gdef = lvl*Math.ceil(this.rank/2);
		this.gatk = Math.floor(lvl/2+this.rank);
		this.slots = Math.round(this.rank/(Math.random()*5))+1;
		
	}

}




class Batloot{
	constructor(rank){
		this.rank = rank;
		this.id = Object.keys(u.bag.drops).length;
	}
}



let bats = [Pygmybat, Greybat, Brownbat, Blackbat, Largebat, Sonicbat, Vampirebat];
let faces = [Pygmyface, Lineface, Tongueface, Redeyesface, Fangface, Madface, Darkface];

let enemyTypes = [bats];




let u = new User();

u.mainmenu();
p(Object.keys(u));	



u.bag.add(new Armor(1));

u.bag.add(new Helm(2));

u.bag.gain(new Batloot(3));
	
	

	
	
	
	
	
	