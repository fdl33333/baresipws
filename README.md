# baresipws
index.html -- web page to control baresip
baresipws.js  nodejs script for server

npm modules used:
- net
- netstring-stream
- var_dump
- websocket
- http

to run baresip at startup, edit /etc/rc.local and add:

/usr/local/bin/baresip -f /root/.baresip -d     // point to correct .baresip directory in user home

to run baresipws.js at startup
create : /etc/systemd/system/baresipws.service

[Unit]
Description=Node.js Baresip websocket server

[Service]
# check the baresipws.js path
ExecStart=/usr/bin/node /root/baresipws.js

# Required on some systems
Restart=always
RestartSec=2
# Output to syslog
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=nodejs-cardreader

[Install]
WantedBy=multi-user.target

Then :
systemctl enable baresipws.service
systemctl start baresipws.service
