module.exports = {
	presets: [[
		'@babel/preset-env', {
			useBuiltIns: 'usage',
			targets: [
				'>0.2%',
				'safari >= 5',
				'ios >= 6'
			],
			debug: true
		}
	]]
};