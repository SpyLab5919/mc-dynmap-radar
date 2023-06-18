import bot from "../bot.js"
import { whitelist } from '../init.js'

bot.command('whitelist', (ctx) => {
  ctx.reply(whitelist.join('\n'))
})

bot.command('addplayer', (ctx) => {
  const playerName = ctx.update.message.text.split(' ')[1]

  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`, { reply_to_message_id: ctx.message.message_id })
    return
  }
  const user = ctx.update.message.from.username

  timestamp.log(`${user} додав ${playerName} до вайтлісту.`)
  ctx.reply(`Додаю ${playerName} до вайтлісту.`)
  whitelist.push(playerName)
  db.write()
})

bot.command('removeplayer', (ctx) => {
  const playerName = ctx.update.message.text.split(' ')[1]

  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`)
    return
  }
  const user = ctx.update.message.from.username
  const playerIndex = whitelist.indexOf(playerName)

  if (playerIndex !== -1) {
    timestamp.warn(`${user} видалив ${playerName} з вайтлісту.`)
    ctx.reply(`Видаляю ${playerName} з вайтлісту.`)
    whitelist.splice(playerIndex, 1)
  } else {
    ctx.reply(`Гравець ${playerName} не знаходиться у вайтлісті.`)
  }
  db.write()
})




