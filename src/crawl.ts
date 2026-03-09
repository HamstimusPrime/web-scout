import { JSDOM } from "jsdom";

export function normalizeURL(url: string): string | null {
    try {
        const u = new URL(url)
        let fullPath = u.host + u.pathname
        if (fullPath.slice(-1) === "/") {
            fullPath = fullPath.slice(0, -1);
        }
        return fullPath

    } catch (error) {
        console.log(`unable to parse URL, error: ${error}\n`)
        return null
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
            console.log("invalid response type\nexiting...");
            process.exit(1);
        }
        //print html in response to console as string
        console.log(await responseObject.text());

    } catch (error) {
        console.log(`an error occured connection to URL:${url}\nerror:${error}\nexiting...`)
    }
}

export function isSameDomain(urlA: string, urlB: string): boolean {
    const urlObjectA = new URL(urlA);
    const urlObjectB = new URL(urlB);
    return urlObjectA.hostname === urlObjectB.hostname;
}

export function getHeadingFromHTML(html: string): string | null {
    const dom = new JSDOM(html);
    //get header1 or header 2
    const heading = dom.window.document.querySelector("h1") ||
        dom.window.document.querySelector("h2");
    if (heading) {
        return heading.textContent
    }
    return null
}
export function getFirstParagraphFromHTML(html: string): string | null {
    const dom = new JSDOM(html);
    //get paragraph nested in main element
    const paragraph = dom.window.document.querySelector("main p")
    if (paragraph) {
        return paragraph.textContent
    }
    return null
}
