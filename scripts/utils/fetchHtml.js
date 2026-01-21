const { JSDOM } = require("jsdom");

/**
 * Fetch HTML content from URL and return JSDOM document
 * @param {string} url 
 * @returns {Promise<Document>}
 */
async function fetchHtml(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        const htmlText = await response.text();
        const dom = new JSDOM(htmlText);
        return dom.window.document;
    } catch (error) {
        console.error("Fetch Error:", error);
        throw error;
    }
}

module.exports = { fetchHtml };
