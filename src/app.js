import dotenv from 'dotenv';
dotenv.config();

import { pointInPolygon } from 'geometric';
import bot from './bot.js';
import * as timestamp from './utils/console.js';
import { config, whitelist, mainBorder } from './init.js';
import { fetchMap } from './utils/browser.js';

timestamp.log("Бота запущено");
bot.telegram.sendMessage(process.env.RIGHTFUL_USER_ID, "Бота запущено");

let interval = config.scanMap.interval;
let intrudersInBorders = [];

loop(scanMap);


async function loop(func) {
  await func();
  setInterval(await func, config.scanMap.interval);
}

async function scanMap() {
  let res = await fetchMap().catch((err) => {
    if (err.code === 'ECONNRESET')
      timestamp.error(`Сокет не відповів`);
    else
      timestamp.error(err);
  });
  
  try {
    let intruders = [];
    res?.data.players.forEach((player) => {
      if (player?.world !== 'Borukva') return;
      if (whitelist.indexOf(player.name) !== -1) return;

      let index = intrudersInBorders.map(e => e.name).indexOf(player.name);
      if (index === -1) {
        if (pointInPolygon([player.x, player.z], mainBorder)) {
          intruders.push(player);
        }
      } else {
        intrudersInBorders[index] = player;
      }
    });

    intruders.forEach((intruder) => {
      intrudersInBorders.push(intruder);
      alert(intruder);
    });

    intrudersInBorders.forEach((intruder) => {
      if (intruder.world === "Borukva")
        if (pointInPolygon([intruder.x, intruder.z], mainBorder))
          return;
      intrudersInBorders.pop(intruder);
      cancel(intruder)
    });
  } catch (err) {
    timestamp.error(err);
  };
}

async function alert(intruder) {
  const message =
    `Станція виявила порушника!\n` +
    `${intruder.name} - [${intruder.x}, ${intruder.y}, ${intruder.z}]`;
    
  await new Promise(resolve => setTimeout(resolve, 1_000));
  bot.telegram.sendMessage(process.env.MAIN_CHAT_ID, message);
  timestamp.log(`${intruder.name} проник всередину ${config.scanMap.file}`);
}

function cancel(intruder) {
  const message = `${intruder.name} покинув радіус дії станції`;
  bot.telegram.sendMessage(process.env.MAIN_CHAT_ID, message);
  timestamp.log(`${intruder.name} вийшов за межі ${config.scanMap.file}`);

}


