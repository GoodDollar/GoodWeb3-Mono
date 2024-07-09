/* eslint-disable @typescript-eslint/no-var-requires */
// import fs from "fs";
const fs = require("fs");
const path = require("path");

/**
 * Usage: rm -rf index.ts && node gen_supported_locales.ts >> index.ts
 */

const dirPath = path.join(__dirname, ".");

const getDirectories = source =>
  fs.readdirSync(source).filter(name => fs.statSync(path.join(source, name)).isDirectory());

const generateImportStatements = dirs =>
  dirs.map(dir => `import { messages as ${toCamelCase(dir)}Messages } from "./${dir}/messages";`).join("\n");

const toCamelCase = str => str.replace(/-./g, x => x[1].toUpperCase());

const generateDefaultMessages = dirs => dirs.map(dir => `  "${dir}": ${toCamelCase(dir)}Messages`).join(",\n");

const generateLocaleCodes = dirs => dirs.map(dir => `"${dir}"`).join(",\n");

const directories = getDirectories(dirPath);

const indexContent = `
${generateImportStatements(directories)}

export const defaultMessages = {
${generateDefaultMessages(directories)}
};

export const localeCodes = [
${generateLocaleCodes(directories)}
];
`;

console.log(indexContent);
