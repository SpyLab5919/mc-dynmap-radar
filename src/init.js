import openDb from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = await openDb(`${__dirname}/db/whitelist.json`);
const whitelist = db.data;

db = await openDb(`${__dirname}/borders/pbi.json`);
const mainBorder = db.data;

db = await openDb(`${__dirname}/config/config.json`);
const config = db.data;

function getOuterRectangleCenter(polygon) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let point;
  for (let i = 0; i < polygon.length; i++) {
    point = polygon[i];
    if (point[0] < minX) minX = point[0];
    if (point[0] > maxX) maxX = point[0];
    if (point[1] < minY) minY = point[1];
    if (point[1] > maxY) maxY = point[1];
  }
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return [Math.round(centerX).toString(), Math.round(centerY).toString()];
}

export { getOuterRectangleCenter, config, whitelist, mainBorder }