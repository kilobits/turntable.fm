// Copyright 2011 Vineet Kumar

var bac = 0; 
var isOut = false;
var theTheme = 'Dubstep/Electro';
var blabber = true;
var auto = false;
var placeholder;
var autobop = 0;
var waskicked = false;
var waskicked2 = false;
var songLimit = 0;
var usersList = { };
var stagedive = false;
var imports = {
	repl: require('repl'),
	ttapi: require('ttapi'),
	conf: require('node-config'),
	banlist: require('./banlist'),
	djlist: require('./djlist'),
	Store: require('./store').Store,
	stats: require('./stats'),
	rsp: require('./response')
};
Bot = function(configName) {
	this.ttapi = null;
	this.configName = configName || process.argv[2] || Bot.usage();
	this.config = {};
	this.logChats = false;
	this.commandHandlers = {};	
	this.modCommandHandlers = {};
	this.ownerCommandHandlers = {};
	this.moreCommandHandlers = {};
	this.funCommandHandlers = {};
	this.queueCommandHandlers = {};
	this.qmodCommandHandlers = {};
	this.greetCommandHandlers = {};
	this.drunkCommandHandlers = {};
	this.users = {};
	this.useridsByName = {};
	this.userNamesById = {};
	this.activity = {};
	this.djs = {};
	/** @type SongStats */
	this.currentSong = null;
	this.pendingGreetings = {};
	this.greetings = {};
	this.activity = {};
	this.djList = new imports.djlist.DjList();
	this.banList = null;
};

Bot.usage = function() {
	throw "Usage: node " + process.argv[1] + " <config name>";
};

Bot.prototype.onInitConfig = function(cb, err) {
	if (err) { throw err; }
	this.config = imports.conf;
	if (!this.config.noRepl) {
		var replContext = imports.repl.start(this.configName + "> ").context;
		replContext.bot = this;
		replContext.imports = imports;
	}
	this.debug = this.config.debug;
	this.mute = this.config.mute;
	this.readGreetings();
	this.readActivity();
	this.readUsernames();
	this.ttapi = new imports.ttapi(this.config.auth, this.config.userid, this.config.roomid);
	this.bindHandlers();
	if (cb) { cb(); }
};

Bot.prototype.start = function(cb) {
	imports.conf.initConfig(this.onInitConfig.bind(this, cb), this.configName);
};

Bot.prototype.bindHandlers = function() {
	this.ttapi.on('speak', this.onSpeak.bind(this));
	this.ttapi.on('registered', this.onRegistered.bind(this));
	this.ttapi.on('new_moderator', this.onNewModerator.bind(this));
	this.ttapi.on('roomChanged', this.onRoomInfo.bind(this));
	this.ttapi.on('roomChanged', this.initDjList.bind(this));
	this.ttapi.on('roomChanged', this.initBanList.bind(this));
	this.ttapi.on('deregistered', this.onDeregister.bind(this));
	this.ttapi.on('add_dj', this.onAddDj.bind(this));
	this.ttapi.on('rem_dj', this.onRemDj.bind(this));
	this.ttapi.on('newsong', this.onNewSong.bind(this));
	this.ttapi.on('nosong', this.onNoSong.bind(this));
	this.ttapi.on('update_votes', this.onUpdateVotes.bind(this));
	/* User Commands */
	this.commandHandlers['help'] = this.onHelp.bind(this);
	this.commandHandlers['commands'] = this.onAllCommands.bind(this);
	this.commandHandlers['theme'] = this.onGetTheme.bind(this);
	this.commandHandlers['queue'] = this.onQueueCommands.bind(this);
	this.commandHandlers['plays'] = this.onPlays.bind(this);
	this.commandHandlers['songlimit'] = this.onLimit.bind(this);
	this.commandHandlers['fun'] = this.onFunCommands.bind(this);
	this.commandHandlers['drunk'] = this.onDrunkCommands.bind(this);
	this.commandHandlers['modstuff'] = this.onHelpModCommands.bind(this);
	this.commandHandlers['bop'] = this.onBonus.bind(this);
	this.commandHandlers['fanme'] = this.onFan.bind(this);
	this.commandHandlers['stagedive'] = this.onstageDive.bind(this)
	this.commandHandlers['more'] = this.onMoreCommands.bind(this);
	this.moreCommandHandlers['cmd'] = this.onAllCommands.bind(this);
	this.moreCommandHandlers['cmds'] = this.onAllCommands.bind(this);
	this.moreCommandHandlers['unfanme'] = this.onUnfan.bind(this);
	this.moreCommandHandlers['album'] = this.onAlbum.bind(this);
	this.moreCommandHandlers['last'] = this.onLast.bind(this);
	this.queueCommandHandlers['list'] = this.onList.bind(this);
	this.queueCommandHandlers['addme'] = this.onAddme.bind(this);
	this.queueCommandHandlers['removeme'] = this.onRemoveme.bind(this);
	this.funCommandHandlers['kiss'] = this.onKiss.bind(this);
	this.funCommandHandlers['booze'] = this.onBooze.bind(this);
	this.funCommandHandlers['moo'] = this.onMoo.bind(this);
	this.funCommandHandlers['love'] = this.onLove.bind(this);
	this.funCommandHandlers['hug'] = this.onHug.bind(this);
	this.funCommandHandlers['grope'] = this.onGrope.bind(this);
	this.funCommandHandlers['smack'] = this.onSmack.bind(this);
	this.drunkCommandHandlers['drink'] = this.onDrink.bind(this);
	this.drunkCommandHandlers['shot'] = this.onShot.bind(this);
	/* Mod Commands */
	this.modCommandHandlers['qmods'] = this.onQModCommands.bind(this);
	this.modCommandHandlers['greetings'] = this.onGreetCommands.bind(this);
	this.modCommandHandlers['settheme'] = this.onSetTheme.bind(this);
	this.modCommandHandlers['ban'] = this.onBan.bind(this);
	this.modCommandHandlers['unban'] = this.onUnban.bind(this);
	this.modCommandHandlers['bans'] = this.onBans.bind(this);
	this.modCommandHandlers['banned'] = this.onBanned.bind(this);
	this.modCommandHandlers['greet'] = this.onGreet.bind(this);
	this.modCommandHandlers['maul'] = this.onMaul.bind(this);
	this.modCommandHandlers['autobop'] = this.onAutoBop.bind(this);
	this.modCommandHandlers['limit'] = this.onSongLimit.bind(this);
	this.qmodCommandHandlers['list-on'] = this.onListOn.bind(this);
	this.qmodCommandHandlers['list-off'] = this.onListOff.bind(this);
	this.qmodCommandHandlers['list-reset'] = this.onListReset.bind(this);
	this.qmodCommandHandlers['add-first'] = this.onAddFirst.bind(this);
	this.qmodCommandHandlers['remove'] = this.onRemove.bind(this);
	this.qmodCommandHandlers['remove-first'] = this.onRemoveFirst.bind(this);
	this.greetCommandHandlers['approve-greeting'] = this.onApproveGreeting.bind(this);
	this.greetCommandHandlers['show-greeting'] = this.onShowGreeting.bind(this);
	this.greetCommandHandlers['reject-greeting'] = this.onRejectGreeting.bind(this);
	this.greetCommandHandlers['pending-greetings'] = this.onPendingGreetings.bind(this);
	/* Owner Commands */
	this.ownerCommandHandlers['firedrill'] = this.onDrill.bind(this);
	this.ownerCommandHandlers['go'] = this.onGo.bind(this);
	this.ownerCommandHandlers['newname'] = this.onNewName.bind(this);
	this.ownerCommandHandlers['blab'] = this.onBlab.bind(this);
	this.ownerCommandHandlers['autome'] = this.onAuto.bind(this);

};

Bot.prototype.readGreetings = function() {
	imports.Store.read(this.config.greetings_filename, function(data) {
		this.greetings = data;
		console.log('loaded %d greetings', Object.keys(this.greetings).length);
	}.bind(this));
};

Bot.prototype.readActivity = function() {
	imports.Store.read(this.config.activity_filename, function(data) {
		this.activity = data;
		console.log('loaded %d activity records', Object.keys(this.activity).length);
	}.bind(this));
};

Bot.prototype.writeActivity = function() {
	if (this.config.activity_filename) {
		imports.Store.write(this.config.activity_filename, this.activity,
			console.log.bind(this, 'Activity data saved to %s', this.config.activity_filename));
	}
};

Bot.prototype.writeGreetings = function() {
	imports.Store.write(this.config.greetings_filename, this.greetings,
		console.log.bind(this, 'saved %d greetings to %s',
		       	Object.keys(this.greetings).length, this.config.greetings_filename));
};

Bot.prototype.writePendingGreetings = function() {
	imports.Store.write(this.config.pending_greetings_filename, this.pendingGreetings,
		console.log.bind(this, 'saved %d pending greetings to %s',
		       	Object.keys(this.pendingGreetings).length, this.config.pending_greetings_filename));
};


Bot.prototype.readUsernames = function() {
	imports.Store.read(this.config.usernames_filename, function(data) {
		this.usernamesById = data;
		for (var userid in this.usernamesById) {
			this.useridsByName[this.usernamesById[userid]] = userid;
		}
		console.log('loaded %d usernames', Object.keys(this.usernamesById).length);
	}.bind(this));
};

Bot.prototype.writeUsernames = function() {
	if (this.config.usernames_filename) {
		imports.Store.write(this.config.usernames_filename, this.usernamesById,
			console.log.bind(this, 'Username map saved to %s', this.config.usernames_filename));
	}
};

/**
  * @param {{name: string, userid: string, text: string}} data return by ttapi
  */
Bot.prototype.onSpeak = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	if (this.logChats) {
		console.log('chat: %s: %s', data.name, data.text);
	}
	this.recordActivity(data.userid);
        var words = data.text.split(/\s+/);
        var command = words[0].toLowerCase();
        if (command.match(/^[*\/]/)) {
                command = command.substring(1);
        } else if (Bot.bareCommands.indexOf(data.text) === -1) { // bare commands must match the entire text line
                return;
        }

	var handler = null;
	if (this.roomInfo.room.metadata.moderator_id.indexOf(data.userid) !== -1) {
		handler = handler || this.modCommandHandlers[command] || this.qmodCommandHandlers[command] || this.greetCommandHandlers[command];
		}
	if (Bot.theOwners.indexOf(data.userid) !== -1) {
		handler = handler || this.ownerCommandHandlers[command];
	}
	handler = handler || this.commandHandlers[command] || this.funCommandHandlers[command] || this.drunkCommandHandlers[command] || this.moreCommandHandlers[command] || this.queueCommandHandlers[command];
	if (handler) {
		handler.call(this, data.text, data.userid, data.name);
	}
};

Bot.prototype.onHelp = function() {
	var helpline = this.config.messages.help
	if (this.djList.active && songLimit > 0){
		this.say(helpline
			.replace(/\{theme\}/g, theTheme)
			.replace(/\{queue\}/g, 'there is a queue, type *addme to get on it')
			.replace(/\{limit\}/g, 'and there\'s a '+songLimit+' song limit'));
	}else if (this.djList.active && songLimit == 0){
		this.say(helpline
			.replace(/\{theme\}/g, theTheme)
			.replace(/\{queue\}/g, 'there is a queue, type *addme to get on it')
			.replace(/\{limit\}/g, 'and there is no song limit'));
	}else if (!this.djList.active && songLimit > 0){
		this.say(helpline
			.replace(/\{theme\}/g, theTheme)
			.replace(/\{queue\}/g, 'it\'s FFA to get on deck')
			.replace(/\{limit\}/g, 'and there\'s a '+songLimit+' song limit'));
	}else if (!this.djList.active && songLimit == 0){
		this.say(helpline
			.replace(/\{theme\}/g, theTheme)
			.replace(/\{queue\}/g, 'it\'s FFA to get on deck')
			.replace(/\{limit\}/g, 'and there is no song limit'));
	}
};

Bot.prototype.onQueueCommands = function() {
	this.say('Queue Commands: ' +
			Object.keys(this.queueCommandHandlers)
				.map(function(s) { return "*" + s; }).join(', '));
};

Bot.prototype.onFunCommands = function() {
	this.say('Fun Commands: ' +
			Object.keys(this.funCommandHandlers)
				.map(function(s) { return "*" + s; }).join(', '));
};

Bot.prototype.onDrunkCommands = function() {
	this.say('Drunk Commands: ' +
			Object.keys(this.drunkCommandHandlers)
				.map(function(s) { return "*" + s; }).join(', '));
};

Bot.prototype.onQModCommands = function() {
	this.say('Queue Mod Commands: ' +
			Object.keys(this.qmodCommandHandlers)
				.map(function(s) { return "*" + s; }).join(', '));
};

Bot.prototype.onGreetCommands = function() {
	this.say('Greeting Commands: ' +
			Object.keys(this.greetCommandHandlers)
				.map(function(s) { return "*" + s; }).join(', '));
};

Bot.prototype.onAllCommands = function() {
	this.say('My Commands: ' +
			Object.keys(this.commandHandlers)
				.map(function(s) { return "*" + s; }).join(', ')+ ', *whorebot.');
};

Bot.prototype.onHelpModCommands = function() {
	this.say('Mod Commands: ' +
			Object.keys(this.modCommandHandlers)
				.map(function(s) { return "*" + s; }).join(', '));
};

Bot.prototype.onMoreCommands = function() {
	this.say('More Commands: ' +
			Object.keys(this.moreCommandHandlers)
				.map(function(s) { return "*" + s; }).join(', '));
};

Bot.prototype.onKiss = function() {
	this.say(imports.rsp.kiss());
};

Bot.prototype.onBooze = function() {
	this.say(imports.rsp.booze());
};

Bot.prototype.onMoo = function() {
	this.say('I\'m not a cow, but oka-MOOOOOOOOOO!');
};

Bot.prototype.onBlab = function() {
	if (blabber != false){ blabber = false; this.say('I\'m going to shut up now.') }
	else if (blabber != true){ blabber = true; this.say('I\'m talking again!')}
};

Bot.prototype.onDrill = function(){
	this.refreshRoomInfo();
	var thisdjs = this.roomInfo.room.metadata.djs
	this.ttapi.remDj(thisdjs[0]);
	this.ttapi.remDj(thisdjs[1]);
	this.ttapi.remDj(thisdjs[2]);
	this.ttapi.remDj(thisdjs[3]);
	this.ttapi.remDj(thisdjs[4]);
};

Bot.prototype.onAuto = function() {
	if (auto != false){ auto = false; this.say('No bop for you.') }
	else if (auto != true){ auto = true; this.say('I bop now.')}
};

Bot.prototype.onAutoBop = function(text, number) {
	var numBop = Bot.splitCommand(text)[1];
	if (!numBop) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <number, left, clear>");
		return;
	}
	else if (numBop == "clear"){this.say('Turning off AutoBop.'); autobop = 0;}
	else if (numBop == "left"){this.say('I will autobop '+autobop+' more times.')}
	else {
		this.say('Will autobop the next '+numBop+' songs.')
		autobop = numBop;
	}
}

Bot.prototype.onSongLimit = function(text, number) {
	var sLimit = Bot.splitCommand(text)[1];
	if (!sLimit) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <number, is, clear>");
		return;
	}
	else if (sLimit == "clear"){this.say('No more song limit!'); songLimit = 0;}
	else {
		this.say('The song limit is now '+sLimit+'.')
		songLimit = sLimit;
	}
}

Bot.prototype.onLimit = function(){
	if (songLimit > 0){ this.say('There is currently a '+songLimit+' song limit.')
	}else{ this.say('There is no song limit.') 
	};
}

Bot.prototype.onFan = function(text, userid, username) {
	if (isOut != true){
	this.ttapi.becomeFan(userid);
	this.say('Fanned!');
	}else{
	this.say('/me can\'t fan while passed out.')}
};

Bot.prototype.onUnfan = function(text, userid, username) {
	this.ttapi.removeFan(userid);
	this.say('I hope it wasn\'t me...');
};

Bot.prototype.onLove = function(text, userid, username) {
	this.say('I love you, '+username);
};

Bot.prototype.onHug = function(text, userid, username) {
	this.say('/me hugs '+username);
};

Bot.prototype.onGrope = function(text, userid, username) {
	if (userid != '4e619cc9a3f7514df80f739c') {
		this.say(imports.rsp.grope().replace(/\{user.name\}/g, username));
		}else{
		this.say('Oh, Mistress Zmbee! Please don\'t stop...');
		}
};

Bot.prototype.onDrink = function(text, userid, username) {
	if (isOut != true){
		if (bac == 0){ this.say(imports.rsp.sober()); this.say('/me drinks'); bac++;}
		else if (bac == 1){ this.say(imports.rsp.onedrink()); this.say('/me drinks'); bac++;}
		else if (bac > 1 && bac < 5){ this.say(imports.rsp.buzzed()); this.say('/me drinks'); bac++;}
		else if (bac >= 5 && bac < 10){ this.say(imports.rsp.drunk()); this.say('/me drinks'); bac++;}
		else if (bac >= 10 && bac < 15){ this.say(imports.rsp.wasted()); this.say('/me drinks'); bac++;}
		else if (bac >= 15){ 
			this.say(imports.rsp.passedout()); 
			this.say('/me passes out');
			setTimeout(function(){ isOut = false; }, 180000);
			isOut = true;
			bac = 0;
			}
		}else{ this.say('/me is passed out.') }
};

Bot.prototype.onShot = function(text, userid, username) {
	if (isOut != true){
		if (bac == 0){ this.say(imports.rsp.sober()); this.say('/me takes a shot'); bac++;bac++;}
		else if (bac == 1){ this.say(imports.rsp.onedrink()); this.say('/me takes a shot'); bac++;bac++;}
		else if (bac > 1 && bac < 5){ this.say(imports.rsp.buzzed()); this.say('/me takes a shot'); bac++;bac++;}
		else if (bac >= 5 && bac < 10){ this.say(imports.rsp.drunk()); this.say('/me takes a shot'); bac++;bac++;}
		else if (bac >= 10 && bac < 15){ this.say(imports.rsp.wasted()); this.say('/me takes a shot'); bac++;bac++;}
		else if (bac >= 15){
			this.say(imports.rsp.passedout()); 
			this.say('/me passes out');
			setTimeout(function(){ isOut = false; }, 180000);
			isOut = true;
			bac = 0;
			}
	}else{ this.say('/me is passed out.') }
};

Bot.prototype.onBonus = function(text, userid, username) {
	if (isOut != true){
		this.ttapi.vote('up');
	}else{
		this.say('/me can\'t bop while passed out.')
	}
};

Bot.prototype.onAlbum = function() {
	if (this.currentSong && this.currentSong.song) {
		this.say(this.config.messages.album
				.replace(/\{song\}/g, this.currentSong.song.metadata.song)
				.replace(/\{artist\}/g, this.currentSong.song.metadata.artist)
				.replace(/\{album\}/g, this.currentSong.song.metadata.album || "(unknown)"));
	}
};

/**
  * Pulls the command off the front of a line of text.
  * @return a 2-element list of [command, rest]
  */
Bot.splitCommand = function(text) {
	var i = text.search(/\s/);
	if (i === -1) {
		return [text, ''];
	}
	return [text.substr(0, i), text.substr(i).trimLeft()];
};

Bot.prototype.onLast = function(text, unused_userid, unused_username) {
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var last = null;
	var userid = this.useridsByName[subject_name];
	if (userid) {
		last = this.activity[userid];
	}
	if (last) {
		var age_ms = new Date() - new Date(last);
		var age_h = Math.floor(age_ms / 1000 / 3600);
		this.say(this.config.messages.lastActivity
				.replace(/\{user\.name\}/g, subject_name)
				.replace(/\{age\}/g, age_h + " hours"));
	} else {
		this.say(this.config.messages.lastActivityUnknown.replace(/\{user\.name\}/g, subject_name));
	}
};

Bot.prototype.onSmack  = function(text, unused_userid, unused_username) {
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var last = null;
	var userid = this.roomInfo.room.metadata.users;
	
	if (subject_name.indexOf(userid).name === 1) {
		this.say('Step One Done!');
		//var subjectid = this.useridsByName[subject_name];
		this.say('/me smacks '+subject_name+'pretty hard');
	}else {
		this.say('/me smacks '+subject_name);
	}
};

Bot.prototype.onGo = function(text, room) {
	var room_name = Bot.splitCommand(text)[1];
	var room = room_name;
	if (!room_name) { this.say("Usage: " + Bot.splitCommand(text)[0] + " <room name/id>");	return;	}
	if (room_name == "zmbeeparty"){ room = '4ebb3f7167db4632ad1335a1'; }
	if (room_name == "bots"){ room = '4ec345804fe7d0727a0020a3'; }
	if (room_name == "alphabeats"){ room = '4e5582db14169c5e62324d64'; }
	this.say('Leaving Now!');
	this.ttapi.roomRegister(room);
};

Bot.prototype.onSetTheme = function(text, theme) {
	var newTheme = Bot.splitCommand(text)[1];
	if (!newTheme) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <theme>");
		return;
	}else {
		this.say('Room theme is set to '+newTheme)
		theTheme = newTheme;
	}
};

Bot.prototype.onGetTheme = function(){
	this.say('Current theme is: '+theTheme)
}

Bot.prototype.onNewName = function(text, newname) {
	var new_name = Bot.splitCommand(text)[1];
	if (!new_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <new name>");
		return;
	}else {
		this.ttapi.modifyName(new_name);
	}
};

Bot.prototype.lookupUsername = function(userid) {
	return this.usernamesById[userid] || "(unknown)";
};

Bot.prototype.onPlays = function(text, userid, username){
	var userid = this.currentSong.dj.userid;
	var subject_name = Bot.splitCommand(text)[1];
	if (subject_name) {
		userid = this.useridsByName[subject_name];
	}
	var stats = this.djs[userid];
	if (stats) {
		this.say(this.config.messages.plays
				.replace(/\{user\.name\}/g, stats.user.name)
				.replace(/\{plays\}/g, stats.plays));
	}
};

Bot.prototype.onstageDive = function(text, userid, username){
	if (this.djs[userid]){
	stagedive = true;
	this.ttapi.remDj(userid)
	}
}

Bot.prototype.onMaul = function(text, userid, username) {
	var userid;
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say('Usage: *maul <username>');
	}else if (subject_name == "everyone"){	
		this.refreshRoomInfo();
		var thisdjs = this.roomInfo.room.metadata.djs
		this.ttapi.remDj(thisdjs[0]);
		this.ttapi.remDj(thisdjs[1]);
		this.ttapi.remDj(thisdjs[2]);
		this.ttapi.remDj(thisdjs[3]);
		this.ttapi.remDj(thisdjs[4]);
	}else{
		userid = this.useridsByName[subject_name];
	}
	if (userid) {
		this.ttapi.remDj(userid);
	}
};

Bot.prototype.onList = function(text, userid, username) {
	if (!this.djList.active) {
		this.say(this.config.messages.listInactive);
		return;
	}
	if (this.djList.length()) {
		this.say(this.config.messages.list
				.replace(/\{list\}/g, this.djList.list.map(this.lookupUsername.bind(this)).join(', ')));
	} else {
		this.say(this.config.messages.listEmpty);
	}
};

Bot.prototype.onListOn = function(text, userid, username) {
	if (this.djList.active) {
		this.say(this.config.messages.listAlreadyOn);
	} else {
		this.djList.active = true;
		this.djList.save(this.config.djlist_filename);
		this.say(this.config.messages.listOn);
	}
};

Bot.prototype.onListOff = function(text, userid, username) {
	if (this.djList.active) {
		this.djList.active = false;
		this.djList.save(this.config.djlist_filename);
		this.say(this.config.messages.listOff);
	} else {
		this.say(this.config.messages.listAlreadyOff);
	}
};

Bot.prototype.onListReset = function(text, userid, username) {
	if (this.djList) {
		this.djList.list = [];
		this.say(this.config.messages.listReset);
	}
};

Bot.prototype.onAddme = function(text, userid, username) {
	if (!this.djList.active) {
		this.say(this.config.messages.listInactive);
		return;
	}
	var position = this.djList.add(userid);
	if (position < 0) {
		this.say(this.config.messages.listAlreadyListed
				.replace(/\{user.name\}/g, username)
				.replace(/\{position\}/g, -position));
		return;
	}
	this.djList.save(this.config.djlist_filename);
	this.say(this.config.messages.listAdded
			.replace(/\{user.name\}/g, username)
			.replace(/\{position\}/g, position));
};

Bot.prototype.onAddFirst = function(text, userid, username) {
	if (!this.djList.active) {
		this.say(this.config.messages.listInactive);
		return;
	}
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var subjectid = this.useridsByName[subject_name];
	if (subjectid) {
		this.djList.addFirst(subjectid);
		this.djList.save(this.config.djlist_filename);
		this.say(this.config.messages.listAdded
				.replace(/\{user.name\}/g, subject_name)
				.replace(/\{position\}/g, 1));
	} else {
		this.say(this.config.messages.unknownUser
				.replace(/\{user.name\}/g, subject_name));
	}
};

Bot.prototype.onRemoveme = function(text, userid, username) {
	var i = this.djList.remove(userid);
	if (i !== -1) {
		this.djList.save(this.config.djlist_filename);
		this.say(this.config.messages.listRemoved
				.replace(/\{user.name\}/g, username)
				.replace(/\{position\}/g, i + 1));
	} else {
		this.say(this.config.messages.listRemoveNotListed
				.replace(/\{user.name\}/g, username));
	}
};

Bot.prototype.onRemove = function(text, userid, username) {
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var subjectid = this.useridsByName[subject_name];
	this.onRemoveme(text, subjectid, subject_name);
};

Bot.prototype.onRemoveFirst = function(text, userid, username) {
	var removed_userid = this.djList.removeFirst();
	if (removed_userid) {
		this.say(this.config.messages.listRemoved
				.replace(/\{user\.name\}/g, this.lookupUsername(removed_userid))
				.replace(/\{position\}/g, 1));
	} else {
		this.say(this.config.messages.listEmpty);
	}
};

Bot.prototype.onBan = function(text, userid, username) {
	var args = Bot.splitCommand(text)[1];
	if (!args) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>, <comment>");
		return;
	}
	var split = args.split(/,(.+)/);
	var subject_name = split[0];
	var comment = split[1] || "";
	var subjectid = this.useridsByName[subject_name];
	if (!subjectid) { return; }
	this.banList.ban(subjectid, comment + " -- " + username + " " + new Date());
	this.banList.save(this.config.banlist_filename);
	this.say(this.config.messages.ban
			.replace(/\{user\.name\}/g, subject_name)
			.replace(/\{banner\.name\}/g, username)
			.replace(/\{ban\.comment\}/g, comment));
	this.ttapi.bootUser(subjectid, comment);
};

Bot.prototype.onBans = function(text, userid, username) {
	var bans = this.banList.list();
	this.say(this.config.messages.bans
			.replace(/\{ban\.count\}/g, Object.keys(bans).length)
			.replace(/\{ban\.list\}/g, bans.map(this.lookupUsername.bind(this)).join(', ')));
};

Bot.prototype.onBanned = function(text, userid, username) {
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var subjectid = this.useridsByName[subject_name];
	var comment = this.banList.query(subjectid);
	if (!comment) {
		this.say(this.config.messages.notBanned
				.replace(/\{user\.name\}/g, subject_name));
	} else {
		this.say(this.config.messages.banned
				.replace(/\{user\.name\}/g, subject_name)
				.replace(/\{ban\.comment\}/g, comment));
	}
};

Bot.prototype.onUnban = function(text, userid, username) {
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var subjectid = this.useridsByName[subject_name];
	var comment = this.banList.query(subjectid);
	if (!comment) {
		this.say(this.config.messages.notBanned
				.replace(/\{user\.name\}/g, subject_name));
	} else {
		this.banList.unban(subjectid);
		this.banList.save(this.config.banlist_filename);
		this.say(this.config.messages.unbanned
				.replace(/\{user\.name\}/g, subject_name));
	}
};

Bot.prototype.onGreet = function(text, userid, username) {
	var greeting = Bot.splitCommand(text)[1];
	if (!greeting || greeting.indexOf(username) === -1) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <greeting> -- greeting must contain your name.")
		return;
	}
	this.pendingGreetings[userid] = greeting.replace(username, "{user.name}");
	this.writePendingGreetings();
	this.say("(pending approval): " + greeting.replace(/\{user.name\}/g, username));
};

Bot.prototype.onApproveGreeting = function(text, userid, username) {
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var subjectid = this.useridsByName[subject_name];
	if (subjectid && this.pendingGreetings[subjectid]) {
		this.greetings[subjectid] = this.pendingGreetings[subjectid];
		delete this.pendingGreetings[subjectid];
		this.writeGreetings();
		this.writePendingGreetings();
		this.say(this.greeting({name: subject_name, userid: subjectid}));
	}
};

Bot.prototype.onShowGreeting = function(text, userid, username) {
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var subjectid = this.useridsByName[subject_name];
	if (!subjectid) {
	       return;
	}
	if (this.pendingGreetings[subjectid]) {
		this.say("(pending approval): " + this.pendingGreetings[subjectid].replace(/\{user.name\}/g, subject_name));
	} else if (this.greetings[subjectid]) {
		this.say("(approved): " + this.greetings[subjectid].replace(/\{user.name\}/g, subject_name));
	}
};

Bot.prototype.onRejectGreeting = function(text, userid, username) {
	var subject_name = Bot.splitCommand(text)[1];
	if (!subject_name) {
		this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
		return;
	}
	var subjectid = this.useridsByName[subject_name];
	if (!subjectid) {
	       return;
	}
	if (subjectid in this.pendingGreetings) {
		delete this.pendingGreetings[subjectid];
		this.writePendingGreetings();
		this.say(this.config.messages.pendingGreetingRejected.replace(/\{user.name\}/g, subject_name));
	} else if (subjectid in this.greetings) {
		delete this.greetings[subjectid];
		this.writeGreetings();
		this.say(this.config.messages.greetingRejected.replace(/\{user.name\}/g, subject_name));
	} else {
		this.say(this.config.messages.noGreeting.replace(/\{user.name\}/g, subject_name));
	}
};

Bot.prototype.onPendingGreetings = function(text, userid, username) {
	this.say(this.config.messages.pendingGreetings
			.replace(/\{list\}/,
			       	Object.keys(this.pendingGreetings).map(this.lookupUsername.bind(this)).join(', ')));
};

Bot.prototype.onRegistered = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	this.refreshRoomInfo();
	user = data.user[0];
	if (user.acl > 0) {
		auto = false; 
		placeholder = autobop;
		autobop = 0;
	}
		if (user.userid !== this.config.userid) {
		this.recordActivity(user.userid);
		if (this.banList) {
			var ban_comment = this.banList.query(user.userid);
			if (ban_comment) {
				this.say(this.config.messages.banned
						.replace(/\{user\.name\}/g, user.name)
						.replace(/\{ban\.comment\}/g, ban_comment));
				this.ttapi.bootUser(user.userid, ban_comment);
				return;
			}
		}
		if (blabber != false) {this.say(this.greeting(user)); }
	}
  }

MS_FROM_S = 1000;
S_FROM_M = 60;
M_FROM_H = 60;
H_FROM_D = 24;
D_FROM_W = 7;
MS_FROM_W = MS_FROM_S * S_FROM_M * M_FROM_H * H_FROM_D * D_FROM_W;

Bot.prototype.greeting = function(user) {
	var message = this.greetings[user.userid];
	var now = new Date();
	var aWeekAgo = new Date().setDate(now.getDate() - 7);
	if (!message && (new Date(MS_FROM_S * user.created) > aWeekAgo)) {
		message = randomElement(this.config.messages.newUserGreetings);
	}
	if (!message) {
		message = randomElement(this.config.messages.defaultGreetings);
	}
	return message.replace(/\{user\.name\}/g, user.name);
};

Bot.prototype.djAnnouncement = function(user) {
	var message;
	if (user.points === 0) {
		message = randomElement(this.config.messages.newDjAnnouncements);
	} else {
		message = randomElement(this.config.messages.djAnnouncements);
	}
	return message
		.replace(/\{user\.name\}/g, user.name)
		.replace(/\{user\.points\}/g, user.points)
		.replace(/\{user\.fans\}/g, user.fans);
};

randomElement = function(ar) {
	return ar[Math.floor(Math.random() * ar.length)];
};

Bot.prototype.onRoomInfo = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	this.roomInfo = data;
	this.users = {};
	if (data.success) {
		this.roomInfo.users.forEach(function(user) {
			this.users[user.userid] = user;
			this.useridsByName[user.name] = user.userid;
			this.usernamesById[user.userid] = user.name;
		}, this);
		this.writeUsernames();
		if (!this.currentSong) {
			this.currentSong = new imports.stats.SongStats(
					data.room.metadata.current_song,
					this.users[data.room.metadata.current_dj]);
			this.currentSong.updateVotes(data.room.metadata);
		}
	}
};

/** @param {RoomInfo} data */
Bot.prototype.initBanList = function(data) {
	this.banList = null;
	if (data.success) {
		BanList.fromFile(this.config.banlist_filename, data.room.roomid, function(banList) {
			this.banList = banList;
		}.bind(this));
	}
};

/** @param {RoomInfo} data */
Bot.prototype.initDjList = function(data) {
	if (data.success) {
		DjList.fromFile(this.config.djlist_filename, data.room.roomid, function(djList) {
			this.djList = djList;
		}.bind(this));
	} else {
		this.djList = new DjList();
	}
};

Bot.prototype.refreshRoomInfo = function(cb) {
	this.ttapi.roomInfo(function(data) {
		this.onRoomInfo.call(this, data);
		if (cb) { cb.call(this, data); }
	}.bind(this));
};

Bot.prototype.onDeregister = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	if (data.user.acl > 0) {
		auto = true; 
		autobop = placeholder;
		placeholder = 0;
	}
	if (data.userid === this.config.userid) {
		this.roomInfo = null;
		this.users = {};
	} else {
		this.recordActivity(data.userid);
		this.refreshRoomInfo();
	}
};

Bot.prototype.say = function(msg) {
	if (!msg) { return; }
	var message = msg
		.replace(/\{room\.name\}/g, this.roomInfo.room.name)
		.replace(/\{bot\.name\}/g, this.lookupUsername(this.config.userid));
	if (this.debug) {
		console.log("say: %s", message);
	}
	if (!this.mute) {
		this.ttapi.speak(message);
	}
};

Bot.prototype.onNewModerator = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	this.say(this.config.messages.newModerator
		.replace(/\{user\.name\}/g, this.lookupUsername(data.userid)));
};

Bot.prototype.onAddDj = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	this.refreshRoomInfo();
	var user = data.user[0];
	this.djs[user.userid] = new imports.stats.DjStats(user);
	if (this.djList.active) {
		var next = this.djList.next();
		if (next) {
			if (user.userid === next) {
				this.djList.remove(user.userid);
			} else {
				this.say(this.config.messages.wrongDj
					.replace(/\{right.name\}/g, this.lookupUsername(next))
					.replace(/\{wrong.name\}/g, user.name));
				this.ttapi.remDj(user.userid);
				waskicked = true;
				waskicked2 = true;
				return;
			}
		}
	}
	if (waskicked == false){
	if (blabber != false){
	if  (data.user[0].userid != this.config.userid){
	this.say(this.djAnnouncement(user));
	}}}else{
	waskicked = false;}
};

Bot.prototype.djSummary = function(stats) {
	var message = randomElement(this.config.messages.djSummaries);
	if (stats.plays != 0){
	return message
		.replace(/\{user\.name\}/g, stats.user.name)
		.replace(/\{user\.points\}/g, stats.user.points)
		.replace(/\{lames\}/g, stats.lames)
		.replace(/\{gain\}/g, stats.gain)
		.replace(/\{plays\}/g, stats.plays);
}
};

Bot.prototype.djDive = function(stats) {
	var message = '{user.name} is surfing the crowd, having earned {gain} points off of {plays} songs!'
	var message2 = '{user.name} tried to surf the crowd, but he ended up knocking his laptop over.'
	if (stats.plays != 0){
	return message
		.replace(/\{user\.name\}/g, stats.user.name)
		.replace(/\{gain\}/g, stats.gain)
		.replace(/\{plays\}/g, stats.plays);
	}else {
	return message2
		.replace(/\{user\.name\}/g, stats.user.name);
	}
};

Bot.prototype.onRemDj = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	this.refreshRoomInfo();
	var user = data.user[0];
	var stats = this.djs[user.userid];
	if (waskicked == false){
	if (blabber != false){
	if (stats && data.user[0].userid != this.config.userid) {
		stats.update(user);
		delete this.djs[user.userid];
		if (stagedive == true){ this.say(this.djDive(stats));stagedive = false; }else{
		this.say(this.djSummary(stats));}
	}}}else{ waskicked = false;}
	if (this.djList.active) {
		var next = this.djList.next();
		if (next) { if (waskicked2 == false){
			this.say(this.config.messages.nextDj
					.replace(/\{user.name\}/, this.lookupUsername(next)));}else{waskicked2 = false;}
		};
	}
};
Bot.prototype.onRandomTest = function() {
	var chance = Math.random();
	if (chance > .5){ this.say('yes')}
	else{this.say('no');}
}
Bot.prototype.onNewSong = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	var song = data.room.metadata.current_song;
	var userid = data.room.metadata.current_dj;
	var djstats = this.djs[userid] || (this.djs[userid] = new imports.stats.DjStats(this.users[userid]));
	if (songLimit > 0){
		if( djstats.plays >= songLimit ){
		this.say('Hey,'+djstats.user.name+', you\'ve already played '+songLimit+' songs, time for someone else to spin!'); 
		var chance = Math.random();
		if (chance > .5){this.ttapi.remDj(userid)}
		} 
	}
	djstats.play(song);
	this.currentSong = new imports.stats.SongStats(song, this.users[song.djid]);
	if (auto == true && userid == "4e0ff328a3f751670a084ba6"){ this.ttapi.vote('up'); };
	if (autobop > 0 && isOut != true) {this.ttapi.vote('up'); autobop--;}
};

Bot.prototype.finishSong = function() {
	if (this.currentSong && this.currentSong.song && this.currentSong.dj) {
		var message = this.config.messages.songSummary;
		this.say(message
			.replace(/\{user\.name\}/g, this.currentSong.dj.name)
			.replace(/\{awesomes\}/g, isNaN(this.currentSong.votes.upvotes) ? 0 : this.currentSong.votes.upvotes)
			.replace(/\{lames\}/g, isNaN(this.currentSong.votes.downvotes) ? 0 : this.currentSong.votes.downvotes)
			.replace(/\{song\}/g, this.currentSong.song.metadata.song)
			.replace(/\{artist\}/g, this.currentSong.song.metadata.artist)
			.replace(/\{album\}/g, this.currentSong.song.metadata.album));
	}
};

Bot.prototype.onUpdateVotes = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	this.recordActivity(data.room.metadata.votelog[0][0]);
	if (this.currentSong) {
		this.currentSong.updateVotes(data.room.metadata);
	} else {
		this.refreshRoomInfo();
	}
};

Bot.prototype.onNoSong = function(data) {
	if (this.debug) {
		console.dir(data);
	}
	this.currentSong = null;
};

Bot.theOwners = [
	'4e0ff328a3f751670a084ba6',
	'4e9a7d20a3f7515e6508de50',
	'4e619cc9a3f7514df80f739c'
];
Bot.bareCommands = [
	'help',
	'theme'
];

Bot.prototype.recordActivity = function(userid) {
	if (userid === this.config.userid) { return; }
	this.activity[userid] = new Date();
	this.writeActivity();
};

exports.Bot = Bot;
exports.imports = imports;

if (process.argv.length > 2) {
	new Bot(process.argv[2]).start();
}
