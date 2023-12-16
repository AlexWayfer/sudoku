const
	fs = require('fs'),
	path = require('path'),
	YAML = require('yaml'),
	{ exec } = require('child_process')

const
	rootDir = path.resolve(__dirname, '..'),
	configFile = fs.readFileSync(path.resolve(rootDir, 'config/deploy.yaml'), 'utf8'),
	config = YAML.parse(configFile)

config.forEach(server => {
	// console.debug(server.ssh)
	// console.debug(server.path)

	const
		files = [
			path.resolve(rootDir, 'images'),
			path.resolve(rootDir, 'scripts'),
			path.resolve(rootDir, 'styles'),
			path.resolve(rootDir, 'sounds'),
			path.resolve(rootDir, 'index.html')
		],
		command = `scp -r ${files.join(' ')} ${server.ssh}:${server.path}`

	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error(error)
			return
		}

		if (stderr) {
			console.error(stderr)
			return
		}

		console.log(stdout)
	})
})
