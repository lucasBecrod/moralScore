/**
 * Scrape candidate photo URLs and party logo URLs from JNE Voto Informado.
 * Uses Playwright to intercept network requests from the Angular SPA.
 *
 * Usage: npx tsx scripts/scrape-jne-urls.ts
 * Requires: npx playwright install chromium
 */

import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const apiRequests: string[] = [];
  const imageUrls: string[] = [];

  // Intercept all network requests
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("api") || url.includes("candidat") || url.includes("presidente")) {
      apiRequests.push(url);
      try {
        const ct = response.headers()["content-type"] || "";
        if (ct.includes("json")) {
          const json = await response.json();
          console.log("\n=== API Response:", url, "===");
          console.log(JSON.stringify(json, null, 2).substring(0, 2000));
        }
      } catch {}
    }
    if (url.includes("apidocs") || url.includes("LogoOp") || url.includes("mpesije")) {
      imageUrls.push(url);
    }
  });

  console.log("Navigating to JNE Voto Informado...\n");
  await page.goto("https://votoinformado.jne.gob.pe/presidente-vicepresidentes", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  // Wait for content to load
  await page.waitForTimeout(5000);

  console.log("\n=== API Requests ===");
  apiRequests.forEach((url) => console.log(url));

  console.log("\n=== Image URLs (photos + logos) ===");
  [...new Set(imageUrls)].forEach((url) => console.log(url));

  // Also extract from DOM
  const imgs = await page.$$eval("img", (elements) =>
    elements.map((el) => ({ src: el.src, alt: el.alt })).filter((i) => i.src)
  );

  console.log("\n=== DOM Images ===");
  imgs.forEach((img) => console.log(`${img.alt}: ${img.src}`));

  await browser.close();
}

main().catch(console.error);
