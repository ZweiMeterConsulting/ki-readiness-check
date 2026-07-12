// PDF-Erzeugung via puppeteer-core + Chromium.
// Chromium-Auswahl analog ompa-tool:
//  - Coolify/Container: System-Chromium über CHROMIUM_LOCAL_EXEC_PATH (/usr/bin/chromium)
//  - Vercel/Lambda:     @sparticuz/chromium entpackt seine Binary selbst
//  - Lokal (Win/Mac):   CHROMIUM_LOCAL_EXEC_PATH auf installierten Chrome zeigen
// Gerendert wird per page.setContent(html) – kein Navigieren zu einer Report-URL.

import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

async function resolveExecutablePath(): Promise<string> {
  const localExec = process.env.CHROMIUM_LOCAL_EXEC_PATH;
  if (localExec) return localExec;

  if (process.env.VERCEL) {
    return chromium.executablePath();
  }

  try {
    return await chromium.executablePath();
  } catch {
    // Letzter Fallback: Chrome-Standardpfade je Betriebssystem.
    const platform = process.platform;
    if (platform === "win32") {
      return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    }
    if (platform === "darwin") {
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
    }
    return "/usr/bin/chromium";
  }
}

export async function generateReportPdf(html: string): Promise<Buffer> {
  const executablePath = await resolveExecutablePath();
  const isVercel = !!process.env.VERCEL;

  // In Docker ist /dev/shm oft zu klein → --disable-dev-shm-usage, sonst
  // stürzt Chromium beim Rendern ab.
  const launchArgs = isVercel
    ? chromium.args
    : ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"];

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args: launchArgs,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    // HTML ist self-contained (keine externen Ressourcen) → "load" genügt.
    await page.setContent(html, { waitUntil: "load", timeout: 60_000 });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
  }
}
