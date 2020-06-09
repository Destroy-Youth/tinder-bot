const puppeteer = require('puppeteer');
const location = require('./resources/location');
const { user, password } = require('./resources/credentials');
const openingLines = require('./resources/openingLines');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://tinder.com/');

  // create browser context
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://tinder.com', ['geolocation']);
  await page.setGeolocation(location);

  await page.waitForXPath(
    '//*[@id="content"]/div/div[2]/div/div/div[1]/button'
  );
  const [acceptCookies] = await page.$x(
    '//*[@id="content"]/div/div[2]/div/div/div[1]/button'
  );
  acceptCookies.click();

  await page.waitForXPath(
    `//*[@id="modal-manager"]/div/div/div/div/div[3]/span/div[2]/button`
  );
  const [FBLoginBtn] = await page.$x(
    `//*[@id="modal-manager"]/div/div/div/div/div[3]/span/div[2]/button`
  );

  const newPagePromise = new Promise((x) => page.once('popup', x));

  await FBLoginBtn.click();
  const popup = await newPagePromise;

  console.log(user, password);

  //Loggin
  await popup.waitForSelector('#email');
  await popup.click('#email');
  await popup.keyboard.type(user);
  await popup.click('#pass');
  await popup.keyboard.type(password);
  await popup.waitForSelector('#loginbutton');
  await popup.click('#loginbutton');

  await page.waitFor(5000);
  console.log('ya esperé');

  page.mainFrame();

  // Wait for the profile card
  await page.waitForXPath(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[1]/div[3]/div[1]/div[1]/div/div[1]/div/div'
  );

  // like
  await page.waitForXPath(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/div[4]/button'
  );
  const [like] = await page.$x(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/div[4]/button'
  );

  // dislike
  await page.waitForXPath(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/div[2]/button'
  );
  const [dislike] = await page.$x(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/div[2]/button'
  );

  // RNG cupid
  let i = 0;
  do {
    await page.waitFor(5000);
    if (Math.floor(Math.random() * 10 + 1) > 6) {
      await dislike.click();
    } else {
      await like.click();
    }

    const [goBackToTinder] = await page.$x(
      '//*[@id="modal-manager-canvas"]/div/div/div[1]/div/div[2]/a'
    );
    console.log(goBackToTinder);

    if (goBackToTinder) {
      console.log('it is a match');

      const [sayHelloInput] = await page.$x('//*[@id="chat-text-area"]');
      sayHelloInput.keyboard.type(
        openingLines[Math.floor(Math.random() * items.length)]
      );
      goBackToTinder.click();
    }

    i++;
  } while (i < 10);
})();
