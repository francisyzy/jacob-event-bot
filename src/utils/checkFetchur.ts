import got from "got";
import bot from "../lib/bot";
import config from "../config";
import { fetchur } from "../types";

export async function notifyFetchur(): Promise<void> {
  console.log("Notifying fetchur");
  const fetchur = (await got(
    "https://raw.githubusercontent.com/francisyzy/data-skyblock/gh-pages/fetchur-events.min.json",
  ).json()) as fetchur;
  //Sends notification out
  if (fetchur.day.includes(convDayString(new Date().getDay()))) {
    bot.telegram.sendMessage(
      config.FETCHUR_TG_CHANNEL_ID,
      `Fetchur's <b>${fetchur.day}</b>: ${fetchur.item}`,
      { parse_mode: "HTML" },
    );
  } else {
    bot.telegram.sendMessage(
      config.FETCHUR_TG_CHANNEL_ID,
      `<i>Unable to get fetchur's quest as the <a href="https://hypixel-skyblock.fandom.com/wiki/Fetchur">Wiki</a> is yet to be updated</i>`,
      { parse_mode: "HTML", disable_web_page_preview: true },
    );
  }
}

function convDayString(day: number): string {
  switch (day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "?";
  }
}
