import bot from "../lib/bot";
import { getBotCommands } from "../utils/botCommands";
import { notifyFetchur } from "../utils/checkFetchur";

//General helper commands
const helper = () => {
  //All bots start with /start
  bot.start((ctx) => {
    ctx.setMyCommands(getBotCommands());
    return ctx.reply("Welcome to jacob event bot.");
  });

  bot.help((ctx) => ctx.reply("Help message"));

  bot.command("updateFetchur", (ctx) => {
    try {
      notifyFetchur();
      return ctx.reply("Updated");
    } catch (error) {
      return ctx.reply("Failed");
    }
  });
};

export default helper;
