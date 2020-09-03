window.$ = window.jQuery = require('jquery');

var {
    exec
} = require("child_process");
var _bashPath = __dirname + '/../resources/bash/';

function bashResult(msg) {
    var _res = msg.replace(/\r|\n/g, '<br>');
    $('#terminal').append(_res);
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
    var _command = _bashPath + 'get_php_v.sh';
    exec(_command, function (error, data, getter) {
        if (error) {
            bashResult('__error__: ' + error.message);
            console.log(error.message);
            return;
        }
        if (getter) {
            bashResult('__getter__: ' + data);
            console.log(data);
            return;
        }
        phpVerResult(data);
        console.log(_command);
    });
}

function runBash(_target, _var = '') {
    var _command = 'bash ' + _bashPath + _target + '.sh' + _var;
    exec(_command, function (error, data, getter) {
        if (error) {
            bashResult('__error__: ' + error.message);
            console.log(error.message);
            return;
        }
        if (getter) {
            bashResult('__getter__: ' + data);
            console.log(data);
            return;
        }
        bashResult('__out__:<br>' + data);
        console.log(_command);
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
        runBash('set_php', ' ' + _target_ver);
    });
});