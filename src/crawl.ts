import { JSDOM } from "jsdom";
import pLimit from "p-limit"

export type ExtractedPageData = {
    url: string,
    heading: string | null,
    firstParagraph: string | null,
    outgoingLinks: string[]
    imageURLs: string[],
}

export function normalizeURL(url: string): string | null {
    try {
        const u = new URL(url)
        let fullPath = u.host + u.pathname
        if (fullPath.slice(-1) === "/") {
            fullPath = fullPath.slice(0, -1);
        }
        return fullPath

    } catch (error) {
        console.log(`unable to parse URL: ${url}, error: ${error}\n`)
        return null
    }
}

export function isSameDomain(urlA: string, urlB: string): boolean | null {
    try {
        const urlObjectA = new URL(urlA);
        const urlObjectB = new URL(urlB);
        return urlObjectA.hostname === urlObjectB.hostname;
    } catch (error) {
        // console.log(`error comparing domain names for ulrA: "${urlA}" and urlB: "${urlB}" \nerror:${error} `)
        return null;
    }
}

export function getHeadingFromHTML(html: string): string | null {
    const dom = new JSDOM(html);
    //get header1 or header 2
    const heading = dom.window.document.querySelector("h1") ||
        dom.window.document.querySelector("h2");
    if (heading) {
        return heading.textContent
    }
    return null;
}

export function getFirstParagraphFromHTML(html: string): string | null {
    const dom = new JSDOM(html);
    //get paragraph nested in main element
    const paragraph = dom.window.document.querySelector("main p") ||
        dom.window.document.querySelector("p");
    if (paragraph) {
        return paragraph.textContent;
    }
    return null;
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    //returns a list of any link found with the base url concatenated to it
    //i.e [Baseurl/<string found>]
    const dom = new JSDOM(html);
    const anchorElements = dom.window.document.querySelectorAll("a");
    const URLs: string[] = [];
    const URLsFromHTML = Array.from(anchorElements).map((node) => node.href);

    for (let url of URLsFromHTML) {
        switch (isSameDomain(url, baseURL)) {
            case null:
                //remve forward slashes if any
                URLs.push(`${baseURL}/${url.replace(/^\/+/, "")}`)
                break;
            case true:
                URLs.push(url);
                break;
            default:
                URLs.push(`${baseURL}/${normalizeURL(url)}`)
                break;
        }
    }
    return URLs;
}

export function getImageURLsFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const anchorElements = dom.window.document.querySelectorAll("img");
    const URLs: string[] = [];
    const imageURLsFromHTML = Array.from(anchorElements).map((node) => node.src);

    for (let imageURL of imageURLsFromHTML) {
        // console.log(`$image url is: ${imageURL}`)
        URLs.push(`${baseURL}/${imageURL.replace(/^\/+/, "")}`)
    }
    return URLs;
}


export function extractPageData(html: string, pageURL: string): ExtractedPageData {

    const pageData: ExtractedPageData = {
        url: pageURL,
        heading: getHeadingFromHTML(html),
        firstParagraph: getFirstParagraphFromHTML(html),
        outgoingLinks: getURLsFromHTML(html, pageURL),
        imageURLs: getImageURLsFromHTML(html, pageURL),
    }

    return pageData
}

export class ConcurrentCrawler {
    public limit: ReturnType<typeof pLimit>
    public pages: Record<string, ExtractedPageData> = {}
    public shouldStop: boolean = false
    public allTasks: Set<Promise<void>> = new Set()
    public visitedCount: number = 0
    private visited: Set<string> = new Set();


    constructor(
        public baseURL: string,
        public maxConcurrency: number = 5,
        public maxPages: number = 100,

    ) {
        this.limit = pLimit(this.maxConcurrency)
    }

    public async crawl(): Promise<Record<string, ExtractedPageData>> {
        await this.crawlPage(this.baseURL)
        return this.pages
    }

    private addPageVisit(normalizedURL: string): boolean {
        if (this.shouldStop) return false
        if (this.visited.has(normalizedURL)) return false

        if (this.visitedCount >= this.maxPages) {
            this.shouldStop = true
            console.log(`number of visited pages is ${this.visitedCount}`)
            console.log("Reached maximum number of pages to crawl.")
            return false
        }

        this.visited.add(normalizedURL)
        this.visitedCount++;
        return true
    }

    private async getHTML(url: string) {
        return await this.limit(async () => {

            try {
                const responseObject = await fetch(url, {
                    headers: {
                        "User-Agent": "Mo/1.0"
                    }
                })
                const responseContentType = responseObject.headers.get("content-type")
                if (responseObject.status > 399) {
                    // console.log(`could not fetch response from URL:${url}\nexiting...`)
                    return
                }
                if (responseContentType && !responseContentType.includes("text/html")) {
                    // console.log("invalid response type\nexiting...");
                    return
                }
                return await responseObject.text();

            } catch (error) {
                console.log(`an error occured connection to URL:${url}\nerror:${error}\nexiting...`)
                return
            }
        })
    }

    private async crawlPage(
        currentURL: string = this.baseURL,
    ): Promise<void> {

        if (this.shouldStop) return

        //check if baseURL and currentURL have the same domain name
        if (isSameDomain(this.baseURL, currentURL) === false) return
        const normalizedCurrentURL = normalizeURL(currentURL)
        if (!normalizedCurrentURL) return

        if (!this.addPageVisit(normalizedCurrentURL)) {
            return;
        }

        const currentHTML = await this.getHTML(currentURL)
        if (!currentHTML) return

        console.log(`crawling ${currentURL}`)
        const pageData = extractPageData(currentHTML, currentURL)
        this.pages[normalizedCurrentURL] = pageData
        console.log("current state of pages :")
        // console.log(this.pages)


        const promises: Promise<void>[] = [];
        for (const url of pageData.outgoingLinks) {
            if (this.shouldStop) break
            const task = this.crawlPage(url)
            this.allTasks.add(task)
            task.finally(() => this.allTasks.delete(task))
            promises.push(task)
        }
        await Promise.all(promises)
    }

}

export async function crawlSiteAsync(url: string, maxConcurrency: number = 5, maxPages: number = 100): Promise<Record<string, ExtractedPageData>> {
    const crawlerObject = new ConcurrentCrawler(url, maxConcurrency, maxPages)
    const objects = await crawlerObject.crawl()
    return objects
}