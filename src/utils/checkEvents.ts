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

export async function notifyEvent(): Promise<void> {
  console.log("Notifying events");
  const events = (await got(
    "https://raw.githubusercontent.com/francisyzy/data-skyblock/gh-pages/jacob-events.min.json",
  ).json()) as events;
  let notifier: {
    cropMessage: string;
    startingIn: string;
    mcDate: string;
  }[] = [];
  events.forEach((event) => {
    if (
      isWithinInterval(new Date(event.rlDate), {
        start: subMinutes(new Date(), config.eventBuffer),
        end: addMinutes(new Date(), config.eventBuffer),
      })
    ) {
      const cropMessage = event.crops.join(", ");
      const startingIn = formatDistanceToNow(new Date(event.rlDate));
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
  //Sends notification out
  notifier.forEach((notify) => {
    bot.telegram.sendMessage(
      config.JACOB_TG_CHANNEL_ID,
      `${notify.mcDate} Jacob's Farming Contest. <b>Crops: ${notify.cropMessage}</b> starting in ${notify.startingIn}`,
      { parse_mode: "HTML" },
    );
  });
}
