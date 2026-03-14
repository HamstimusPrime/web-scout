import { argv } from 'node:process';
import { crawlSiteAsync } from "./crawl"
import { validateCommandLineArgs } from './utils';



async function main() {
    const parsedCommands = validateCommandLineArgs(argv);
    if (!parsedCommands.maxPages && !parsedCommands.maxcConcurrency) {
        console.log("Starting crawler...using default page and concurrency limit")
    } else { console.log("Starting crawler...") }

    crawlSiteAsync(
        parsedCommands.url,
        parsedCommands.maxcConcurrency,
        parsedCommands.maxPages
    );
}
main();