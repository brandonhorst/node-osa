node-osa
========

Verb basic node.js module for running Open Scripting Architecture code in OSX 10.10+

##Overview

OSA allows for advanced interaction between applications on OSX. In the past, it has largely been implemented using AppleScript. Beginning in OSX 10.10 Yosemite, Apple has opened up this platform for development in [Javascript](https://developer.apple.com/library/prerelease/mac/releasenotes/InterapplicationCommunication/RN-JavaScriptForAutomation/index.html#//apple_ref/doc/uid/TP40014508). This has been regarded as the best thing ever, by me.

`node-osa` creates the illusion of being able to call OSA scripts naturally from node. As a pleasant side-effect, it also allows for OSA development in CoffeeScript (and any other compile-to-JS language). This is _not_ a perfect bridge.

##Installation

```
npm install osa
```

##Use

```
require('osa');
```

##Implementation

This is how it works:

- The module is a single method, which accepts a Javascript function `osaFunction`, any number of arguments `args`, and a callback `done`.
- A string of javascript is generated. This code, when executed, would call `osaFunction`, passing in `args` followed by a callback of its own. The function must call this callback with its error or results.
- This string of javascript is executed using the `osascript` utility. Results are passed back to node in JSON via stderr ('cause that's just how `osascript` rolls).
- Node parses the JSON, and passes it to the `done` callback.

##Limitations

There are, of course, many limitations with this strategy.

- The context of the passed `osaFunction` is completely ignored. It cannot behave like a closure as it is executing in a different environment.
- As JSON is used as the transport mechanism, only `Object`s, `Array`s, `Number`s, `String`s, `true`, `false`, and `null` can be passed back and forth between the two environments. At some point, it could support some builtins like `RegExp`s, `Date`s, and maybe even context-less `Function`s, but it will never be able to handle prototypes. That is to say, you cannot pass a node library to OSA, and you cannot return an OSA object to node, even as a placeholder.
- Needless to say, you cannot `require` anything on the OSA side.
- Currently, you cannot `console.log` anything from the OSA side.
- Performance is not great (though it is non-blocking, of course). This could be improved with a daemon of some sort.

That said, it will likely meet many of the needs for node OSX utilities. It's an awesome way to combine the power of a platform like node with the unique abilities that OSA offers.

##Example

This is a basic script that prompts the user for some information, and passes it back to node.

This is contained in `test/test.coffee` and you can run it yourself with `npm test` (requires `coffee`).

This function will be evaluated in the OSA environment. Notice that it gets automatic access to the `Application` object (as well as `Library`, `Path`, `ObjectSpecifier`, `delay`, `ObjC`, `Ref`, and `$`).

```coffee
promptForHandle = (service, defaultHandle, done) ->
	app = Application.currentApplication()
	app.includeStandardAdditions = true
	result = app.displayDialog "What is your #{service} handle?",
		withTitle: 'Hello, world!'
		defaultAnswer: defaultHandle

	done(null, service, result.textReturned)
```

This function gets evaulated on the node side. It passes in the `promptForHandle` function, two arguments, and a callback. `promptForHandle` gets executed, and the results are returned. They are then written to the console.

```coffee
osa = require 'osa'

osa promptForHandle, 'twitter', '@brandonhorst', (err, service, result) ->
	if err?
		console.error err
	else
		console.log "Your #{service} handle is #{result}"
```

##More Information

This is a brand-new project for a brand-new API. Obviously it is very far from production-ready. But feel free to play around with it. I'd love to discuss any thoughts or new ideas. Create an issue or contact me at [@brandonhorst](http://twitter.com/brandonhorst). Thank you!