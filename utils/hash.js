const bcrypt = require("bcryptjs");

const hash = (password) => bcrypt.hashSync(password, 10);
const verify = (plain, hashed) => bcrypt.compareSync(plain, hashed);

module.exports = { hash, verify };
