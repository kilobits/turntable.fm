exports.sober = function() {soberr =
[
 "I didn't plan on drinking, but I'll have a little something.",
 "Let's get this party started!",
 "Open bar! God I love this place.",
 "Don't mind if I do.",
 "I don't know, I don't like drinking in public."
 ]
 var sober = soberr[Math.floor(Math.random()*soberr.length)]
 return (sober);	};

exports.onedrink = function() {onedrinkr =
[
 "Another? I've only had one, of course I'll have another!",
 "Ah, the second of many.",
 "About time! I've only had one drink!",
 "Heh, too many of these and I'll do something stupid.",
 "I've had more than this at an AA meeting!"
 ]
 var onedrink = onedrinkr[Math.floor(Math.random()*onedrinkr.length)]
 return (onedrink);	};

exports.buzzed = function() {buzzedr =
[
 "You're looking mighty fine right about now.",
 "They taste better the more you have!",
 "WOoooo! I'm finally one of the cool kids.",
 "I prefer my alcohol in little red cups.",
 "I love you bro.",
 "Do you feel special? I feel special."
 ]
 var buzzed = buzzedr[Math.floor(Math.random()*buzzedr.length)]
 return (buzzed);	};

exports.drunk = function() {drunkr =
[
 "Goood gods, man, how you get so...so...what was I saying?",
 "WOOOOOOOOOOOOOOOOOOOOOOOOOOOO!",
 "/me takes off shirt.",
 "Nah I'm still good to drive. Gimme mah keys.",
 "That chick looks hot. What do you mean, that's a man?",
 "/me runs into a wall"
 ]
 var drunk = drunkr[Math.floor(Math.random()*drunkr.length)]
 return (drunk);	};

exports.wasted = function() {wastedr =
[
 "/me falls over",
 "Haaaa, jaayst thru up a lilll. ",
 "Watchu tlakin bowt, willis?",
 "Momma alwayz sed life was like a six pak...",
 "I think ur bootyfull."
 ]	
 var wasted = wastedr[Math.floor(Math.random()*wastedr.length)]
 return (wasted);	};
 
exports.passedout = function() {passedoutr =
[
 "Scuse meh, I need to vomit.",
 "/me takes off pants",
 "Y so sirius?",
 "Y so mad? U DON'T KNOW MEE",
 "/me cries"
 ]
 var passedout = passedoutr[Math.floor(Math.random()*passedoutr.length)]
 return (passedout);	};
 
exports.place = function() {placer =
[
 "the middle of a road",
 "a field",
 "someone else's car",
 "my parent's house",
 "my ex's bed"
 ]
 var place = placer[Math.floor(Math.random()*placer.length)]
 return (place);	};
 
exports.kiss = function () {kisses =
[
 "Good gods, you're a good kisser!",
 "Whoa whoa whoa, slow down with the tongue!",
 "Look...it's not you, it's me.",
 "You'd better be able to follow through with this.",
 "/me undresses"
 ]
var kiss = kisses[Math.floor(Math.random()*kisses.length)]
return (kiss); 
}

exports.booze = function () {boozeresponses =
[
 "Shaken or stirred?",
 "I hope you don't mind, but I only make them dirty.",
 "I don't like the looks of you. No booze for you.",
 "/me pours a drink",
 "I swear if I have to make one more fruity drink for a grown ass man..."
 ]
var booze = boozeresponses[Math.floor(Math.random()*boozeresponses.length)]
return (booze);
}

exports.grope = function () {groper =
[
 "Good god, {user.name}, not with people around!",
 "Why, I never! The nerve of some people!",
 "/me slaps {user.name} in the face."
 ]
var grope = groper[Math.floor(Math.random()*groper.length)]
return (grope);
}