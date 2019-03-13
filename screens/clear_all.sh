#!/bin/bash -e
#clear_all.sh

{ # try
	screen -X -S 3001 quit &&
	echo QUIT 3001
} || { # catch
	echo FAILED TO QUIT 3001
}

{ # try
	screen -X -S 3005 quit &&
	echo QUIT 3005
} || { # catch
	echo FAILED TO QUIT 3005
}

screen -ls
