const {Builder, By, Key} = require('selenium-webdriver');
const FTFixer = require('@aaronxyliu/ftfixer');                        // INSTRUMENT

async function main(){
     const driver = await new Builder()
          .forBrowser('firefox')
          .build();   // 初始化 WebDriver
     await driver.get('http://localhost:5000');
     await driver.executeScript(FTFixer.START_MO_SNIPPET);      // INSTRUMENT

     await driver.findElement(By.id('name')).sendKeys('Aaron');

     // Delete all cookies
     await driver.manage().deleteAllCookies();                   // INSTRUMENT
     
     
     await driver.findElement(By.id('email')).sendKeys('aaron@gmail.com', Key.ENTER);

     await FTFixer.waitFor(2000);                               // INSTRUMENT

     // Read all cookies
     var cookies = await driver.manage().getCookies();           // INSTRUMENT
     var mutations = FTFixer.parseCookie(cookies);              // INSTRUMENT

     //console.log(mNumber);
     driver.close();
     return mutations;                                           // INSTRUMENT
     
}

main();