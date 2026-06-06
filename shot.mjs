import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 1100 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://localhost:3000/products',{waitUntil:'domcontentloaded',timeout:45000});
await p.waitForTimeout(2000);
await p.screenshot({path:'/tmp/products2.png'});
await b.close(); console.log('SHOT OK');
