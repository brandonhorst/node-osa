var exec = require('child_process').exec;

// export function osa
// takes a function, any number of arguments, and a callback.
// It will run the function in the OSA environment, passing in any given arguements.
// that function is expected to return a single value, which will be passed back to the
// callback via stdout.
var consoleLogPrefix = '<brandonhorst:node-osa>';
var consoleLogSuffix = '</brandonhorst:node-osa>';

function extractLogs (stderr) {
  var reg = new RegExp('^' + consoleLogPrefix + ' ([\\s\\S]*?) ' + consoleLogSuffix + '$', 'gm');
  var matches = [];
  var found;
  while ((found = reg.exec(stderr)) !== null) {
    matches.push(found[1]);
    reg.lastIndex -= found[0].split(':')[1].length;
  }

  return matches.length > 0 ? matches.join('\n') : null;
}

module.exports = function osa (osaFunction) {
  // get an array of arguments, excluding the osaFunction and the callback
  var args = Array.prototype.slice.call(arguments, 1, arguments.length - 1);

  // get a reference to the callback
  var done = arguments[arguments.length - 1];

  // conver these args to json
  var jsonArgs = args.map(JSON.stringify);

  // build a string to call osaFunction, pass in args, and evaulate to
  // the JSON representation of the return value, then call it with osascript
  var consoleLogPatch = 'var old = console.log; console.log = function () { Array.prototype.unshift.call(arguments, "' +
    consoleLogPrefix + '"); Array.prototype.push.call(arguments, "' + consoleLogSuffix +
    '"); old.apply(console, arguments); }; ';
  var functionCallString = consoleLogPatch + 'JSON.stringify((' + osaFunction.toString() + ')(' + jsonArgs.join(',') + '));';
  var escapedCall = functionCallString.replace(/^\s+/g, ' ').replace(/\n/g, '').replace(/'/g, "'\\''");
  var executeString = "osascript -l JavaScript -e '" + escapedCall + "'";

  // call the shell command
  exec(executeString, function (err, stdout, stderr) {
    var result, newErr;

    var log = extractLogs(stderr);

    // if an error was thrown, it will go into err - just pass it through
    if (err) {
      done(err);

    // if no error was thrown, anything returned will be in stdout
    } else {
      try {
        if (stdout === '\n') {
          done(null, undefined, log);
        } else {
          result = JSON.parse(stdout);
          done(null, result, log);
        }
      // if nothing was in stdout (or it wasn't JSON), something went wrong
      } catch (e) {
        newErr = new Error('Function did not return an object: ' + e.message);
        done(newErr);
      }
    }
  });
};
