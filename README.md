node-osa
========

Node.js module for running Open Scripting Architecture code in OSX 10.10+

##Overview

OSA allows for advanced interaction between applications on OSX. In the past, it has largely been implemented using AppleScript. Beginning in OSX 10.10 Yosemite, Apple has opened up this platform for development in [Javascript](https://developer.apple.com/library/prerelease/mac/releasenotes/InterapplicationCommunication/RN-JavaScriptForAutomation/index.html#//apple_ref/doc/uid/TP40014508). This has been regarded as the best thing ever, by me.

`node-osa` creates the illusion of being able to call OSA scripts naturally from node. As a pleasant side-effect, it also allows for OSA development in compile-to-JS languages such as CoffeeScript and Traceur.

##Installation

```bash
npm install osa
```

##Use

```javascript
var osa = require('osa');

//callback, passed the return value of osaFunction
function done(err, result) { ... }

//function to be executed on the osa side
function osaFunction(arg [, moreArgs...]) { ... }

osa(osaFunction, arg [, moreArgs...], done);
```
##Testing

```bash
npm test      #run tests
npm run cover #run test coverage
npm run lint  #run jshint
```

##Limitations

- As it is executing in an entirely different environment, the context of the passed `osaFunction` is completely ignored. It cannot behave like a closure or modify any external variables.
- As JSON is used as the transport mechanism, only `Object`s, `Array`s, `Number`s, `String`s, `true`, `false`, and `null` can be passed back and forth between the two environments. That is to say, you cannot pass a node library to OSA, and you cannot return an OSA object to node, even as a placeholder.
- You cannot use Node builtins or npm modules on the osa side.
- Currently, anything you `console.log` from the OSA side is not exposed anywhere.

That said, it will likely meet many of the needs for simple node OSX utilities. It's an awesome way to combine the power of a platform like Node with the unique abilities that OSA offers.

##Example

This is a basic script that prompts the user for some information, and passes it back to node.

This example is contained in `demo/demo.js` and you can run it yourself with `node run demo`. `node-osa` is not yet fully unit tested.

First, we will write our function that will be evaluated in the OSA environment. Notice that it gets automatic access to the `Application` object (as well as `Library`, `Path`, `ObjectSpecifier`, `delay`, `ObjC`, `Ref`, and `$`).

```javascript
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

	return [service, result.textReturned];
};
```

Next, we will write the function than handles the callback from the OSA call

```javascript
responseHandler = function (err, service, result) {
	var stringToPrint;
	
	if (err) {
		console.error(err)
	} else {
		stringToPrint = 'Your ' + service + ' handle is ' + result;
		console.log(stringToPrint);
	}
};
```

Then, we will actually make the `osa` call. This will call promptForHandle, with 2 arguments, `'twitter'` and `'@brandonhorst'`. Whatever it returns will be passed to `responseHandler`.

```javascript
osa = require 'osa'

osa(promptForHandle, 'twitter', '@brandonhorst', responseHandler);
```

When we run it:

```bash
$ npm run demo
	*A textbox should appear, prompting for input. If we accept the default...*
Your twitter handle is @brandonhorst
```

##Implementation

- When its exported function is called, the module generates a string of javascript code. This code is a string representation of `osaFunction`, self-executed with `args` and a final callback. `osaFunction` is expected to call its final argument with its error or results.
- This string of javascript is executed using the `osascript` utility. Results are passed back to Node in JSON via `stdout`.
- The module parses the JSON, and passes it to the original `done` callback.

##How Come the OSA Side Isn't Passed a Callback?

In 0.x, the OSA function was passed a callback that it could call. However, as it turns out, Apple's OSA Javascript isn't really designed to work asyncronously. Its API calls are syncronous and it does not have functions like `setTimeout`. Because of this, a callback seems unnecessary. If you do need one for some reason, please open an issue.

##More Information

The Javascript OSA API has not yet been finalized by Apple, so anything could change at any time.

Once Travis upgrades to 10.10, I will see if I can get this working with Travis and Coveralls.

I'd *love* to discuss any thoughts or new ideas, and I'd be **thrilled** to see any potential applications. To get in touch, create an issue or contact me at @brandonhorst. Thank you!