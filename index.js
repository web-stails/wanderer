'use strict';

const fs = require('fs');
require('./library/global_function')

let path = './config.conf';
if (fs.existsSync(path)) {
	global.config_global_option = config_decode(fs.readFileSync(path, "utf8"));
} else {
	global.config_global_option = config_decode(fs.readFileSync("./wanderer/config.conf", "utf8"));
}


require('./library/wenderer').init();
