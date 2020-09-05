var {
    exec
} = require("child_process");
var _bashPath = __dirname + '/../resources/bash/';

function bashResult(msg) {
    var _res = msg.replace(/\r|\n/g, '<br>');
    document.getElementById('terminal').innerHTML = document.getElementById('terminal').innerHTML + _res;
};

function phpVerResult(msg) {
    var _ver = String(msg).replace(/\r|\n/g, '');
    if (_ver.indexOf('error') < 0) {
        console.log('_' + _ver + '_');
        var _options = document.querySelectorAll('.js-php-v-select option');
        for (var i = 0; i < _options.length; i++) {
            if (_options[i].getAttribute('data-get') == _ver) {
                _options[i].setAttribute('selected', true);
            } else {
                _options[i].setAttribute('selected', false);
            }
        }
    }
};

function getPhpVer() {
    var _command = _bashPath + 'get_php_v.sh';
    exec(_command, function (error, data, getter) {
        if (error) {
            bashResult('<span class="error">__error__:&nbsp</span>' + error.message);
            console.log(error.message);
            return;
        }
        if (getter) {
            bashResult('<span class="getter">__getter__:&nbsp</span>' + data);
            console.log(data);
            return;
        }
        phpVerResult(data);
        console.log(_command);
    });
}

function runBash(_target, _var = '') {
    var _command = 'sudo bash ' + _bashPath + _target + '.sh' + _var;
    exec(_command, function (error, data, getter) {
        if (error) {
            bashResult('<span class="error">__error__:&nbsp</span>' + error.message);
            console.log(error.message);
            return;
        }
        if (getter) {
            bashResult('<span class="getter">__getter__:&nbsp</span>' + data);
            console.log(data);
            return;
        }
        bashResult('<span class="out">__out__:&nbsp</span>' + data);
        console.log(_command);
    });
}

function runGit(_target, _var = '') {
    var _command = 'bash ' + _bashPath + _target + '.sh' + _var;
    exec(_command, function (error, data, getter) {
        if (error) {
            bashResult('<span class="error">__error__:&nbsp</span>' + error.message);
            console.log(error.message);
            return;
        }
        if (getter) {
            bashResult('<span class="getter">__getter__:&nbsp</span>' + data);
            console.log(data);
            return;
        }
        bashResult('<span class="out">__out__:&nbsp</span>' + data);
        console.log(_command);
    });
}

document.addEventListener("DOMContentLoaded", function (event) {

    getPhpVer();

    var _run_bash = document.querySelectorAll('.js-run-bash');
    for (var i = 0; i < _run_bash.length; i++) {
        _run_bash[i].addEventListener('click', function () {
            var _target = this.getAttribute('data-bash');
            runBash(_target);
        });
    }

    var _php_v_select = document.querySelectorAll('.js-php-v-select')[0];
    _php_v_select.addEventListener('change', function () {
        var _target = this.value;
        runBash('set_php', ' ' + _target);
    });

    var _add_domain = document.querySelectorAll('.js-add-domain')[0];
    var _add_domain_input = document.querySelectorAll('.js-add-domain-input')[0];
    _add_domain.addEventListener('click', function () {
        var _target = _add_domain_input.value.replace(/[^0-9A-Za-z\-]/g, "");
        runBash('add_domain', ' ' + _target_domain);
    });

    var _rescan_dirs = document.querySelectorAll('.js-rescan-dirs')[0];
    _rescan_dirs.addEventListener('click', function () {
        var u_confirm = confirm('Reconfigure hosts and sites file?');
        if (u_confirm) {
            runBash('rescan_dirs');
        }
    });

    var _repo = document.getElementsByClassName('js-git-clone')[0];
    var _repo_input = document.getElementsByClassName('js-git-clone-input')[0];
    var _addconfig = document.getElementsByClassName('js-git-clone-conf')[0];
    var _openbrowser = document.getElementsByClassName('js-git-clone-brow')[0];
    var _opencode = document.getElementsByClassName('js-git-clone-code')[0];
    _repo.addEventListener('click', function () {
        var _param1, _param2, _param3 = '';
        var _target = _repo_input.value.replace(/[^0-9A-Za-z\-\.\/\:\@]/g, "");
        if (_target == '' || _target == null || _target == undefined) {
            _target = '0';
        }
        if (_addconfig.checked) {
            _param1 = ' 1';
        } else {
            _param1 = ' 0';
        }
        if (_openbrowser.checked) {
            _param2 = ' 1';
        } else {
            _param2 = ' 0';
        }
        if (_opencode.checked) {
            _param3 = ' 1';
        } else {
            _param3 = ' 0';
        }
        bashResult('<span class="out">__out__:&nbsp</span> cloned...');
        runGit('git_clone', ' ' + _target + _param1 + _param2 + _param3);
    });
});