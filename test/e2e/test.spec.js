browser.waitForAngularEnabled(false);
describe('Aurelia homepage', function() {
  it('should add a todo', async function() {
    await browser.get('http://localhost:8000');
    await browser.wait(() => {
      return ExpectedConditions.visibilityOf($('.au.name-tag.header-visible'))();
    }, 5000, '');

    const app = await element(by.tagName('app'));
    let text = await app.getText();
    expect(text.toString().split('Hello World').length).toEqual(6);

    const btn = await element(by.buttonText('Add Todo'));
    await btn.click();

    text = await app.getText();
    expect(text.toString().split('Hello World').length).toEqual(8);
  });
});
