interface event {
  mcDate: string;
  rlDate: Date;
  crops: string[];
}

interface events extends Array<event> {}

interface fetchur {
  day: string;
  item: string;
}

export { events, fetchur };
