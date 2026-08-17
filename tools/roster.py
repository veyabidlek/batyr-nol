#!/usr/bin/env python3
"""Every image in the game, as a prompt.

Kept apart from the generator so the cast can be read as a cast. The keys here
are the filenames the game asks for — `js/data/foes.js` `art` fields, the
`scene` names in `js/data/story.js`, and the sprite names in `js/sprite.js` —
so a rename here is a rename there.
"""

# Repeated per character so each one is on-model for the four pose frames that
# get generated from it later.
FRAMING = ("Full body, three-quarter view facing camera-left, feet at the "
           "bottom of the frame, the whole figure inside the frame with a "
           "little space above the head")

# ------------------------------------------------------------------ heroes

CHARACTERS: dict[str, str] = {
    "aibyn": (
        "A seventeen-year-old Kazakh hero, a young batyr. Short black hair with "
        "a single braided lock, sharp determined dark eyes, a thin scar across "
        "one cheekbone. Steppe-gold and indigo lamellar armour over a cream "
        "under-robe, a fur-trimmed shoulder mantle, a silver belt with turquoise "
        "stones. He holds an inherited curved sabre low in one hand; the blade "
        "carries a faint teal glow along its edge. Calm, unafraid, standing "
        "ready. " + FRAMING
    ),
    "aisulu": (
        "A seventeen-year-old Kazakh heroine, a young batyr woman. Long black "
        "hair in two braids threaded with silver coins, fierce bright eyes, a "
        "small silver forehead ornament. Steppe-gold and indigo lamellar armour "
        "over a cream under-robe, a short fur mantle, a quiver at her hip. She "
        "holds a recurve bow in one hand and a curved sabre at her belt; a faint "
        "teal glow runs along the bowstring. Poised, unafraid. " + FRAMING
    ),
    "barys": (
        "A large mythic snow leopard, the size of a horse, pale grey-cream fur "
        "with dark rosettes that glow faintly teal at their centres, ice-blue "
        "eyes, a silver ornamented collar. Standing alert and protective, tail "
        "curled. Noble rather than cute. " + FRAMING
    ),

    # ---------------------------------------------------------- the heralds
    # Each one is a maths law broken, made into a person.
    "foe1": (
        "A villain called the Halver: a tall, elegant swordsman whose entire "
        "body is split perfectly down the vertical midline — the left half in "
        "black-violet armour, the right half in bone white, the seam between "
        "them a glowing teal line. Two thin sabres, one in each hand, held "
        "crossed. A narrow smiling mask covering only half the face. Elegant, "
        "unsettling, not gory. " + FRAMING
    ),
    "foe2": (
        "A villain called the Never-Full: a huge round hulking figure in a "
        "tattered crimson chapan robe, arms far too long, a wide grinning mouth, "
        "small greedy glowing eyes. Where his belly should be there is a dark "
        "swirling void that pulls at the cloth around it. Comically enormous but "
        "genuinely menacing. " + FRAMING
    ),
    "foe3": (
        "A villain called the Scales: a slender veiled figure in flowing indigo "
        "and gold robes, blindfolded with an embroidered band, holding up an "
        "ornate steppe balance-scale whose two pans hang at obviously unequal "
        "heights, one pan glowing gold, the other dark. Serene, judgemental. "
        + FRAMING
    ),
    "foe4": (
        "A villain called the Hundred-Chief: a gaunt tax-collector warlord in "
        "black lacquered armour trimmed with gold coins, a long thin moustache, "
        "a hundred small silver coins strung across his chest, one gloved hand "
        "outstretched palm-up demanding payment. Cold, patient, cruel. " + FRAMING
    ),
    "foe5": (
        "A villain called the Mirror: a figure entirely made of polished mirror "
        "shards floating loosely in the shape of a warrior, each shard reflecting "
        "a different fragment of steppe sky, wearing a broken silver mask and a "
        "long teal cloak. No face, only reflections. Beautiful and wrong. "
        + FRAMING
    ),
    "foe6": (
        "A villain called the Opposite: a warrior who is the exact photographic "
        "negative of a hero — inverted colours, pale skin against black armour "
        "where there should be dark on gold, a reversed silhouette, holding a "
        "sabre upside down by the blade. The same build as a young batyr, but "
        "everything about them reversed. " + FRAMING
    ),
    "foe7": (
        "A villain called the Grid: a spider-like sorcerer wrapped in a lattice "
        "of glowing teal threads that stretch off past the edges of the figure, "
        "four extra thin arms of woven light, a masked face of intersecting "
        "lines, indigo robes. Precise, mathematical, predatory. " + FRAMING
    ),
    "foe8": (
        "A villain called the Balance: a towering armoured guardian with two "
        "identical halves and two identical faces, one looking left and one "
        "looking right, holding two identical maces in perfect symmetry, "
        "bone-white armour with gold seams, a heavy stone yoke across the "
        "shoulders. Absolutely symmetrical, immovable. " + FRAMING
    ),
    "foe9": (
        "A villain called the Endless: a lean ascetic figure in ragged bone-white "
        "wrappings whose lower body dissolves into an endlessly receding trail of "
        "smaller and smaller copies of itself fading into the distance, a serene "
        "hollow-eyed face, arms spread wide. Hypnotic, unreachable. " + FRAMING
    ),

    # ---------------------------------------------------------- the khan
    "khan": (
        "The final villain, Khan Zero: a colossal armoured emperor whose armour "
        "is magnificent but whose body inside it is an absence — a clean void "
        "black-violet silhouette with no features, ringed by a broken crown of "
        "floating gold shards. A vast dark cloak spreading like erased sky. One "
        "gauntleted hand raised, and everything the hand points at is fading out "
        "of existence at the edges. Awe, not gore. " + FRAMING
    ),
    "khan2": (
        "An old Kazakh batyr, seventy years old, freed from a dark seal: long "
        "white beard and hair, deep laughter lines, exhausted but standing, the "
        "same steppe-gold and indigo lamellar armour as a young hero but "
        "battered and forty years older, a broken sabre in one hand, torn "
        "black-violet chains falling away from his wrists and dissolving into "
        "teal light. Kind, ruined, unbowed. " + FRAMING
    ),
}

# ------------------------------------------------------------------ objects

OBJECTS: dict[str, str] = {
    "gem": "A single faceted teal-cyan gemstone with a bright catchlight, "
           "floating, glowing softly, anime item icon",
    "heart": "A single glowing crimson heart-shaped charm with a silver Kazakh "
             "ornament rim, anime item icon",
    "star": "A single five-pointed steppe-gold star with a soft radial glow and "
            "a long horizontal lens flare, anime item icon",
    "seal": "An ancient circular stone seal carved with Kazakh oyu ornament, "
            "cracked across the middle, teal light leaking from the crack, "
            "floating, anime item icon",
    "sabre": "A curved Kazakh sabre with a silver-and-turquoise hilt, blade "
             "edged in faint teal light, floating diagonally, anime item icon",
    "chest": "A carved wooden steppe chest with silver ornament bands and a "
             "heavy lock, closed, anime item icon",
}

# ------------------------------------------------------------------ arenas
# One per fight, plus the map. 16:9, opaque, and deliberately empty in the
# middle third — the fighters stand there.

BACKGROUNDS: dict[str, str] = {
    "bg_map": (
        "A vast Kazakh steppe seen from a high ridge at golden hour, a winding "
        "road going from the near edge toward distant mountains, scattered "
        "yurts, a huge dark storm-void swallowing the horizon at the far end. "
        "Wide anime establishing shot, no characters"
    ),
    "bg_field": (
        "An open steppe grassland under a wide dawn sky, wind moving through "
        "tall golden grass, distant low hills, an empty foreground clearing. "
        "Anime battle-arena background, no characters"
    ),
    "bg_camp": (
        "A ruined nomad camp at dusk, collapsed yurts, smouldering fires, "
        "scattered cooking pots, long shadows, empty ground in the middle. "
        "Anime battle-arena background, no characters"
    ),
    "bg_bazaar": (
        "An abandoned steppe caravan bazaar at night, striped awnings, hanging "
        "lanterns, spilled sacks of grain, moonlight, empty ground in the "
        "middle. Anime battle-arena background, no characters"
    ),
    "bg_treasury": (
        "The stone vault of a khan's treasury, columns carved with Kazakh "
        "ornament, mounds of silver coins along the walls, cold shafts of light "
        "from high windows, empty floor in the middle. Anime battle-arena "
        "background, no characters"
    ),
    "bg_lake": (
        "A perfectly still mountain lake at twilight reflecting the sky like a "
        "mirror, snow peaks, a narrow stone causeway across the middle of the "
        "water. Anime battle-arena background, no characters"
    ),
    "bg_inverse": (
        "A steppe landscape with its colours photographically inverted — a "
        "black sun in a pale sky, white grass, dark clouds glowing — unsettling "
        "and beautiful, empty ground in the middle. Anime battle-arena "
        "background, no characters"
    ),
    "bg_grid": (
        "A void of deep indigo crossed by a vast glowing teal coordinate lattice "
        "receding to a vanishing point, floating stone platforms at the "
        "intersections. Anime battle-arena background, no characters"
    ),
    "bg_temple": (
        "The inner hall of an ancient steppe stone sanctuary, two identical rows "
        "of carved pillars in perfect symmetry, a shaft of gold light down the "
        "centre, dust in the air. Anime battle-arena background, no characters"
    ),
    "bg_edge": (
        "The edge of the world at night: the steppe simply stops and beyond it "
        "is an endless star-field, the ground crumbling away into pieces that "
        "float upward. Anime battle-arena background, no characters"
    ),
    "bg_void": (
        "The inside of a collapsed star: a black-violet void with a colossal "
        "ring of broken golden light around a perfectly empty circular centre, "
        "fragments of steppe landscape floating and dissolving. Anime "
        "battle-arena background, no characters"
    ),
}

# ------------------------------------------------------------------ comics
# The story, in panels. 16:9 opaque, cinematic, characters allowed.

COMICS: dict[str, str] = {
    # prologue
    "c_stars": (
        "Night over the Kazakh steppe. A teenager in a felt cloak stands on a "
        "hill looking up at a sky where the stars are going out one by one, "
        "leaving clean black holes in the constellations. A great snow leopard "
        "sits beside them. Wide cinematic anime shot, awe and dread"
    ),
    "c_elder": (
        "Inside a yurt lit by a hearth. A very old woman with silver braids "
        "holds out a cracked circular stone seal to a young batyr; teal light "
        "leaks from the crack across both their faces. Warm firelight, deep "
        "shadows, close cinematic anime shot"
    ),
    "c_ride": (
        "Dawn. A young batyr on a galloping horse crossing an enormous golden "
        "steppe, a great snow leopard running alongside, dust trailing behind, "
        "a dark void visible on the horizon ahead. Wide cinematic anime shot, "
        "heroic"
    ),
    # after each herald
    "c_after1": (
        "A tall villain split down the middle in black and white armour kneels "
        "defeated in tall grass, and as he falls the two halves of him drift "
        "apart and dissolve into teal motes. A young batyr watches, sabre "
        "lowered. Cinematic anime shot, melancholy"
    ),
    "c_after2": (
        "A huge defeated villain in a crimson robe sits in the ruins of a nomad "
        "camp, the void in his belly closing over, looking down at a single "
        "piece of bread in his enormous hand as if seeing food for the first "
        "time. Cinematic anime shot, quiet"
    ),
    "c_after3": (
        "A veiled blindfolded villain lowers an ornate balance-scale until its "
        "two pans hang perfectly level, and pulls the blindfold off. Night "
        "bazaar, lanterns. Close cinematic anime shot"
    ),
    "c_after4": (
        "A gaunt villain in coin-covered black armour sits alone on the floor of "
        "a stone treasury as the hundred silver coins fall from his chest and "
        "roll away across the flagstones. Cinematic anime shot, cold light"
    ),
    "c_after5": (
        "A figure made of mirror shards comes apart above a still mountain lake, "
        "each shard falling and reflecting a different memory as it drops toward "
        "the water. Cinematic anime shot, beautiful"
    ),
    "c_after6": (
        "A colour-inverted warrior and a young batyr stand facing each other in "
        "an inverted steppe, palms raised and almost touching, and where their "
        "hands nearly meet the inverted colours cancel back to normal in a "
        "spreading circle. Cinematic anime shot, revelation"
    ),
    "c_after7": (
        "A spider-like sorcerer's lattice of glowing teal threads unravels into "
        "the indigo void, and a single bright point of light is left hanging "
        "exactly where a young batyr is standing. Cinematic anime shot"
    ),
    # the twist
    "c_twist1": (
        "A colossal symmetrical guardian in bone-white armour kneels, cracked, "
        "and reaches out one hand toward a young batyr, speaking urgently. "
        "Inside a symmetrical stone sanctuary, gold light. Cinematic anime shot, "
        "urgency"
    ),
    "c_twist2": (
        "Flashback, forty years earlier: an armoured batyr in his prime stands "
        "alone before an enormous tear in the sky, arms spread, holding it shut, "
        "as black-violet chains wrap around his wrists and pull him into it. "
        "Wide cinematic anime shot, sacrifice"
    ),
    "c_twist3": (
        "Nine defeated villains stand together in a row in the dark, heads "
        "bowed, looking toward a distant ring of broken golden light. Seen from "
        "behind. Wide cinematic anime shot, sombre"
    ),
    "c_twist4": (
        "Extreme close-up of a young batyr's eyes reflecting a ring of broken "
        "golden light, one tear held and unfallen, jaw set with decision. "
        "Cinematic anime shot"
    ),
    # the boss and the ending
    "c_throne": (
        "A colossal faceless armoured emperor of pure void sits on a throne "
        "inside a collapsed star, a broken crown of gold shards orbiting his "
        "head, one gauntlet raised, and everything the gauntlet points at is "
        "erasing at the edges. Wide cinematic anime shot, overwhelming"
    ),
    "c_reveal": (
        "The void inside a colossal suit of armour cracks open and the exhausted "
        "face of a very old white-bearded batyr looks out from inside it, "
        "recognising the young batyr in front of him. Close cinematic anime "
        "shot, heartbreak"
    ),
    "c_pair": (
        "A young batyr and an old white-bearded batyr stand back to back inside "
        "a ring of broken golden light, one hand each raised outward, and the "
        "light between them settles into a single perfect calm circle. Wide "
        "cinematic anime shot, resolution"
    ),
    "c_end1": (
        "Dawn over the Kazakh steppe. The stars are coming back on in a fading "
        "sky, one by one. A young batyr, an old batyr and a great snow leopard "
        "walk down a hill toward distant yurts, seen from behind. Wide cinematic "
        "anime shot, peace"
    ),
    "c_end2": (
        "Nine former villains, now companions, sit in a wide circle around a "
        "fire on the night steppe with a young batyr and an old batyr, the snow "
        "leopard asleep in the middle. Warm firelight. Wide cinematic anime "
        "shot, warmth"
    ),
}
