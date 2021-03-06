const blessed = require('blessed');
const contrib = require('blessed-contrib');
const config = require('./config');

const screen = blessed.screen();

//create layout and widgets

const grid = new contrib.grid({
	rows:   2,
	cols:   6,
	screen: screen
});
const focusEffects = {
	border: {
		fg: 'white'
	}
};

const graph = grid.set(0, 0, 1, 4, contrib.line, {
	minY:       config.positions.stopLoss.P_L,
	maxY:       config.positions.takeProfit,
	label:      'Total P/L',
	showLegend: true
});
module.exports.graphPanel = graph;

const log = grid.set(0, 4, 2, 2, contrib.log, {
	fg:           'green',
	selectedFg:   'green',
	label:        'Log',
	interactive:  true,
	keys:         true,
	focusEffects: focusEffects,
});
module.exports.logPanel = log;

const positions = grid.set(1, 0, 1, 2, contrib.table, {
	keys:          true,
	fg:            'green',
	selectedFg:    'white',
	selectedBg:    'blue',
	interactive:   true,
	label:         'Positions',
	columnSpacing: 1, /*in chars*/
	columnWidth:   [12, 6, 10, 10], /*in chars*/
	focusEffects:  focusEffects,
});

module.exports.positionsPanel = positions;

const commands = grid.set(1, 2, 1, 1, contrib.table, {
	keys:          true,
	fg:            'green',
	selectedFg:    'white',
	selectedBg:    'blue',
	interactive:   true,
	label:         'Commands',
	columnSpacing: 1, /*in chars*/
	columnWidth:   [20], /*in chars*/
	focusEffects:  focusEffects,
});
module.exports.commandsPanel = commands;

const keys = grid.set(1, 3, 1, 1, contrib.table, {
	keys:          false,
	fg:            'green',
	interactive:   false,
	label:         'Keys',
	columnSpacing: 1, /*in chars*/
	columnWidth:   [5, 20] /*in chars*/
});
module.exports.keysPanel = keys;

const focusable = [positions.rows, commands.rows, log];
let focused = 0;

module.exports.start = function () {

	keys.on('click', function () {
		log.log('keys panel clicked');
	});

	// focusable.forEach(f => {
	// 	f.on('focus', function () {
	// 		console.log(`focusing ${f.options.label || f.parent.options.label}`);
	// 	});
	// });

	screen.key(['tab'], function () {
		focused = (focused + 1) % focusable.length;
		focusable[focused].focus();
		// log.log(`changing focus:${focused}`);
	});

	screen.key(['escape', 'q', 'C-c'], function () {
		return process.exit(0);
	});

// fixes https://github.com/yaronn/blessed-contrib/issues/10
	screen.on('resize', function () {
		graph.emit('attach');
		log.emit('attach');
		positions.emit('attach');
		commands.emit('attach');
		keys.emit('attach');
	});

	screen.key('enter', function () {
		log.log(`running onEnter on panel ${screen.focused.options.label || screen.focused.parent.options.label}`);
		let onEnter = screen.focused['onEnter'] || screen.focused.parent['onEnter'];
		if (screen.focused['onEnter']) screen.focused.onEnter();
		else if (screen.focused.parent['onEnter']) screen.focused.parent.onEnter();
	});

	screen.render();

	keys.setData({
		headers: ['key', 'action'],
		data:    [['Tab', 'Change focus'], ['Q', 'Quit']]
	});

	// commands.setData({
	// 	headers: ['command'],
	// 	data:    [['Close position'],
	// 		['Flip position'],
	// 		['Double position'],
	// 		['New position'],
	// 		['Move stoploss'],
	// 		['Move takeprofit']]
	// });


};
