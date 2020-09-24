exports.config = {
    specs: ['e2etest.js'],
    allScriptsTimeout: 11000,
    capabilities: {
        browserName: 'chrome'
    },
    baseUrl: 'http://localhost:8080/',
    framework: 'jasmine',
    unexpectedAlertBehaviour: 'accept',
    directConnect: true,
    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};