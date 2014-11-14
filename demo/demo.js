var osa = require('../lib/osa');


function promptForHandle(service, defaultHandle) {
  var app = Application.currentApplication();
  var prompt = 'What is your ' + service + ' handle?';

  var promptArguments = {
    withTitle: 'Hello, world!',
    defaultAnswer: defaultHandle
  };
  var result;

  console.log('This was logged from osa');

  app.includeStandardAdditions = true;

  result = app.displayDialog(prompt, promptArguments);

  return {service: service, text: result.textReturned};
}

function responseHandler(err, result, log) {
  var stringToPrint;

  console.log(log);

  if (err) {
    console.error(err)
  } else {
    stringToPrint = 'Your ' + result.service + ' handle is ' + result.text;
    console.log(stringToPrint);
  }
};

osa(promptForHandle, 'twitter', '@brandonhorst', responseHandler);
