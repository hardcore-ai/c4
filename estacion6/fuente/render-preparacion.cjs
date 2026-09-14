// Run with NODE_PATH pointing to an environment with marked and playwright.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

(async () => {
  const { marked } = await import(pathToFileURL(require.resolve('marked')).href);
  const dir = path.resolve(__dirname, '../../estacion7');
  const body = marked.parse(fs.readFileSync(path.join(dir, 'preparacion.md'), 'utf8'));
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Preparación para estación 7</title><style>
  *{box-sizing:border-box}body{font:12pt/1.45 Calibri,Aptos,Arial,sans-serif;color:#1A1A1A;max-width:850px;margin:32px auto;padding:0 24px}
  h1{font-size:26pt;line-height:1.1}h2{font-size:17pt;margin-top:24px;break-after:avoid}h3{break-after:avoid}
  a{color:#1A1A1A;text-decoration:underline}table{border-collapse:collapse;width:100%;font-size:10pt}th,td{padding:8px;border:1px solid #808080;text-align:left}th{background:#C8E600}
  pre{white-space:pre-wrap;overflow-wrap:anywhere;padding:12px;border:1px solid #808080;font-size:9pt}code{overflow-wrap:anywhere}li{margin:5px 0}tr,pre{break-inside:avoid}
  @media print{@page{size:A4;margin:16mm}body{max-width:none;margin:0;padding:0}a{text-decoration:none}}
  </style></head><body>${body}</body></html>`;
  const target = path.join(dir, 'preparacion.html');
  fs.writeFileSync(target, html);
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage({viewport:{width:900,height:1100}});
    await page.goto(pathToFileURL(target).href);
    await page.evaluate(() => document.fonts.ready);
    await page.pdf({path:path.join(dir,'preparacion.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
    await page.screenshot({path:path.join(__dirname,'verificacion/preparacion.png'),fullPage:true});
    console.log('Preparación HTML y PDF exportados.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
