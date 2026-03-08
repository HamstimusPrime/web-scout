import { resolve } from "node:dns";

export function normalizeURL(url: string): string {
    try {
        const u = new URL(url)
        let fullPath = u.host + u.pathname
        if (fullPath.slice(-1) === "/") {
            fullPath = fullPath.slice(0, -1);
        }
        return fullPath
    } catch (error) {
        console.log(`unable to parse URL, error: ${error}\n`)
        return ""
    }
}

export async function getHTML(url: string) {
    try {
        const responseObject = await fetch(url, {
            headers: {
                "User-Agent": "BootCrawler/1.0"
            }
        })
        const responseContentType = responseObject.headers.get("content-type")
        if (responseObject.status === 400) {
            console.log(`could not fetch response from URL:${url}\nexiting...`)
            process.exit(1)
        }
        if (responseContentType && !responseContentType.includes("text/html")) {
            console.log("invalid response type\nexiting...")
            process.exit(1)
        }
        //print html in response to console as string
        console.log(await responseObject.text())

    } catch (error) {
        console.log(`an error occured connection to URL:${url}\nerror:${error}\nexiting...`)
    }
} 

export function crawlPage(
    baseURL: string,
    currentURL: string,
    pages: Record<string, number> = {},
){
    //check to see if baseURL and current URL are from the same domain
    //first noramlize URLs of both
    // check if both have the same domain name. if they dont
    
}

