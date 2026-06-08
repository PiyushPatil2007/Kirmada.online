@echo off
e:
cd "e:\Web development\Agency Website"
git init
git branch -M main
git add .
git commit -m "Initial website commit"
git remote add origin https://github.com/PiyushPatil2007/kirmada-online-website.git
git push -u origin main
