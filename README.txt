John FitzGerald
General Purpose JavaScript Project Platform
Developed as a way to streamline the process of prototyping new ideas.
Allowed for a central libary which can be modified separitely from each individual project.
My tendency to do this has repeatedly come back to bite me. I really should have placed each project in its own Reposetory and not be afraid of duplicate code.

This repository is managed by a node server.
Node server instructions:
  install node: https://nodejs.org/en/download/
  cmd: npm init
  cmd: npm install express
  cmd: npm install socket.io
  cmd: npm install shelljs
To activate server:
  cmd: node app <project_name> <port_name>
    project_name is the name of any sub-folder of 'projects'
      if left out, will default to '00_template' '2000'
    port_number is any availiable port
      if left out, will default to '2000'
