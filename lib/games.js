// Список игр для донат-магазина: при выборе игры в админке валюта подставляется автоматически.
// Чтобы добавить новую игру — просто добавь строку сюда.
export const GAMES = [
  { name: "PUBG MOBILE", currency: "UC", category: "MOBILE" },
  { name: "FREE FIRE", currency: "Diamonds", category: "MOBILE" },
  { name: "BRAWL STARS", currency: "Gems", category: "MOBILE" },
  { name: "CLASH OF CLANS", currency: "Gems", category: "MOBILE" },
  { name: "MOBILE LEGENDS", currency: "Diamonds", category: "MOBILE" },
  { name: "STEAM WALLET", currency: "USD", category: "PC" },
  { name: "VALORANT", currency: "VP", category: "PC" },
  { name: "GENSHIN IMPACT", currency: "Genesis Crystals", category: "PC" },
  { name: "PLAYSTATION", currency: "PSN", category: "CONSOLE" },
  { name: "XBOX", currency: "XBOX", category: "CONSOLE" },
];

export function currencyForGame(gameName) {
  const g = GAMES.find((x) => x.name === gameName);
  return g ? g.currency : "";
}
