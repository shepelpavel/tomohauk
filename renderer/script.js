window.$ = window.jQuery = require('jquery');

const __process = require('child_process');
const __bashPath = __dirname + '/../resources/bash/';

function bashResult(msg) {
    var _terminal = document.getElementById('terminal');
    _terminal.value += (msg);
};

function phpVerResult(msg) {
    var _ver = String(msg).replace(/\r|\n/g, '');
    if (_ver.indexOf('error') < 0) {
        console.log('_' + _ver + '_');
        $('.js-php-v-select option').attr('selected', false);
        $('.js-php-v-select option[data-get="' + _ver + '"]').attr('selected', true);
    }
};

function getPhpVer() {
    var _child_php = __process.spawn(__bashPath + 'get_php_v.sh');
    _child_php.on('error', function (err) {
        phpVerResult('__error__:' + err);
    });

    _child_php.stdout.on('data', function (data) {
        phpVerResult(data);
    });

    _child_php.stderr.on('data', function (data) {
        phpVerResult('__error__: ' + data);
    });

    _child_php.on('close', function (code) {
        console.log('__php_v_block_code__: ' + code);
    });
}

function runBash(_target) {
    var _child = __process.spawn(__bashPath + _target + '.sh');
    _child.on('error', function (err) {
        bashResult('__error__: ' + err);
    });

    _child.stdout.on('data', function (data) {
        bashResult('__out__: ' + data);
    });

    _child.stderr.on('data', function (data) {
        bashResult('__error__: ' + data);
    });

    _child.on('close', function (code) {
        console.log('__child_close_code__: ' + code);
    });
}

$(document).ready(function () {
    getPhpVer();

    $('.js-run-bash').on('click', function () {
        var _target = $(this).attr('data-bash');
        runBash(_target);
    });

    $('.js-php-v-select').on('change', function () {
        var _target_ver = $(this).val();
        runBash(_target_ver);
    });
});