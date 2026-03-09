import { expect, test } from 'vitest'
import { normalizeURL, isSameDomain, getFirstParagraphFromHTML, getHeadingFromHTML } from './crawl'


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