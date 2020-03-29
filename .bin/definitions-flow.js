// @link: https://laniewski.me/javascript/2018/05/12/exporting-flow-definitions-to-npm.html
import { basename, resolve } from "path";
import { copy } from "fs-extra";
import glob from "glob";

async function copyFile(file) {
  const srcDir = resolve(__dirname, "../src");
  const destDir = resolve(__dirname, "../dist");
  const fileDef = `${file}.flow`.replace(srcDir, destDir);

  try {
    await copy(file, fileDef);
    console.log(`Copied ${file} to ${fileDef}`);
  } catch (error) {
    console.error(`Could not copy ${file} to ${fileDef}`);
    console.error(error);
  }
}

glob(resolve(__dirname, "../src/**/*.js"), (error, files) => {
  if (error) {
    console.error("Could not find any files in './src/**/*.js'");
    console.error(error);
  } else {
    files.forEach((file) => copyFile(file));
  }
});
