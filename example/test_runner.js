const fs = require(`fs`)
const path = require(`path`)
const child_process = require(`child_process`)

const TIMEOUT = 30*1000
const TESTRUNNER_SETTINGS = `.testrunner.json`
const SUCCESS = 0
const ERROR = 1

main()

/**
 * Starting point of the script.
 */
function main() {
    if(process.argv[2] === "-h" || process.argv[2] === "-help"){
        printHelp()
        return
    }

    let tests = fs.readdirSync(`tests`)
    tests = getUserSettings(tests)
    let promises = []
    tests.forEach(test => promises.push(runTest(test)))

    Promise.all(promises)
            .then(printFinished)
            .catch(e => console.error(`Unexpected error in promise all`, e))
}

/**
 * Prints help.
 */
function printHelp() {
    const help = `Welcome to the testrunner!`
    console.log(help)
}

/**
 * 
 * @param {number[]} results array with result of each testcase. Zero means success, one means error 
 */
function printFinished(results) {
    const failedTests = results.reduce((acc, val) => acc+val, 0)
    if (failedTests) {
        console.log(`Number of failed tests: ${failedTests}/${results.length}\n`)
    } else {
        console.log(`All tests have been performed. No error!\n`)
    }
}

/**
 * Run the current test case and returns a promise that always resolves.
 * If the promise resolves with 0, test executed successfully, otherwise resolves 1.
 * 
 * @param {string} test name of the folder of the test performed
 * @returns {Promise} resolves 0 if there was no error, otherwise resolves 1
 */
function runTest(test) {
    let opt = getArgOptions(test)
    const command = createCommand(opt)

    return new Promise(resolve => {
        child_process.exec(command, { timeout: TIMEOUT }, (err, stdout, stderr) => {
            const expectedErrorCode = getErrorCode(opt)
            if (err && err.code != expectedErrorCode) {
                console.error(`exec error: ${err}`)
                resolve(ERROR)
                return
            }

            const result = getResult(opt, { stdout, stderr })
            resolve(printResult(result, {command, test}))
        })
    })
}

/**
 * Prints result of the test case.
 * 
 * @param {TestResult} result information about the result of the test 
 * @param {TestInfo} info information about the test case
 * @returns {number} SUCCESS if test executed successfully, otherwise ERROR 
 */
function printResult(result, info) {
    if (result.correct) {
        printSuccess(info)
        return SUCCESS
    } else {
        info = Object.assign({errorMessage : result.errorMessage}, info)
        printError(info)
        return ERROR
    }
}
/**
 * @typedef {Object} Opt Object that contains information about current test folder
 * @property {string[]} files filenames found in the current test folder
 * @property {string} folderPath path to the current test folder
 * @property {array} [args] filenames to be checked in the current test folder 
 */

/**
 * Returns error code foudn in **return_code** folder or 0.
 * 
 * @param {Opt} opt default Opt object without args
 * @returns {number} error code, defaults to 0
 */
function getErrorCode(opt) {
    opt = Object.assign({args: [`return_code`, `return_code.txt`]}, opt)
    return Number(getArgContent(opt))
}

/**
 * @typedef {Object} TestResult Object that contains information about the result of the current test
 * @property {boolean} correct true if the test was successful, otherwise false
 * @property {string} [errorMessage] message to be printed in case of an error  
 */

/**
 * Checks if stdout and stderr of executed program is same as expected stdout and stderr
 * 
 * @param {Opt} opt default Opt object without args
 * @param {string} results.stdout actual stdout of the program
 * @param {string} results.stderr actual stderr of the program
 * @returns {TestResult} object describing result of the test
 */
function getResult(opt, results) {
    const stdoutOpt = Object.assign({ args: [`stdout`, `stdout.txt`] }, opt)
    let stdoutCorrect = isStdCorrect(stdoutOpt, results.stdout)

    const stderrOpt = Object.assign({ args: [`stderr`, `stderr.txt`] }, opt)
    let stderrCorrect = isStdCorrect(stderrOpt, results.stderr)

    let result = {
        correct: (stdoutCorrect.correct && stderrCorrect.correct),
        errorMessage: ``
    }

    if (!stdoutCorrect.correct) {
        result.errorMessage += `There was an error with stdout:\n${stdoutCorrect.errorMessage}`
    }

    if (!stderrCorrect.correct) {
        result.errorMessage += `There was an error with stderr:\n${stderrCorrect.errorMessage}`
    }

    return result
}

/**
 * Checks if content of standard stream is equal to expected
 * 
 * @param {Opt} opt Opt object with args defined
 * @param {string} resultStd actual result of standard stream
 * @returns {{correct: boolean, errorMessage: string}} object describing result of the test stream
 */
function isStdCorrect(opt, resultStd) {
    const expectedStd = getArgContent(opt)
    let correct = (!resultStd && !expectedStd)
    correct = correct || (resultStd === expectedStd)

    let errorMessage = ""
    if (!correct) {
        errorMessage = `Output:\n${resultStd}\nExpected:\n${expectedStd}\n`
    }

    return { correct, errorMessage }
}

/**
 * Returns path and filenames of currently tested test case (folder)
 * 
 * @param {string} test directory of the test case
 * @returns {Opt} default Opt object without args
 */
function getArgOptions(test) {
    const testFolder = path.join(`tests`, `${test}`)
    const testFiles = fs.readdirSync(testFolder)

    return {
        files: testFiles,
        folderPath: testFolder
    }
}

/**
 * Creates command that will be executed based on current test case
 * 
 * @param {Opt} opt default Opt object withotu args
 * @returns {string} command that should be executed
 */
function createCommand(opt) {
    opt = Object.assign({}, opt)

    opt.args = [`argv`, `argv.txt`]
    const argv = getArgContent(opt).trim()

    opt.args = [`stdin`, `stdin.txt`]
    const stdInput = getStdinPath(opt)

    let command = loadExecutable()

    if (argv) {
        command += ` ${argv}`
    }

    if (stdInput) {
        command += ` < ${stdInput}`
    }

    return command
}

/**
 * Loads executable from **.testrunner.json** file. Defaults to proj1.exe.
 * 
 * @returns {string} executable 
 */
function loadExecutable() {
    let executable;
    try {
        const settings = JSON.parse(fs.readFileSync(TESTRUNNER_SETTINGS))
        executable = settings.executable
    } catch(e) {
        executable = `proj1.exe`
        console.warn(`Missing .testrunner.json in root folder, using default executable ${executable}`)
    }

    return executable
}

/**
 * Loads content of the file specified in opt.args that exists in test folder.
 * If multiple files exist, returns content of the last one.
 * 
 * @param {array} opt.files files in test directory
 * @param {array} opt.args arguments to check
 * @param {string} opt.folderPath path to the test folder 
 * @returns {string} content of the specified file, if the file does not exist returns empty string
 */
function getArgContent(opt) {
    let content = ""

    opt.args.forEach(arg => {
        if (opt.files.includes(arg)) {
            const argPath = path.join(`${opt.folderPath}`, `${arg}`)
            content = fs.readFileSync(argPath, `utf-8`)
        }
    })

    return content
}

/**
 * 
 * @param {Opt} opt
 * @returns {string} relative path to stdin file, if the file does not exists returns empty string 
 */
function getStdinPath(opt) {
    let result = ``

    if (opt.files.includes(`stdin`)) {
        result = `stdin`
    } else if (opt.files.includes(`stdin.txt`)) {
        result = `stdin.txt`
    }

    if (result) {
        result = path.join(`${opt.folderPath}`, `${result}`)
    }

    return result
}

/**
 * @typedef {Object} TestInfo Object that contains information about the current test
 * @property {string} test name of the test case
 * @property {string} command command that was executed
 * @property {string} [errorMessage] description of why the program failed the test 
 */

/**
 * Print succes message to the terminal.
 *  
 * @param {TestInfo} opt
 */
function printSuccess(opt) {
    console.log(`\x1b[32m%s\x1b[0m`, `${opt.test}: ${opt.command}: Success! :)`)
}

/**
 * Prints error message to the terminal.
 * 
 * @param {TestInfo} opt
 */
function printError(opt) {
    console.log(`\x1b[41m%s\x1b[0m`, `${opt.test}: ${opt.command}: Failed! :(`)
    console.log(`${opt.errorMessage}`)
}

/**
 * Filters out test cases (folder names) that should not be executed.
 * 
 * @param {string[]} tests all tests (folder names) found
 * @returns {string[]} tests (folder names) that should be executed
 */
function getUserSettings(tests) {
    let filtered = tests    
    switch (process.argv[2]) {
        case `--skip`:
        case `-s`:
            const skipped = process.argv.slice(3)
            filtered = tests.filter(el => !skipped.includes(el))
            break;
        case `--run`:
        case `-r`:
            const run = process.argv.slice(3)
            filtered = tests.filter(el => run.includes(el))
            break
        default:
            break;
    }

    return filtered
}
