// Ejecutame con Node.
let test_string = "[3] Haz un haiku.";

const regexStr = /\[\d\] /;
const regexNum = /\d/;
let numPick = test_string.match(regexStr, "")[0].match(regexNum)[0];
test_string = test_string.replace(regexStr, "");

console.log(`numPick: "${numPick}".`);
console.log(`Test string: "${test_string}".`);
