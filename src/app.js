import dotenv from 'dotenv'
dotenv.config()

import { pointInPolygon } from 'geometric'
import * as timestamp from './utils/console.js'

import { __dirname, countries, mainConfig } from './init.js'
import { fetchMap } from './utils/browser.js'

let IIB = await openDb(`${__dirname}/IIB.json`)
if (!IIB.data) {
  IIB.data = []
}
import { alert, cancel } from './bot.js'
import openDb from './utils/db.js'

let index = 0
countries.forEach((country) => {
  if (IIB.data.filter(saved => saved.country === country.name).length == 0)
    IIB.data.push({ "country": country.name, "borders": [] })
  country.borders.forEach((border) => {
    if (IIB.data[index].borders.filter(b => b.name === border.name).length == 0)
      IIB.data[index].borders.push({ "name": border.name, "intruders": [] })
  })
  index++
})

IIB.write(IIB.data)

let hiddenPlayers = [], currentIntruders = [], index_IIB

//loop(intrusionScan, mainConfig.intrusion.interval)


async function loop(func, interval) {
  await func()
  setInterval(await func, interval)
}

async function intrusionScan() {
  let res = await fetchMap().catch((err) => {
    switch (err.code) {
      case ('ECONNREFUSED'):
        timestamp.warn("Сервер вимкнутий"); break
      case ('ECONNRESET'):
        timestamp.error("Сокет не відповів"); break
      case ('EAI_AGAIN'):
        timestamp.error("Нема з'єднання"); break
      default:
        timestamp.error(err)
    }
  })

  try {
    hiddenPlayers = []
    countries.forEach((country) => {
      currentIntruders[country.name] = []
      Object.keys(country.borders).forEach((key) => {
        currentIntruders[country.name][key] = []
      })
    })
    // console.table (intrudersInBorders)
    res?.data.players.forEach(async (player) => {
      if (player === undefined) return
      if (player.world === '-some-other-bogus-world-') {
        hiddenPlayers.push(player)
      }
      countries.forEach(async (country) => {
        if (isInWhitelist(player, country.whitelist) == true) return

        let countryIndex = findIndexByProperty(IIB.data, "country", country.name)

        country.borders.forEach(async (border) => {
          if (player.world !== border.worldname) return
          const borderIndex = findIndexByProperty(IIB.data[countryIndex].borders, "name", border.name)
          const IIB_data_border_intruders = IIB.data[countryIndex].borders[borderIndex].intruders
          const intruderIndex = IIB_data_border_intruders.findIndex(
            (intruder) => intruder.name === player.name
          )

          if (pointInPolygon([player.x, player.z], border.coords)) {
            if (intruderIndex == -1) {
              if (country.config.allowedIntrusionTime == 0) {
                await alert(player, border.name, country.config.chatId)
                player.isAlerted = true
              } else {
                player.isAlerted = false
              }
              player.time = Date.now()
              IIB_data_border_intruders.push(player)

            } else {
              if (Date.now() > IIB_data_border_intruders[intruderIndex].time + country.config.allowedIntrusionTime)
                if (!IIB_data_border_intruders[intruderIndex].isAlerted) {
                  await alert(player, border.name, country.config.chatId)
                  IIB_data_border_intruders[intruderIndex].isAlerted = true
                }
              player.time = IIB_data_border_intruders[intruderIndex].time
              player.isAlerted = IIB_data_border_intruders[intruderIndex].isAlerted
              IIB_data_border_intruders[intruderIndex] = player
            }
          } // if not in border
          else {
            if (intruderIndex !== -1) {
              if (IIB_data_border_intruders[intruderIndex].isAlerted)
                await cancel(player, border.name, country.config.chatId)
              IIB.data[countryIndex].borders[borderIndex].intruders = IIB_data_border_intruders.slice(0,intruderIndex).concat(IIB_data_border_intruders.slice(intruderIndex + 1, IIB_data_border_intruders.length))
            }
          }
        })
      })
    })
    IIB.write()
  } catch (err) {
    timestamp.error(err)
  }
}
function findIndexByProperty(data, key, value) {
  for (var i = 0; i < data.length; i++) {
    if (data[i][key] == value) {
      return i
    }
  }
  return -1
}


function isInWhitelist(player, whitelist) {
  for (let i = 0; i < whitelist.length; i++) {
    if (player.name == whitelist[i].name
      || player.name == whitelist[i].twink) {
      return true
    }
  }
  return false
}