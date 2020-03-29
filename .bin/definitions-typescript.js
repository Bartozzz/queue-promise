import { basename, resolve } from "path";
import { copy } from "fs-extra";
import glob from "glob";

async function copyFile(file) {
  const srcDir = resolve(__dirname, "../types");
  const destDir = resolve(__dirname, "../dist");
  const fileDef = file.replace(srcDir, destDir);

  try {
    await copy(file, fileDef);
    console.log(`Copied ${file} to ${fileDef}`);
  } catch (error) {
    console.error(`Could not copy ${file} to ${fileDef}`);
    console.error(error);
  }
}

glob(resolve(__dirname, "../types/**/*.d.ts"), (error, files) => {
  if (error) {
    console.error("Could not find any files in './types/**/*.d.ts'");
    console.error(error);
  } else {
    files.forEach((file) => copyFile(file));
  }
});
