import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import { pointInPolygon, polygonScale } from 'geometric';
import bot from './bot.js';
import openDb from './db.js';

let db = await openDb('./db/admins.json');
db = await openDb('./db/whitelist.json');
let whitelist = db.data;

const borders_old = [
  [-186, -927],
  [-170, -1041],
  [-148, -1101],
  [-118, -1157],
  [-84, -1211],
  [-59, -1233],
  [-21, -1244],
  [39, -1257],
  [73, -1271],
  [125, -1289],
  [181, -1294],
  [354, -1294],
  [405, -1241],
  [430, -1185],
  [446, -1126],
  [444, -1090],
  [574, -1090],
  [575, -1216],
  [703, -1217],
  [705, -1088],
  [709, -957],
  [711, -893],
  [698, -830],
  [676, -769],
  [657, -705],
  [621, -642],
  [548, -605],
  [482, -631],
  [427, -658],
  [366, -658],
  [304, -662],
  [245, -665],
  [212, -647],
  [167, -629],
  [111, -620],
  [73, -591],
  [42, -566],
  [1, -555],
  [-39, -569],
  [-67, -563],
  [-93, -603],
  [-116, -653],
  [-135, -687],
  [-160, -714],
  [-171, -738],
  [-171, -776],
  [-157, -813],
  [-162, -866],
  [-168, -900],
];


const borders = [
  [-107, -465],
  [-103, -462],
  [191, -462],
  [198, -458],
  [255, -399],
  [446, -335],
  [478, -304],
  [577, -270],
  [609, -302],
  [628, -310],
  [662, -321],
  [707, -328],
  [760, -347],
  [784, -352],
  [808, -362],
  [837, -388],
  [879, -412],
  [920, -439],
  [927, -442],
  [947, -445],
  [962, -445],
  [994, -446],
  [1007, -445],
  [1042, -446],
  [1073, -477],
  [1076, -495],
  [1089, -591],
  [1090, -784],
  [1074, -824],
  [1027, -848],
  [995, -895],
  [972, -952],
  [944, -981],
  [930, -1026],
  [896, -1061],
  [881, -1105],
  [785, -1201],
  [737, -1217],
  [641, -1313],
  [611, -1360],
  [415, -1360],
  [344, -1436],
  [295, -1433],
  [216, -1392],
  [145, -1392],
  [1, -1510],
  [1, -1545],
  [1, -1564],
  [0, -1579],
  [-12, -1586],
  [-49, -1574],
  [-76, -1621],
  [-204, -1621],
  [-216, -1608],
  [-226, -1555],
  [-226, -1388],
  [-174, -1355],
  [-153, -1335],
  [-153, -1320],
  [-146, -1302],
  [-85, -1212],
  [-148, -1101],
  [-169, -1040],
  [-187, -928],
  [-167, -901],
  [-156, -813],
  [-171, -776],
  [-171, -737],
  [-135, -688],
  [-92, -603],
];

let intrudersInBorders = [];

setInterval(() => scanMap(), 10_000);

function scanMap() {
  console.log(`Сканую`);
  axios
    .get(`${process.env.DYNMAP_URL}/${Date.now()}`)
    .then((res) => {
      let intruders = [];
      res.data.players.forEach((player) => {
        if (player?.world !== 'Borukva') return;
        if (whitelist.indexOf(player.name) !== -1) return;

        let index = intrudersInBorders.map(e => e.name).indexOf(player.name);
        if (index === -1) {
          if (pointInPolygon([player.x, player.z], borders)) {
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
          if (pointInPolygon([intruder.x, intruder.z], polygonScale(borders, 1.1)))
            return;
        intrudersInBorders.pop(intruder);
        cancel(intruder)
      });
    })
    .catch((err) => {
      console.log(err);
    });
    console.log(`завершив сканування`);
}

async function alert(intruder) {
  const message = `Виявлено порушника ${intruder.name} [${intruder.x}, ${intruder.y}, ${intruder.z}]\n` +
                  `/screenshot`;
  await new Promise(resolve => setTimeout(resolve, 1_000));
  bot.telegram.sendMessage(process.env.MAIN_CHAT_ID, message);
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function cancel(intruder) {
  const message = `${intruder.name} покинув радіус дії станції`;
  bot.telegram.sendMessage(process.env.MAIN_CHAT_ID, message);
  console.log(`[${new Date().toISOString()}] ${message}`);
}