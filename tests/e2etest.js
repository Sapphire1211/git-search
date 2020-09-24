'use strict';
//import { Alert } from 'selenium-webdriver';

describe('git search app', function() {
    browser.driver.manage().window().maximize();
    it('should show the index.html', function() {
       browser.get('index.html');
       expect(browser.getCurrentUrl()).toMatch("/index.html");
    })

    it('should have the input field', function() {
       var input = element(by.id('searchInput'));      
       expect(input.isPresent()).toBe(true);
    });

    it('should have the search button', function() {
       var searchButton = element(by.id('searchButton'));      
       expect(searchButton.isPresent()).toBe(true);
    });

    it('should be able fill the input with a word to search', function() {
       var input = element(by.id('searchInput'));
       input.clear();   
       input.sendKeys('test');
       expect(input.getAttribute('value')).toBe('test');
    });

    it('should search with the input query string', function() {
       var EC = protractor.ExpectedConditions;
       var searchButton = element(by.id('searchButton'));
       browser.wait(EC.elementToBeClickable(searchButton), 5000);
       searchButton.click();
       browser.sleep(2000);
       var nextButton = element(by.id('nextButton'));
       expect(nextButton.isPresent()).toBe(true);
    });

    it('should have the next button after search', function() {
       var nextButton = element(by.id('nextButton'));
       expect(nextButton.isPresent()).toBe(true);
    });

    it('should show the details button for search result', function() {
       var detailsButton = element(by.className('detailsButton'));
       expect(detailsButton.isPresent()).toBe(true);
    });

    it('should show the repo details in an alert after clicking the details button', function() {
       var detailsButton = element(by.className('detailsButton'));
       detailsButton.click();
       var EC = protractor.ExpectedConditions;
       browser.wait(EC.alertIsPresent(), 5000);// Waits for an alert pops up.
       browser.sleep(2000);
       browser.driver.switchTo().alert().dismiss();
    });

    it('should have the prev button after pressing next button', function() {
       element(by.id('nextButton')).click();
       var prevButton = element(by.id('prevButton'));
       expect(prevButton.isPresent()).toBe(true);
       browser.sleep(2000);
    });

    it('should be able to continue pressing next button and prev button', function() {
       var nextButton = element(by.id('nextButton'));
       var prevButton = element(by.id('prevButton'));
       nextButton.click();
       browser.sleep(2000);
       expect(element(by.className('detailsButton')).isPresent()).toBe(true);
       
       nextButton.click();
       browser.sleep(2000);
       expect(element(by.className('detailsButton')).isPresent()).toBe(true);

       nextButton.click();
       browser.sleep(2000);
       expect(element(by.className('detailsButton')).isPresent()).toBe(true);

       prevButton.click();
       browser.sleep(2000);
       expect(element(by.className('detailsButton')).isPresent()).toBe(true);

       prevButton.click();
       browser.sleep(2000);
       expect(element(by.className('detailsButton')).isPresent()).toBe(true);
   });

   it('should be able to show alert banner for query string with error reponse', function() {
      var input = element(by.id('searchInput'));
      input.clear();   
      input.sendKeys(';');
      var searchButton = element(by.id('searchButton'));
      searchButton.click();
      browser.sleep(2000);
      var alertBanner = element(by.id('alertBanner'));      
      expect(alertBanner.isPresent()).toBe(true);
      browser.sleep(2000); 
  });

  it('should be able to show alert banner for query string with empty result', function() {
     var input = element(by.id('searchInput'));
     input.clear();   
     input.sendKeys(':');
     var searchButton = element(by.id('searchButton'));
     searchButton.click();
     browser.sleep(2000);
     var alertBanner = element(by.id('alertBanner'));      
     expect(alertBanner.isPresent()).toBe(true);
     browser.sleep(2000); 
 });
});