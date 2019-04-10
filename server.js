// REQUIREMENTS

const dotenv = require('dotenv');
const express = require('express');
const Telegraf = require('telegraf');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

// DOTENV SETUP

dotenv.config();

// DATABASE SETUP

const adapter = new FileSync('.data/db.json');
const db = low(adapter);

const defaultEntries = {
  entries: [],
};

db.defaults(defaultEntries).write();

// WEBSERVER SETUP

const app = express();

app.use(express.static('public'));

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/entries', (request, response) => {
  const entries = db
    .get('entries')
    .sortBy('moduleCode')
    .value();
  const result = entries.map((entry) => {
    return { moduleCode: entry.moduleCode, chatUrl: entry.chatUrl };
  });
  response.send(result);
});

app.get('/entries/:moduleCode', (request, response) => {
  const moduleCode = request.params.moduleCode;
  const entry = db
    .get('entries')
    .find({ moduleCode: moduleCode })
    .value();
  const result = entry === undefined ? 'Not Found' : entry.chatUrl;
  response.send(result);
});

app.listen(process.env.PORT);

// CHATBOT SETUP

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username;
});

bot.start(async (ctx) => {
  if (ctx.chat.title === undefined)
    return ctx.reply('Opps, maybe try again? Did you make me an admin?');

  if (!ctx.chat.title.match('^[A-Z0-9]+ Discussion$'))
    return ctx.reply(
      'Your group name is invalid. Ensure that it is in the form of "CS1231 Discussion".',
    );

  if (ctx.chat.type !== 'supergroup')
    return ctx.reply(
      'Your group is not a supergroup. Please convert it into one.',
    );

  const moduleCode = ctx.chat.title.split(' ')[0];
  const chatIdExist =
    db
      .get('entries')
      .find({ chatId: ctx.chat.id })
      .size() > 0;
  const moduleCodeExist =
    db
      .get('entries')
      .find({ moduleCode: moduleCode })
      .size() > 0;

  if (chatIdExist || moduleCodeExist)
    return ctx.reply('This chat has already been registered');

  ctx
    .exportChatInviteLink()
    .then((chatUrl) => {
      db.get('entries')
        .push({ chatId: ctx.chat.id, chatUrl: chatUrl, moduleCode: moduleCode })
        .write();
      ctx.reply('Chat successfully registered');
    })
    .catch((err) => {
      console.log(err);
    });
});

bot.on(['new_chat_members', 'left_chat_member'], (ctx) => {
  try {
    ctx.deleteMessage(ctx.message.message_id);
  } catch (err) {
    console.log(err);
  }
});

bot.startPolling();
