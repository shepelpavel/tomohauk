const __process = require('child_process');
const __bashPath = __dirname + '/../resources/bash/';

function bashResult(msg) {
    var _terminal = document.getElementById('terminal');
    _terminal.value += (msg);
};

function runTest() {
    var _child = __process.spawn(__bashPath + 'test.sh');
    _child.on('error', function (err) {
        bashResult('__error__: ' + err);
    });

    _child.stdout.on('data', function (data) {
        bashResult('__out__: ' + data);
    });

    _child.stderr.on('data', function (data) {
        bashResult('__err__: ' + data);
    });

    _child.on('close', function (code) {
        console.log('__child_close_code__: ' + code);
    });
}

button = document.getElementById('test');
button.addEventListener("click", function () {
    runTest();
});