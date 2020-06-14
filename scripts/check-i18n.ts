const fs = require("fs");
const {
  extractFromFiles,
  flatten,
  findMissing,
  findUnused,
  findDuplicated,
  forbidDynamic,
} = require("i18n-extract");
const keys = extractFromFiles(["src/**/*.tsx", "src/**/*.ts"], {
  marker: "t",
  parser: "typescript",
});
const locale = flatten(JSON.parse(fs.readFileSync("src/locales/en.json")));
console.dir(
  [
    ...findMissing(locale, keys),
    ...findUnused(locale, keys),
    ...findDuplicated(locale, keys),
    ...forbidDynamic(locale, keys),
  ],
  { depth: null }
);
