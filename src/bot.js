import dotenv from 'dotenv';
dotenv.config();
import { Telegraf } from 'telegraf';
import * as timestamp from './utils/console.js';
import { captureCoords, captureMap, fetchMap } from './utils/browser.js';
import { config, whitelist } from './init.js';
const bot = new Telegraf(process.env.BOT_TOKEN);


await bot.launch().catch((err) => console.error(err));

bot.use(async (ctx, next) => {
  //if (ctx.update.from === undefined) return; // 
  const userId = ctx.update.message?.from.id;
  const chatId = ctx.update.message?.chat.id;
  const userName = ctx.update.message?.from.username
  const chatName = ctx.update.message?.chat.username;
  const command = ctx.update.message?.text;
  const update = ctx.update.message || ctx.update.callback_query;
  // userId == process.env.RIGHTFUL_USER_ID || 
  if (command === undefined)
    return;

  if (chatId == process.env.MAIN_CHAT_ID) {
    timestamp.log(`${userName} [${userId}] використав ${command}`);
  } else if (userId != process.env.RIGHTFUL_USER_ID || chatId != process.env.MAIN_CHAT_ID) {
    timestamp.log(`${userName} ${userId} використав ${command} у ${chatName} ${chatId}`);
  }
  else {
    ctx.reply('Виявлено чужинця! Покиньте територію чату!');
    timestamp.warn(`Несанкціонований доступ! ${userName} [${userId}] у ${chatName} ${chatId}`);
    return;
  }
  try {
    await next();
  } catch (err) {
    console.error(err);
    ctx.reply(`Виникла помилка при виконанні команди`);
  }
});



bot.command('whitelist', (ctx) => {
  ctx.reply(whitelist.join('\n'));
});


bot.command('addplayer', (ctx) => {
  const playerName = ctx.update.message.text.split(' ')[1];

  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`, { reply_to_message_id: ctx.message.message_id });
    return;
  }
  const user = ctx.update.message.from.username;

  timestamp.log(`${user} додав ${playerName} до вайтлісту.`);
  ctx.reply(`Додаю ${playerName} до вайтлісту.`);
  whitelist.push(playerName);
  db.write();
});



bot.command('removeplayer', (ctx) => {
  const playerName = ctx.update.message.text.split(' ')[1];

  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`);
    return;
  }
  const user = ctx.update.message.from.username;
  const playerIndex = whitelist.indexOf(playerName);

  if (playerIndex !== -1) {
    timestamp.warn(`${user} видалив ${playerName} з вайтлісту.`);
    ctx.reply(`Видаляю ${playerName} з вайтлісту.`);
    whitelist.splice(playerIndex, 1);
  } else {
    ctx.reply(`Гравець ${playerName} не знаходиться у вайтлісті.`);
  }
  db.write();
});



bot.command('sex', async (ctx) => {
  console.log(`Секс!`);
  await ctx.reply(`Секс!`);
});
bot.command('goko_4orta', async (ctx) => {
  console.log(`/goko_4orta`);
  await ctx.reply(`/goko_4orta`);
});
bot.command('plotnaya_vsim_nashim', async (ctx) => {
  console.log(`o/`);
  await ctx.reply(`o/`);
})
bot.command('simp', async (ctx) => {

  await ctx.reply(`o/`);
})

bot.command('greet', (ctx) => {
  ctx.reply(response, { reply_to_message_id: 1 });
})



bot.command('screenshot', async (ctx) => {
  await bot.telegram.sendChatAction(ctx.chat.id, 'upload_photo');

  const screenshot = await captureMap();

  await bot.telegram.sendPhoto(ctx.chat.id, { source: screenshot });
});

bot.command('whereis', async (ctx) => {

  const playerName = ctx.update.message.text.split(' ')[1];
  const zoom = ctx.update.message.text.split(' ')[2];
  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`);
    return;
  }

  const response = await fetchMap();

  const player = response.data.players.filter(obj => obj.name === playerName)[0];
  if (player === undefined) {
    ctx.reply(`Гравця не знайдено`);
    return;
  } else if (player.world !== 'Borukva') {
    if (player.world === 'Borukva_nether') {
      ctx.reply(`${player.name} знаходиться у Незері на [${player.x}, ${player.y}, ${player.z}]`)
    } else { ctx.reply(`${player.name} невидимий або знаходиться в Енді`) }
    return;
  }
  await bot.telegram.sendChatAction(ctx.chat.id, 'upload_photo');

  const result = await captureCoords([player.x, player.z], zoom);

  await ctx.replyWithPhoto({ source: result.screenshot, }, {
    caption: `[\\${player.x}, \\${player.y}, \\${player.z}](${result.url})`,
    parse_mode: 'MarkdownV2'
  });

});

bot.command('playerlist', async (ctx) => {
  let message = "";
  const response = await fetchMap();

  let playerlist = response.data.players.sort((a, b) => {
    return a.name.toUpperCase() >= b.name.toUpperCase() ? 1 : -1
  })

  playerlist.map((player => message += `${player.name}\n`));
  ctx.reply(message);
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

export default bot;
