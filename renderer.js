const process = require('child_process');

function bashResult(msg) {
    var _terminal = document.getElementById('terminal');
    _terminal.value += (msg);
};

function runTest() {
    var child = process.spawn('./test.sh');
    child.on('error', function (err) {
        bashResult('-- ' + data);
    });

    child.stdout.on('data', function (data) {
        bashResult('-- ' + data);
    });

    child.stderr.on('data', function (data) {
        bashResult('-- ' + data);
    });

    child.on('close', function (code) {
        console.log(code);
    });
}

button = document.getElementById('test');
button.addEventListener("click", function () {
    runTest();
});