[![Coverage Status](https://coveralls.io/repos/d2rm/d2rm/badge.svg?branch=dev-angular)](https://coveralls.io/r/d2rm/d2rm?branch=dev-angular)
Refactoring D2RM to an angular based application.

In order to start working on this repository, you will have to follow these steps:
- Download and install Ruby
- install compass gem:
  ```
  gem install compass
  ```
- when finished install compass, go inside the project, and run node package manager install:
  ```
  npm install
  ```
- when finished install node modules, on gulpfile.js, change PLATFORM const to the platform you are working on:
  ```
  const PLATFORM = "win64"; // all/osx32/osx64/win32/win64/linux32/linux64
  ```
- finally run the following command on cmd:
  ```
  gulp buildFirst
  ```
- NOTICE! the buildFirst command should run once only, then the command you will use will be:
  ```
  gulp default
  ```
