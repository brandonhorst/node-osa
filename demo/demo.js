var osa = require('../lib/osa');


function promptForHandle(service, defaultHandle) {
  var app = Application.currentApplication();
  var prompt = 'What is your ' + service + ' handle?';

  var promptArguments = {
    withTitle: 'Hello, world!',
    defaultAnswer: defaultHandle
  };
  var result;

  app.includeStandardAdditions = true;

  result = app.displayDialog(prompt, promptArguments);

  return [service, result.textReturned];
}

function responseHandler(err, serviceAndResult) {
  var stringToPrint;
  
  if (err) {
    console.error(err)
  } else {
    stringToPrint = 'Your ' + serviceAndResult[0] + ' handle is ' + serviceAndResult[1];
    console.log(stringToPrint);
  }
};

osa(promptForHandle, 'twitter', '@brandonhorst', responseHandler);