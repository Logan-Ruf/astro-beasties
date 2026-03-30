import { bold, cyan, dim, red, yellow, green } from "kleur/colors";

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const prefix = (color: (str: string) => string) => {
  return `${dim(dateTimeFormat.format(new Date()))} ${bold(
    color("[astro-beasties]")
  )}`;
};

const info = (msg: string) => {
  console.log(`${prefix(cyan)} ${msg}`);
};

const warn = (msg: string) => {
  console.log(`${prefix(yellow)} ${msg}`);
};

const error = (msg: string) => {
  console.log(`${prefix(red)} ${msg}`);
};

const success = (msg: string) => {
  console.log(`${prefix(green)} ${msg}`);
};

export default { info, warn, error, success };
