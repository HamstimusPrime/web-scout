import { argv } from 'node:process';
import { crawlSiteAsync } from "./crawl"
import { validateCommandLineArgs } from './utils';



async function main() {
    const parsedCommands = validateCommandLineArgs(argv);
    if (!parsedCommands.maxPages && !parsedCommands.maxcConcurrency) {
        console.log("Starting crawler...using default page and concurrency limit")
    } else { console.log("Starting crawler...") }

    const pages = await crawlSiteAsync(
        parsedCommands.url,
        parsedCommands.maxcConcurrency,
        parsedCommands.maxPages
    );

    console.log("Finished crawling.");
    const firstPage = Object.values(pages)[0];
    if (firstPage) {
        console.log(
            `First page record: ${firstPage["url"]} - ${firstPage["heading"]}`,
        );
    }
}
main();