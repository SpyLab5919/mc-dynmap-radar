import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import * as timestamp from './utils/console.js'
import { __approot, getAllFiles } from './init.js'

const bot = new Telegraf(process.env.BOT_TOKEN)

await bot.launch().then(() => {
  timestamp.log("Перезапущено!")
  bot.telegram.sendMessage(process.env.RIGHTFUL_USER_ID, "Встановлено зв'язок із станцією!")
})


const commandList = getAllFiles(`${__approot}/src/commands`)

commandList.forEach(command => {
  import(`file://${command}`)
})



bot.use(async (ctx, next) => {
  // console.log(ctx.update.message)
  const userId = ctx.update.message?.from.id
  const chatId = ctx.update.message?.chat.id
  const userName = ctx.update.message?.from.username
  const chatName = ctx.update.message?.chat.username
  const command = ctx.update.message?.text
  // const owner == process.env.RIGHTFUL_USER_ID
  //console.log(ctx)

  const timeMsg = `Processing update ${ctx.update.update_id}`
  //console.time(timeMsg)

  timestamp.log(`${userName} ${userId} використав ${command} у ${chatName} ${chatId}`)

  await next().catch((err) => {
    console.error(err)
    ctx.reply(`Виникла помилка при виконанні команди`)
  })
  //console.time(timeMsg)
})

async function alert(intruder, border, chatId) {
  const message =
    `Станція виявила порушника у ${border}!\n` +
    `${intruder.name} [${intruder.x}, ${intruder.y}, ${intruder.z}]`
  await bot.telegram.sendMessage(chatId, message).catch((err) => timestamp.error(err))
  timestamp.log(`${intruder.name} проник всередину ${border}`)
}

async function cancel(intruder, border, chatId) {
  const message = `${intruder.name} покинув межі ${border}`
  await bot.telegram.sendMessage(chatId, message)
  timestamp.log(`${intruder.name} вийшов за межі ${border}`)
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export default bot
export {alert, cancel}
