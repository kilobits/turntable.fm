exports.conf = {
	"auth": "auth+live+yourauth",
	"userid": "userid",
	"roomid": "roomid",
	"greetings_filename": "greetings.json",
	"pending_greetings_filename": "greetings-pending.json",
	"activity_filename": "activity.json",
    "rooms_filename": "rooms.json",
	"usernames_filename": "usernames.json",
	"djlist_filename": "djlist-{roomid}.json",
	"banlist_filename": "banlist-{roomid}.json",
    "owners": {
        "4e0ff328a3f751670a084ba6":"YayRamen!",
        "4e9a7d20a3f7515e6508de50":"Dj NastyBits",
        "4e619cc9a3f7514df80f739c":"ZmbeePrncess"
    },
	"messages": {
		"help": "The theme is {theme}, {queue}, {limit}.",
		"defaultGreetings": [
			"Hi {user.name}, welcome to {room.name}! Type *help to find out what's going on.",
			"Hello {user.name}, welcome to {room.name}! Type *help to find out what's going on.",
			"Hey there {user.name}. Welcome to {room.name}! Type *help to find out what's going on."
		],
		"newUserGreetings": [
			"Welcome to turntable {user.name}! Type *help to find out what's going on.",
			"Hi {user.name}, welcome to turntable! Type *help to find out what's going on."
		],
		"djAnnouncements": [
			"{user.name} just started DJing with {user.points} points and {user.fans} fans.",
		],
		"newDjAnnouncements": [
			"{user.name} has never spun before!",
			"Show some love for {user.name}'s first time on the decks!"
		],
		"djSummaries": [
			"Thanks for spinning, {user.name}.  You played {plays} songs and got {gain} points and {lames} lames."
		],
		"plays": "{user.name} has played {plays} songs.",
		"newModerator": "{user.name} is now a moderator in {room.name}.  Don't blow it.",
		"songSummary": "{song} earned {user.name} {awesomes} points!",
		"album": "{song} is on {album}",
		"bonus": "{dj.name} just got a bonus from {user.name}",
		"bonusAlreadyUsed": "Sorry, bonus already used by {user.name}.  My head is already boppin!",
		"lastActivity": "It's been {age} since I saw {user.name}",
		"lastActivityUnknown": "Hmm, I haven't seen {user.name}",
		"listInactive": "There is no queue.  Free for All to get on deck.",
		"listEmpty": "Nobody's called next spot.  Type *addme to call it.",
		"listAdded": "{user.name}, you're now #{position} on the queue.",
		"list": "The current dj queue is: {list}",
		"listOn": "The room now has a dj queue.  Type *addme to call the next spot.",
		"listOff": "The dj queue is now off.  Free for all to get on deck.",
		"listAlreadyOn": "The dj queue is on already.  Type *list to see the current queue.",
		"listAlreadyOff": "The dj queue is already off.  Free for all.",
		"listAlreadyListed": "{user.name} is already #{position} on the queue.",
		"listRemoved": "{user.name} has given up his spot in the queue.",
		"listRemoveNotListed": "{user.name} is not on the DJ list.",
		"listReset": "The dj list has been cleared.",
		"banned": "{user.name} is banned: {ban.comment}",
		"notBanned": "{user.name} is not banned.",
		"unbanned": "{user.name} has been unbanned.",
		"ban": "{user.name} has been banned: {ban.comment} -- {banner.name}",
		"bans": "{ban.count} banned users: {ban.list}",
		"wrongDj": "{right.name} is supposed to be up next.  {wrong.name}, please step down.",
		"nextDj": "{user.name} is up next.",
		"unknownUser": "Sorry, can't find anybody by the name of {user.name}",
		"someMessage": "some-message-value",
		"greetingRejected": "Greeting for {user.name} removed.",
		"pendingGreetingRejected": "Pending greeting for {user.name} rejected.",
		"noGreeting": "{user.name} doesn't have a personal greeting",
		"pendingGreetings": "Users with proposed greetings pending moderator approval: {list}"
	}
};
