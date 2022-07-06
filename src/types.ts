interface event {
  mcDate: string;
  rlDate: Date;
  crops: string[];
}

interface events extends Array<event> {}

export { events };
