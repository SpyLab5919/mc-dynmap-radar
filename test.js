import { fetchMap } from "./src/utils/browser.js";
console.clear()

const res = await fetchMap();
const players = res.data.players;
const table = {
  name: [],
  account: [],
  world: [],
  type: [],
  health: [],
  armor: [],
  x: [],
  y: [],
  z: [],
}
console.table(players, ['name', 'account', 'type', 'health', 'armor', 'world', 'x', 'y', 'z'])
process.exit();