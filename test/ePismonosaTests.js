'use strict';

const assert = require('assert');
const { Builder, By, until } = require('selenium-webdriver');
const ltCapabilities = require('../capabilities');

describe('ePismonosa - Login', async function () {
    const USERNAME = ltCapabilities.capabilities.user;
    const KEY = ltCapabilities.capabilities.accessKey;
    const GRID_HOST = 'hub.lambdatest.com/wd/hub';
    const gridUrl = 'https://' + USERNAME + ':' + KEY + '@' + GRID_HOST;
    const link = 'https://app.epismonosa.rs/';
    let driver;

    this.beforeEach(async function () {
        ltCapabilities.capabilities.name = this.currentTest.title;
        driver = new Builder().usingServer(gridUrl).withCapabilities(ltCapabilities.capabilities).build();
    });

    this.afterEach(async function () {
        await driver.quit();
    });

    it('Login with invalid credentials', async function () {
        // 1) navigate to web cite
        await driver.get(link);

        // 2) Click on filed " login with name and password"
        await driver.wait(until.elementLocated(By.className('MuiGrid-item')));
        let listInputs = await driver.findElements(By.css('input'));
        await listInputs[0].click();

        // 3) Enter name as "Petar"
        const registerForm = await driver.findElement(By.className('register-form'));
        await driver.wait(until.elementLocated(By.className('register-form')));
        const inputsList = await registerForm.findElements(By.className('MuiInputBase-input'));
        await inputsList[0].sendKeys('Petar');

        // 4) Enter username as "Petar123"
        await inputsList[1].sendKeys('Petar123');

        // 5) Click on Login button
        await registerForm.findElement(By.css('button')).click();

        // 6) Assert that there is alert messagge with text "Pogresni kredencijali"
        const message = driver.findElement(By.className('MuiAlert-message'));
        await driver.wait(until.elementTextContains(message, ''), 3000);
        const textMessage = await driver.findElement(By.className('MuiAlert-message')).getText();
        assert.equal(textMessage, 'Pogrešni kredencijali', 'There is no error message with text: "Pogrešni kredencijali".');
    });
});
