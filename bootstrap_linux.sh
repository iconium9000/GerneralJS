#!/bin/bash -e

GENERALJS=$(pwd)

echo
echo --GO to $(pwd)

cd $(pwd)

{
  echo
  echo --UPDATE git repository
  git reset --hard origin/master
  git gc
  git fetch origin master
}

{
  echo
  echo --CREATE assembly instruections with nodeJS
  node bootstrap_linus.js
}

{
  echo
  echo
  echo --COMPLETE!
}
