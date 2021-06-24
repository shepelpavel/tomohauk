function eventSenderSend(event, resp) {
    switch (event) {
        case 'settings-data':
            console.log(settings);
            settings.settings = resp
            break;
        case 'system-res':
            terminal.text += '[' + new Date().toLocaleTimeString('ru-RU', {
                timeZone: 'Europe/Moscow'
            }) + '] ' + resp + '\n'
            break;
        case 'loader-hide':
            loader.show = false
            break;
        case 'php-available':
            php.php_ver = resp
            break;
        case 'php-current':
            php.php_cur = resp
            break;
        case 'to-editor':
            editor.display = 'show-editor'
            editor.text = resp
            break;
        case 'clear-inputs-git':
            for (var _i = 0; resp.length > _i; _i++) {
                $('input[name="' + resp[_i] + '"]').val('')
                git[resp[_i]] = ''
            }
            break;
        case 'git-status-push':
            git.need_push += resp + '\n'
            git.show_push = true
            break;
        default:
            break;
    }
}

function openPage(page) {
    if (!$('.page[data-page="' + page + '"]').hasClass('active')) {
        $('.js-menu-item').removeClass('active')
        $('.page').removeClass('active')
        $('.js-menu-item[data-page="' + page + '"]').addClass('active')
        $('.page[data-page="' + page + '"]').addClass('active')
    }
}

var loader = new Vue({
    el: '#loader',
    data: {
        show: false
    }
})
var terminal = new Vue({
    el: '#terminal',
    data: {
        terminal_items: [{
            time: new Date(),
            text: '... started'
        }],
        text: '[' + new Date().toLocaleTimeString('ru-RU', {
            timeZone: 'Europe/Moscow'
        }) + '] ... started\n'
    },
    watch: {
        text: function () {
            $('#terminal textarea').stop().animate({
                scrollTop: $('#terminal textarea')[0].scrollHeight * 2
            }, 800)
        }
    }
})

var settings = new Vue({
    el: '#settings',
    data: {
        settings: {},
        php_ver: []
    },
    mounted: function () {
        this.settings = _options
    }
})

var editor = new Vue({
    el: '#editor',
    data: {
        file: '',
        text: '',
        display: 'hide-editor',
        save_btn: false
    },
    methods: {
        saveFromEditor: function () {
            loader.show = true
            var _data = {
                file: this.file,
                text: this.text
            }
            ipcRenderer('save_file', _data)
        }
    }
})

var php = new Vue({
    el: '#php',
    data: {
        php_ver: [],
        php_cur: ''
    },
    mounted: function () {
        this.php_ver = ['5.6', '7.2', '7.4']
        this.php_cur = '7.2'
    },
    methods: {
        phpCurrent: function (php_cur, ver) {
            if (php_cur == ver) {
                return 'enabled'
            }
        },
        setPhpVer: function (event) {
            if (!event.target.classList.contains('enabled')) {
                loader.show = true
                var _en_ver = $(event.target).text()
                var _data = {
                    en_ver: _en_ver,
                    all_ver: this.php_ver
                }
                ipcRenderer('set_php_ver', _data)
            }
        }
    }
})

var git = new Vue({
    el: '#git',
    data: {
        git_clone: '',
        repo_name: '',
        need_push: '',
        show_push: false
    },
    methods: {
        gitClone: function () {
            if (this.git_clone.replace(/\s/g, '').length > 0) {
                loader.show = true
                $('button[data-show="git_clone"]').removeClass('show').addClass('hide').prop('disabled', true)
                var _data = {
                    repo: this.git_clone.replace(/\s/g, ''),
                    repo_name: this.repo_name ? this.repo_name : this.git_clone.replace(/\s/g, '').split('/')[1].split('.')[0]
                }
                ipcRenderer('git_clone', _data)
            }
        },
        checkPushed: function () {
            loader.show = true
            this.need_push = ''
            ipcRenderer('check_pushed')
        }
    },
    watch: {
        git_clone: function () {
            if (
                this.git_clone.indexOf('/') !== -1 &&
                this.git_clone.indexOf('.') !== -1
            ) {
                var _repo_name = this.git_clone.split('/')[1].split('.')[0]
                if (_repo_name) {
                    this.repo_name = _repo_name
                }
            } else {
                this.repo_name = this.git_clone
            }
        }
    }
})

openPage('apache')

$('.js-button').on('click', function () {
    loader.show = true
    var _exec = $(this).attr('data-exec')
    ipcRenderer(_exec)
})

$('.js-button-open').on('click', function () {
    var _exec = $(this).attr('data-exec')
    var _file = $(this).attr('data-file')
    if ($(this).hasClass('with-save') && _file) {
        editor.save_btn = true
        editor.file = settings.settings[_file]
    }
    ipcRenderer(_exec)
})

$('.js-menu-button').on('click', function () {
    var _menu_active = $('#menu').hasClass('open')
    if (_menu_active) {
        $('#menu').removeClass('open')
    } else {
        $('#menu').addClass('open')
    }
})

$('.js-menu-item').on('click', function () {
    var _page = $(this).attr('data-page')
    openPage(_page)
})

$('input').on('input propertychange', function () {
    var _prop = $(this).attr('name')
    if (_prop) {
        if ($(this).val().replace(/\s/g, '').length > 0) {
            $('button[data-show="' + _prop + '"]').removeClass('hide').addClass('show').prop('disabled', false)
        } else {
            $('button[data-show="' + _prop + '"]').removeClass('show').addClass('hide').prop('disabled', true)
        }
    }
})

$('.js-save').on('click', function () {
    loader.show = true
    $(this).removeClass('show').addClass('hide')
    if (settings.settings.projects_path.slice(-1) !== '/') {
        settings.settings.projects_path = settings.settings.projects_path + '/'
    }
    ipcRenderer('write_settings', settings.settings)
})

$('.js-close-editor').on('click', function () {
    editor.display = 'hide-editor'
    editor.save_btn = false
})