const { chromium } = require('playwright-core');
(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/user/.cache/ms-playwright/chromium-1223/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-gpu'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const p = await ctx.newPage();
  await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  // reveal all animations
  await p.evaluate(() => document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('in')));
  await p.waitForTimeout(300);
  // scroll to very bottom
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await p.waitForTimeout(800);
  // screenshot the footer element directly
  const footer = await p.$('footer');
  if (footer) {
    await footer.scrollIntoViewIfNeeded();
    await p.waitForTimeout(400);
    await footer.screenshot({ path: '/tmp/mo_footer2.png' });
  } else {
    await p.screenshot({ path: '/tmp/mo_footer2.png' });
  }
  // also full viewport at bottom
  await p.screenshot({ path: '/tmp/mo_bottom.png' });
  console.log('done');
  await browser.close();
})();
