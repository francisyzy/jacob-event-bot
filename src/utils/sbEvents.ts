import { addMinutes, isWithinInterval, subMinutes } from "date-fns";
import bot from "../lib/bot";
import config from "../config";

const MC_DAY = 1200000;
const MC_MONTH = 37200000;
const MC_YEAR = 446400000; //Real Life ms
const MC_HOUR = MC_DAY / 24;
const MC_MINUTE = MC_HOUR / 60;
const SB_NEWYEAR = 1560275700000; //Skyblock Year 1
const IRL_HOUR = 3600000;
const SB_SEASON_NAMES = [
  "Early Spring",
  "Spring",
  "Late Spring",

  "Early Summer",
  "Summer",
  "Late Summer",

  "Early Authum",
  "Authum",
  "Late Authum",

  "Early Winter",
  "Winter",
  "Late Winter",
];

let FISHING_FESTIVAL = false;

function formatTime(x: number) {
  x = Math.floor(x / 1000);
  var d = Math.floor(x / 86400);
  var h = Math.floor((x % 86400) / 3600);
  var m = Math.floor((x % 3600) / 60);
  var s = x % 60;

  var ret = "";
  if (x >= 3600) {
    if (x >= 86400) {
      ret += `${d}d `;
    }
    ret += `${h}h `;
  }
  ret += `${m}m ${s}s`;
  return ret;
}

function sbGetSeason(n: number) {
  return SB_SEASON_NAMES[n - 1];
}

var CUSTOM_OFFSET = 0;

function sbGetYear(time: number) {
  var sbCurtime = (time - SB_NEWYEAR) % MC_YEAR;
  var sbCurYear = time - sbCurtime;
  return 1 + (sbCurYear - SB_NEWYEAR) / MC_YEAR;
}
function sbDayOfTheYear(time: number) {
  var sbCurtime = (time - SB_NEWYEAR) % MC_YEAR;
  return Math.floor(sbCurtime / MC_DAY) + 1;
}
function timeToSBDate(
  time: number,
  hours?: boolean | undefined,
  obj?: boolean | undefined,
) {
  var year = sbGetYear(time);
  time -= SB_NEWYEAR;
  var month = (Math.floor(time / MC_MONTH) % 12) + 1;
  var day = (Math.floor(time / MC_DAY) % 31) + 1;
  var hour = (Math.floor(time / MC_HOUR) % 24).toString();
  var min = (Math.floor(time / MC_MINUTE) % 60).toString();
  hour = hour.toString().padStart(2, "0");
  min = min.toString().padStart(2, "0");

  if (obj) {
    return {
      day: day,
      month: month,
      year: year,
      hour: hour,
      min: min,
    };
  }
  var daytime = hours ? ` ${hour}:${min}` : "";
  return `${day}/${month}/${year}${daytime}`;
}

function sbDate(d = 1, m = 1) {
  d = d - 1;
  m = m - 1;
  return d * MC_DAY + m * MC_MONTH;
}

function date2sbDate(curtime: number, raw: any) {
  curtime -= SB_NEWYEAR;
  if (raw) return curtime;
  return [
    Math.floor((curtime / MC_DAY) % 31) + 1,
    Math.floor((curtime / MC_MONTH) % 12) + 1,
    Math.floor(curtime / MC_YEAR) + 1,
  ];
}
function sbGetNextEvents() {
  var curtime = new Date().getTime() + CUSTOM_OFFSET;

  var sbCurtime = (curtime - SB_NEWYEAR) % MC_YEAR;
  var sbCurYear = curtime - sbCurtime;

  function fishingFestival(offset: number) {
    offset = offset;
    if (sbCurtime % MC_MONTH < IRL_HOUR) {
      offset--;
    }
    var start =
      sbCurtime - (sbCurtime % MC_MONTH) + MC_MONTH * offset;
    var end = start + IRL_HOUR;
    return [start, end];
  }

  function specialMayorElections() {
    var SB_YEAR = sbGetYear(curtime);
    var SpecialYear = SB_YEAR % 8 !== 0 ? 8 - (SB_YEAR % 8) : 0;
    var SpecialDiff = SB_YEAR - Math.floor(SB_YEAR / 8) * 8;
    if (SpecialDiff === 1 && sbCurtime < sbDate(27, 3)) {
      return sbEvent(27 - 372, 6, 279);
    }
    return sbEvent(27 + 372 * SpecialYear, 6, 279);
  }

  function sbEvent(day: number, month: number, duration: number) {
    var start = sbDate(day, month);
    var end = start + MC_DAY * duration;
    if (end < sbCurtime) {
      start += MC_YEAR;
      end += MC_YEAR;
    }
    return [start, end];
  }

  var sbEvents = [
    ["Election Over", sbEvent(27, 3, 0)],
    ["Traveling Zoo", sbEvent(1, 4, 3)],
    ["Election Start", sbEvent(27, 6, 0)],
    ["Spooky Festival", sbEvent(29, 8, 3)],
    ["Traveling Zoo", sbEvent(1, 10, 3)],
    ["Jerry's Workshop", sbEvent(1, 12, 31)],
    ["Season Of Jerry", sbEvent(24, 12, 3)],
    ["New Year Cake", sbEvent(29, 12, 3)],
    ["Special Mayor Election", specialMayorElections()],
  ];
  if (FISHING_FESTIVAL) {
    sbEvents.push(["Fishing Festival", fishingFestival(1)]);
    sbEvents.push(["Fishing Festival", fishingFestival(2)]);
    sbEvents.push(["Fishing Festival", fishingFestival(3)]);
    sbEvents.push(["Fishing Festival", fishingFestival(4)]);
    sbEvents.push(["Fishing Festival", fishingFestival(5)]);
    sbEvents.push(["Fishing Festival", fishingFestival(6)]);
  }
  let finalEvent = [];
  for (let i = 0; i < sbEvents.length; i++) {
    const sbEvent = sbEvents[i];
    const eventDetails = sbEvent[1] as number[];
    finalEvent[i] = {
      eventName: sbEvent[0],
      start: new Date(sbCurYear + eventDetails[0]),
      end: new Date(sbCurYear + eventDetails[1]),
      startTime: sbCurYear + eventDetails[0],
      endTime: sbCurYear + eventDetails[1],
      TimeLeft: sbCurYear + eventDetails[0] - curtime,
      SBDate: timeToSBDate(sbCurYear + eventDetails[0]),
    };
  }
  return finalEvent;
  //NextEvents =
  //   return sbEvents
  // .sort((x, y) => x[1][0] > y[1][0])
  // .map((x) => {
  //   return [
  //     x[0],
  //     {
  //       start: new Date(sbCurYear + x[1][0]),
  //       end: new Date(sbCurYear + x[1][1]),
  //       startTime: sbCurYear + x[1][0],
  //       endTime: sbCurYear + x[1][1],
  //       TimeLeft: sbCurYear + x[1][0] - curtime,
  //       SBDate: timeToSBDate(sbCurYear + x[1][0]),
  //     },
  //   ];
  // });
}

export async function notifySBEvents(): Promise<void> {
  const events = sbGetNextEvents();
  for (const event of events) {
    const eventTime = event.start;

    // const localEventTime = new Date(
    //   eventTime.getUTCFullYear(),
    //   eventTime.getUTCMonth(),
    //   eventTime.getUTCDate(),
    //   eventTime.getUTCHours(),
    //   eventTime.getUTCMinutes(),
    //   eventTime.getUTCSeconds(),
    //   eventTime.getUTCMilliseconds(),
    // );
    // console.log(localEventTime.toString());
    // console.log(eventTime.toString());
    if (
      isWithinInterval(eventTime, {
        start: subMinutes(new Date(), 5),
        end: addMinutes(new Date(), 5),
      })
    ) {
      // console.log(`<a href="https://hypixel-skyblock.fandom.com/wiki/Special:Search?query=${event.eventName}">${event.eventName}</a> is starting now`);
      await bot.telegram.sendMessage(
        config.EVENT_TG_CHANNEL_ID,
        `<a href="https://hypixel-skyblock.fandom.com/wiki/Special:Search?query=${event.eventName}">${event.eventName}</a> is starting now`,
        { parse_mode: "HTML", disable_web_page_preview: true },
      );
    }
  }
}
