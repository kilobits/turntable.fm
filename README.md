#My Version of Vin's bot.

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
