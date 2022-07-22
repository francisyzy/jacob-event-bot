interface event {
  mcDate: string;
  rlDate: Date;
  crops: string[];
}

interface events extends Array<event> {}

interface fetchur {
  day: string;
  item: string;
  url: string;
}

export { events, fetchur };
