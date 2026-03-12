const bcrypt = require("bcryptjs");

bcrypt.hash("", 10).then(console.log);