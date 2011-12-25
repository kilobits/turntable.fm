// Copyright 2011 Vineet Kumar
///////////////////////////////////Vars
var blabber = true;
var stagedive = false;
var auto = false;
var autobop = 0;
var songLimit = 0;
var afk = 10;
var theTheme;

var imports = {
  repl: require('repl'),
  ttapi: require('ttapi'),
  conf: require('node-config'),
  banlist: require('./banlist'),
  djlist: require('./djlist'),
  Store: require('./store').Store,
  stats: require('./stats')
};

Bot = function (configName) {
  this.ttapi = null;
  this.configName = configName || process.argv[2] || Bot.usage();
  this.config = {};
  this.logChats = false;
  ///////////////////////////////////Command Handlers
  this.commandHandlers = {};
  this.hiddenCommandHandlers = {};
  this.friendCommandHandlers = {};
  this.ownerCommandHandlers = {};
  this.banCommandHandlers = {};
  this.qCommandHandlers = {};
  this.greetCommandHandlers = {};
  this.qmodCommandHandlers = {};
  this.shyCommandHandlers = {};
  this.users = {};
  this.useridsByName = {};
  this.usernamesById = {};
  this.activity = {};
  this.djs = {}; /** @type SongStats */
  this.currentSong = null;
  this.pendingGreetings = {};
  this.rooms = {};
  this.greetings = {};
  this.activity = {};
  this.djList = new imports.djlist.DjList();
  this.banList = null;
};

Bot.usage = function () {
  throw "Usage: node " + process.argv[1] + " <config name>";
};

Bot.prototype.onInitConfig = function (cb, err) {
  if (err) {
    throw err;
  }
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
  this.readRooms();
  this.ttapi = new imports.ttapi(this.config.auth, this.config.userid, this.config.roomid);
  this.bindHandlers();
  if (cb) {
    cb();
  }
  ///////////////////////////////////Set the theme from config
  theTheme = this.config.messages.theme;
};

Bot.prototype.start = function (cb) {
  imports.conf.initConfig(this.onInitConfig.bind(this, cb), this.configName);
};

Bot.prototype.bindHandlers = function () {
  this.ttapi.on('speak', this.onSpeak.bind(this));
  this.ttapi.on('registered', this.onRegistered.bind(this));
  this.ttapi.on('registered', this.onRegisteredFan.bind(this));
  this.ttapi.on('new_moderator', this.onNewModerator.bind(this));
  this.ttapi.on('roomChanged', this.onRoomInfo.bind(this));
  this.ttapi.on('roomChanged', this.initDjList.bind(this));
  this.ttapi.on('roomChanged', this.initBanList.bind(this));
  this.ttapi.on('deregistered', this.onDeregister.bind(this));
  this.ttapi.on('add_dj', this.onAddDj.bind(this));
  this.ttapi.on('rem_dj', this.onRemDj.bind(this));
  this.ttapi.on('snagged', this.onSnagged.bind(this));
  this.ttapi.on('newsong', this.onNewSong.bind(this));
  this.ttapi.on('nosong', this.onNoSong.bind(this));
  this.ttapi.on('update_votes', this.onUpdateVotes.bind(this));
  //////////////////////////////////// Command Handlers
  this.commandHandlers['help'] = this.onHelp;
  this.commandHandlers['theme'] = this.onGetTheme;
  this.commandHandlers['commands'] = this.onHelpCommands;
  this.commandHandlers['modstuff'] = this.onHelpFriendCommands;
  this.commandHandlers['all'] = this.onAllCommands;
  this.commandHandlers['album'] = this.onAlbum;
  this.commandHandlers['last'] = this.onLast;
  this.commandHandlers['songlimit'] = this.onLimit;
  this.commandHandlers['afkcheck'] = this.onAfkCheck;
  this.commandHandlers['plays'] = this.onPlays;
  this.commandHandlers['greet'] = this.onGreet;
  this.commandHandlers['queue'] = this.onQueueCommands;
  this.commandHandlers['stagedive'] = this.onstageDive;

  this.qCommandHandlers['q+'] = this.onAddme;
  this.qCommandHandlers['q-'] = this.onRemoveme;
  this.qCommandHandlers['q'] = this.onList;

  this.qmodCommandHandlers['list-on'] = this.onListOn;
  this.qmodCommandHandlers['list-off'] = this.onListOff;
  this.qmodCommandHandlers['list-reset'] = this.onListReset;
  this.qmodCommandHandlers['reset-list'] = this.onListReset;
  this.qmodCommandHandlers['add-first'] = this.onAddFirst;
  this.qmodCommandHandlers['remove'] = this.onRemove;
  this.qmodCommandHandlers['remove-first'] = this.onRemoveFirst;

  this.banCommandHandlers['ban'] = this.onBan;
  this.banCommandHandlers['unban'] = this.onUnban;
  this.banCommandHandlers['bans'] = this.onBans;
  this.banCommandHandlers['banned'] = this.onBanned;

  this.greetCommandHandlers['approve-greeting'] = this.onApproveGreeting;
  this.greetCommandHandlers['show-greeting'] = this.onShowGreeting;
  this.greetCommandHandlers['reject-greeting'] = this.onRejectGreeting;
  this.greetCommandHandlers['pending-greetings'] = this.onPendingGreetings;

  this.friendCommandHandlers['maul'] = this.onMaul;
  this.friendCommandHandlers['gtfo'] = this.onBoot;
  this.friendCommandHandlers['bop'] = this.onBonus;
  this.friendCommandHandlers['settheme'] = this.onSetTheme;
  this.friendCommandHandlers['autobop'] = this.onAutoBop;
  this.friendCommandHandlers['setlimit'] = this.onSongLimit;
  this.friendCommandHandlers['setafk'] = this.onSetAfk;
  this.friendCommandHandlers['qmods'] = this.onQueueModCommands;
  this.friendCommandHandlers['banstuff'] = this.onBanCommands;
  this.friendCommandHandlers['greetings'] = this.onGreetCommands;

  this.ownerCommandHandlers['owners'] = this.onOwners;
  this.ownerCommandHandlers['autome'] = this.onAuto;
  this.ownerCommandHandlers['blab'] = this.onBlab;
  this.ownerCommandHandlers['go'] = this.onGo;
  this.ownerCommandHandlers['setgo'] = this.onSetGo;

  this.hiddenCommandHandlers['freakthefuckout'] = this.onBonus;
  this.hiddenCommandHandlers['moo'] = this.onMoo;
  this.shyCommandHandlers['bonus'] = this.onBonus;
};

var nop = function () {};

Bot.prototype.readGreetings = function () {
  imports.Store.read(this.config.greetings_filename, function (data) {
    this.greetings = data;
    console.log('loaded %d greetings', Object.keys(this.greetings).length);
  }.bind(this), nop);
  imports.Store.read(this.config.pending_greetings_filename, function (data) {
    this.pendingGreetings = data;
    console.log('loaded %d pending greetings', Object.keys(this.pendingGreetings).length);
  }.bind(this), nop);
};

Bot.prototype.writeGreetings = function () {
  imports.Store.write(this.config.greetings_filename, this.greetings, console.log.bind(this, 'saved %d greetings to %s', Object.keys(this.greetings).length, this.config.greetings_filename));
};

Bot.prototype.writePendingGreetings = function () {
  imports.Store.write(this.config.pending_greetings_filename, this.pendingGreetings, console.log.bind(this, 'saved %d pending greetings to %s', Object.keys(this.pendingGreetings).length, this.config.pending_greetings_filename));
};

Bot.prototype.writeRooms = function () {
    imports.Store.write(this.config.rooms_filename, this.rooms, console.log.bind(this, 'saved %d rooms to %s', Object.keys(this.rooms).length, this.config._filename));
};

Bot.prototype.readActivity = function () {
  imports.Store.read(this.config.activity_filename, function (data) {
    this.activity = data;
    console.log('loaded %d activity records', Object.keys(this.activity).length);
  }.bind(this), nop);
};

Bot.prototype.readRooms = function () {
    imports.Store.read(this.config.rooms_filename, function (data) {
        this.rooms = data;
        console.log('loaded %d rooms', Object.keys(this.rooms).length);
    }.bind(this));
};

Bot.prototype.writeActivity = function () {
  if (this.config.activity_filename) {
    imports.Store.write(this.config.activity_filename, this.activity, console.log.bind(this, 'Activity data saved to %s', this.config.activity_filename));
  }
};

Bot.prototype.readUsernames = function () {
  imports.Store.read(this.config.usernames_filename, function (data) {
    this.usernamesById = data;
    for (var userid in this.usernamesById) {
      this.useridsByName[this.usernamesById[userid]] = userid;
    }
    console.log('loaded %d usernames', Object.keys(this.usernamesById).length);
  }.bind(this), nop);
};

Bot.prototype.writeUsernames = function () {
  if (this.config.usernames_filename) {
    imports.Store.write(this.config.usernames_filename, this.usernamesById, console.log.bind(this, 'Username map saved to %s', this.config.usernames_filename));
  }
};

/**
 * @param {{name: string, userid: string, text: string}} data return by ttapi
 */
Bot.prototype.onSpeak = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  if (this.logChats) {
    console.log('chat: %s: %s', data.name, data.text);
  }
  this.recordActivity(data.userid);
  var words = data.text.split(/\s+/);
  var command = words[0].toLowerCase();
  if (command.match(/^[!*\/]/)) {
    command = command.substring(1);
  }
  else if (Bot.bareCommands.indexOf(data.text) === -1) { // bare commands must match the entire text line
    return;
  }
  var handler = null;
  if (this.config.owners[data.userid]) {
    handler = handler || this.ownerCommandHandlers[command];
    handler = handler || this.friendCommandHandlers[command];
    handler = handler || this.greetCommandHandlers[command];
    handler = handler || this.banCommandHandlers[command];
    handler = handler || this.qmodCommandHandlers[command];
    handler = handler || this.shyCommandHandlers[command];
  }
  if (this.config.friends[data.userid] || this.roomInfo.room.metadata.moderator_id.indexOf(data.userid) !== -1) {
    handler = handler || this.friendCommandHandlers[command];
    handler = handler || this.greetCommandHandlers[command];
    handler = handler || this.banCommandHandlers[command];
    handler = handler || this.qmodCommandHandlers[command];
    handler = handler || this.shyCommandHandlers[command];
  }
  handler = handler || this.commandHandlers[command];
  handler = handler || this.hiddenCommandHandlers[command];
  handler = handler || this.qCommandHandlers[command];
  if (handler) {
    handler.call(this, data.text, data.userid, data.name);
  }
};
////////////////////////////////////////////Start Custom Code
Bot.prototype.onBlab = function () {
  if (blabber != false) {
    blabber = false;
    this.say('I\'m going to shut up now.')
  }
  else if (blabber != true) {
    blabber = true;
    this.say('I\'m talking again!')
  }
};
Bot.prototype.onGo = function (text, room) {
    var room_name = Bot.splitCommand(text)[1];
    var room = room_name;
    if (!room_name) {
        this.say("Usage: " + Bot.splitCommand(text)[0] + " <room name/id>");
        return;
    }
    if (room_name in this.rooms )  {
        room = this.rooms[room_name];
        this.say('Going to '+room_name);
    }  else {
        this.say('Leaving Now!');
    }
    this.ttapi.roomRegister(room);
};
Bot.prototype.onSetGo = function (text, userid, username) {
    var args = Bot.splitCommand(text)[1];
    if (!args) {
        this.say("Usage: " + Bot.splitCommand(text)[0] + " <roomname>,<roomid>");
        return;
    }
    var split = args.split(/,(.+)/);
    var roomid = split[0];
    var roomname = split[1] ;
    if (!roomid || !roomname) {
        return;
    }
    this.rooms[roomid] = roomname;
    this.writeRooms();
    this.say("It is Written.");
};
Bot.prototype.onSetTheme = function (text, theme) {
  var newTheme = Bot.splitCommand(text)[1];
  if (!newTheme) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <theme>");
    return;
  }
  else {
    this.say('Room theme is set to ' + newTheme)
    theTheme = newTheme;
  }
};

Bot.prototype.onGetTheme = function () {
  this.say('Current theme is: ' + theTheme)
}

Bot.prototype.onstageDive = function (text, userid, username) {
  if (this.djs[userid]) {
    stagedive = true;
    this.ttapi.remDj(userid)
  }
};

Bot.prototype.djDive = function (stats) {
  var message = '{user.name} is surfing the crowd, having earned {gain} points off of {plays} songs!'
  var message2 = '{user.name} tried to surf the crowd, but they ended up knocking their laptop over.'
  if (stats.plays != 0) {
    return message.replace(/\{user\.name\}/g, stats.user.name).replace(/\{gain\}/g, stats.gain).replace(/\{plays\}/g, stats.plays);
  }
  else {
    return message2.replace(/\{user\.name\}/g, stats.user.name);
  }
};

Bot.prototype.onAuto = function () {
  if (auto != false) {
    auto = false;
    this.say('No bop for you.')
  }
  else if (auto != true) {
    auto = true;
    this.say('I bop now.')
  }
};

Bot.prototype.onAutoBop = function (text, number) {
  var numBop = Bot.splitCommand(text)[1];
  if (!numBop) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <num/left/clear>");
    return;
  }
  else if (numBop == "clear") {
    this.say('Turning off AutoBop.');
    autobop = 0;
  }
  else if (numBop == "left") {
    this.say('I will autobop ' + autobop + ' more times.')
  }
  else {
    this.say('Will autobop the next ' + numBop + ' songs.')
    autobop = numBop;
  }
};

Bot.prototype.onSongLimit = function (text, number) {
  var sLimit = Bot.splitCommand(text)[1];
  if (!sLimit) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <num/clear>");
    return;
  }
  else if (sLimit == "clear") {
    this.say('No more song limit!');
    songLimit = 0;
  }
  else {
    this.say('The song limit is now ' + sLimit + '.')
    songLimit = sLimit;
  }
};

Bot.prototype.onLimit = function () {
  if (songLimit > 0) {
    this.say('There is currently a ' + songLimit + ' song limit.')
  }
  else {
    this.say('There is no song limit.')
  };
};

Bot.prototype.onAfkCheck = function () {
  this.refreshRoomInfo();
  var thisdjs = this.roomInfo.room.metadata.djs;
  if (this.afkCheck(thisdjs[0], afk) == true) {
    this.ttapi.remDj(thisdjs[0]);
  };
  if (this.afkCheck(thisdjs[1], afk) == true) {
    this.ttapi.remDj(thisdjs[1]);
  };
  if (this.afkCheck(thisdjs[2], afk) == true) {
    this.ttapi.remDj(thisdjs[2]);
  };
  if (this.afkCheck(thisdjs[3], afk) == true) {
    this.ttapi.remDj(thisdjs[3]);
  };
  if (this.afkCheck(thisdjs[4], afk) == true) {
    this.ttapi.remDj(thisdjs[4]);
  };
};

Bot.prototype.onSetAfk = function (text, number) {
  var newafk = Bot.splitCommand(text)[1];
  if (!newafk) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <num>");
    return;
  }
  else {
    this.say('Afk Limit is now ' + newafk + ' minutes.')
    afk = newafk;
  }
};

Bot.prototype.afkCheck = function (userid, num) {
  var last = this.activity[userid];
  var age_ms = new Date() - new Date(last);
  var age_m = Math.floor(age_ms / 1000 / 60);
  if (age_m > num) {
    return true;
  };
  return false;
};

Bot.prototype.onMaul = function (text, userid, username) {
  var userid;
  var subject_name = Bot.splitCommand(text)[1];
  if (!subject_name) {
    this.say('Usage: *maul <username>');
  }
  else if (subject_name == "everyone") {
    this.refreshRoomInfo();
    var thisdjs = this.roomInfo.room.metadata.djs
    this.ttapi.remDj(thisdjs[0]);
    this.ttapi.remDj(thisdjs[1]);
    this.ttapi.remDj(thisdjs[2]);
    this.ttapi.remDj(thisdjs[3]);
    this.ttapi.remDj(thisdjs[4]);
  }
  else {
    userid = this.useridsByName[subject_name];
  }
  if (userid) {
    this.ttapi.remDj(userid);
    this.say('Rawr!');
  }
};

Bot.prototype.onBoot = function (text, userid, username) {
  var userid;
  var subject_name = Bot.splitCommand(text)[1];
  if (!subject_name) {
    this.say('Usage: *gtfo <username>');
  }
  else {
    userid = this.useridsByName[subject_name];
  }
  if (userid == this.config.userid) {
    this.say('I won\'t boot myself, dummy.');
    return;
  }
  else if (this.config.owners[userid]) {
    this.say("I won't boot "+subject_name+" cause I lurvs them.");
    return;
  }
  else if (userid) {
    this.ttapi.bootUser(userid, 'Cause I Said So.');
  }
  else if (this.config.owners[userid]) {
    this.say("I won't boot "+subject_name+" cause I lurvs them.");
    return;
  }
  else {
    this.say('No one in here by the name of ' + subject_name)
  }
};

Bot.prototype.onMoo = function () {
  this.say('I\'m not a cow, but okaMOOOOOOOO.')
};
/////////////////////////////////////////////////////End Custom Code
/////////////////////////////////////////////////////Change Help
Bot.prototype.onHelp = function () {
  var helpline = this.config.messages.help
  if (this.djList.active && songLimit > 0) {
    this.say(helpline.replace(/\{theme\}/g, 'The theme is ' + theTheme).replace(/\{queue\}/g, 'there is a queue, type "q+" to get on it').replace(/\{limit\}/g, 'there\'s a ' + songLimit + ' song limit').replace(/\{afk\}/g, 'and an afk limit of ' + afk + ' minutes'));
  }
  else if (this.djList.active && songLimit == 0) {
    this.say(helpline.replace(/\{theme\}/g, 'The theme is ' + theTheme).replace(/\{queue\}/g, 'there is a queue, type "q+" to get on it').replace(/\{limit\}/g, 'there\'s no song limit').replace(/\{afk\}/g, 'and an afk limit of ' + afk + ' minutes'));
  }
  else if (!this.djList.active && songLimit > 0) {
    this.say(helpline.replace(/\{theme\}/g, 'The theme is ' + theTheme).replace(/\{queue\}/g, 'it\'s fastest fingers to dj').replace(/\{limit\}/g, 'there\'s a ' + songLimit + ' song limit').replace(/\{afk\}/g, 'and an afk limit of ' + afk + ' minutes'));
  }
  else if (!this.djList.active && songLimit == 0) {
    this.say(helpline.replace(/\{theme\}/g, 'The theme is ' + theTheme).replace(/\{queue\}/g, 'it\'s fastest figners to dj').replace(/\{limit\}/g, 'there\'s no song limit').replace(/\{afk\}/g, 'and an afk limit of ' + afk + ' minutes'));
  }
};

/////////////////////////////////////////Set the command sorting
Bot.prototype.onHelpCommands = function () {
  this.say('commands: ' + Object.keys(this.commandHandlers).map(function (s) {
    return "*" + s;
  }).join(', '));
};

Bot.prototype.onHelpFriendCommands = function () {
  this.say('friend commands: ' + Object.keys(this.friendCommandHandlers).map(function (s) {
    return "*" + s;
  }).join(', '));
};

Bot.prototype.onQueueCommands = function () {
  this.say('queue commands: ' + Object.keys(this.qCommandHandlers).map(function (s) {
    return "*" + s;
  }).join(', '));
};

Bot.prototype.onQueueModCommands = function () {
  this.say('queue mod commands: ' + Object.keys(this.qmodCommandHandlers).map(function (s) {
    return "*" + s;
  }).join(', '));
};

Bot.prototype.onBanCommands = function () {
  this.say('ban commands: ' + Object.keys(this.banCommandHandlers).map(function (s) {
    return "*" + s;
  }).join(', '));
};

Bot.prototype.onGreetCommands = function () {
  this.say('greet commands: ' + Object.keys(this.greetCommandHandlers).map(function (s) {
    return "*" + s;
  }).join(', '));
};

Bot.prototype.onAllCommands = function () {
  this.say('*commands, *queue, *greetings, *modstuff, *qmods, *banstuff')
};
///////////////////////////////////////End
Bot.prototype.onOwners = function () {
  this.say('my owners are: ' + Object.keys(this.config.owners).map(this.lookupUsername.bind(this)).join(', '));
};

Bot.prototype.onFriends = function () {
  this.say('my friends are: ' + Object.keys(this.config.owners).concat(Object.keys(this.config.friends)).map(this.lookupUsername.bind(this)).join(', '));
};

Bot.prototype.bonusCb = function (userid, data) {
  if (this.debug) {
    console.dir(data);
  }
  if (!data.success) {
    return;
  }
  this.currentSong.bonusBy = userid;
  this.say(this.config.messages.bonus.replace(/\{user.name\}/g, this.lookupUsername(this.currentSong.bonusBy)).replace(/\{dj.name\}/g, this.currentSong.dj.name));
};

///////////////////////////////////////////////Simplified Bonus
Bot.prototype.onBonus = function (text, userid, username) {
  if (!this.currentSong || !this.currentSong.song) {
    return;
  }
  this.ttapi.vote('up');
};

Bot.prototype.onAlbum = function () {
  if (this.currentSong && this.currentSong.song) {
    this.say(this.config.messages.album.replace(/\{song\}/g, this.currentSong.song.metadata.song).replace(/\{artist\}/g, this.currentSong.song.metadata.artist).replace(/\{album\}/g, this.currentSong.song.metadata.album || "(unknown)"));
  }
};

/**
 * Pulls the command off the front of a line of text.
 * @return a 2-element list of [command, rest]
 */
Bot.splitCommand = function (text) {
  var i = text.search(/\s/);
  if (i === -1) {
    return [text, ''];
  }
  return [text.substr(0, i), text.substr(i).trimLeft()];
};

Bot.prototype.onLast = function (text, unused_userid, unused_username) {
  var subject_name = Bot.splitCommand(text)[1];
  if (!subject_name) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
    return;
  }
  var age_m = this.last(subject_name);
  if (age_m >= 0) {
    var age = age_m + " minutes";
    if (age_m > 120) {
      age = Math.floor(age_m / 60) + " hours";
    }
    this.say(this.config.messages.lastActivity.replace(/\{user\.name\}/g, subject_name).replace(/\{age\}/g, age));
  }
  else {
    this.say(this.config.messages.lastActivityUnknown.replace(/\{user\.name\}/g, subject_name));
  }
};

Bot.prototype.last = function (username) {
  var userid = this.useridsByName[username];
  if (!userid) {
    return -1;
  }
  var last = this.activity[userid];
  if (!last) {
    return -1;
  }
  var age_ms = new Date() - new Date(last);
  var age_m = Math.floor(age_ms / 1000 / 60);
  return age_m;
};

Bot.prototype.lookupUsername = function (userid) {
  return this.usernamesById[userid] || "(unknown)";
};

Bot.prototype.lookupUsernameWithIdleStars = function (userid) {
  var username = this.lookupUsername(userid);
  var age_m = this.last(username);
  if (age_m > 4) {
    return username + "*";
  };
  return username;
};

Bot.prototype.onPlays = function (text, userid, username) {
  var userid = this.currentSong.dj.userid;
  var subject_name = Bot.splitCommand(text)[1];
  if (subject_name) {
    userid = this.useridsByName[subject_name];
  }
  var stats = this.djs[userid];
  if (stats) {
    this.say(this.config.messages.plays.replace(/\{user\.name\}/g, stats.user.name).replace(/\{plays\}/g, stats.plays));
  }
};

Bot.prototype.onList = function (text, userid, username) {
  if (!this.djList.active) {
    this.say(this.config.messages.listInactive);
    return;
  }
  if (this.djList.length()) {
    this.say(this.config.messages.list.replace(/\{list\}/g, this.djList.list.map(this.lookupUsernameWithIdleStars.bind(this)).join(', ')));
  }
  else {
    this.say(this.config.messages.listEmpty);
  }
};

Bot.prototype.onListOn = function (text, userid, username) {
  if (this.djList.active) {
    this.say(this.config.messages.listAlreadyOn);
  }
  else {
    this.djList.active = true;
    this.djList.save(this.config.djlist_filename);
    this.say(this.config.messages.listOn);
  }
};

Bot.prototype.onListOff = function (text, userid, username) {
  if (this.djList.active) {
    this.djList.active = false;
    this.djList.save(this.config.djlist_filename);
    this.say(this.config.messages.listOff);
  }
  else {
    this.say(this.config.messages.listAlreadyOff);
  }
};

Bot.prototype.onListReset = function (text, userid, username) {
  if (this.djList) {
    this.djList.list = [];
    this.djList.save(this.config.djlist_filename);
    this.say(this.config.messages.listReset);
  }
};

Bot.prototype.onAddme = function (text, userid, username) {
  if (!this.djList.active) {
    this.say(this.config.messages.listInactive);
    return;
  }
  var position = this.djList.add(userid);
  if (position < 0) {
    this.say(this.config.messages.listAlreadyListed.replace(/\{user.name\}/g, username).replace(/\{position\}/g, -position));
    return;
  }
  this.djList.save(this.config.djlist_filename);
  this.say(this.config.messages.listAdded.replace(/\{user.name\}/g, username).replace(/\{position\}/g, position));
};

Bot.prototype.onAddFirst = function (text, userid, username) {
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
    this.say(this.config.messages.listAdded.replace(/\{user.name\}/g, subject_name).replace(/\{position\}/g, 1));
  }
  else {
    this.say(this.config.messages.unknownUser.replace(/\{user.name\}/g, subject_name));
  }
};

Bot.prototype.onRemoveme = function (text, userid, username) {
  var i = this.djList.remove(userid);
  if (i !== -1) {
    this.djList.save(this.config.djlist_filename);
    this.say(this.config.messages.listRemoved.replace(/\{user.name\}/g, username).replace(/\{position\}/g, i + 1));
  }
  else {
    this.say(this.config.messages.listRemoveNotListed.replace(/\{user.name\}/g, username));
  }
};

Bot.prototype.onRemove = function (text, userid, username) {
  var subject_name = Bot.splitCommand(text)[1];
  if (!subject_name) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
    return;
  }
  var subjectid = this.useridsByName[subject_name];
  this.onRemoveme(text, subjectid, subject_name);
};

Bot.prototype.onRemoveFirst = function (text, userid, username) {
  var removed_userid = this.djList.removeFirst();
  if (removed_userid) {
    this.say(this.config.messages.listRemoved.replace(/\{user\.name\}/g, this.lookupUsername(removed_userid)).replace(/\{position\}/g, 1));
  }
  else {
    this.say(this.config.messages.listEmpty);
  }
};

Bot.prototype.onBan = function (text, userid, username) {
  var args = Bot.splitCommand(text)[1];
  if (!args) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>, <comment>");
    return;
  }
  var split = args.split(/,(.+)/);
  var subject_name = split[0];
  var comment = split[1] || "";
  var subjectid = this.useridsByName[subject_name];
  if (!subjectid) {
    return;
  }
  this.banList.ban(subjectid, comment + " -- " + username + " " + new Date());
  this.banList.save(this.config.banlist_filename);
  this.say(this.config.messages.ban.replace(/\{user\.name\}/g, subject_name).replace(/\{banner\.name\}/g, username).replace(/\{ban\.comment\}/g, comment));
};

Bot.prototype.onBans = function (text, userid, username) {
  var bans = this.banList.list();
  this.say(this.config.messages.bans.replace(/\{ban\.count\}/g, Object.keys(bans).length).replace(/\{ban\.list\}/g, bans.map(this.lookupUsername.bind(this)).join(', ')));
};

Bot.prototype.onBanned = function (text, userid, username) {
  var subject_name = Bot.splitCommand(text)[1];
  if (!subject_name) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
    return;
  }
  var subjectid = this.useridsByName[subject_name];
  var comment = this.banList.query(subjectid);
  if (!comment) {
    this.say(this.config.messages.notBanned.replace(/\{user\.name\}/g, subject_name));
  }
  else {
    this.say(this.config.messages.banned.replace(/\{user\.name\}/g, subject_name).replace(/\{ban\.comment\}/g, comment));
  }
};

Bot.prototype.onUnban = function (text, userid, username) {
  var subject_name = Bot.splitCommand(text)[1];
  if (!subject_name) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <username>");
    return;
  }
  var subjectid = this.useridsByName[subject_name];
  var comment = this.banList.query(subjectid);
  if (!comment) {
    this.say(this.config.messages.notBanned.replace(/\{user\.name\}/g, subject_name));
  }
  else {
    this.banList.unban(subjectid);
    this.banList.save(this.config.banlist_filename);
    this.say(this.config.messages.unbanned.replace(/\{user\.name\}/g, subject_name));
  }
};

Bot.prototype.onGreet = function (text, userid, username) {
  var greeting = Bot.splitCommand(text)[1];
  if (!greeting || greeting.indexOf(username) === -1) {
    this.say("Usage: " + Bot.splitCommand(text)[0] + " <greeting> -- greeting must contain your name.");
    return;
  }
  this.pendingGreetings[userid] = greeting.replace(username, "{user.name}");
  this.writePendingGreetings();
  this.say("(pending approval): " + greeting.replace(/\{user.name\}/g, username));
};

Bot.prototype.onApproveGreeting = function (text, userid, username) {
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
    this.say(this.greeting({
      name: subject_name,
      userid: subjectid
    }));
  }
};

Bot.prototype.onShowGreeting = function (text, userid, username) {
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
  }
  else if (this.greetings[subjectid]) {
    this.say("(approved): " + this.greetings[subjectid].replace(/\{user.name\}/g, subject_name));
  }
};

Bot.prototype.onRejectGreeting = function (text, userid, username) {
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
  }
  else if (subjectid in this.greetings) {
    delete this.greetings[subjectid];
    this.writeGreetings();
    this.say(this.config.messages.greetingRejected.replace(/\{user.name\}/g, subject_name));
  }
  else {
    this.say(this.config.messages.noGreeting.replace(/\{user.name\}/g, subject_name));
  }
};

Bot.prototype.onPendingGreetings = function (text, userid, username) {
  this.say(this.config.messages.pendingGreetings.replace(/\{list\}/, Object.keys(this.pendingGreetings).map(this.lookupUsername.bind(this)).join(', ')));
};

Bot.prototype.onRegistered = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  user = data.user[0];
  if (user.userid !== this.config.userid) {
    this.recordActivity(user.userid);
    this.refreshRoomInfo();
    if (this.banList) {
      var ban_comment = this.banList.query(user.userid);
      if (ban_comment) {
        this.say(this.config.messages.banned.replace(/\{user\.name\}/g, subject_name).replace(/\{ban\.comment\}/g, ban_comment));
        this.ttapi.bootUser(user.userid, banned_reason);
        return;
      }
    }
    ////////////////////////////////////Blab
    if (blabber != false) {
      this.say(this.greeting(user));
    }
  }
};

Bot.prototype.onRegisteredFan = function (data) {
  user = data.user[0];
  if (user.userid !== this.config.userid) {
    this.ttapi.becomeFan(user.userid);
  }
};

MS_FROM_S = 1000;
S_FROM_M = 60;
M_FROM_H = 60;
H_FROM_D = 24;
D_FROM_W = 7;
MS_FROM_W = MS_FROM_S * S_FROM_M * M_FROM_H * H_FROM_D * D_FROM_W;

Bot.prototype.greeting = function (user) {
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

Bot.prototype.djAnnouncement = function (user) {
  var message;
  if (user.points === 0) {
    message = randomElement(this.config.messages.newDjAnnouncements);
  }
  else {
    message = randomElement(this.config.messages.djAnnouncements);
  }
  return message.replace(/\{user\.name\}/g, user.name).replace(/\{user\.points\}/g, user.points).replace(/\{user\.fans\}/g, user.fans);
};


randomElement = function (ar) {
  return ar[Math.floor(Math.random() * ar.length)];
};

Bot.prototype.onRoomInfo = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  this.roomInfo = data;
  this.users = {};
  if (data.success) {
    this.roomInfo.users.forEach(function (user) {
      this.users[user.userid] = user;
      this.useridsByName[user.name] = user.userid;
      this.usernamesById[user.userid] = user.name;
    }, this);
    this.writeUsernames();
    if (!this.currentSong) {
      this.currentSong = new imports.stats.SongStats(
      data.room.metadata.current_song, this.currentDj(data));
      this.currentSong.updateVotes(data.room.metadata);
    }
  }
};

Bot.prototype.currentDj = function (optional_roomInfo) {
  var roomInfo = optional_roomInfo || this.roomInfo;
  return this.users[roomInfo.room.metadata.current_dj];
};

/** @param {RoomInfo} data */
Bot.prototype.initBanList = function (data) {
  this.banList = null;
  if (data.success) {
    BanList.fromFile(this.config.banlist_filename, data.room.roomid, function (banList) {
      this.banList = banList;
    }.bind(this));
  }
};

/** @param {RoomInfo} data */
Bot.prototype.initDjList = function (data) {
  if (data.success) {
    DjList.fromFile(this.config.djlist_filename, data.room.roomid, function (djList) {
      this.djList = djList;
    }.bind(this));
  }
  else {
    this.djList = new DjList();
  }
};

Bot.prototype.refreshRoomInfo = function (cb) {
  this.ttapi.roomInfo(function (data) {
    this.onRoomInfo.call(this, data);
    if (cb) {
      cb.call(this, data);
    }
  }.bind(this));
};

Bot.prototype.onDeregister = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  if (data.userid === this.config.userid) {
    this.roomInfo = null;
    this.users = {};
  }
  else {
    this.recordActivity(data.userid);
    this.refreshRoomInfo();
  }
};

Bot.prototype.say = function (msg) {
  if (!msg || !this.roomInfo) {
    return;
  }
  var message = msg.replace(/\{room\.name\}/g, this.roomInfo.room.name).replace(/\{bot\.name\}/g, this.lookupUsername(this.config.userid));
  if (this.debug) {
    console.log("say: %s", message);
  }
  if (!this.mute) {
    this.ttapi.speak(message);
  }
};

Bot.prototype.onNewModerator = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  this.say(this.config.messages.newModerator.replace(/\{user\.name\}/g, this.lookupUsername(data.userid)));
};

Bot.prototype.onAddDj = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  var user = data.user[0];
  this.recordActivity(user.userid);
  this.djs[user.userid] = new imports.stats.DjStats(user);
  if (this.djList.active) {
    var next = this.djList.next();
    if (next) {
      if (user.userid === next) {
        this.djList.remove(user.userid);
      }
      else {
        this.say(this.config.messages.wrongDj.replace(/\{right.name\}/g, this.lookupUsername(next)).replace(/\{wrong.name\}/g, user.name));
        return;
      }
    }
  }
  this.say(this.djAnnouncement(user));
};

Bot.prototype.djSummary = function (stats) {
  var message = randomElement(this.config.messages.djSummaries);
  ////////////////////////////////////Remove notification if not played song
  if (stats.plays != 0) {
    return message.replace(/\{user\.name\}/g, stats.user.name).replace(/\{user\.points\}/g, stats.user.points).replace(/\{lames\}/g, stats.lames).replace(/\{gain\}/g, stats.gain).replace(/\{plays\}/g, stats.plays);
  }
};

Bot.prototype.onRemDj = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  var user = data.user[0];
  this.recordActivity(user.userid);
  var stats = this.djs[user.userid];
  ///////////////////////Blab and stagedive and stuffs
  if (blabber != false) {
    if (stats && data.user[0].userid != this.config.userid) {
      stats.update(user);
      delete this.djs[user.userid];
      if (stagedive == true) {
        this.say(this.djDive(stats));
        stagedive = false;
      }
      else {
        this.say(this.djSummary(stats));
      }
    }
  }
  if (this.djList.active) {
    var next = this.djList.next();
    if (next) {
      this.say(this.config.messages.nextDj.replace(/\{user.name\}/, this.lookupUsername(next)));
    };
  }
};

Bot.prototype.onSnagged = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  this.recordActivity(data.userid);
  ////////////////Autobop on snag
  this.ttapi.vote('up');
};

Bot.prototype.onNewSong = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  var song = data.room.metadata.current_song;
  var userid = data.room.metadata.current_dj;
  var djstats = this.djs[userid] || (this.djs[userid] = new imports.stats.DjStats(this.users[userid]));
  djstats.play(song);
  this.currentSong = new imports.stats.SongStats(song, this.users[userid]);
  ///////////////Add song Limits
  if (songLimit > 0) {
    if (djstats.plays >= songLimit) {
      this.say('Hey,' + djstats.user.name + ', you\'ve already played ' + songLimit + ' songs, time for someone else to spin!');
      var chance = Math.random();
      if (chance > .5) {
        this.ttapi.remDj(userid)
      }
    }
  }
  /////////////AutoOwner && Autobop
  if (auto == true && this.config.owners[userid]) {
    this.ttapi.vote('up');
  };
  if (autobop > 0) {
    this.ttapi.vote('up');
    autobop--;
  }
};

Bot.prototype.onEndSong = function () {
  if (this.currentSong && this.currentSong.song && this.currentSong.dj) {
    var message = this.config.messages.songSummary;
    this.say(message.replace(/\{user\.name\}/g, this.currentSong.dj.name).replace(/\{awesomes\}/g, isNaN(this.currentSong.votes.upvotes) ? 0 : this.currentSong.votes.upvotes).replace(/\{lames\}/g, isNaN(this.currentSong.votes.downvotes) ? 0 : this.currentSong.votes.downvotes).replace(/\{song\}/g, this.currentSong.song.metadata.song).replace(/\{artist\}/g, this.currentSong.song.metadata.artist).replace(/\{album\}/g, this.currentSong.song.metadata.album));
    this.currentSong = null;
  }
};

Bot.prototype.milestoneMessage = function (points) {
  var message = this.config.messages.milestones[points];
  if (points % 1000 == 0) {
    message = message || this.config.messages.milestones['thousand'];
  }
  if (points % 100 == 0) {
    message = message || this.config.messages.milestones['hundred'];
  }
  return message;
};

/*Bot.prototype.checkMilestone = function () {
  if (!this.currentDj()) {
    return;
  }
  var points = this.currentDj().points;
  var message = this.milestoneMessage(points);
  if (message) {
    this.say(message.replace(/\{user\.name\}/g, this.currentSong.dj.name).replace(/\{points\}/g, points));
  }
};*/

Bot.prototype.onUpdateVotes = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  this.recordActivity(data.room.metadata.votelog[0][0]);
  if (this.currentSong) {
    this.currentSong.dj = this.currentDj();
    this.currentSong.updateVotes(data.room.metadata);
  }
  this.refreshRoomInfo(this.checkMilestone);
};

Bot.prototype.onNoSong = function (data) {
  if (this.debug) {
    console.dir(data);
  }
  this.currentSong = null;
};

////Bare Commands
Bot.bareCommands = ['help', 'theme', 'q+', 'q-', 'q'];

Bot.prototype.recordActivity = function (userid) {
  if (userid === this.config.userid) {
    return;
  }
  this.activity[userid] = new Date();
  this.writeActivity();
};

exports.Bot = Bot;
exports.imports = imports;

if (process.argv.length > 2) {
  new Bot(process.argv[2]).start();
}
