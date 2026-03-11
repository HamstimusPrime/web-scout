import { argv } from 'node:process';
import { crawlPage } from "./crawl"


async function main() {
    if (argv.length <= 2 || argv.length > 3) {
        console.log("too many arguments passed or no arguments\nexiting...")
        process.exit(1)
    }
    const urlFromUser = argv[2]
    console.log(`CLI command: ${urlFromUser}`)


    const pages = await crawlPage(
        urlFromUser,
    );
    console.log(pages)
}
main();