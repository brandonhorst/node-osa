node-osa
========

Very basic node.js module for running Open Scripting Architecture code in OSX 10.10+

##Overview

OSA allows for advanced interaction between applications on OSX. In the past, it has largely been implemented using AppleScript. Beginning in OSX 10.10 Yosemite, Apple has opened up this platform for development in [Javascript](https://developer.apple.com/library/prerelease/mac/releasenotes/InterapplicationCommunication/RN-JavaScriptForAutomation/index.html#//apple_ref/doc/uid/TP40014508). This has been regarded as the best thing ever, by me.

`node-osa` creates the illusion of being able to call OSA scripts naturally from node. As a pleasant side-effect, it also allows for OSA development in CoffeeScript (and any other compile-to-JS language). This is _not_ a perfect bridge.

##Installation

```bash
npm install osa
```

##Use

```javascript
var osa = require('osa');
osa(osaFunction, arg, [moreArgs...,] done);
```

##Implementation

This is how it works:

- The module exports a single method, which accepts a Javascript function `osaFunction`, any number of arguments `args`, and a callback `done`.
- The module generates a string of javascript code. This code is a string representation of `osaFunction`, self-executed with `args` and a final callback. `osaFunction` is expected to call its final argument with its error or results.
- This string of javascript is executed using the `osascript` utility. Results are passed back to the module in JSON.
- The module parses the JSON, and passes it to the original `done` callback.

##Limitations

There are, of course, many limitations with this strategy.

- As it is executing in an entirely different environment, the context of the passed `osaFunction` is completely ignored. It cannot behave like a closure or modify any external variables.
- As JSON is used as the transport mechanism, only `Object`s, `Array`s, `Number`s, `String`s, `true`, `false`, and `null` can be passed back and forth between the two environments. At some point, it could support some builtins like `RegExp`s, `Date`s, and maybe even context-less `Function`s, but it will never be able to handle prototypes. That is to say, you cannot pass a node library to OSA, and you cannot return an OSA object to node, even as a placeholder.
- Needless to say, you cannot `require` anything on the OSA side.
- Currently, you cannot `console.log` anything from the OSA side, as `console.log` is used as the internal communication between the module and the OSA process.
- Performance is not great as each call spawns off a new OSA process. This could be improved with a daemon of some sort. Of course, it is asyncronous and will not interrupt a node application.

That said, it will likely meet many of the needs for simple node OSX utilities. It's an awesome way to combine the power of a platform like node with the unique abilities that OSA offers.

##Example

This is a basic script that prompts the user for some information, and passes it back to node.

This example is contained in `test/test.js` and you can run it yourself with `npm test`. `node-osa` is not yet fully unit tested.

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

	done(null, service, result.textReturned);
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

Then, we will actually make the `osa` call. This will call promptForHandle, with 3 arguments, `'twitter'`, `'@brandonhorst'`, and a callback. When that callback is called, its arguments will be passed to `responseHandler`.

```javascript
osa = require 'osa'

osa(promptForHandle, 'twitter', '@brandonhorst', responseHandler);
```

When we run it:

```bash
$ npm test
	#A textbox should appear, prompting for input. If we accept the default...*
Your twitter handle is @brandonhorst
```

##More Information

This is a brand-new project for a brand-new API. Obviously it is very far from production-ready. But feel free to play around with it. I'd love to discuss any thoughts or new ideas. Create an issue or contact me at [@brandonhorst](http://twitter.com/brandonhorst). Thank you!