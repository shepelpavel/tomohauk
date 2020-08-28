const process = require('child_process');

function runTest() {
    var child = process.spawn('./test.sh');
    child.on('error', function (err) {
        console.log(err);
    });

    child.stdout.on('data', function (data) {
        console.log(data);
    });

    child.stderr.on('data', function (data) {
        console.log(data);
    });

    child.on('close', function (code) {
        console.log(code);
    });
}

button = document.getElementById('test');
button.addEventListener("click", function () {
    runTest();
});