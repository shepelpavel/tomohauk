window.$ = window.jQuery = require('jquery');

const __process = require('child_process');
const __bashPath = __dirname + '/../resources/bash/';

function bashResult(msg) {
    var _terminal = document.getElementById('terminal');
    _terminal.value += (msg);
};

function runBash(_target) {
    var _child = __process.spawn(__bashPath + _target + '.sh');
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

$(document).ready(function () {
    $('.js-run-bash').on('click', function() {
        var _target = $(this).attr('data-bash');
        runBash(_target);
    });
});