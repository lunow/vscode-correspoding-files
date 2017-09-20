const ava = require('ava');
const example = require('./example.js');

ava.test('its working', t => {
	t.true('Its just a test.', example);
});