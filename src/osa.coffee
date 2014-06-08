#node-osa

exec = require('child_process').exec
_ = require 'lodash'
util = require 'util'

utilities = require './utilities'

#This is the "done" function on the OSA side. It simply logs a JSON representation to the console (stderr)
#to be picked up by the exec callback
callback = (err, args...) ->
	if err?
		console.log JSON.stringify(err)
	else
		console.log JSON.stringify(args)

#See utilities.coffee
utilitiesString = 'var ' + ("__#{name} = #{code}" for name, code of utilities).join(',') + ';'

#Export a single function that takes a function, any number of arguments, and a callback.
#It will run the function in the OSA environment, passing in any given arguements. It will also pass in one final argument,
#a callback that accepts an error as its first argument and then any number of results
module.exports = (osaFunction, args..., done) ->
	args = (JSON.stringify(arg) for arg in args)
	argAndCallback = args.push callback

	functionCall = "#{utilitiesString} (#{osaFunction.toString()})(#{args.join(',')})"
	escapedCall = functionCall.replace(/^\s+/g, '').replace(/\n/g, '').replace(/'/g, '"\'"')

	exec "osascript -l JavaScript -e '#{escapedCall}'", (err, stdout, stderr) ->
		if err? #Error with the osascript call
			done(err)
		else
			results = JSON.parse(stderr) #console.log comes in over stderr for osascript
			if util.isError(results) #Error returned from JS
				done(results)
			else
				done(null, results...)
