const { By, until } = require("selenium-webdriver");

function getBy(type, selector) {
    switch (type) {
        case "css": return By.css(selector);
        case "id": return By.id(selector);
        case "name": return By.name(selector);
        case "xpath": return By.xpath(selector);
        default:
            throw new Error(`SelectorType inconnu: ${type}`);
    }
}

async function runStep(driver, step) {
    const { Action, SelectorType, Selector, Value } = step;

    switch (Action) {
        case "open":
            if (!Value || !Value.startsWith("http")) {
                throw new Error(`URL invalide pour open: "${Value}"`);
            }
            await driver.sleep(2000);
            await driver.get(Value);
            break;

        case "click":
            await driver.findElement(getBy(SelectorType, Selector)).click();
            break;

        case "type":
            // attendre que l’élément soit présent et visible
            await driver.wait(until.elementLocated(getBy(SelectorType, Selector)), 5000);
            const elem = await driver.findElement(getBy(SelectorType, Selector));
            await driver.wait(until.elementIsVisible(elem), 5000);
            await elem.sendKeys(Value);
            break;

        case "waitFor":
            const el = await driver.wait(
                until.elementLocated(getBy(SelectorType, Selector)),
                15000
            );
            await driver.wait(until.elementIsVisible(el), 10000);
            break;

        default:
            throw new Error(`Action inconnue: ${Action}`);
    }
}

module.exports = runStep;
