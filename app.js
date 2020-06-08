const puppeteer = require('puppeteer');
const location = require('./resources/location');
const { user, password } = require('./resources/credentials');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://tinder.com/');

  // create browser context
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://tinder.com', ['geolocation']);
  await page.setGeolocation(location);

  await page.waitForXPath(
    `//*[@id="modal-manager"]/div/div/div/div/div[3]/span/div[2]/button`
  );
  const [FBLoginBtn] = await page.$x(
    `//*[@id="modal-manager"]/div/div/div/div/div[3]/span/div[2]/button`
  );

  const newPagePromise = new Promise((x) => page.once('popup', x));

  await FBLoginBtn.click();
  const popup = await newPagePromise;

  try {
    console.log(user, password);

    await popup.waitForSelector('#email');
    await popup.click('#email');
    await popup.keyboard.type(user);
    await popup.click('#pass');
    await popup.keyboard.type(password);
    await popup.waitForSelector('#loginbutton');
    await popup.click('#loginbutton');
  } catch (error) {
    console.log(error);
  }
})();
