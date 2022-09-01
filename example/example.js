const {Builder, By, Key} = require('selenium-webdriver');

async function main(){
     const driver = await new Builder()
          .forBrowser('firefox')
          .build();   // 初始化 WebDriver
     await driver.get('http://localhost:5000');

     await driver.findElement(By.id('name')).sendKeys('Aaron');
     await driver.findElement(By.id('email')).sendKeys('aaron@gmail.com', Key.ENTER);

     var mList = await driver.findElement(By.id('mList'));
     expect(mList.length).toBe(3);
     driver.close();
}

main();