import dotenv from 'dotenv'
dotenv.config()
import axios from "axios"
import { mainConfig } from '../src/init.js'
import * as timestamp from '../src/utils/console.js' 


async function fetchMap() {
  console.log(`${mainConfig.url}up/world/Borukva/${Date.now()}`)
  let res = await axios
    .get(`${mainConfig.url}up/world/Brukva/${Date.now()}`)
    .catch((err) => {
      timestamp.error(err)
      return null
    })
  return res?.data || null
}

let test = await fetchMap()
console.log(test)