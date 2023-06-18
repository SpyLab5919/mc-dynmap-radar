import bot from "../bot.js"
import { captureCoords, captureMap, fetchMap } from '../utils/browser.js'
import { countries, mainConfig, whitelist } from '../init.js'
import * as timestamp from '../utils/console.js'

bot.command('screenshot', async (ctx) => {
  console.log("get")

  await bot.telegram.sendChatAction(ctx.chat.id, 'upload_photo')
  let screenshot = undefined

  for (let i = 0; i < countries.length; i++) {
    if (countries[i].config.chatId === ctx.chat.id.toString()) {
      // TODO: add buttons
      screenshot = await captureMap(countries[i])
      break
    }
    else if (countries[i].whitelist.findIndex((player) => player.id === ctx.chat.id) !== -1) {
      try {
        screenshot = await captureMap(countries[i])
      } catch (err) {
        timestamp.error(err)
        await ctx.reply("Не вдалося зробити скріншот мапи. Спробуйте пізніше.")
        return
      }
      break
    }
  }
  if (screenshot !== undefined)
    await bot.telegram.sendPhoto(ctx.chat.id, { source: screenshot })
  else
    ctx.reply('Не вдалося визначити вашу країну для скріншота')


})

bot.command('whereis', async (ctx) => {

  const playerName = ctx.update.message.text.split(' ')[1]
  const zoom = ctx.update.message.text.split(' ')[2] || mainConfig.whereis.zoom
  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`)
    return
  }

  const response = await fetchMap()

  if (!response)
    return ctx.reply("Не можу знайти таку особу.\nПеревірте її існування та спробуйте ще")

  const player = response.players.filter(obj => obj.name.toUpperCase() === playerName.toUpperCase())[0]
  if (player === undefined) {
    ctx.reply(`Гравця не знайдено на сервері`)
    return
  } else if (player.world !== 'Borukva') {
    ctx.reply(`${player.name} невидимий або знаходиться в Незері/Енді`)
    return
  }

  await bot.telegram.sendChatAction(ctx.chat.id, 'upload_photo')
  const result = await captureCoords([player.x, player.z], zoom, mainConfig.whereis)

  await ctx.replyWithPhoto({ source: result.screenshot, }, {
    caption: `[\\${player.x}, \\${player.y}, \\${player.z}](${result.url})`,
    parse_mode: 'MarkdownV2'
  })

})

bot.command('playerlist', async (ctx) => {
  const response = await fetchMap()

  if (response == null) {
    return ctx.reply("Гравців не знайдено")
  }

  let playerList = response.players.sort((a, b) => {
    return a.name.toUpperCase() >= b.name.toUpperCase() ? 1 : -1
  })


  let message = ""
  playerList.map((player => {
    message += `<code>${player.name}</code>`

    if (player.world != "Borukva") {
      message += '<code>' + "".padEnd(16 - player.name.length + 1)

      if (player.world == "Borukva_nether")
        message += "[nether]"
      else
        message += "[???]"

      message += "</code>"
    }
    message += "\n"
  }))
  ctx.reply(message, { "parse_mode": "HTML" })
})
