const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const getOrganizationPageUrl = async (organizationName) => {
  const URL = 'https://ariregister.rik.ee';

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  // auto-type organization name into search bar
  await page.goto(`${URL}/est`);
  await page.type('#company_search', organizationName);
  // auto-click search button
  await page.click('.btn-search');
  await page.waitForTimeout(1000);

  const res = await page.evaluate(() => {
    const container = document
      .querySelector('.ar__center')
      .querySelectorAll('.card-body')[1];
    return container.querySelector('a').getAttribute('href');
  });

  await browser.close();
  return URL + res;
};

const getOrganizationData = async (organizationName) => {
  const url = await getOrganizationPageUrl(organizationName);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForTimeout(1000);

  const res = await page.evaluate(() => {
    const container = document
      .querySelector('.ar__center')
      .querySelectorAll('.card')[2];

    // "Üldinfo" container
    let json = '{"Üldinfo":{';
    const generalInfo = container.querySelectorAll('.card-body')[0];
    for (let row of generalInfo.querySelectorAll('.row')) {
      json += `"${row
        .querySelectorAll('*')[0]
        .innerText.trim()
        .replace(/\s/g, '_')}":"${row
        .querySelectorAll('*')[1]
        .innerText.trim()}",`;
    }
    json = json.replace(/.$/, '');
    json += '},';

    // "Kontaktid" container
    json += '"Kontaktid":{';
    const contactInfo = container.querySelectorAll('.card-body')[1];
    for (let row of contactInfo.querySelectorAll('.row')) {
      json += `"${row
        .querySelectorAll('*')[0]
        .innerText.trim()
        .replace(/\s/g, '_')}":"${row
        .querySelectorAll('*')[1]
        .innerText.trim()}",`;
    }
    json = json.replace(/.$/, '');
    json += '},';

    // "Maksualane info" container
    json += '"Maksualane_info":{';
    const paymentInfo = container.querySelectorAll('.card-body')[2];
    for (let row of paymentInfo.querySelectorAll('.row')) {
      json += `"${row
        .querySelectorAll('*')[0]
        .innerText.trim()
        .replace(/\s/g, '_')}":"${row
        .querySelectorAll('*')[1]
        .innerText.trim()}",`;
    }
    json = json.replace(/.$/, '');
    json += '}}';

    // return json
    return JSON.parse(json);
  });
  console.log(res);

  browser.close();
};

getOrganizationData('vegelog oü');
getOrganizationData('rimi eesti food as');
