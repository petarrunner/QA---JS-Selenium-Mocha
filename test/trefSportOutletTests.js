'use strict';

const assert = require('assert');
const { Builder, By, until } = require('selenium-webdriver');
const ltCapabilities = require('../capabilities');

describe('Trefsport - outlet', async function () {
    const USERNAME = ltCapabilities.capabilities.user;
    const KEY = ltCapabilities.capabilities.accessKey;
    const GRID_HOST = 'hub.lambdatest.com/wd/hub';
    const gridUrl = 'https://' + USERNAME + ':' + KEY + '@' + GRID_HOST;
    const link = 'https://www.trefsport.com/';
    let driver;

    const getPriceAsNumber = function (string) {
        return +string.replace(',00 RSD', '').replace('.', '').replace('>', '');
    };

    this.beforeEach(async function () {
        ltCapabilities.capabilities.name = this.currentTest.title;
        driver = new Builder().usingServer(gridUrl).withCapabilities(ltCapabilities.capabilities).build();
        await driver.get(link);

        // 2) Click and accept cookie
        await driver.wait(until.elementLocated(By.id('HyperLink4')), 20000);
        await driver.findElement(By.id('HyperLink4')).click();

        // 3) Click on "outlet"
        let listNavbarOptions = await driver.findElement(By.className('header__menu-list')).findElements(By.className('header__menu-list-item'));
        let outletField = listNavbarOptions[7];
        await outletField.click();
    });

    this.afterEach(async function () {
        await driver.quit();
    });

    it('Check that old price is higher than new one', async function () {
        // 4) Click on the random item
        await driver.wait(until.elementLocated(By.id('product-list')), 20000);
        const listItems = await driver.findElement(By.id('product-list')).findElements(By.className('product-item'));
        const rndNo = Math.floor(Math.random() * listItems.length);
        await listItems[rndNo].click();

        // 5) Take old price
        const oldPriceString = await driver.findElement(By.className('product__old-price')).getText();
        const oldPriceNumber = getPriceAsNumber(oldPriceString);

        // 6) Take new price
        const newPriceString = await driver.findElement(By.className('product__price')).getText();
        const newPriceNumber = getPriceAsNumber(newPriceString);

        // 7) Assert that new price is lower than old
        assert(oldPriceNumber > newPriceNumber, 'Old price is not higher than new - 2!');
    });

    it('Sorting by lower prices', async function () {
        let arrayNewPrices = [];

        // 4) Click on a sort button
        await driver.wait(until.elementLocated(By.className('chosen-container-single-nosearch')));
        await driver.findElement(By.id('ddlOrderBy_chosen')).click();

        //5) Click on option "Najmanjoj ceni"
        const listOpts = await driver.findElement(By.id('ddlOrderBy_chosen')).findElements(By.className('active-result'));
        const lowerPriceOpt = await listOpts[3];
        await lowerPriceOpt.click();

        // 6) Take all new prices
        await new Promise(r => setTimeout(r, 2000));
        const listItems = await driver.findElement(By.id('product-list')).findElements(By.className('old-price'));

        // 7) Add to list all prices
        for (let i = 0; i < listItems.length; i++) {
            let curPrice = await listItems[i].getText();
            let curPriceNumber = getPriceAsNumber(curPrice);
            arrayNewPrices.push(curPriceNumber);
        }

        // 8) Assert that current price is lower than the next one
        for (let i = 0; i < arrayNewPrices.length - 1; i++) {
            assert(arrayNewPrices[i] <= arrayNewPrices[i + 1], `Sorting doesn't work correct. Price of ${i + 1} item is higher than the next one.`);
        }
    });
});
