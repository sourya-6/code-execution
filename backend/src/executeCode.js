const { exec } = require("child_process");

function executeCode(code, language) {
    return new Promise((resolve) => {
        const filename = `temp.${language === "python" ? "py" : "js"}`;
        require("fs").writeFileSync(filename, code);

        const command = language === "python" ? `python ${filename}` : `node ${filename}`;
        exec(command, (error, stdout, stderr) => {
            resolve(error ? stderr : stdout);
        });
    });
}

module.exports = { executeCode };
