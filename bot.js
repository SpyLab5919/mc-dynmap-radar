import dotenv from 'dotenv';
dotenv.config();
import openDb from './db.js';
import { Telegraf } from 'telegraf';
import { chromium } from 'playwright';

const bot = new Telegraf(process.env.BOT_TOKEN);

const db = await openDb('./db/whitelist.json');
let whitelist = db.data;

const url = "http://borukva.space:3405/?worldname=Borukva&mapname=flat&zoom=2&x=450&y=64&z=-950";
const browser = await chromium.launch();
const page = await browser.newPage();

await page.setViewportSize({ width: 1200, height: 700 });

try {
  await page.goto(url);
} catch (err) {
  console.log(`[${new Date().toISOString()}] Помилка підключення до динмапи`);
  console.log(err);
  ctx.reply(`Помилка підключення до динмапи`);
};


await bot.launch().catch((err) => console.error(err));
console.log("bot.launch");

bot.use(async (ctx, next) => {
  //if (ctx.update.from === undefined) return; // 
  const userId = ctx.update.message?.from.id;
  const chatId = ctx.update.message?.chat.id;
  const update = ctx.update.message || ctx.update.callback_query;
  // userId == process.env.RIGHTFUL_USER_ID || 

  // if (ctx.update.message?.text == '/terminate') {
  //   await ctx.reply(`Вимикаюсь...`);

  //   bot.stop('SIGNINT');
  //   process.exit();
  // }
  try {
    if (chatId == process.env.MAIN_CHAT_ID) {
      console.log(`[${new Date().toISOString()}] ${ctx.update.message?.from.username} ${userId} використав ${ctx.update.message?.text}`);
      await next();
      return;
    }

    if (userId != process.env.RIGHTFUL_USER_ID || chatId != process.env.MAIN_CHAT_ID) {
      await next();
      console.log(`[${new Date().toISOString()}] ${ctx.update.message?.from.username} ${userId} використав ${ctx.update.message?.text} у ${ctx.update.message?.chat.username} ${chatId}`);
      return;
    }
    await ctx.reply('У вас немає прав.');
  } catch (err) {
    console.error(err);
    ctx.reply(`Виникла помилка при виконанні програми`);
  }

  
});

bot.command('seewhitelist', (ctx) => {
  // console.log(ctx);
  ctx.reply(whitelist.join(' \n'));
});

// bot.command('addadmin', (ctx) => {
//   const user = ctx.update.message.from.username;
//   const playerName = ctx.update.message.text.split(' ')[1];
//   if (playerName === undefined) {
//     ctx.reply(`Введіть нік гравця`);
//     return;
//   }

//   console.log(`[${new Date().toISOString()}] ${user} додав ${playerName} до вайтлісту.`);
//   ctx.reply(`Додаю ${playerName} до вайтлісту.`);
//   whitelist.push(playerName);
//   db.write();
// });

bot.command('addplayer', (ctx) => {
  const playerName = ctx.update.message.text.split(' ')[1];

  if (playerName === undefined) {
    ctx.reply(`Введіть нік гравця`);
    return;
  }
  const user = ctx.update.message.from.username;

  console.log(`[${new Date().toISOString()}] ${user} додав ${playerName} до вайтлісту.`);
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
    console.log(`[${new Date().toISOString()}] ${user} видалив ${playerName} з вайтлісту.`);
    ctx.reply(`Видаляю ${playerName} з вайтлісту.`);
    whitelist.splice(playerIndex, 1);
  } else {
    console.log(`[${new Date().toISOString()}] Гравець ${playerName} не знаходиться у вайтлісті.`);
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
bot.command('/plotnaya_vsim_nashim', async (ctx) => {
  console.log(`o/`);
  await ctx.reply(`o/`);
})


bot.command('screenshot', async (ctx) => {
  await bot.telegram.sendChatAction(ctx.chat.id, 'typing');

  const screenshot = await page.screenshot({
    clip: { x: 250, y: 0, width: 700, height: 700 }
  }).catch((err) => {
    console.error(err);
    ctx.reply(`Виникла помилка при скріншоті`);
    return;
  });

  //await browser.close();

  await bot.telegram.sendPhoto(ctx.chat.id, { source: screenshot });
  console.log(`[${new Date().toISOString()}] Скріншот мапи`);
});




process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
export default bot;
