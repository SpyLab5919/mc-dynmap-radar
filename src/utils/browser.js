import dotenv from 'dotenv'
dotenv.config()
import axios from "axios"
import { firefox } from 'playwright-firefox'
import { mainConfig, countries, getOuterRectangleCenter } from '../init.js'
import * as timestamp from './console.js'

let openMap = []
//const mapURL = `${mainConfig.url}/?worldname=${param.worldname}&mapname=${param.mapname}&zoom=${param.zoom}&x=${param.x}&y=64&z=${param.z}`
const browser = await firefox.launch()

await loadCountriesMaps()

function getMainBorders(country) {
  for (let i = 0; i < country.borders.length; i++)
    if (country.borders[i].isMain === true)
      return country.borders[i]
  return null
}

async function loadCountriesMaps() {
  openMap = []
  countries.filter(country => getMainBorders(country)).map(async (country) => {
    const mainBorder = getMainBorders(country)
    mainBorder.center ||= getOuterRectangleCenter(mainBorder.coords)
    openMap[country.name] = await addNewPage(browser, mainBorder.center, mainBorder.zoom, mainBorder, country.config.scanMap.screen).catch((err) => {
      timestamp.error(err)
    })
  })
}

async function addNewPage(browser, coords, zoom, borderConfig, mapConfig) {
  const page = await browser.newPage()
  await page.setViewportSize({
    width: mapConfig.width,
    height: mapConfig.height
  })
  try {
    await gotoURL(
      page,
      borderConfig.worldname,
      borderConfig.mapname,
      zoom,
      coords[0],
      64,
      coords[1]
    )
  } catch (err) {
    const message = `Помилка підключення до ${mainConfig.url}`
    timestamp.error(message)
    timestamp.error(err)
    timestamp.error(message)
    return null
  }
  // console.log(page.url)
  // let button = await page.waitForSelector(".dynmap > .map > .")
  // console.log(button)
  //await page.wait_for_selector('path[class=leaflet-interactive]')
  await page.waitForLoadState("networkidle")
  const locator = await page.locator('path[class=leaflet-interactive]').all()
  console.log(locator.length)
  // for (let b of locator) {
  //   await b.evaluate(node => node['fill-opacity']= "0.1")
  // }
  return page
}

async function gotoURL(page, worldname, mapname, zoom, x, y, z) {
  const params = new URLSearchParams({
    worldname: worldname,
    mapname: mapname,
    zoom: zoom,
    x: x, y: y, z: z
  })
  const url = mainConfig.url + "?" + params
  await page.goto(url)
}

async function fetchMap() {
  let res = await axios
    .get(`${mainConfig.url}up/world/Borukva/${Date.now()}`)
    .then(response => response.date)
    .catch((error) => { return null; })
  return res
}

async function captureMap(country) {
  let isFinished = false
  while (!isFinished) {
    if (openMap[country.name] === undefined) {
      setTimeout(() => { console.log(isFinished)  }, 1000); 
    }
    else {
      
      isFinished = true
    }
  }

  const page = openMap[country.name]
  await page.waitForLoadState("networkidle")
  await page.evaluate(() => {
    const selectors = document.querySelectorAll('path[class=leaflet-interactive]')
    for (let s of selectors)
      s.setAttribute('fill-opacity', 0.10)
  })

  const image = country.config.scanMap.image
  // await openMap[country.name].click('dynmap')
  // const box = await page.getByTitle('Layers')?.boundingBox()
  // if (box) {
  //   await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  // }

  // for (let b in box)
  //   console.log(b)
  // console.log(box)
  // const checkbox = await openMap[country.name].getByTitle('checkbox')

  const screenshot = await openMap[country.name].screenshot({
    clip: {
      x: image.paddingX,
      y: image.paddingY,
      width: image.width,
      height: image.height
    }
  })
    .catch((err) => {
      timestamp.error(err)
      ctx.reply(`Виникла помилка при скріншоті`)
      return
    })
  return screenshot
}

async function getMapUrl(country) {
  return await openMap[country.name].url()
}


async function captureCoords(coords, zoom, config) {
  const secondPage = await addNewPage(browser, coords, zoom, config, config.screen)

  await new Promise(resolve => setTimeout(resolve, config.delay))

  const screenshot = await secondPage.screenshot({
    clip: {
      x: config.image.paddingX,
      y: config.image.paddingY,
      width: config.image.width,
      height: config.image.height
    }
  })
    .catch((err) => {
      timestamp.error(err)
      return undefined
    })
    .finally(() => secondPage?.close())
  return {
    screenshot: screenshot,
    url: await secondPage.url()
  }
}



export { fetchMap, loadCountriesMaps, captureMap, captureCoords }