var osa = require('../lib/osa');


var promptForHandle = function (service, defaultHandle, done) {
	var app = Application.currentApplication();
	var prompt = 'What is your ' + service + ' handle?';
	var promptArguments = {
		withTitle: 'Hello, world!',
		defaultAnswer: defaultHandle
	};
	var result;

	app.includeStandardAdditions = true;

	result = app.displayDialog(prompt, promptArguments);

	done(null, service, result.textReturned);
};

responseHandler = function (err, service, result) {
	var stringToPrint;
	
	if (err) {
		console.error(err)
	} else {
		stringToPrint = 'Your ' + service + ' handle is ' + result;
		console.log(stringToPrint);
	}
};

osa(promptForHandle, 'twitter', '@brandonhorst', responseHandler);