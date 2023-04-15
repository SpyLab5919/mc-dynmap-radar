
const currentTime = () => `[${new Date().toISOString()}]`;

// const timestampLength = 27;

// function log(text, color = Color.fg.green) {
//   console.log(`%s%s%s`,text.padEnd(process.stdout.columns - timestampLength), color, currentTime(), Color.reset);
// }

function log(text, color = Color.fg.green) {
  console.log(`%s%s%s`, color, currentTime(), Color.reset, text);
}
function warn(text) {
  console.warn(`%s%s %s%s`, Color.warn, currentTime(), "[warn]", Color.reset, text);
}
function error(text) {
  console.warn(`%s%s %s%s`, Color.fg.red, currentTime(), "[ERROR]", Color.reset, text);
}

const Color = {
  reset:      "\x1b[0m",
  bright:     "\x1b[1m",
  dim:        "\x1b[2m",
  underscore: "\x1b[4m",
  blink:      "\x1b[5m",
  reverse:    "\x1b[7m",
  hidden:     "\x1b[8m",
  warn:       "\x1b[38;5;178m",

  fg: {
    black:    "\x1b[30m",
    red:      "\x1b[31m",
    green:    "\x1b[32m",
    yellow:   "\x1b[33m",
    blue:     "\x1b[34m",
    magenta:  "\x1b[35m",
    cyan:     "\x1b[36m",
    white:    "\x1b[37m"
  },

  bg: {
    black:    "\x1b[40m",
    red:      "\x1b[41m",
    green:    "\x1b[42m",
    yellow:   "\x1b[43m",
    blue:     "\x1b[44m",
    magenta:  "\x1b[45m",
    cyan:     "\x1b[46m",
    white:    "\x1b[47m"
  }
};

export {log, warn, error, Color}