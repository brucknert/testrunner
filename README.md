# Testrunner documentation

## Why should you use it

## Get started
You need to install Node.js (it is already installed on servers Eva and Merlin).
You can install it from [here](https://nodejs.org/en/download). Doesn't matter if you install LTS (stable) version or current (latest), but make sure it is added to PATH.
You can that everything was install correctly by writing to your terminal

`node --version`

Copy file **test_runner.js** and **.testrunner.json** to the same folder where is your binary/script that you want to test.

Create folder tests and 
`node test_runner.js`

## Folder structure

### Root folder
.   -- tests    -- 01
                -- 02
                -- 03
    -- proj1.exe
    -- .testrunner.json

### Testrunner settings
You can configure settings for testrunner in file **.testrunner.json**. Currently it contains one option **executable**. 
It is a command that will be run in command line. Example for the Windows users:

```javascript
{
    "executable": "proj1.exe"
}
```

If you are a Linux user, you probably want to change it to:

```javascript
{
    "executable": "./proj1"
}
```


If you want to test for example python script, you can change it to:

```javascript
{
    "executable": "python myscript"
}
```

Always make sure the **.testrunner.json** is in your root folder. On Linux, files starting with dot are invisible by default.
You can list them using

`ls -a`


### Content of the test case folder

01  -- argv.txt
    -- stdin.txt
    -- stdout.txt
    -- stderr.txt
    -- return_code.txt


#### Program arguments
If you want to specify program arguments (argv), save them into **argv** or **argv.txt**.
For example if you have argv.txt file with content: 

`arg1 arg2 arg3`

And run the test_runner.js, it will run as:

`./m arg1 arg2 arg3`

If the file is missing, no arguments are specified when running the binary/script.


#### (optional) Program standard input (stdin)
If you want to specify stdin for your program, save it into **stdin** or **stdin.txt** file in your testcase.
If the file is missing, nothing will be redirected to stdin.

#### (optional) Program standard output (stdout)
If you want to specify expected stdout of the program, save it into **stdout** or **stdout.txt** file in your testcase. If program output differs from output inside stdout.txt file, then the test case is not successful.
If the file is missing, testrunner checks if tested program does not output anything. If the program output anything even though the stdout.txt file is missing, then the test case is not successful.

#### Program standard error (stderr)
Same as stdout but uses **stderr** or **stderr.txt** file and compares it with program's stderr output.

#### Program return code
If you want to check return code, specify the value in **error\_code** or **error\_code.txt** file. Empty file defaults to return code 0.

### How to run only specific test cases
If you want to run only some specific test cases, use argument **--run**.
Each test case should be seperated by space (see example).

This example will run only test case (folder in *tests* folder) 01.
`node test_runner.js --run 01`

This example will run only test cases (folders in *tests* folder) 01 and 03.
`node test_runner.js --run 01 03`

You can also use **-r** instead of **--run**
`node test_runner.js -r 01 03`


### How to skip certain test cases
If you want to skip some test cases, use argument **--skip**.
Each test case should be seperated by space (see example).


This example will run all test cases (folders in *tests* folder) except 01.
`node test_runner.js --run 01`


This example will run all test cases (folders in *tests* folder) except 01 and 03.
`node test_runner.js --skip 01 03`

You can also use **-s** instead of **--skip**
`node test_runner.js -s 01 03`
