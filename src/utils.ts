import { argv } from 'node:process';

export type CommandLineArgs = {
    url: string;
    maxcConcurrency?: number;
    maxPages?: number
}

export function validateCommandLineArgs(args: string[]): CommandLineArgs {
    if (argv.length <= 2 || argv.length > 5) {
        console.log("too many arguments passed or no arguments\nexiting...")
        process.exit(1)
    }

    const commandLineResults: CommandLineArgs = { url: argv[2] }
    const maxConcurrency = parseInt(argv[3])
    if (!isNaN(maxConcurrency)) {
        commandLineResults.maxcConcurrency = maxConcurrency
    }

    const maxPages = parseInt(argv[4])
    if (!isNaN(maxPages)) {
        commandLineResults.maxPages = maxPages
    }

    return commandLineResults

}
