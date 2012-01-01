exports.conf = {
	"auth": "fill this in your turntableUserAuth cookie",
	"userid": "fill this in from your turntableUserId cookie",
	"roomid": "fill this in from TURNTABLE_ROOMID in view-source:turntable.fm/$ROOM",
	"greetings_filename": "greetings.json",
	"pending_greetings_filename": "greetings-pending.json",
	"rooms_filename": "rooms.json",
	"activity_filename": "activity.json",
	"usernames_filename": "usernames.json",
	"djlist_filename": "djlist-{roomid}.json",
	"banlist_filename": "banlist-{roomid}.json",
	"minibot": "false",
	"owners": {
	},
	"friends": {
	},
	"messages": {
		"help": "{theme}, {queue}, {limit}, {afk}.",
		"defaultGreetings": [
			"Hi {user.name}!, welcome to {room.name}. Type 'help' to find out what's going on",
			"Hello {user.name}, welcome to {room.name}. Type 'help' to find out what's going on",
			"Hey there {user.name}, welcome to {room.name}. Type 'help' to find out what's going on"
		],
		"newUserGreetings": [
			"Welcome to turntable {user.name}! Type 'help' to find out what's going on",
			"Hi {user.name}, welcome to turntable! Type 'help' to find out what's going on"
		],
		"djAnnouncements": [
			"{user.name} just started DJing with {user.points} points and {user.fans} fans.",
		],
		"newDjAnnouncements": [
			"Now the real fun begins, {user.name}!",
			"Show some love for {user.name}'s first time on the decks!"
		],
		"djSummaries": [
			"{user.name} played {plays} songs, gaining {gain} points (and got lamed {lames} times).",
			"Thanks for the tunes {user.name}.  You played {plays} songs and got {gain} points and {lames} lames."
		],
        "sober": [
			"I've never been one to turn down a free drink.",
			"It's only a drink, what can happen?",
            "I do love me some alcohol",
            "See you tomorrow!!!"
		],
        "onedrink": [
			"I've only had one, what's one more?",
			"Thank you, now can I have one more?",
            "Man, this is going to be a good night."
		],
        "buzzed": [
			"And how are YOU doing? ;D",
			"I see me some booty up in herr.",
            "No, man, I'm not drunk.",
            "I'm actually good to drive,  gimme mah keys back.",
            "I have this really funny joke, I just can't remember it.",
		],
        "drunk": [
			"/me stumbles",
			"I just don't understand why they left me...I was so good to them...",
            "/me that chick over there is hot. I'ma go get slapped by a boyfriend, brb.",
            "I'm not as think as you drunk I am.",
            "No, I TOLD you, I drive better drunk.",
            "/me walks into pole.",
            "/me runs off to the bathroom."
		],
        "wasted": [
			"/me takes off shirt.",
            "I'd shag me, that's all I'm saying. You're missing out.",
            "Come on, lovely! You beling with meeeeee.",
            "/me throws up.",
            "I'm never drinking again, damn.",
            "/me falls over."
		],
        "passedout": [
			"This is the bathroom, right?",
			"/me falls over",
            "/me trips over a shadow"
		],
        "theme": "Dubstep/Electro",
		"plays": "{user.name} has played {plays} songs.",
		"newModerator": "{user.name} is now a moderator in {room.name}.  With great power comes great responsibility.",
		"songSummary": "{song} by {artist}: +{awesomes}, -{lames}",
		"album": "{song} is on {album}",
		"bonus": "{dj.name} just got a bonus from {user.name}",
		"bonusAlreadyUsed": "Sorry, bonus already used by {user.name}.  My head is already boppin!",
		"selfBonus": "Sorry, {user.name}, you can't give yourself a bonus.",
		"lastActivity": "It's been {age} since I saw {user.name}",
		"lastActivityUnknown": "Hmm, I haven't seen {user.name}",
		"listInactive": "There is no list.  Fastest-fingers.",
		"listEmpty": "Nobody's on the list.  Type q+ to add yourself.",
		"listAdded": "{user.name}, you're now #{position} on the list.",
		"list": "The current dj list is: {list}",
		"listOn": "The room now has a dj list.  Type q+ to add yourself.",
		"listOff": "The dj list is now off.  Fastest-fingers.",
		"listAlreadyOn": "The dj list is already on.  Type q to see the current list.",
		"listAlreadyOff": "The dj list is already off.  Fastest-fingers.",
		"listAlreadyListed": "{user.name} is already #{position} on the list.",
		"listRemoved": "{user.name} has been removed from the DJ list.",
		"listRemoveNotListed": "{user.name} is not on the DJ list.",
		"listReset": "The dj list has been cleared.",
		"banned": "{user.name} is banned: {ban.comment}",
		"notBanned": "{user.name} is not banned.",
		"unbanned": "{user.name} has been unbanned.",
		"ban": "{user.name} has been banned: {ban.comment} -- {banner.name}",
		"bans": "{ban.count} banned users: {ban.list}",
		"wrongDj": "{right.name} is supposed to be up next.  {wrong.name}, please step down.",
		"nextDj": "{user.name} is up next.",
		"someMessage": "some-message-value",
		"greetingRejected": "Greeting for {user.name} removed.",
		"pendingGreetingRejected": "Pending greeting for {user.name} rejected.",
		"noGreeting": "{user.name} doesn't have a personal greeting",
		"pendingGreetings": "Users with proposed greetings pending moderator approval: {list}",
        "unknownUser": "Who is {user.name}?",
        "milestones": {
            "hundred": "{user.name} just reached {points} points. Nice!",
            "thousand": "Congrats on,reaching {points}, {user.name}!",
            "100": "{user.name} just reached {points} points. Bear up!",
            "300": "{user.name} just reached {points} points. Try on a cat suit!",
            "600": "{user.name} just reached {points} points. Moosehead!",
            "1000": "{user.name} just reached {points} points. It's monkey time!",
            "10000": "Woohoo! Welcome {user.name} to the elite 10k propellerhead club!"
   }
}
};
