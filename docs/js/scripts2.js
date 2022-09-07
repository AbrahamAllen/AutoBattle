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
	
	startTower(lvl){
		domclear(screen);
		this.hero.spawn();
		this.activeTower = new Tower(lvl);
		this.activeTower.makeFloors()
		this.activeFloor = this.activeTower.floors[0];
		setTimeout(function(){u.continueFloor()}, 2000);
	}
	loot(enemy){
		this.hero.exp+=enemy.lvl;
		
		if(Math.random()*100 < this.hero.luck){
			this.bag.add(enemy.lootpool[0]);
		}
	}
	
	kill(enemy){
		p(this.activeFloor.shift());
		p(this.activeFloor);
		
		this.loot(enemy);
		setTimeout(function(){u.continueFloor()}, 2000);
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
		
		let menu = dombuild(screen, 'baseMenu');
		
		let bag = dombuild(menu, 'openBag');
		bag.onclick = function(){u.bag.open(u.hero)};
		
		let next = dombuild(menu, 'nextFloor');
		next.onclick = function(){u.newFloor()};
	}
	
	newFloor(){
		domclear(screen);
		
		p('newFloor');
		this.floorTrack++;
		this.activeFloor = this.activeTower.floors[this.floorTrack];
		if(this.floorTrack > 9){this.endTower()}
		else{this.hero.spawn(); this.activeFloor[0].spawn()};
		
	}
	
	endTower(){
		
	}
	
	equip(i){
		p(this);
		try{
			this.hero.gear[i].dequip(this.hero);
			domclear(document.getElementById(i));
			this.bag.items[this.selItem].equip(this.hero);
			document.getElementById(i).appendChild(document.getElementById(this.selItem))
		}catch{
			this.bag.items[this.selItem].equip(this.hero);
			document.getElementById(i).appendChild(document.getElementById(this.selItem))
		}
	}
	
	
	
}


//creating tower builds 10 floors with 5 enemies per floor
class Tower{
	constructor(lvl){
		this.lvl = lvl;
		this.floors = {};
	}
	
	makeFloors(){
		let i = 0;
		while(i < 10){
			this.floors[i] = [];
			let n = 0;
			while(n < 1){
				this.floors[i].push(new Enemy(this.lvl))
				n++
			}
			i++
		}
	}
	
}

class HealthBar{
	constructor(hp, o){
		this.maxHp = hp;
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
	}
	
	update(hp){
		this.hp = hp;
		if(this.hp < 0){this.hp = 0};
		
		this.track.style.width = ((this.hp/this.maxHp)*100).toString()+'%';
		p(this.track.style.width);
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
		this.def;
		this.atkSpd;
		
		this.stats = [this.hp, this.atk, this.def, this.atkSpd];
		
		
	}
	
	attack(target){
		
		let unit = this;
		//uses attack speed stat to set Interval time of attack, breaks on 0 hp for either side
		this.fight = setInterval(function(){
			
			if(unit.hp > 0 && target.hp > 0){
				p('attack');
				unit.attackanim(); try{unit.damageCalc(target)}catch{target.damage(unit.atk)}};
				
			if(target.hp <= 0){
		
				clearInterval(unit.fight)};
				
		}, unit.atkSpd)
	}
	
	
	damage(amt){
		let total = amt-this.def;
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
		this.exp = 0;
		
		this.hp = 100;
		this.maxHp = 100;
		this.atk = 10;
		this.def = 0;
		this.extraAtk = 3;
		this.extraDef = 3;
		this.atkSpd = 5000;
		
		this.luck = 100;
		
		this.attackType = 'normal';
		
		this.gear = {};
		this.gear['helm'] = undefined;
		this.gear['body'] = undefined;
		this.gear['foot'] = undefined;
	}
	
	spawn(){
		let hero = document.createElement('div');
		hero.className = 'hero';
		screen.appendChild(hero);
		
		this.dom = hero;
		this.healthbar = new HealthBar(this.hp, hero);
	}
	
	attackanim(){
		let unit = this;
		
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},150);
		setTimeout(function(){unit.dom.style.top = '100px'; unit.dom.style.left = '200px'; unit.dom.style.scale = '80%'},300);
		setTimeout(function(){unit.dom.style.top = '200px'; unit.dom.style.left = '100px'; unit.dom.style.scale = '90%'},450);
		setTimeout(function(){unit.dom.style.top = '240px'; unit.dom.style.left = '40px'; unit.dom.style.scale = '100%'},600);
	
	}
	
	damageCalc(target){
		let total = 0;	
		
		switch(this.attackType){
			case 'normal': total = this.atk; break;
			case 'fast': total = this.atk*.8; break;
			case 'slow': total = this.atk*1.2; break;
			case 'attackstance':total = this.atk+this.extraAtk; break;
			case 'defensestance': total = this.def+this.extraDef; break;
			
			
		}
		p(total);
		target.damage(total);
	}
	
	
}


class Enemy extends Character{
	constructor(lvl){
		super();
		
		this.lvl = lvl;
		this.type = 'enemy';
		
		this.hp = lvl*2;
		this.atk = lvl;
		this.def = lvl;
		this.atkSpd = 10000-(lvl*500);
		
		this.lootpool = [new Armor(lvl, 5, 1)];
	}
	spawn(){
		let enemy = document.createElement('div');
		enemy.className = 'enemy';
		screen.appendChild(enemy);
		
		this.dom = enemy;
		this.dom.style.backgroundImage = "url('enemy.png')";
		this.healthbar = new HealthBar(this.hp, enemy);
		
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


//holds loot, tracks max inventory, suplies loot to charmenu
class Bag{
	constructor(){
		this.items = new Object();
		
	}
	spawn(){
		this.dom = document.createElement('div');
		this.dom.id = 'bag';
		screen.appendChild(this.dom);
	}
	
	add(item){
		let i = Object.keys(this.items).length;
		
		this.items[i] = item;
		
		p(this);
	}
	//opens bag dom menu
	open(hero){
		domclear(screen);
		
		let charmenu = dombuild(screen, 'charmenu');
		
		
		
		p(hero);
		for(let x of Object.keys(hero.gear)){
			let div = dombuild(charmenu, x);
			div.innerHTML = x;
			div.onclick = function(){u.equip(this.id)};
		}
		
		
		let bag = document.createElement('div');
		bag.id = 'bag';
		screen.appendChild(bag);
		
		for(let item of Object.keys(this.items)){
			let div = document.createElement('div');
			div.className = 'loot '+this.items[item].type;
			div.id = item;
			div.onclick = function(){u.selItem = this.id};
			bag.appendChild(div);
		}
		
		let next = dombuild(screen, 'nextFloor');
		next.onclick = function(){u.newFloor()};
	}
}



class Loot{
	constructor(lvl){
		
	}
	
}

class Armor extends Loot{
	constructor(lvl, def, rank){
		super(lvl);
		
		this.type = 'armor';
		this.def = def;
	}
	equip(hero){
		hero.def+=this.def;
		this.ability(hero);
			
	}
	dequip(hero){
		hero.def-=this.def;
		this.deability(hero);
	}
	
	ability(hero){
		hero.extraDef+=this.def*2;
	}
	
	deability(hero){
		hero.extraDef-=this.def*2;
	}
}

class Acessory extends Loot{
	constructor(lvl, rank){
		
	}
	
}










function battle(hero, enemy){
	p(enemy);
	hero.attack(enemy);
	enemy.attack(hero);
}

let u = new User();

class TowerSel{
	constructor(lvl){
		
		this.dom = document.createElement('div');
		this.dom.innerHTML = lvl;
		this.dom.className = 'tower';
		this.dom.id = lvl;
		this.dom.onclick = function(){p(u); u.startTower(parseInt(this.id))};
		
		screen.appendChild(this.dom);	
	}
}

new TowerSel(3);





