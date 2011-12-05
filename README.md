# A Bot Named Helga

This bot is based off of Vin's Code, which is available [here](https://github.com/vin/turntable.fm)
It runs on [node.js](http://nodejs.org/), usings Alain Gilbert's
[ttapi library](https://github.com/alaingilbert/Turntable-API).

## Setting Up

Since my bot is based off of [Vin's code](https://github.com/vin/turntable.fm), you'll need to set up his
code first. So head on over to his [repo](https://github.com/vin/turntable.fm), and get it set up.

Once you have Vin's code up and running, you can just come back
here and copy my files in and replace those that you already have. Easy.

## Changes

I just rewrote the bot. I got the latest revision of [Vin's code](https://github.com/vin/turntable.fm), and set it up,
and then recoded some functions in. I think it's a bit more stable now.

`12.4.11` - Main Rewrite. Added autobop, song limit, blabber, sorted
out the commands, changed the queue commands, added the themes
added my own afk checks. Renamed the old bot 'oldbot' in case people
still want it. Also added maul and gtfo, the remove dj and boot commands.

## Definitions

`autobop` - Sets the bot to autobop (technically illegal) Useage: *autobop {num/left/clear}
[*autobop 6] will set bot to autobop for the next 6 songs, [*autobop left] will tell you how many 
more song the bot will bop, and [*autobop clear] will set autobop to 0, thus clearing the autobop.

`songlimit & setlimit` - Sets the song limit. [*songlimit] will tell you what the song limit is, (default 0),
and *setlimit <num> will set the song limit to num.

`theme & settheme` - Sets the theme. Default defined in common.js, *settheme <string> sets the 
theme to string, while theme will call the theme for use. Also will display the theme in *help.

`afkcheck & setafk` - AFK settings. There is a command that checks the afk time of the DJ's, and if
any are over the limit, (default 10 minutes), it will boot theme. Use *setafk <num> to change the afk
limit to num minutes.

`stagedive` - The bot (if moderator) will remove the user if they are a DJ, and then display a message
giving the DJ a sendoff for when they step down.

`maul` - Useage *maul <username>. Boots username off the decks

`gtfo` - Useage *gtfo <username>. Boots username out of the room.
