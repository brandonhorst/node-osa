node-osa
========

Node.js module for running Open Scripting Architecture code in OSX 10.10+

##Overview

OSA allows for advanced interaction between applications on OSX. In the past, it has largely been implemented using AppleScript. Beginning in OSX 10.10 Yosemite, Apple has opened up this platform for development in [Javascript](https://developer.apple.com/library/prerelease/mac/releasenotes/InterapplicationCommunication/RN-JavaScriptForAutomation/index.html#//apple_ref/doc/uid/TP40014508). This has been regarded as the best thing ever, by me.

`node-osa` creates the illusion of being able to call OSA scripts naturally from node. As a pleasant side-effect, it also allows for easy OSA development with compile-to-js tools such as Babel or CoffeeScript.

##Installation

```sh
npm install osa
```

##Use

```js
var osa = require('osa');

//function to be executed on the osa side
function osaFunction(arg [, moreArgs...]) { ... }

//called when the osa function completes
function callback(err, result, log) { ... }

osa(osaFunction, arg [, moreArgs...], callback);
```

##Testing

```sh
npm test
npm run demo
npm run cover
npm run lint
```

##Limitations

- As it is executing in an entirely different environment, the context of the passed `osaFunction` is completely ignored. It cannot behave like a closure or modify any external variables.
- As JSON is used as the transport mechanism, only `Object`s, `Array`s, `Number`s, `String`s, `true`, `false`, and `null` can be passed back and forth between the two environments. That is to say, you cannot pass a node library or class to OSA, and you cannot return an OSA object to node, even as a placeholder.
- You cannot use node builtins or npm modules on the osa side.
- Currently no streaming is used for the JSON parsing. Sending or returning very large values (on the order of megabytes) may cause memory problems.
- The OSA javascript environment is entirely syncronous. Functions like `setTimeout` are not available. Any asynchronous behavior will need to be conducted on the node side.
- As each call spawns off a new process and spins up a new environment, calls take a while. On a 2014 Macbook Air, calls take around 50ms. Of course this is all asynchronous from Node's point of view, but making many calls in series may take quite a while.

That said, all of these limitations are problems with the OSA environment, not with this module. None of these could be improved by using AppleScript instead. This module will likely meet many needs of simple node OSX utilities. It's an awesome way to combine the power of a platform like node with the unique abilities that OSA offers.

##Example

This is a basic script that prompts the user for some information, and passes it back to node.

This example is contained in `demo/demo.js` and you can run it yourself with `npm run demo`.

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

	return {service: service, text: result.textReturned};
};
```

Next, we will write the function than handles the callback from the OSA call. Notice that it takes 3 arguments:

- `err` - an `Error` if one is triggered in the osa world, or something goes wrong with the call
- `result` - the return value of the function passed to `osa`
- `log` - a `\n`-delimited `String` of all `console.log` statements executed in the `osa` function

```javascript
responseHandler = function (err, result, log) {
	var stringToPrint;

	if (err) {
		console.error(err)
	} else {
		stringToPrint = 'Your ' + result.service + ' handle is ' + result.text;
		console.log(stringToPrint);
	}
};
```

Then, we will actually make the `osa` call. This will call promptForHandle, with 2 arguments, `'twitter'` and `'@brandonhorst'`. Whatever it returns will be passed to `responseHandler`.

```javascript
osa = require('osa');

osa(promptForHandle, 'twitter', '@brandonhorst', responseHandler);
```

When we run it:

```sh
$ npm run demo
	*A textbox should appear, prompting for input. If we accept the default...*
Your twitter handle is @brandonhorst
```

##Implementation

- When its exported function is called, the module generates a string of javascript code. This code is a string representation of `osaFunction`, self-executed with `args` and a final callback.
- This string of javascript is executed using the `osascript` utility. Returned value is passed back to node in JSON via `stdout`.
- The module parses the JSON, and passes it to the original `done` callback.

##How Come the OSA Side Isn't Passed a Callback?

In 0.x, the OSA function was passed a callback that it could call. However, as it turns out, Apple's OSA Javascript isn't really designed to work asynchronously. Its API calls are syncronous and it does not have functions like `setTimeout`. Because of this, a callback seems unnecessary. If you do need one for some reason, please open an issue.
