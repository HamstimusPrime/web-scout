import { JSDOM } from "jsdom";

export type ExtractedPageData = {
    url: string,
    heading: string | null,
    firstParagraph: string | null,
    outgoingLinks: string[] | null,
    imageURLs: string[] | null,
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

export function isSameDomain(urlA: string, urlB: string): boolean | null {
    try {
        const urlObjectA = new URL(urlA);
        const urlObjectB = new URL(urlB);
        return urlObjectA.hostname === urlObjectB.hostname;
    } catch (error) {
        console.log(`error comparing domain names for ulrA: "${urlA}" and urlB: "${urlB}" \nerror:${error} `)
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
        console.log(`$image url is: ${imageURL}`)
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