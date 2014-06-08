osa = require '../osa'


promptForHandle = (service, defaultHandle, done) ->
	app = Application.currentApplication()
	app.includeStandardAdditions = true
	result = app.displayDialog "What is your #{service} handle?",
		withTitle: 'Hello, world!'
		defaultAnswer: defaultHandle

	done(null, service, result.textReturned)

osa promptForHandle, 'twitter', '@brandonhorst', (err, service, result) ->
	if err?
		console.error err
	else
		console.log "Your #{service} handle is #{result}"