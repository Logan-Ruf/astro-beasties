import { bold, cyan, dim, red, yellow, green } from "kleur/colors";
const dateTimeFormat = new Intl.DateTimeFormat([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
});
const prefix = (color) => {
    return `${dim(dateTimeFormat.format(new Date()))} ${bold(color("[astro-beasties]"))}`;
};
const info = (msg) => {
    console.log(`${prefix(cyan)} ${msg}`);
};
const warn = (msg) => {
    console.log(`${prefix(yellow)} ${msg}`);
};
const error = (msg) => {
    console.log(`${prefix(red)} ${msg}`);
};
const success = (msg) => {
    console.log(`${prefix(green)} ${msg}`);
};
export default { info, warn, error, success };
