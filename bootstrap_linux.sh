#!/bin/bash -e

GENERALJS=$(pwd)

echo
echo --GO to "$GENERALJS"

cd $GENERALJS

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
  node screens/assemble_scripts.js $GENERALJS
}

cd screens

# {
#   echo
#   echo --CLEAR previous screens
#   echo why not do it 3 times??
#
#   chmod +x clear_all.sh
#   echo -clear_all try 1
#   ./clear_all.sh
#   echo -clear_all try 2
#   ./clear_all.sh
#   echo -clear_all try 3
#   ./clear_all.sh
#
#   #rm clear_all.sh
# }

# {
#   echo
#   echo --START new servers
#
#   chmod +x startup.sh
#   ./startup.sh
#   #rm startup.sh
# }

{
  echo
  echo
  echo --COMPLETE!
}
