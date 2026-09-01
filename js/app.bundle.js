(() => {
'use strict';

/**
 * Thirty date-driven landmarks on the painted world map.
 * Positions and hotspots are percentages so they scale on every screen.
 * Scene presets provide safe fallbacks if a future landmark omits bespoke artwork.
 */
const scenePresets = {
  village: {
    sceneArt: './assets/art/scene-village.svg',
    sceneAlt: 'A warm village lane with a red mailbox beside a cottage',
    prompt: landmark => `A message has found its way to ${landmark}. The little red mailbox is waiting.`,
    objectLabel: 'Open the mailbox',
    hotspot: { x: 67, y: 53, w: 13, h: 25 }
  },
  forest: {
    sceneArt: './assets/art/scene-forest.svg',
    sceneAlt: 'A moonlit forest clearing with a treasure chest under an old tree',
    prompt: landmark => `Fireflies gather near ${landmark}. An old chest waits beneath the trees.`,
    objectLabel: 'Open the chest',
    hotspot: { x: 43, y: 62, w: 20, h: 19 }
  },
  summit: {
    sceneArt: './assets/art/scene-summit.svg',
    sceneAlt: 'A snowy mountain lookout with a vintage suitcase near a tent',
    prompt: landmark => `The trail reaches ${landmark}, where a weathered suitcase has been left beside the camp.`,
    objectLabel: 'Unfasten the suitcase',
    hotspot: { x: 63, y: 67, w: 22, h: 17 }
  }
};

const rewardMessages = [
  "You are a light that shines bright into every soul",
  "The joy you bring to people that encounter you is a precious gift",
  "Your laugh could light up the darkest room",
  "Thank you for every stream that made a bad day better",
  "You make this community feel like home",
  "The world is a little more beautiful with you in it",
  "Your passion for what you love is truly inspiring",
  "Here's to a woman who deserves every good thing",
  "You bring so much joy to so many people",
  "Thank you for always showing up, even on tough days",
  "Your kindness never goes unnoticed",
  "You are so much more than you give yourself credit for",
  "Watching you grow has been an absolute privilege",
  "You have a gift for making people feel seen",
  "The care you put into everything you do is remarkable",
  "Here's a small token of enormous appreciation",
  "You deserve rest, adventure, and everything in between",
  "Thank you for being exactly who you are",
  "Your dedication is something truly rare",
  "Every day you inspire more people than you realise",
  "You have built something genuinely special",
  "The best is always yet to come with you",
  "Your strength is quiet but it moves mountains",
  "Thank you for the memories you don't even know you created",
  "You deserve to be surrounded by people who know how special you are",
  "A little something for a person who gives so much",
  "Today and always — thank you, Kate",
  "You are appreciated beyond what words can carry",
  "Tomorrow is the day — are you ready? 🎂",
  "🐴 A Wild Horse in your name"
];
const voucherAssignments = [
  { from: 1, to: 1, image: 'assets/art/vouchers/voucher-spa.png', url: 'https://www.wyjatkowyprezent.pl/prezent/pakiet-przezyc-chwila-odprezenia/', alt: 'Relaxation experience voucher' },
  { from: 2, to: 8, image: 'assets/art/vouchers/voucher-amazon.png', url: 'https://www.amazon.pl', alt: 'Amazon gift voucher' },
  { from: 9, to: 15, image: 'assets/art/vouchers/voucher-ccc.png', url: 'https://giftcard.modivo.com/pl/page/ecard_choose', alt: 'MODIVO and CCC group gift voucher' },
  { from: 16, to: 22, image: 'assets/art/vouchers/voucher-morele.png', url: 'https://www.morele.net/elektroniczna-karta-podarunkowa-50-zl-976823/', alt: 'Morele electronic gift voucher' },
  { from: 23, to: 29, image: 'assets/art/vouchers/voucher-steam.png', url: 'https://store.steampowered.com/digitalgiftcards', alt: 'Steam digital gift card' },
  { from: 30, to: 30, image: 'assets/art/vouchers/voucher-cwhf.png', url: 'https://www.corollawildhorses.com/', alt: 'Corolla Wild Horse Fund' }
];
const landmarks = [
  { id: 'village-post', day: 1, title: 'A Letter at First Light', region: 'Dawn Harbor', x: 7, y: 88, scene: 'village', sceneArt: './assets/art/scene-day01-dawn-harbor.webp', sceneAlt: 'A golden dawn over a painted harbor village with a red wooden mailbox beside a cottage gate', openSceneArt: './assets/art/scene-day01-dawn-harbor-open.webp', revealBox: { x: 55, y: 43, w: 18, h: 34 }, letterArt: './assets/art/Letter.webp', hotspot: { x: 58.5, y: 48, w: 12, h: 28 }, icon: '💌', reward: 'The First Clue' },
  { id: 'saltwind-beacon', day: 2, title: 'The Beacon Below', region: 'Saltwind Beacon', x: 9, y: 81, scene: 'summit', sceneArt: './assets/art/scene-day02-saltwind-beacon.webp', sceneAlt: 'A windswept lighthouse terrace above a turquoise sea with an antique brass signal lantern on a stone pedestal', openSceneArt: './assets/art/scene-day02-saltwind-beacon-open.webp', revealBox: { x: 47, y: 18, w: 22, h: 56 }, prompt: 'The old signal lantern has gone dark, but something glints behind its little brass door.', objectLabel: 'Inspect the signal lantern', hotspot: { x: 53.5, y: 20, w: 14.5, h: 52 }, icon: '🕯️', reward: 'A Guiding Light' },
  { id: 'mossbell-village', day: 3, title: 'News from Mossbell', region: 'Mossbell Village', x: 16, y: 72, scene: 'village', sceneArt: './assets/art/scene-day03-mossbell-village.webp', sceneAlt: 'A sunlit mossy village square with a closed carved wooden notice cabinet beside a fountain', openSceneArt: './assets/art/scene-day03-mossbell-village-open.webp', revealBox: { x: 43, y: 20, w: 36, h: 65 }, prompt: 'The square is quiet, but the notice cabinet holds news meant for one particular traveler.', objectLabel: 'Open the notice cabinet', hotspot: { x: 50, y: 20, w: 25, h: 62 }, icon: '📜', reward: 'Village Tidings' },
  {
    id: 'old-windmill',
    day: 4,
    title: 'Sails in the Morning',
    region: 'The Old Windmill',
    x: 13,
    y: 65,
    scene: 'village',
    sceneArt: 'assets/art/scene-day04-old-windmill.webp',
    sceneAlt: 'The old windmill above golden fields in the morning light',
    openSceneArt: 'assets/art/scene-day04-old-windmill-open.webp',
    revealBox: { x: 54, y: 40, w: 18, h: 27 },
    prompt: 'The wind hums behind the carved door. Something bright turns with every breath of air.',
    objectLabel: 'Open the windmill door',
    hotspot: { x: 61, y: 42, w: 10, h: 24 },
    icon: '🌬️',
    reward: 'A Favorable Wind'
  },
  {
    id: 'golden-acre',
    day: 5,
    title: 'The Golden Acre',
    region: 'Sunwheat Fields',
    x: 23,
    y: 72,
    scene: 'village',
    sceneArt: 'assets/art/scene-day05-golden-acre.webp',
    sceneAlt: 'A treasure coffer beside a path through the golden wheat fields',
    openSceneArt: 'assets/art/scene-day05-golden-acre-open.webp',
    revealBox: { x: 57, y: 38, w: 27, h: 40 },
    prompt: 'A wheat sheaf marks the coffer. Whatever the harvest hid, it is waiting beneath the lid.',
    objectLabel: 'Open the harvest coffer',
    hotspot: { x: 58, y: 46, w: 24, h: 31 },
    icon: '🌾',
    reward: 'Harvest Gold'
  },
  {
    id: 'willowbend',
    day: 6,
    title: 'A Secret at Willowbend',
    region: 'Willowbend Cottage',
    x: 26,
    y: 65,
    scene: 'village',
    sceneArt: 'assets/art/scene-day06-willowbend.webp',
    sceneAlt: 'A carved jewelry box in the garden of Willowbend Cottage',
    openSceneArt: 'assets/art/scene-day06-willowbend-open.webp',
    revealBox: { x: 58, y: 48, w: 25, h: 30 },
    prompt: 'Willow leaves conceal old promises. The little carved box may be keeping one of them.',
    objectLabel: 'Open the willow jewelry box',
    hotspot: { x: 59, y: 54, w: 23, h: 22 },
    icon: '🫖',
    reward: 'A Quiet Afternoon'
  },
  {
    id: 'south-watch',
    day: 7,
    title: 'The Watcher’s Parcel',
    region: 'Southwatch Tower',
    x: 40,
    y: 76,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day07-southwatch-tower.webp',
    sceneAlt: 'A sealed watcher’s parcel on the terrace of Southwatch Tower',
    openSceneArt: 'assets/art/scene-day07-southwatch-tower-open.webp',
    revealBox: { x: 44, y: 45, w: 38, h: 47 },
    prompt: 'The watcher left no name, only a parcel sealed against the mountain weather.',
    objectLabel: 'Unwrap the watcher’s parcel',
    hotspot: { x: 47, y: 49, w: 33, h: 38 },
    icon: '🔭',
    reward: 'The Long View'
  },
  {
    id: 'moonwash-cove',
    day: 8,
    title: 'Treasure on the Tide',
    region: 'Moonwash Cove',
    x: 47,
    y: 88,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day08-moonwash-cove.webp',
    sceneAlt: 'A closed scallop reliquary resting in a tide pool at Moonwash Cove',
    openSceneArt: 'assets/art/scene-day08-moonwash-cove-open.webp',
    revealBox: { x: 54, y: 34, w: 30, h: 47 },
    prompt: 'The tide has withdrawn, but it left one impossible shell behind among the rocks.',
    objectLabel: 'Open the scallop reliquary',
    hotspot: { x: 56, y: 50, w: 26, h: 30 },
    icon: '🐚',
    reward: 'A Seaside Treasure'
  },
  {
    id: 'greenwater-isle',
    day: 9,
    title: 'Across Green Water',
    region: 'Greenwater Isle',
    x: 58,
    y: 76,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day09-greenwater-isle.webp',
    sceneAlt: 'A closed navigator’s case hidden beneath coastal roots on Greenwater Isle',
    openSceneArt: 'assets/art/scene-day09-greenwater-isle-open.webp',
    revealBox: { x: 58, y: 34, w: 28, h: 49 },
    prompt: 'Someone crossed the green water before you and hid their navigator’s case beneath the roots.',
    objectLabel: 'Open the navigator’s case',
    hotspot: { x: 60, y: 52, w: 23, h: 27 },
    icon: '🛶',
    reward: 'The Island Cache'
  },
  {
    id: 'echo-basin',
    day: 10,
    title: 'The Singing Falls',
    region: 'Echo Falls Basin',
    x: 82,
    y: 69,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day10-echo-falls.webp',
    sceneAlt: 'A bronze sluice lever built into the rocks beside the singing waterfalls',
    openSceneArt: 'assets/art/scene-day10-echo-falls-open.webp',
    revealBox: { x: 70, y: 24, w: 19, h: 35 },
    prompt: 'One bronze lever interrupts the falls’ natural rhythm. Perhaps the water is hiding another note.',
    objectLabel: 'Pull the sluice lever',
    hotspot: { x: 72, y: 25, w: 8, h: 32 },
    icon: '💧',
    reward: 'Bottled Wonder'
  },
  {
    id: 'foxglove-grove',
    day: 11,
    title: 'Tracks through Foxglove',
    region: 'Foxglove Grove',
    x: 74,
    y: 61,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day11-foxglove-grove.webp',
    sceneAlt: 'Fox tracks leading to a leaf-covered hollow beside a woodland trail',
    openSceneArt: 'assets/art/scene-day11-foxglove-grove-open.webp',
    revealBox: { x: 62, y: 45, w: 25, h: 43 },
    prompt: 'The tracks stop at a mound of leaves beneath the roots. The foxgloves are perfectly still.',
    objectLabel: 'Brush away the leaves',
    hotspot: { x: 63, y: 51, w: 22, h: 35 },
    icon: '🍂',
    reward: 'A Woodland Token'
  },
  {
    id: 'forest-cache',
    day: 12,
    title: 'The Emberleaf Cache',
    region: 'Emberleaf Camp',
    x: 76,
    y: 49,
    scene: 'forest',
    sceneArt: './assets/art/scene-day12-emberleaf-camp.webp',
    sceneAlt: 'A warm autumn forest campsite with a brass-bound treasure chest beneath an ancient tree',
    openSceneArt: 'assets/art/scene-day12-emberleaf-camp-open.webp',
    revealBox: { x: 51, y: 46, w: 23, h: 38 },
    prompt: 'The brass-bound chest waits beneath the Emberleaf tree, warm as the last light of autumn.',
    objectLabel: 'Open the Emberleaf chest',
    hotspot: { x: 53.5, y: 54, w: 17, h: 25 },
    icon: '🗝️',
    reward: 'A Forest Treasure'
  },
  {
    id: 'amber-ruins',
    day: 13,
    title: 'Whispers in Amber',
    region: 'Amber Chapel Ruins',
    x: 72,
    y: 37,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day13-amber-chapel.webp',
    sceneAlt: 'A loose curl of amber-marked bark on an ancient tree within chapel ruins',
    openSceneArt: 'assets/art/scene-day13-amber-chapel-open.webp',
    revealBox: { x: 68, y: 37, w: 18, h: 29 },
    prompt: 'Amber gleams along the ancient trunk. One curl of bark seems ready to lift at a touch.',
    objectLabel: 'Lift the amber-marked bark',
    hotspot: { x: 68, y: 39, w: 10, h: 24 },
    icon: '🔔',
    reward: 'The Chapel Bell'
  },
  {
    id: 'wayfinder-isle',
    day: 14,
    title: 'The Wayfinder’s Light',
    region: 'Wayfinder Isle',
    x: 61,
    y: 50,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day14-wayfinder-isle.webp',
    sceneAlt: 'An ancient star-map disk embedded in a navigation cairn above the island channels',
    openSceneArt: 'assets/art/scene-day14-wayfinder-isle-open.webp',
    revealBox: { x: 60, y: 16, w: 26, h: 62 },
    prompt: 'The stars on the old stone disk almost align. One careful turn may show the way.',
    objectLabel: 'Align the star-map disk',
    hotspot: { x: 61, y: 18, w: 23, h: 39 },
    icon: '🏮',
    reward: 'A Steady Light'
  },
  {
    id: 'three-bridges',
    day: 15,
    title: 'Where Three Roads Meet',
    region: 'Three Bridges Crossing',
    x: 53,
    y: 44,
    scene: 'village',
    sceneArt: 'assets/art/scene-day15-three-bridges.webp',
    sceneAlt: 'Three stone bridges meeting around an overgrown patch beneath a weathered signpost',
    openSceneArt: 'assets/art/scene-day15-three-bridges-open.webp',
    revealBox: { x: 50, y: 58, w: 21, h: 24 },
    prompt: 'The grass beneath the signpost grows unusually thick. Something has been hidden below it for years.',
    objectLabel: 'Clear the overgrown patch',
    hotspot: { x: 51, y: 60, w: 19, h: 20 },
    icon: '🧭',
    reward: 'The Wayfinder'
  },
  {
    id: 'lanternwood',
    day: 16,
    title: 'Lanterns beneath the Trees',
    region: 'Lanternwood Forest',
    x: 44,
    y: 42,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day16-lanternwood.webp',
    sceneAlt: 'An unlit ivy-wrapped lantern hanging above a glowing woodland path',
    openSceneArt: 'assets/art/scene-day16-lanternwood-open.webp',
    revealBox: { x: 74, y: 16, w: 24, h: 47 },
    prompt: 'Every lantern beneath the trees is glowing except one, its dark glass wrapped in ivy.',
    objectLabel: 'Open the unlit lantern',
    hotspot: { x: 77, y: 18, w: 14, h: 43 },
    icon: '✨',
    reward: 'Firefly Glass'
  },
  {
    id: 'roundstone-keep',
    day: 17,
    title: 'The Keeper’s Riddle',
    region: 'Roundstone Keep',
    x: 38,
    y: 55,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day17-roundstone-keep.webp',
    sceneAlt: 'A scrambled sliding-tile riddle embedded in the curved wall of Roundstone Keep',
    openSceneArt: 'assets/art/scene-day17-roundstone-keep-open.webp',
    revealBox: { x: 42, y: 7, w: 50, h: 77 },
    prompt: 'Set the moon above the tower, place the key beneath the crown, and join the road that has no end.',
    objectLabel: 'Slide the riddle panel aside',
    hotspot: { x: 43, y: 8, w: 48, h: 75 },
    icon: '👑',
    reward: 'The Keeper’s Crown'
  },
  {
    id: 'brookmarket',
    day: 18,
    title: 'Market Day Mystery',
    region: 'Brookmarket Hamlet',
    x: 30,
    y: 52,
    scene: 'village',
    sceneArt: 'assets/art/scene-day18-brookmarket.webp',
    sceneAlt: 'A bustling village market with a peach crate hidden among produce stalls',
    openSceneArt: 'assets/art/scene-day18-brookmarket-open.webp',
    revealBox: { x: 53, y: 50, w: 30, h: 34 },
    prompt: 'Among summer’s sweetest harvest, one fruit never ripens and never rots.',
    objectLabel: 'Search beneath the peaches',
    hotspot: { x: 56, y: 56, w: 22, h: 25 },
    icon: '🍑',
    reward: 'The Golden Peach'
  },
  {
    id: 'silverstep-bridge',
    day: 19,
    title: 'Over Silverstep',
    region: 'Silverstep Bridge',
    x: 25,
    y: 44,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day19-silverstep-bridge.webp',
    sceneAlt: 'A silver-veined stone bridge crossing a rushing mountain river',
    openSceneArt: 'assets/art/scene-day19-silverstep-bridge-open.webp',
    revealBox: { x: 20, y: 46, w: 34, h: 45 },
    prompt: 'The safest crossing keeps its promise beneath the final step.',
    objectLabel: 'Lift the silver-veined stone',
    hotspot: { x: 27, y: 47, w: 24, h: 35 },
    icon: '💎',
    reward: 'The Silverstep Anklet'
  },
  {
    id: 'westpine-trail',
    day: 20,
    title: 'The Pine Trail Cache',
    region: 'Westpine Trail',
    x: 16,
    y: 39,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day20-westpine-trail.webp',
    sceneAlt: 'A woodland waystation with neatly stacked firewood beside a travelers’ shelter',
    openSceneArt: 'assets/art/scene-day20-westpine-trail-open.webp',
    revealBox: { x: 9, y: 55, w: 36, h: 32 },
    prompt: 'What the careful traveler leaves behind, the forest keeps beneath its winter fuel.',
    objectLabel: 'Move the stacked firewood',
    hotspot: { x: 18, y: 59, w: 25, h: 25 },
    icon: '🌲',
    reward: 'The Evergreen Pinecone'
  },
  {
    id: 'fallen-arch',
    day: 21,
    title: 'Beyond the Fallen Arch',
    region: 'The Fallen Arch',
    x: 12,
    y: 30,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day21-fallen-arch.webp',
    sceneAlt: 'A fallen arch framing an ancient sanctuary and a root-bound griffin guardian',
    openSceneArt: 'assets/art/scene-day21-fallen-arch-open.webp',
    revealBox: { x: 34, y: 58, w: 45, h: 40 },
    prompt: 'Beyond the broken threshold, the last guardian still holds the seal.',
    objectLabel: 'Free the guardian’s paw',
    hotspot: { x: 44, y: 62, w: 28, h: 35 },
    icon: '🦅',
    reward: 'The Griffin Seal'
  },
  {
    id: 'thunder-gate',
    day: 22,
    title: 'The Mountain Gate',
    region: 'Thunder Gate',
    x: 28,
    y: 27,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day22-mountain-gate.webp',
    sceneAlt: 'A severe monumental mountain gate guarded by colossal stone sentinels',
    openSceneArt: 'assets/art/scene-day22-mountain-gate-open.webp',
    revealBox: { x: 36, y: 61, w: 23, h: 37 },
    prompt: 'The mountain yields to neither strength nor command—but it remembers those who climb.',
    objectLabel: 'Break the ice from the counterweight',
    hotspot: { x: 39, y: 66, w: 15, h: 20 },
    icon: '🐐',
    reward: 'The Mountain’s Favor'
  },
  {
    id: 'summit-suitcase',
    day: 23,
    title: 'Luggage at Cloudbreak',
    region: 'Cloudbreak Citadel',
    x: 22,
    y: 20,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day23-cloudbreak-citadel.webp',
    sceneAlt: 'A high mountain citadel terrace with a vintage leather suitcase beside an expedition tent',
    openSceneArt: 'assets/art/scene-day23-cloudbreak-citadel-open.webp',
    revealBox: { x: 49, y: 44, w: 24, h: 42 },
    prompt: 'Every expedition begins with a packed case—and sometimes the means to travel farther than expected.',
    objectLabel: 'Open the expedition suitcase',
    hotspot: { x: 53, y: 59, w: 17, h: 20 },
    icon: '💎',
    reward: 'A Future Expedition'
  },
  {
    id: 'whitewater-crown',
    day: 24,
    title: 'Above the White Water',
    region: 'Whitewater Crown',
    x: 31.5,
    y: 23,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day24-whitewater-crown.webp',
    sceneAlt: 'Seven waterfalls crowning a bright alpine shrine above the clouds',
    openSceneArt: 'assets/art/scene-day24-whitewater-crown-open.webp',
    revealBox: { x: 18, y: 58, w: 38, h: 33 },
    prompt: 'Where seven waters wear a crown, look beneath the stones they have made smooth.',
    objectLabel: 'Move the river stones',
    hotspot: { x: 29, y: 64, w: 24, h: 23 },
    icon: '💧',
    reward: 'The Whitewater Opal'
  },
  {
    id: 'upper-sanctuary',
    day: 25,
    title: 'The World Below',
    region: 'Upper Sanctuary',
    x: 28.5,
    y: 15.5,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day25-upper-sanctuary.webp',
    sceneAlt: 'An ancient brass viewing instrument overlooking the wide land from the sanctuary’s upper terrace',
    openSceneArt: 'assets/art/scene-day25-upper-sanctuary-open.webp',
    revealBox: { x: 56, y: 55, w: 25, h: 40 },
    prompt: 'The oldest watcher looked beyond the horizon, but kept its finest view close at hand.',
    objectLabel: 'Open the viewing pillar',
    hotspot: { x: 64, y: 62, w: 12, h: 26 },
    icon: '🔭',
    reward: 'The Far Horizon Brooch'
  },
  {
    id: 'river-beginning',
    day: 26,
    title: 'At the River’s Beginning',
    region: 'Firstwater Falls',
    x: 36.5,
    y: 15.5,
    scene: 'summit',
    sceneArt: 'assets/art/scene-day26-river-beginning.webp',
    sceneAlt: 'Clear headwaters rushing from the sanctuary toward an immense waterfall',
    openSceneArt: 'assets/art/scene-day26-river-beginning-open.webp',
    revealBox: { x: 27, y: 48, w: 34, h: 50 },
    prompt: 'Before the river learned to fall, a blue-winged watcher guarded its first waters.',
    objectLabel: 'Draw back the hanging moss',
    hotspot: { x: 30, y: 57, w: 27, h: 40 },
    icon: '🐦',
    reward: 'The Firstwater Kingfisher'
  },
  {
    id: 'elder-stones',
    day: 27,
    title: 'The Circle Remembers',
    region: 'The Elder Stones',
    x: 49.5,
    y: 24,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day27-elder-stones.webp',
    sceneAlt: 'An immense circular forest monument of ancient carved stone pillars',
    openSceneArt: 'assets/art/scene-day27-elder-stones-open.webp',
    revealBox: { x: 46, y: 60, w: 45, h: 36 },
    prompt: 'No single stone remembers the whole, but the circle has forgotten nothing.',
    objectLabel: 'Stir the ancient ashes',
    hotspot: { x: 49, y: 63, w: 38, h: 23 },
    icon: '🪨',
    reward: 'The Elder Rune'
  },
  {
    id: 'last-crossing',
    day: 28,
    title: 'The Last Crossing',
    region: 'Ferryman’s Bridge',
    x: 66,
    y: 34,
    scene: 'forest',
    sceneArt: 'assets/art/scene-day28-last-crossing.webp',
    sceneAlt: 'An old stone-and-timber bridge crossing a turquoise river toward a distant tower',
    openSceneArt: 'assets/art/scene-day28-last-crossing-open.webp',
    revealBox: { x: 42, y: 59, w: 22, h: 41 },
    prompt: 'The ferryman made his final crossing, but left one promise bound to the shore.',
    objectLabel: 'Unwind the ferryman’s rope',
    hotspot: { x: 43, y: 64, w: 10, h: 18 },
    icon: '🌉',
    reward: 'The Last Crossing Cuff'
  },
  {
    id: 'last-golden-gate',
    day: 29,
    title: 'The Last Golden Gate',
    region: 'The Great Tower',
    x: 78,
    y: 36,
    scene: 'village',
    sceneArt: 'assets/art/scene-day29-last-golden-gate.webp',
    sceneAlt: 'The monumental golden-lit entrance to the great tower above the river valley',
    openSceneArt: 'assets/art/scene-day29-last-golden-gate-open.webp',
    revealBox: { x: 25, y: 43, w: 18, h: 24 },
    prompt: 'Every road has led to this door. The last lock remembers the light.',
    objectLabel: 'Turn the gatekeeper’s sun',
    hotspot: { x: 27, y: 46, w: 14, h: 19 },
    icon: '🔑',
    reward: 'The Key of the Golden Gate'
  },
  {
    id: 'starlight-paddock',
    day: 30,
    title: 'Final Quest — A New Friend',
    region: 'Starlight Paddock',
    x: 84,
    y: 14,
    scene: 'village',
    sceneArt: 'assets/art/scene-day30-starlight-paddock.webp',
    sceneAlt: 'A female adventurer seen from behind at the entrance to a sunlit farm with closed stable doors',
    openSceneArt: 'assets/art/scene-day30-starlight-paddock-open.webp',
    revealBox: { x: 0, y: 0, w: 100, h: 100 },
    easterEggArt: 'assets/art/scene-day30-starlight-paddock-easter-egg.webp',
    prompt: 'The journey ends at one last closed door. Someone is waiting on the other side.',
    objectLabel: 'Open the stable doors',
    hotspot: { x: 38, y: 38, w: 21, h: 20 },
    icon: '🐴',
    reward: 'A New Friend',
    final: true
  }
];

const quests = landmarks.map(landmark => {
  const scene = scenePresets[landmark.scene];
  const voucher = voucherAssignments.find(assignment => landmark.day >= assignment.from && landmark.day <= assignment.to);
  const reward = landmark.final
    ? {
        icon: landmark.icon,
        title: 'Adventure Complete — A New Friend',
        text: rewardMessages[landmark.day - 1],
        voucherImage: voucher.image,
        voucherUrl: voucher.url,
        voucherAlt: voucher.alt
      }
    : {
        icon: landmark.icon,
        title: landmark.reward,
        text: rewardMessages[landmark.day - 1],
        voucherImage: voucher.image,
        voucherUrl: voucher.url,
        voucherAlt: voucher.alt
      };

  return {
    id: landmark.id,
    day: landmark.day,
    title: landmark.title,
    region: landmark.region,
    mapPosition: { x: landmark.x, y: landmark.y },
    sceneArt: landmark.sceneArt ?? scene.sceneArt,
    sceneAlt: landmark.sceneAlt ?? scene.sceneAlt,
    openSceneArt: landmark.openSceneArt ?? null,
    revealBox: landmark.revealBox ?? null,
    letterArt: landmark.letterArt ?? null,
    easterEggArt: landmark.easterEggArt ?? null,
    prompt: landmark.prompt ?? scene.prompt(landmark.region),
    objectLabel: landmark.objectLabel ?? scene.objectLabel,
    hotspot: { ...(landmark.hotspot ?? scene.hotspot) },
    reward,
    final: Boolean(landmark.final)
  };
});

const getQuest = id => quests.find(quest => quest.id === id);

const START = new Date(2026, 10, 1);
const END = new Date(2026, 10, 30, 23, 59, 59, 999);

// Temporary preview default. Set to null before launch to use the real date.
const DEVELOPMENT_DAY = 1;

function getAdventureDay(search = window.location.search, now = new Date()) {
  const debug = Number.parseInt(new URLSearchParams(search).get('day'), 10);
  if (Number.isInteger(debug)) return Math.min(30, Math.max(0, debug));
  if (Number.isInteger(DEVELOPMENT_DAY)) return DEVELOPMENT_DAY;
  if (now < START) return 0;
  if (now > END) return 30;
  return now.getDate();
}

function formatAdventureDate(day) {
  if (day === 0) return 'Adventure locked';
  return `November ${day}, 2026`;
}

const STORAGE_KEY = 'kcm2026.completedQuests';

function loadCompleted() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(Array.isArray(value) ? value : []);
  } catch {
    return new Set();
  }
}

function saveCompleted(completed) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}


const day = getAdventureDay();
const completed = loadCompleted();
let activeQuest = null;
let journalPage = 0;
let journalImageIndex = 0;

// Add purchased codes here. A code is only shown after its matching quest is complete.
const voucherCodes = Object.fromEntries(quests.map(quest => [quest.day, 'Code to be added']));
const voucherGroups = [
  { title: 'Spa', from: 1, to: 1, image: 'assets/art/vouchers/voucher-spa.png' },
  { title: 'Amazon', from: 2, to: 8, image: 'assets/art/vouchers/voucher-amazon.png' },
  { title: 'MODIVO / CCC', from: 9, to: 15, image: 'assets/art/vouchers/voucher-ccc.png' },
  { title: 'Morele', from: 16, to: 22, image: 'assets/art/vouchers/voucher-morele.png' },
  { title: 'Steam', from: 23, to: 29, image: 'assets/art/vouchers/voucher-steam.png' },
  { title: 'Wild Horse Fund', from: 30, to: 30, image: 'assets/art/vouchers/voucher-cwhf.png' }
];
const VOUCHER_CODE_PLACEHOLDER = 'Code to be added';

const $ = selector => document.querySelector(selector);
const els = {
  mapView: $('#mapView'), sceneView: $('#sceneView'), mapWorld: $('#mapWorld'),
  markers: $('#questMarkers'), markerTemplate: $('#markerTemplate'), dayLabel: $('#dayLabel'),
  completedCount: $('#completedCount'), currentRegion: $('#currentRegion'), resetProgress: $('#resetProgress'), discoveryPercent: $('#discoveryPercent'), discoveryBar: $('#discoveryBar'),
  mapHint: $('#mapHint'), sceneStage: $('#sceneStage'), sceneArt: $('#sceneArt'), sceneOpenArt: $('#sceneOpenArt'), sceneRegion: $('#sceneRegion'),
  sceneTitle: $('#sceneTitle'), scenePrompt: $('#scenePrompt'), hotspot: $('#hotspot'), backButton: $('#backButton'),
  modal: $('#rewardModal'), rewardIcon: $('#rewardIcon'), rewardDay: $('#rewardDay'), rewardTitle: $('#rewardTitle'),
  rewardText: $('#rewardText'), rewardVoucher: $('#rewardVoucher'), rewardVoucherImage: $('#rewardVoucherImage'), closeReward: $('#closeReward'), returnButton: $('#returnButton'),
  letterOverlay: $('#letterOverlay'), letterImage: $('#letterImage'), closeLetter: $('#closeLetter'),
  openJournal: $('#openJournal'), journalOverlay: $('#journalOverlay'), closeJournal: $('#closeJournal'),
  journalPage: $('#journalPage'), journalPageLabel: $('#journalPageLabel'), journalPrevious: $('#journalPrevious'), journalNext: $('#journalNext'),
  parchmentOverlay: $('#parchmentOverlay'), parchmentTitle: $('#parchmentTitle'), parchmentCodes: $('#parchmentCodes'), closeParchment: $('#closeParchment'),
  imageOverlay: $('#imageOverlay'), journalFullImage: $('#journalFullImage'), imageViewerTitle: $('#imageViewerTitle'), closeImageViewer: $('#closeImageViewer'),
  previousJournalImage: $('#previousJournalImage'), nextJournalImage: $('#nextJournalImage')
};

const preloadedImages = new Set();

function preloadImage(src) {
  if (!src || preloadedImages.has(src)) return Promise.resolve();
  preloadedImages.add(src);
  return new Promise(resolve => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

function questImageSources(quest) {
  return [quest.sceneArt, quest.openSceneArt, quest.letterArt, quest.easterEggArt].filter(Boolean);
}

function scheduleIdleWork(callback) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout: 2500 });
  } else {
    window.setTimeout(callback, 800);
  }
}

function preloadAdventureImages() {
  const currentQuest = quests.find(quest => quest.day === day);
  questImageSources(currentQuest ?? {}).forEach(preloadImage);

  const backgroundQueue = quests
    .filter(quest => quest.day <= day && quest !== currentQuest)
    .flatMap(questImageSources);

  const preloadNext = () => {
    const nextSource = backgroundQueue.shift();
    if (!nextSource) return;
    preloadImage(nextSource).finally(() => scheduleIdleWork(preloadNext));
  };

  scheduleIdleWork(preloadNext);
}

function render() {
  const progress = Math.round((day / 30) * 100);
  els.dayLabel.textContent = formatAdventureDate(day);
  els.completedCount.textContent = quests.filter(quest => completed.has(quest.id)).length;
  els.currentRegion.textContent = quests.find(quest => quest.day === day)?.region ?? 'Awaiting November';
  els.discoveryPercent.textContent = `${progress}%`;
  els.discoveryBar.style.width = `${progress}%`;
  els.mapHint.textContent = day === 0
    ? 'The first quest marker appears on November 1, 2026. Try ?day=12 while building.'
    : 'Choose any available marker to begin a quest.';
  renderMarkers();
}

function renderMarkers() {
  els.markers.replaceChildren();
  quests.forEach(quest => {
    const unlocked = quest.day <= day;
    const done = completed.has(quest.id);
    const active = unlocked && quest.day === day && !done;
    const available = unlocked && !active && !done;
    const marker = els.markerTemplate.content.firstElementChild.cloneNode(true);
    marker.style.left = `${quest.mapPosition.x}%`;
    marker.style.top = `${quest.mapPosition.y}%`;
    marker.classList.toggle('is-locked', !unlocked);
    marker.classList.toggle('is-active', active);
    marker.classList.toggle('is-available', available);
    marker.classList.toggle('is-complete', done);
    marker.classList.toggle('is-final', quest.final);
    marker.querySelector('.marker-symbol').textContent = !unlocked ? '◆' : done ? '✓' : active ? '!' : '•';
    marker.querySelector('.marker-label').textContent = `Day ${quest.day} · ${quest.title}`;
    marker.setAttribute('aria-label', !unlocked
      ? `${quest.title}, unlocks November ${quest.day}`
      : `${quest.title}${done ? ', completed' : ', available'}`);
    marker.disabled = !unlocked;
    if (active) marker.setAttribute('aria-current', 'step');
    marker.addEventListener('click', () => enterQuest(quest.id));
    els.markers.append(marker);
  });
}

function enterQuest(id) {
  activeQuest = getQuest(id);
  if (!activeQuest) return;
  els.mapWorld.style.setProperty('--zoom-x', `${activeQuest.mapPosition.x}%`);
  els.mapWorld.style.setProperty('--zoom-y', `${activeQuest.mapPosition.y}%`);
  els.mapView.classList.add('is-departing');
  setTimeout(() => {
    els.sceneArt.src = activeQuest.sceneArt;
    els.sceneArt.alt = activeQuest.sceneAlt;
    els.sceneStage.classList.remove('is-object-opening', 'is-object-open');
    if (activeQuest.openSceneArt && activeQuest.revealBox) {
      const box = activeQuest.revealBox;
      els.sceneOpenArt.src = activeQuest.openSceneArt;
      els.sceneOpenArt.hidden = false;
      els.sceneStage.style.setProperty('--open-top', `${box.y}%`);
      els.sceneStage.style.setProperty('--open-right', `${100 - box.x - box.w}%`);
      els.sceneStage.style.setProperty('--open-bottom', `${100 - box.y - box.h}%`);
      els.sceneStage.style.setProperty('--open-left', `${box.x}%`);
      els.sceneStage.style.setProperty('--effect-x', `${box.x + box.w / 2}%`);
      els.sceneStage.style.setProperty('--effect-y', `${box.y + box.h / 2}%`);
    } else {
      els.sceneOpenArt.removeAttribute('src');
      els.sceneOpenArt.hidden = true;
    }
    els.sceneRegion.textContent = `Day ${activeQuest.day} · ${activeQuest.region}`;
    els.sceneTitle.textContent = activeQuest.title;
    els.scenePrompt.textContent = completed.has(activeQuest.id)
      ? 'You have already found this treasure. You can inspect it again.'
      : activeQuest.prompt;
    Object.assign(els.hotspot.style, {
      left: `${activeQuest.hotspot.x}%`, top: `${activeQuest.hotspot.y}%`,
      width: `${activeQuest.hotspot.w}%`, height: `${activeQuest.hotspot.h}%`
    });
    els.hotspot.querySelector('.hotspot-label').textContent = activeQuest.objectLabel;
    showView('scene');
    els.hotspot.focus({ preventScroll: true });
    els.mapView.classList.remove('is-departing');
  }, 520);
}

function showView(view) {
  const scene = view === 'scene';
  els.mapView.classList.toggle('is-active', !scene);
  els.sceneView.classList.toggle('is-active', scene);
  els.mapView.setAttribute('aria-hidden', String(scene));
  els.sceneView.setAttribute('aria-hidden', String(!scene));
}

function handleObjectInteraction() {
  if (!activeQuest) return;
  const hasOpenState = Boolean(activeQuest.openSceneArt && activeQuest.revealBox);
  const isAlreadyOpen = els.sceneStage.classList.contains('is-object-open');

  if (!hasOpenState || isAlreadyOpen) {
    showReward();
    return;
  }

  els.hotspot.disabled = true;
  els.sceneStage.classList.add('is-object-opening', 'is-object-open');
  window.setTimeout(() => {
    els.sceneStage.classList.remove('is-object-opening');
    if (activeQuest.letterArt) {
      showLetter();
    } else {
      els.hotspot.disabled = false;
      showReward();
    }
  }, activeQuest.letterArt ? 3000 : 2900);
}

function revealEasterEgg() {
  if (!activeQuest?.easterEggArt || !els.sceneStage.classList.contains('is-object-open')) return;
  els.sceneOpenArt.src = activeQuest.easterEggArt;
}

function showLetter() {
  els.letterImage.src = activeQuest.letterArt;
  els.letterOverlay.classList.add('is-open');
  els.letterOverlay.setAttribute('aria-hidden', 'false');
  els.closeLetter.focus();
}

function closeLetter() {
  els.letterOverlay.classList.remove('is-open');
  els.letterOverlay.setAttribute('aria-hidden', 'true');
  els.hotspot.disabled = false;
  showReward();
}

function showReward() {
  if (!activeQuest) return;
  completed.add(activeQuest.id);
  saveCompleted(completed);
  els.rewardIcon.textContent = activeQuest.reward.icon;
  els.rewardDay.textContent = `Day ${activeQuest.day} reward`;
  els.rewardTitle.textContent = activeQuest.reward.title;
  els.rewardText.textContent = activeQuest.reward.text;
  els.rewardVoucherImage.src = activeQuest.reward.voucherImage;
  els.rewardVoucherImage.alt = activeQuest.reward.voucherAlt;
  els.modal.classList.add('is-open');
  els.modal.setAttribute('aria-hidden', 'false');
  els.returnButton.focus();
  render();
}

function closeReward(returnToMap = false, revealFinale = false) {
  els.modal.classList.remove('is-open');
  els.modal.setAttribute('aria-hidden', 'true');
  if (revealFinale && activeQuest?.day === 30) {
    revealEasterEgg();
    els.backButton.focus();
    return;
  }
  if (returnToMap) {
    showView('map');
    activeQuest = null;
    render();
    document.querySelector('.quest-marker.is-complete:not(:disabled)')?.focus();
  } else {
    els.hotspot.focus();
  }
}

function setOverlay(overlay, open) {
  overlay.classList.toggle('is-open', open);
  overlay.setAttribute('aria-hidden', String(!open));
}

function renderJournal() {
  els.journalPage.replaceChildren();
  els.journalPrevious.disabled = journalPage === 0;
  els.journalNext.disabled = journalPage === 5;
  els.journalPageLabel.textContent = journalPage === 0 ? 'Page 1 of 6 · Voucher collection' : `Page ${journalPage + 1} of 6 · Days ${(journalPage - 1) * 6 + 1}–${journalPage * 6}`;
  const grid = document.createElement('div');
  grid.className = 'journal-grid';

  if (journalPage === 0) {
    voucherGroups.forEach(group => {
      const groupQuests = quests.filter(quest => quest.day >= group.from && quest.day <= group.to);
      const found = groupQuests.filter(quest => completed.has(quest.id)).length;
      const revealed = day >= group.from;
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = `journal-tile voucher-tile${revealed ? '' : ' is-concealed'}`;
      tile.disabled = !revealed;
      tile.setAttribute('aria-label', revealed
        ? `${group.title}: ${found} of ${groupQuests.length} rewards found`
        : `${group.title} voucher opens on day ${group.from}`);
      tile.innerHTML = revealed
        ? `<img src="${group.image}" alt="${group.title} voucher"><span class="voucher-progress">${found}/${groupQuests.length}</span><span class="journal-tile-caption">${group.title}</span>`
        : `<span class="voucher-concealed-message">Opens on day ${group.from}</span>`;
      if (revealed) tile.addEventListener('click', () => openVoucherParchment(group));
      grid.append(tile);
    });
  } else {
    quests.slice((journalPage - 1) * 6, journalPage * 6).forEach(quest => {
      const unlocked = completed.has(quest.id);
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = `journal-tile${unlocked ? '' : ' is-locked'}`;
      tile.disabled = !unlocked;
      tile.setAttribute('aria-label', unlocked ? `View Day ${quest.day}: ${quest.title}` : `Day ${quest.day}, not yet discovered`);
      tile.innerHTML = `<img src="${quest.openSceneArt || quest.sceneArt}" alt=""><span class="journal-tile-caption">Day ${quest.day} · ${quest.title}</span>${unlocked ? '' : `<span class="journal-lock">${quest.day}<small>Not yet discovered</small></span>`}`;
      if (unlocked) tile.addEventListener('click', () => openJournalImage(quest));
      grid.append(tile);
    });
  }
  els.journalPage.append(grid);
}

function openJournal() {
  renderJournal();
  setOverlay(els.journalOverlay, true);
  els.closeJournal.focus();
}

function closeJournal() {
  setOverlay(els.journalOverlay, false);
  els.openJournal.focus();
}

function changeJournalPage(change) {
  journalPage = Math.max(0, Math.min(5, journalPage + change));
  renderJournal();
}

async function copyVoucherCode(code) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(code);
      return true;
    }
  } catch {}

  const field = document.createElement('textarea');
  field.value = code;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.append(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  return copied;
}

function openVoucherParchment(group, selectedDay = null) {
  els.parchmentTitle.textContent = selectedDay ? `${group.title} · Day ${selectedDay}` : group.title;
  els.parchmentCodes.replaceChildren();
  quests.filter(quest => quest.day >= group.from && quest.day <= group.to && (!selectedDay || quest.day === selectedDay)).forEach(quest => {
    const unlocked = completed.has(quest.id);
    const row = document.createElement('div');
    row.className = 'code-row';
    const code = voucherCodes[quest.day];
    const codeReady = unlocked && code && code !== VOUCHER_CODE_PLACEHOLDER;
    const displayedCode = unlocked ? code : '••••••••••••';
    const buttonLabel = !unlocked ? 'Locked' : codeReady ? 'Copy' : 'Pending';
    row.innerHTML = `<strong>Day ${quest.day}</strong><span class="code-value${unlocked ? '' : ' is-locked'}">${displayedCode}</span><button class="copy-code" type="button" ${codeReady ? '' : 'disabled'}>${buttonLabel}</button>`;
    if (codeReady) row.querySelector('button').addEventListener('click', async event => {
      const copied = await copyVoucherCode(code);
      event.currentTarget.textContent = copied ? 'Copied' : 'Copy failed';
      window.setTimeout(() => { event.currentTarget.textContent = 'Copy'; }, 1200);
    });
    els.parchmentCodes.append(row);
  });
  setOverlay(els.parchmentOverlay, true);
  els.closeParchment.focus();
}

function openRewardVoucher() {
  if (!activeQuest || !completed.has(activeQuest.id)) return;
  const group = voucherGroups.find(item => activeQuest.day >= item.from && activeQuest.day <= item.to);
  if (group) openVoucherParchment(group, activeQuest.day);
}

function completedGallery() {
  return quests.filter(quest => completed.has(quest.id));
}

function openJournalImage(quest) {
  const gallery = completedGallery();
  journalImageIndex = Math.max(0, gallery.findIndex(item => item.id === quest.id));
  renderJournalImage();
  setOverlay(els.imageOverlay, true);
  els.closeImageViewer.focus();
}

function renderJournalImage() {
  const gallery = completedGallery();
  if (!gallery.length) return;
  journalImageIndex = (journalImageIndex + gallery.length) % gallery.length;
  const quest = gallery[journalImageIndex];
  els.journalFullImage.src = quest.openSceneArt || quest.sceneArt;
  els.journalFullImage.alt = quest.sceneAlt;
  els.imageViewerTitle.textContent = `Day ${quest.day} · ${quest.title}`;
  const multiple = gallery.length > 1;
  els.previousJournalImage.hidden = !multiple;
  els.nextJournalImage.hidden = !multiple;
}

function changeJournalImage(change) {
  journalImageIndex += change;
  renderJournalImage();
}

function resetCompletionData() {
  if (!window.confirm('Reset all completed quests for testing?')) return;
  completed.clear();
  saveCompleted(completed);
  render();
  els.resetProgress.blur();
}
els.hotspot.addEventListener('click', handleObjectInteraction);
els.rewardVoucher.addEventListener('click', openRewardVoucher);
els.openJournal.addEventListener('click', openJournal);
els.closeJournal.addEventListener('click', closeJournal);
els.journalPrevious.addEventListener('click', () => changeJournalPage(-1));
els.journalNext.addEventListener('click', () => changeJournalPage(1));
els.journalOverlay.querySelector('[data-close-journal]').addEventListener('click', closeJournal);
els.closeParchment.addEventListener('click', () => setOverlay(els.parchmentOverlay, false));
els.parchmentOverlay.querySelector('[data-close-parchment]').addEventListener('click', () => setOverlay(els.parchmentOverlay, false));
els.closeImageViewer.addEventListener('click', () => setOverlay(els.imageOverlay, false));
els.imageOverlay.querySelector('[data-close-image]').addEventListener('click', () => setOverlay(els.imageOverlay, false));
els.previousJournalImage.addEventListener('click', () => changeJournalImage(-1));
els.nextJournalImage.addEventListener('click', () => changeJournalImage(1));
els.resetProgress.addEventListener('click', resetCompletionData);
els.closeLetter.addEventListener('click', closeLetter);
els.backButton.addEventListener('click', () => showView('map'));
els.closeReward.addEventListener('click', () => closeReward(false, true));
els.returnButton.addEventListener('click', () => closeReward(true, true));
els.modal.addEventListener('click', event => { if (event.target.classList.contains('modal-backdrop')) closeReward(false); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && els.imageOverlay.classList.contains('is-open')) setOverlay(els.imageOverlay, false);
  else if (event.key === 'Escape' && els.parchmentOverlay.classList.contains('is-open')) setOverlay(els.parchmentOverlay, false);
  else if (event.key === 'Escape' && els.journalOverlay.classList.contains('is-open')) closeJournal();
  else if (event.key === 'Escape' && els.modal.classList.contains('is-open')) closeReward(false);
  else if (els.imageOverlay.classList.contains('is-open') && event.key === 'ArrowLeft') changeJournalImage(-1);
  else if (els.imageOverlay.classList.contains('is-open') && event.key === 'ArrowRight') changeJournalImage(1);
  else if (els.journalOverlay.classList.contains('is-open') && event.key === 'ArrowLeft') changeJournalPage(-1);
  else if (els.journalOverlay.classList.contains('is-open') && event.key === 'ArrowRight') changeJournalPage(1);
});

render();
preloadAdventureImages();

})();
