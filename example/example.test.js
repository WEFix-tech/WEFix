const {Builder, By, Key} = require('selenium-webdriver');

test('e2e test', async () => {
    const driver = await new Builder()
         .forBrowser('firefox')
         .build();   // Initialize WebDriver
    await driver.get('http://localhost:5000');
    await driver.findElement(By.id('name')).sendKeys('Aaron');
    await driver.findElement(By.id('email')).sendKeys('aaron@gmail.com', Key.ENTER);
    
    var mListElement = await driver.findElement(By.id('mList'));
    var mList = await mListElement.findElements(By.className('mInfo'));
    expect(mList.length).toBe(3);
    driver.close();
});