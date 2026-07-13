// Список игр для донат-магазина: при выборе игры валюта и популярные паки
// подставляются автоматически. Чтобы добавить новую игру — просто добавь строку сюда.
// packs — готовые номиналы пополнения (кнопки-заготовки в админке).
export const GAMES = [
  { name: "PUBG MOBILE", currency: "UC", category: "MOBILE", packs: ["60 UC", "325 UC", "660 UC", "1800 UC", "3850 UC", "8100 UC"] },
  { name: "FREE FIRE", currency: "Diamonds", category: "MOBILE", packs: ["100", "310", "525", "1085", "2200", "5600"] },
  { name: "BRAWL STARS", currency: "Gems", category: "MOBILE", packs: ["30", "80", "170", "360", "950"] },
  { name: "CLASH OF CLANS", currency: "Gems", category: "MOBILE", packs: ["80", "500", "1200", "2500", "6500"] },
  { name: "MOBILE LEGENDS", currency: "Diamonds", category: "MOBILE", packs: ["55", "220", "440", "860", "1700", "3650"] },
  { name: "STANDOFF 2", currency: "Gold", category: "MOBILE", packs: ["180", "490", "1190", "2490", "6390"] },
  { name: "ROBLOX", currency: "Robux", category: "PC", packs: ["400", "800", "1700", "4500"] },
  { name: "VALORANT", currency: "VP", category: "PC", packs: ["475", "1000", "2050", "3650", "5350"] },
  { name: "GENSHIN IMPACT", currency: "Genesis Crystals", category: "PC", packs: ["60", "330", "1090", "3280", "6480"] },
  { name: "STEAM WALLET", currency: "USD", category: "PC", packs: ["5", "10", "20", "50", "100"] },
  { name: "PLAYSTATION", currency: "PSN", category: "CONSOLE", packs: ["20", "50", "100"] },
  { name: "XBOX", currency: "XBOX", category: "CONSOLE", packs: ["15", "25", "50", "100"] },
];

export function currencyForGame(gameName) {
  const g = GAMES.find((x) => x.name === gameName);
  return g ? g.currency : "";
}

export function packsForGame(gameName) {
  const g = GAMES.find((x) => x.name === gameName);
  return g ? g.packs : [];
}
