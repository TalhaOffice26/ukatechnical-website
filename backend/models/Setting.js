const m = require('mongoose');
module.exports = m.model('Setting', new m.Schema({ key: { type: String, unique: true, required: true }, value: m.Schema.Types.Mixed }));