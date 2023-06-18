import bot from "../bot.js"
import { Markup } from "telegraf"
function simpleReply(command, reply, markup) {
  bot.command(command, async (ctx) => {
    await ctx.reply(reply, markup)
  })
}

simpleReply('sex', 'Секс!')
simpleReply('goko_4orta', '/goko_4orta')
simpleReply('plotnaya_vsim_nashim', 'o/')
simpleReply('simp', '/whereis pitsa_')
simpleReply('platform', `Бот працює на платформі ${process.platform.toUpperCase()}`)
bot.command('test', async (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "test",
    {
      reply_markup: {
        inline_keyboard: [

          [
            { text: "Next", callback_data: "next" },

            { text: "Open in browser", web_app: "telegraf.js.org" }
          ]
        ]
      }
    })
})

bot.action('next', async (ctx) => {
  ctx.answerCbQuery("Answered")
  ctx.reply("1")
})
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.hears('hi')

bot.command('webapp_test', async (ctx) => ctx.replyWithHTML('Прошу', Markup.inlineKeyboard([
  [Markup.button.webApp('Динмапа', 'https://shorturl.at/svGJ0')]
])))

bot.command('command', async (ctx) => {
  await console.log(ctx.message.from.language_code)
})
