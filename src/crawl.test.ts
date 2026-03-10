import { expect, test, it } from 'vitest'

import {
    normalizeURL, getURLsFromHTML,
    isSameDomain, extractPageData,
    getFirstParagraphFromHTML,
    getHeadingFromHTML, getImageURLsFromHTML
} from './crawl'


test("normalizeURL protocol", () => {
    const input = "https://crawler-test.com/path";
    const actual = normalizeURL(input);
    const expected = "crawler-test.com/path";
    expect(actual).toEqual(expected);
});

test("normalizeURL slash", () => {
    const input = "https://crawler-test.com/path/";
    const actual = normalizeURL(input);
    const expected = "crawler-test.com/path";
    expect(actual).toEqual(expected);
});

test("normalizeURL capitals", () => {
    const input = "https://CRAWLER-TEST.com/path";
    const actual = normalizeURL(input);
    const expected = "crawler-test.com/path";
    expect(actual).toEqual(expected);
});

test("normalizeURL http", () => {
    const input = "http://CRAWLER-TEST.com/path";
    const actual = normalizeURL(input);
    const expected = "crawler-test.com/path";
    expect(actual).toEqual(expected);
});

test("the same domain name", () => {
    const inputURlA = "http://CRAWLER-TEST.com/path";
    const inputURLB = "https://CRAWLER-TEST.com/path/summer-time";
    const actual = isSameDomain(inputURlA, inputURLB)
    const expected = true;
    expect(actual).toEqual(expected);
});

test("the same domain name", () => {
    const inputURlA = "http://CRAWLER-TEST.com/path";
    const inputURLB = "https://CRAWLER-TESTER.com/path/summer-time";
    const actual = isSameDomain(inputURlA, inputURLB)
    const expected = false;
    expect(actual).toEqual(expected);
});


test("getFirstParagraphFromHTML main priority", () => {
    const inputBody = `
    <html><body>
      <p>Outside paragraph.</p>
      <main>
        <p>Main paragraph.</p>
      </main>
    </body></html>
  `;
    const actual = getFirstParagraphFromHTML(inputBody);
    const expected = "Main paragraph.";
    expect(actual).toEqual(expected);
});

test("getHeadingFromHTML basic", () => {
    const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
    const actual = getHeadingFromHTML(inputBody);
    const expected = "Test Title";
    expect(actual).toEqual(expected);
});

test("quick test", () => {
    const inputBody = `<html><body><a href="/path/one"><span>Boot.dev</span></a></body></html>`;
    const baseURL = "https://theDadis.com";

    console.log(getURLsFromHTML(inputBody, baseURL))
})

test("quick test", () => {
    const inputBody = `<html>
  <body>
    <a href="https://crawler-test.com">Go to Boot.dev</a>
    <img src="/logo.png" alt="Boot.dev Logo" />
  </body>
</html>`;
    const baseURL = "https://theDadis.com";

    console.log(getURLsFromHTML(inputBody, baseURL))
})

test("getImagesFromHTML relative", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><img src="/logo.png" alt="Logo"></body></html>`;

    const actual = getImageURLsFromHTML(inputBody, inputURL);
    const expected = ["https://crawler-test.com/logo.png"];

    expect(actual).toEqual(expected);
});

test("getImagesFromHTML relative", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><img src="https://mo.com/logo.png" alt="Logo"></body></html>`;

    const actual = getImageURLsFromHTML(inputBody, inputURL);
    const expected = ["https://crawler-test.com/https://mo.com/logo.png"];

    expect(actual).toEqual(expected);
});

test("extractPageData basic", () => {
    const inputURL = "https://crawler-test.com";
    const inputBody = `<html><body><h1>Test Title</h1>
      <p>This is the first paragraph.</p>
      <a href="/link1">Link 1</a>
      <img src="/image1.jpg" alt="Image 1">
    </body></html>
  `;

    const actual = extractPageData(inputBody, inputURL);
    const expected = {
        url: "https://crawler-test.com",
        heading: "Test Title",
        firstParagraph: "This is the first paragraph.",
        outgoingLinks: ["https://crawler-test.com/link1"],
        imageURLs: ["https://crawler-test.com/image1.jpg"],
    };

    expect(actual).toEqual(expected);
});