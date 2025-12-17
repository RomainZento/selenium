require("dotenv").config();
const { Builder } = require("selenium-webdriver");
const loadExcelTests = require("./excelReader");
const runStep = require("./actions");


(async function run() {
    console.log("Lancement des tests Selenium depuis Excel");

    const tests = loadExcelTests("./enjoy-test-2FA-selenium-9.xlsx", "2FA");
    const driver = await new Builder().forBrowser("chrome").build();

    try {
        for (const testID of Object.keys(tests)) {
            console.log(`\nTEST ${testID}`);

            for (const step of tests[testID]) {
                console.log(
                    `  Step ${step.Step} → ${step.Action} ${step.Selector ? `(${step.Selector})` : ""
                    }`
                );

                await runStep(driver, step);
            }

            console.log(`TEST ${testID} OK`);
        }
    } catch (err) {
        console.error("ERREUR :", err.message);

        // Screenshot en cas d’échec
        const image = await driver.takeScreenshot();
        require("fs").writeFileSync("error.png", image, "base64");
        console.error("Screenshot enregistré : error.png");
    } finally {
        await driver.quit();
        console.log("\n Fin des tests");
    }
})();
