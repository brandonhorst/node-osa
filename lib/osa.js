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
  var done = arguments.length > 1
    ? arguments[arguments.length - 1]
    : null;

  // conver these args to json
  var jsonArgs = args.map(JSON.stringify);

  // build a string to call osaFunction, pass in args, and evaulate to
  // the JSON representation of the return value, then call it with osascript
  var consoleLogPatch = 'var old = console.log; console.log = function () { Array.prototype.unshift.call(arguments, "' +
    consoleLogPrefix + '"); Array.prototype.push.call(arguments, "' + consoleLogSuffix +
    '"); old.apply(console, arguments); }; ';
  var functionCallString = consoleLogPatch + 'JSON.stringify((' + osaFunction.toString() + ')(' + jsonArgs.join(',') + '));';

  // Use multiple -e options to allow line-specific error reporting in osaFUnction. 
  // Reported error lines start counting at 1 for the function call, i.e. an error in line 2
  // refers to the first line of code inside the function.
  var escapedCall = functionCallString.replace(/^\s+/g, ' ').replace(/'/g, "'\\''").split('\n');
  var executeString = "osascript -l JavaScript";
  for (var i=1, r=0; r<escapedCall.length; r++) {
      executeString += " -e '" + escapedCall[r] + "'"; 
  }

  exec(executeString, {maxBuffer: 1024 * 1024}, function (err, stdout, stderr) {
    if (!done) {
      return;
    }

    var result, newErr;

    var log = extractLogs(stderr);

    // if an error was thrown, it will go into err - just pass it through
    if (err) {
      done(err);

    // if no error was thrown, anything returned will be in stdout
    } else {
      try {
        if (stdout.trim() === '' ) {
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
