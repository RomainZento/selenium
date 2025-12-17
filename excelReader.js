const xlsx = require("xlsx");

function resolveEnvVariables(value) {
    if (typeof value !== "string") return value;

    return value.replace(/\$\{(.+?)\}/g, (_, envName) => {
        if (!process.env[envName]) {
            throw new Error(`❌ Variable d'environnement manquante: ${envName}`);
        }
        return process.env[envName];
    });
}

function loadExcelTests(filePath, sheetName) {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
        throw new Error(`Feuille "${sheetName}" introuvable`);
    }

    const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

    const tests = {};
    rows.forEach(row => {
        // 🔁 Résoudre les variables ENV sur chaque colonne
        Object.keys(row).forEach(key => {
            row[key] = resolveEnvVariables(row[key]);
        });

        if (!tests[row.TestID]) {
            tests[row.TestID] = [];
        }
        tests[row.TestID].push(row);
    });

    // Trier les steps
    Object.keys(tests).forEach(testID => {
        tests[testID].sort((a, b) => a.Step - b.Step);
    });

    return tests;
}

module.exports = loadExcelTests;
