# TestRunner documentation

## 1 TLDR version
It tests your project. Check [Example](#8-example) section.

## 2 Why should you use it
Usually, when people start writing code, they test their code manually.
This results in not running all the tests everytime we change our code.
That results  in code that is not probably tested.
This coding style is called "Edit and Pray".

TestRunner project tries to prevent this. It makes testing easy! You just create folder in *tests* folder, specify input and expected output, and TestRunner does the rest for you.
Hope this project helps you developing your school project or maybe some home project more easily.
Advantage of this solution is that it is cross-platform (works on Windows, Linux, Unix, ...) and it is really easy to setup.

## 3 Get started
You need to install Node.js (it is already installed on servers Eva and Merlin if you are FIT BUT student).
You can install it from [here](https://nodejs.org/en/download). Doesn't matter if you install LTS (stable) version or current (latest), but make sure it is added to PATH.

You can check that everything was install correctly by writing to your terminal:

`node --version`

And it should print out your installed version of NodeJS.

Now copy **Example** folder to your computer. 

### Windows users
Compile the proj1.c so that proj1.exe is in the same folder. You can use added Makefile or compile it with some IDE (CodeBlocks) and copy the binary compiled file to the Example folder. Now run in terminal:

`node test_runner.js`

And it should print test results. See [Example](#8-example) section. 

### Linux users
Same as Windows, but you have to change in file **.testrunner.json** "proj1.exe" to "./proj1". See [TestRunner settings](#42-testrunner-settings) section.

### School server
If you want to test it on Merlin or Eva servers, just connect to your desired server and write:

```
git clone https://github.com/brucknert/testrunner.git
cd testrunner/example
make
nano .testrunner.json
```

Now change the executable from "proj1.exe" tp "./proj1" and save it by pressing ctrl+o. Then confirm name with enter, then exit nano with ctrl+x.

Now you can run:

`node test_runner.js`  

## 4 Folder structure
This chapter describes mandatory folder structure.

### 4.1 Root folder
```
.   -- tests    -- 01
                -- 02
                -- 03 (you can add as many folders in tests folder as you want)
    -- proj1.exe (or your binary/script)
    -- test_runner.js
    -- .testrunner.json
```

### 4.2 TestRunner settings
You can configure settings for TestRunner in file **.testrunner.json**. Currently it contains one option **executable**. 
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


### 4.3 Content of the test case folder
Each test case folder can contain these files (example test case folder 01):

```
01  -- argv.txt
    -- stdin.txt
    -- stdout.txt
    -- stderr.txt
    -- return_code.txt
```

Every file is optional in test case folder. So if you don't want to use program arguments (argv) you don't have to. Same with stdin. If the test should not print anything to the stderr stream, you don't have to have stderr.txt etc.

#### 4.3.1 Program arguments
If you want to specify program arguments (argv), save them into **argv** or **argv.txt**.
For example if you have argv.txt file with content: 

`arg1 arg2 arg3`

And run the test_runner.js, it will run as:

`proj1.exe arg1 arg2 arg3`

If the file is missing, no arguments are specified when running the binary/script.


#### 4.3.2 Program standard input (stdin)
If you want to specify stdin for your program, save it into **stdin** or **stdin.txt** file in your testcase.
If the file is missing, nothing will be redirected to stdin.

#### 4.3.3 Program standard output (stdout)
If you want to specify expected stdout of the program, save it into **stdout** or **stdout.txt** file in your testcase. If program output differs from output inside stdout.txt file, then the test case is not successful.
If the file is missing, TestRunner checks if tested program does not output anything. If the program output anything even though the stdout.txt file is missing, then the test case is not successful.

#### 4.3.4 Program standard error (stderr)
Same as stdout but uses **stderr** or **stderr.txt** file and compares it with program's stderr output.

#### 4.3.5 Program return code
If you want to check return code, specify the value in **return\_code** or **return\_code.txt** file. Empty file defaults to return code 0.

## 5 How to run only specific test cases
If you want to run only some specific test cases, use argument **--run**.
Each test case should be seperated by space (see example).

This example will run only test case (folder in *tests* folder) 01.
`node test_runner.js --run 01`

This example will run only test cases (folders in *tests* folder) 01 and 03.
`node test_runner.js --run 01 03`

You can also use **-r** instead of **--run**
`node test_runner.js -r 01 03`


## 6 How to skip certain test cases
If you want to skip some test cases, use argument **--skip**.
Each test case should be seperated by space (see example).


This example will run all test cases (folders in *tests* folder) except 01.
`node test_runner.js --run 01`


This example will run all test cases (folders in *tests* folder) except 01 and 03.
`node test_runner.js --skip 01 03`

You can also use **-s** instead of **--skip**
`node test_runner.js -s 01 03`

## 7 Test output
If the test executed successfully, TestRunner prints message in format:

```
<testcase>:<command>: Success! :)
```

where
* \<testcase\> is folder of the test performed
* \<command\> is the command that was executed


If test case fails, TestRunner prints message in format:

```
<testcase>:<command>: Failed! :(
<errormessage>
Output:
<output>
Expected:
<expected>
```

where
* \<errormessage\> is description what went wrong (stdout, stderr or errorcode)
* \<output\> value that the program returned
* \<expected\> value that was expected

## 8 Example
Copy **example** folder from github and run *make* command in terminal in the folder with *Makefile* file.

If you are working on Linux, change executable to `./proj1` in **.testrunner.json**, see [TestRunner settings](#42-testrunner-settings) section.

Run in terminal:

`node test_runner.js`

And see the results of the test cases. There are 3 test cases:

* 01 - uses one program argument and checks if the program prints the argument to the stdout
* 02 - uses two program arguments and checks if the program returned an error code 1 and prints error tothe stderr
* 03 - uses stdin and checks if the program prints first letter of the stdin to the stdout

It should output:

```
$ node test_runner.js
01: proj1.exe arg1: Success! :)
02: proj1.exe arg1 arg2: Success! :)
03: proj1.exe < tests\03\stdin.txt: Success! :)
All tests have been performed. No error!
````

You can check the proj1 source code in **proj1.c** file.

Have fun testing and programming!
