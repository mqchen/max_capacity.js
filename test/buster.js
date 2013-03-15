var config = module.exports;

config["Mediator tests"] = {
	environment: "node",
	rootPath: "../",
	sources: [
		"src/**/*.js"
	],
	tests: [
		"test/**/*-test.js"
	]
};