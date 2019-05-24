const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { version } = require('../package.json');

const args = process.argv.slice(2);

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const handleError = (error) =>
  process.stderr.write(
    `Failed to update userCSS version: ${error}\n`,
    () => process.exit(1),
  );

async function main() {
  try {
    const cssPathArg = args[0];

    if (cssPathArg == null || cssPathArg.length < 1) {
      throw new Error(`No path to userCSS was provided!`);
    }

    const cssPath = path.resolve(process.cwd(), cssPathArg);

    const file = await readFileAsync(cssPath);
    const userCSS = file.toString();

    let prevVersion;
    const updatedUserCSS = userCSS.replace(
      /( *\@version *)(.*)/,
      (match, group1, group2) => {
        prevVersion = group2;
        return group1 + version;
      },
    );

    await writeFileAsync(cssPath, updatedUserCSS);

    console.log(
      `Successfully updated userCSS version!\n`,
      `${prevVersion} -> ${version}\n`,
    );

    process.exit(0);
  }
  catch (e) {
    handleError(e);
  }
}

main();
