const puppeteer = require('puppeteer');
const location = require('./resources/location');
const { user, password } = require('./resources/credentials');
const openingLines = require('./resources/openingLines');

const tinderPage = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://tinder.com/');

  // create browser context
  const context = browser.defaultBrowserContext();
  await context.overridePermissions('https://tinder.com', ['geolocation']);
  await page.setGeolocation(location);

  return [page, browser];
};

const login = async (page) => {
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
};

const like = async (page) => {
  // like
  await page.waitForXPath(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/div[4]/button'
  );
  const [like] = await page.$x(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/div[4]/button'
  );

  await like.click();
};

const dislike = async (page) => {
  // dislike
  await page.waitForXPath(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/div[2]/button'
  );
  const [dislike] = await page.$x(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[2]/div[2]/button'
  );

  await dislike.click();
};

const rngCupid = async (page, browser) => {
  page.mainFrame();
  // Wait for the profile card
  await page.waitForXPath(
    '//*[@id="content"]/div/div[1]/div/main/div[1]/div/div/div[1]/div/div[1]/div[3]/div[1]/div[1]/div/div[1]/div/div'
  );

  // RNG cupid
  let i = 0;
  do {
    await page.waitFor(5000);

    if (Math.floor(Math.random() * 10 + 1) > 6) {
      await dislike(page);
    } else {
      await like(page);
    }
    console.log('slides: ', i);

    const totalPages = await browser.pages();
    console.log('totalPages: ', totalPages);

    console.log('pages: ', totalPages.length);
    if (totalPages > 2) {
      closePopup(totalPages[totalPages.length - 1]);
    }

    i++;
  } while (true);
};

const closePopup = async (page) => {
  console.log('it is a match');

  const [goBackToTinder] = await page.$x(
    '//*[@id="modal-manager-canvas"]/div/div/div[1]/div/div[2]/a'
  );
  const [sayHelloInput] = await matchWindow.$x('//*[@id="chat-text-area"]');
  sayHelloInput.keyboard.type(
    openingLines[Math.floor(Math.random() * items.length)]
  );
  goBackToTinder.click();
};

(async () => {
  try {
    const [page, browser] = await tinderPage();
    await login(page);

    await page.waitFor(5000);
    rngCupid(page, browser);
  } catch (error) {
    console.log(error);
  }
})();
