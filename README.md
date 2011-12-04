#My Version of Vin's bot.

#How To Use
##First, Get Vin's code. Get it up and running. Once you have confirmed that Vin's bot works, come back and copy over my files and replace those from Vin's code. That is all it takes to get this fork.

## Commands I've Added/Changed

### Commands
Added better command sorting. There are now categories of commands. New Owner Commands that will only respond if the userid has been added as an owner.

### Added *fanme and *unfan me
They fan/unfan the user. Simple

### Added Random Response Commands for entertainment
They are *kiss, *booze, and *grope. They each return a random response

### Static entertainment Commands
They are *love and *hug. They just return simple text one-liners

### Drunk Mode
Still under development. Users can use *drink or *shot to make the bot take a drink. Each subsequent drink raises the BAC var by 1 or 2 points. Returns random responses based on how high the BAC is. For entertainment. Once BAC is > certain number, bot 'passes out'. This now triggers an event where any attempt to get the bot to bop/bonus, fan you, or take another shot results in the bot simply saying it is passed out. Passed Out lasts for 3 minutes.

### Go
Something for me. *go <room name> will travel the bot to other rooms. 

### Theme and Settheme. 
Var controlled. *settheme <new theme> will change the room's theme. Room theme is displayed on *help or *theme.

### New Name
*newname <name> will change the bot's name.

### Blab
This is something I coded in. *blab will turn blabber on if it's off, and off if it's on. If it's off, Bot will not speak unless spoken to. It shuts off greetings, the automatic DJ notifications, and so forth. Comes in handy if you move the bot to a room where a bot is already presiding.

### Autome
Probably a bad thing to have in a bot. If active, the bot will automatically awesome whenever one of the owners play.

### Autobop
Another owner command, used as such: *Autobop <num/clear/left> *autobop 20 will set the bot to bop for the next 20 songs. *autobop left will display how many songs are left to awesome, and *autobop clear will turn it off.

That's all for now. These are all in addition to what Vin has added.

### Firedrill
Added *firedrill as an owner command. Boots all DJ's off stage

### Maul
Just a fun remove dj command. *maul DJNAME escorts DJ off stage.

### SongLimit
Added *limit and *songlimit. *limit useage: *limit <num/clear> *limit 5 will set a 5 song limit. I haven't coded a wait limit yet. *limit clear will turn it off. *songlimit will tell you what the current limit is. 

### Help
I also updated to *help. It now tells the current theme (from *settheme), whether or not the queue is active ( *list-on ) [ I updated the code for the dj queue to remove anyone who takes a spot that isn't theirs. Now I need to find a way to take a name off of the queue if person leaves the room, and after a set amount of afk time, so other people get to dj. ] and then it says the songlimit. So, if the song limit is 5, the theme is Dubstep/Electro, and the queue is on, this is the output of *help "Hi, the theme is Dubstep/Electro, there is a dj queue so type *addme to get on it, there is a 5 song limit."

### Stagedive
Added *stagedive. While DJing, if you want to get down, you can alternatively type *stagedive, and you will get a custom sending off while the bot boots you off stage. kind of fun.

### gtfo (formally boot)
Added *gtfo <username> to kick a user out of the room. Mod command only

### q, q-, q+
Shorthand replacements for *list, *addme, and *removeme. Bare commands.

### Afk
Simple owner command *afk num will change the timeout for afk. Default on bot start is 10 minutes. *afk 25 would set a 25 minute timeout, for example.

## Other things I've done

### AFK Check
This is based off of Vin's lookupusernamewithidletime function. What it does it looks up the username and sees how long it's been since they were active. I've applied it to DJing and the Queue. If you've been AFK for more than 10 minutes, bot will escort you on your song. And if you've been afk for more than five minutes, and someone tries to take your spot in line at the DJ queue, you forfeit your spot. Working on cleaning it up.
