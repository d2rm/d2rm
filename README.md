[![LICENSE](https://img.shields.io/badge/license-GNU-green.svg)]()
[![Gitter](https://img.shields.io/badge/chat-gitter-ff69b4.svg)](https://gitter.im/Atraci/Atraci-Angular)
[![STATE](https://img.shields.io/badge/state-alpha-blue.svg)]()

Refactoring Atraci to angular based application : https://github.com/Atraci/Atraci

![screenshot](http://i.imgur.com/AWzVRZf.jpg)

In order to start working on this repository, you will have to do the following steps:
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
