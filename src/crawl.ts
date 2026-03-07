export function normalizeURL(url: string): string {
    try {
        const u = new URL(url)
        return u.host + u.pathname.replace(/\/$/, "")
    } catch (error) {
        console.log(`unable to parse URL, error: ${error}\n`)
        return ""
    }

}
