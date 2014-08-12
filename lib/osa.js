var exec = require('child_process').exec;
var util = require('util');

//This is the "done" function on the OSA side. It simply logs a JSON representation to the console (stderr)
// to be picked up by the exec callback
var writeOutResults = function (err) {
	var args;

	if (err) {
		console.log(JSON.stringify(err));
	} else {
		args = Array.prototype.slice.call(arguments, 1);
		console.log(JSON.stringify(args));
	}
};

//Export a single function that takes a function, any number of arguments, and a callback.
// It will run the function in the OSA environment, passing in any given arguements. It will also pass in one final argument,
// a callback that accepts an error as its first argument and then any number of results
module.exports = function (osaFunction) {
	var args = Array.prototype.slice.call(arguments, 1, arguments.length - 1);
	var done = arguments[arguments.length - 1];
	var jsonArgs = [];
	var functionCallString;
	var escapedCall;
	var executeString;

	for (i in args) {
		jsonArgs.push(JSON.stringify(args[i]));
	}
	jsonArgs.push(writeOutResults);

	functionCallString = '(' + osaFunction.toString() + ')(' + jsonArgs.join(',') + ');';
	escapedCall = functionCallString.replace(/^\s+/g, ' ').replace(/\n/g, '').replace(/'/g, "'\\''");
	executeString = "osascript -l JavaScript -e '" + escapedCall + "'";

	exec(executeString, function (err, stdout, stderr) {
		if (err) {
			done(err);
		} else {
			results = JSON.parse(stderr) //console.log comes in over stderr for osascript
			if (util.isError(results)) { //Error returned from JS
				done(results)
			} else {
				done.apply(null, [null].concat(results));
			}
		}
	});
};