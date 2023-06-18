import openDb from './utils/db.js'
import path from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import appRootPath from 'app-root-path'
import mainConfig from '../config/config.json' assert { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const __approot = appRootPath.path

let db = await openDb(`${__dirname}/db/whitelist.json`)
const whitelist = db.data
// db = await openDb(`${__dirname}/config.json`)
// const mainConfig = db.data

const countriesDir = `${__approot}/config/countries/`
const fileList = getAllFiles(countriesDir)

const countries = []
await fileList.map(async (file) => {

  const trimFile = file.replace(countriesDir, '')
  const splitFile = trimFile.split(/\\|\//)
  
  const countryName = splitFile[0]
  const fileName = splitFile[splitFile.length - 1].split('.')[0]

  const content = fs.readFileSync(file).toString()

  let index = countries.findIndex(x => x.name == countryName)
  if(index === -1) {
    countries.push({"name": countryName, "borders": [], "config": {}, "whitelist": []})
    index = countries.length - 1
  }
  if (trimFile.includes('borders')) {
    countries[index].borders.push(JSON.parse(content))
    if (fileName === 'main') {
      countries[index].borders[countries[index].borders.length - 1].isMain = true
    } else
    countries[index].borders[countries[index].borders.length - 1].isMain = false
  }
  if (trimFile.includes('config')) {
    countries[index].config= JSON.parse(content)
  }
  if (trimFile.includes('whitelist')) {
    countries[index].whitelist = JSON.parse(content)
  }
  
})

function getOuterRectangleCenter(polygon) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let point
  for (let i = 0; i < polygon.length; i++) {
    point = polygon[i]
    if (point[0] < minX) minX = point[0]
    if (point[0] > maxX) maxX = point[0]
    if (point[1] < minY) minY = point[1]
    if (point[1] > maxY) maxY = point[1]
  }
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  return [Math.round(centerX).toString(), Math.round(centerY).toString()]
}



function getAllFiles(dirPath, arrayOfFiles = []) {
  const start = dirPath
  let files = fs.readdirSync(dirPath)

  files.forEach((file) => {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file))
    }
  })

  return arrayOfFiles
}


export { getOuterRectangleCenter, getAllFiles, mainConfig, whitelist, countries, __dirname, __approot }