import { Message } from "typegram";
import { Telegraf } from "telegraf";

import config from "./config";

import { toEscapeHTMLMsg } from "./utils/messageHandler";
import { printBotInfo } from "./utils/consolePrintUsername";

import bot from "./lib/bot";
import helper from "./commands/helper";
import catchAll from "./commands/catch-all";
import { notifyJacob } from "./utils/checkJacob";
import { notifyFetchur } from "./utils/checkFetchur";
import { notifySBEvents } from "./utils/sbEvents";
import { schedule } from "node-cron";

//Production Settings
if (process.env.NODE_ENV === "production") {
  //Production Logging
  bot.use((ctx, next) => {
    if (ctx.message && config.LOG_GROUP_ID) {
      let userInfo: string;
      if (ctx.message.from.username) {
        userInfo = `name: <a href="tg://user?id=${
          ctx.message.from.id
        }">${toEscapeHTMLMsg(ctx.message.from.first_name)}</a> (@${
          ctx.message.from.username
        })`;
      } else {
        userInfo = `name: <a href="tg://user?id=${
          ctx.message.from.id
        }">${toEscapeHTMLMsg(ctx.message.from.first_name)}</a>`;
      }
      const text = `\ntext: ${
        (ctx.message as Message.TextMessage).text
      }`;
      const logMessage = userInfo + toEscapeHTMLMsg(text);
      bot.telegram.sendMessage(config.LOG_GROUP_ID, logMessage, {
        parse_mode: "HTML",
      });
    }
    return next();
  });
  bot.launch();
  // bot.launch({
  //   webhook: {
  //     domain: config.URL,
  //     port: Number(config.PORT),
  //   },
  // });
} else {
  //Development logging
  bot.use(Telegraf.log());
  bot.launch();
  printBotInfo(bot);
}

helper();
//https://crontab.guru/#15_*_*_*_*
schedule("15 * * * *", () => {
  console.log(new Date());
  console.log(new Date().toString());
  notifySBEvents();
});
//https://crontab.guru/#55_*_*_*_*
schedule("55 * * * *", () => {
  console.log(new Date());
  console.log(new Date().toString());
  notifySBEvents();
});
//https://crontab.guru/#35_*_*_*_*
schedule("35 * * * *", () => {
  console.log(new Date());
  console.log(new Date().toString());
  notifySBEvents();
});
//https://crontab.guru/#14_*_*_*_*
schedule("14 * * * *", () => {
  console.log(new Date());
  console.log(new Date().toString());
  notifyJacob();
});
//https://crontab.guru/#15_13_*_*_*
schedule("15 13 * * *", () => {
  console.log(new Date());
  console.log(new Date().toString());
  notifyFetchur();
});
// notifyJacob();
// notifyFetchur();

//Catch all unknown messages/commands
catchAll();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
