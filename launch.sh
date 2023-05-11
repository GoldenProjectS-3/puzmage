#!/bin/bash
service mariadb start
mariadb -u root < createdb.sql
mariadb -u root puzmage < script.sql
npm i
node index.js
