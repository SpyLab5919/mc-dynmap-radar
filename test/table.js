import axios from "axios"

async function fetchMap() {
  let res = await axios.get(`http://borukva.space:3405/up/world/Borukva/${Date.now()}`)
  return res
}
console.clear()

const res = await fetchMap()

const players = res.data.players.sort((a, b) => {
  return a.name.toUpperCase() >= b.name.toUpperCase() ? 1 : -1
})

console.table(players, ['name', 'account', 'type', 'health', 'armor', 'world', 'x', 'y', 'z'])



for (let i = 0; i < players.length; i++)
  console.log(`${players[i].name}, ${players[i].health}, ${players[i].armor}, ${players[i].world}, ${players[i].x}, ${players[i].y}, ${players[i].z}`)
process.exit();      