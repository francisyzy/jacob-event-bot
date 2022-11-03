import {
  addMinutes,
  formatDistanceToNow,
  isWithinInterval,
  subMinutes,
} from "date-fns";
import got from "got";
import bot from "../lib/bot";
import config from "../config";
import { events } from "../types";

export async function notifyJacob(): Promise<void> {
  console.log("Notifying jacob");
  let notifier: {
    cropMessage: string;
    startingIn: string;
    mcDate: string;
  }[] = [];
  try {
    const events = (await got(
      "https://raw.githubusercontent.com/francisyzy/data-skyblock/gh-pages/jacob-events.min.json",
    ).json()) as events;
    events.forEach((event) => {
      if (
        isWithinInterval(new Date(event.rlDate), {
          start: subMinutes(new Date(), config.eventBuffer),
          end: addMinutes(new Date(), config.eventBuffer),
        })
      ) {
        const cropMessage = event.crops.join(", ");
        const startingIn = formatDistanceToNow(
          new Date(event.rlDate),
        );
        notifier.push({
          cropMessage: cropMessage,
          startingIn: startingIn,
          mcDate: event.mcDate,
        });
      }
    });
    //Removes duplicate events
    //https://stackoverflow.com/a/36744732
    notifier = notifier.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.mcDate === value.mcDate),
    );
  } catch (error) {
    console.log(error);
  }
  //Sends notification out
  notifier.forEach((notify) => {
    bot.telegram.sendMessage(
      config.JACOB_TG_CHANNEL_ID,
      `${notify.mcDate} Jacob's Farming Contest. <b>Crops: ${notify.cropMessage}</b> starting in ${notify.startingIn}`,
      { parse_mode: "HTML" },
    );
  });
  if (notifier.length === 0 && new Date().getMinutes() === 14) {
    bot.telegram.sendMessage(
      config.JACOB_TG_CHANNEL_ID,
      `Jacob's Farming Contest is starting soon. <i>Unable to get crops as the <a href="https://hypixel-skyblock.fandom.com/wiki/Jacob%27s_Farming_Contest/Events">Wiki</a> is yet to be updated</i>`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        disable_notification: true,
      },
    );
  }
}
