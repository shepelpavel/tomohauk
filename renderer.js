const process = require('child_process');

function bashResult(msg) {
    var _terminal = document.getElementById('terminal');
    _terminal.value += (msg);
};

function runTest() {
    // /usr/lib/apacheconfigelectron/resources/app/
    var child = process.spawn(__dirname + '/test.sh');
    child.on('error', function (err) {
        bashResult('__error__: ' + err);
    });

    child.stdout.on('data', function (data) {
        bashResult('__out__: ' + data);
    });

    child.stderr.on('data', function (data) {
        bashResult('__err__: ' + data);
    });

    child.on('close', function (code) {
        console.log('__child_close_code__: ' + code);
    });
}

button = document.getElementById('test');
button.addEventListener("click", function () {
    runTest();
});