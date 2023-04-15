import dotenv from 'dotenv';
dotenv.config();
import axios from "axios";
import { chromium } from 'playwright';
import { config, mainBorder, getOuterRectangleCenter } from '../init.js';
import * as custom from './console.js'

const center = getOuterRectangleCenter(mainBorder);

//const mapURL = `${process.env.DYNMAP_URL}/?worldname=${param.worldname}&mapname=${param.mapname}&zoom=${param.zoom}&x=${param.x}&y=64&z=${param.z}`;
const browser = await chromium.launch();
const scanMapPage = await addNewPage(browser, center, config.scanMap);
async function addNewPage(browser, coords, localConfig) {

  const page = await browser.newPage();

  await page.setViewportSize({
    width: localConfig.screen.width,
    height: localConfig.screen.height
  });
  try {
    await gotoURL(
      page,
      localConfig.worldname,
      localConfig.mapname,
      localConfig.zoom,
      coords[0],
      64,
      coords[1]
    );
  } catch (err) {
    const message = `Помилка підключення до ${process.env.DYNMAP_URL}`;
    custom.error(message);
    custom.error(err);
    custom.error(message);
    return null;
  };
  return page;
}

async function gotoURL(page, worldname, mapname, zoom, x, y, z) {
  const params = new URLSearchParams({
    worldname: worldname,
    mapname: mapname,
    zoom: zoom,
    x: x, y: y, z: z
  });
  const url = process.env.DYNMAP_URL + "?" + params;
  await page.goto(url);
}

async function fetchMap() {
  let res = await axios.get(`${process.env.DYNMAP_URL}up/world/Borukva/${Date.now()}`);
  return res;
}

async function captureMap() {
  await scanMapPage.setViewportSize({
    width: config.scanMap.screen.width,
    height: config.scanMap.screen.height
  });

  const screenshot = await scanMapPage.screenshot({
    clip: {
      x: config.scanMap.image.paddingX,
      y: config.scanMap.image.paddingY,
      width: config.scanMap.image.width,
      height: config.scanMap.image.height
    }
  })
    .catch((err) => {
      custom.error(err);
      //ctx.reply(`Виникла помилка при скріншоті`);
      return;
    });
  return screenshot;
}


async function captureCoords(coords, zoom = config.whereis.zoom) {
  const localConfig = Object.assign({}, config.whereis);
  localConfig.zoom = zoom;

  const secondPage = await addNewPage(browser, coords, localConfig);

  await new Promise(resolve => setTimeout(resolve, localConfig.delay));

  const screenshot = await secondPage.screenshot({
    clip: {
      x: localConfig.image.paddingX,
      y: localConfig.image.paddingY,
      width: localConfig.image.width,
      height: localConfig.image.height
    }
  })
    .catch((err) => {
      custom.error(err);
      return undefined;
    })
    .finally(() => secondPage?.close())
  return {
    screenshot: screenshot,
    url: await secondPage.url()
  };
}

export { fetchMap, captureMap, captureCoords }