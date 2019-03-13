#!/bin/bash -e
#echo BASH SETUP GENERALJS NODE SERVERS

{
	screen -d -m -S 3001 ~/Github/GeneralJS/screens/3001_blockade.sh
}
{
	screen -d -m -S 3005 ~/Github/GeneralJS/screens/3005_knifeline.sh
}

screen -ls
