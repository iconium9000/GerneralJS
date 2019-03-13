#!/bin/bash -e
#echo BASH SETUP GENERALJS NODE SERVERS

#{
#	~/Github/GeneralJS/screens/clear_screens.bash
#	~/Github/GeneralJS/screens/clear_screens.bash
#}

{
	echo starting blockade on port 3001
#	chmod +x ~/Github/GeneralJS/screens/start_3001.sh
	screen -d -m -S 3001 ~/Github/GeneralJS/screens/start_3001.sh
}
#{
#	echo starting knifeline on port 3005
#	chmod +x ~/Github/GeneralJS/screens/start_3005.sh
	screen -d -m -S 3005 ~/Github/GeneralJS/screens/start_3005.sh
#}

screen -ls
