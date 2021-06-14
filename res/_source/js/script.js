const {
    ipcRenderer
} = require('electron')
const $ = require('./../_assets/module/jquery/jquery.min.js')
const Vue = require('./../_assets/module/vue/vue.min.js')

function openPage(page) {
    if (!$('.page[data-page="' + page + '"]').hasClass('active')) {
        $('.js-menu-item').removeClass('active')
        $('.page').removeClass('active')
        $('.js-menu-item[data-page="' + page + '"]').addClass('active')
        $('.page[data-page="' + page + '"]').addClass('active')
    }
}

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
        ipcRenderer.send('get_settings')
    }
})

var editor = new Vue({
    el: '#editor',
    data: {
        file: '',
        text: '',
        display: 'hide-editor',
        save_btn: false
    }
})

var php = new Vue({
    el: '#php',
    data: {
        php_ver: [],
        php_cur: ''
    },
    mounted: function () {
        ipcRenderer.send('get_php_ver')
        ipcRenderer.send('get_cur_php_ver')
    },
    methods: {
        phpCurrent: function (php_cur, ver) {
            if (php_cur == ver) {
                return 'enabled'
            }
        },
        setPhpVer: function (event) {
            if (!event.target.classList.contains('enabled')) {
                var _en_ver = $(event.target).text()
                var _data = {
                    en_ver: _en_ver,
                    all_ver: this.php_ver
                }
                ipcRenderer.send('set_php_ver', _data)
            }
        }
    }
})

ipcRenderer.on('system-res', (event, resp) => {
    terminal.text += '[' + new Date().toLocaleTimeString('ru-RU', {
        timeZone: 'Europe/Moscow'
    }) + '] ' + resp + '\n'
})
ipcRenderer.on('php-available', (event, resp) => {
    php.php_ver = resp
})
ipcRenderer.on('php-current', (event, resp) => {
    php.php_cur = resp
})
ipcRenderer.on('settings-data', (event, resp) => {
    settings.settings = resp
})
ipcRenderer.on('to-editor', (event, resp) => {
    editor.display = 'show-editor'
    editor.text = resp
})

openPage('apache')

$('.js-button').on('click', function () {
    var _exec = $(this).attr('data-exec')
    ipcRenderer.send(_exec)
})

$('.js-button-open').on('click', function () {
    var _exec = $(this).attr('data-exec')
    var _file = $(this).attr('data-file')
    if ($(this).hasClass('with-save') && _file) {
        editor.save_btn = true
        editor.file = settings.settings[_file]
    }
    ipcRenderer.send(_exec)
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

$('#settings input').on('input propertychange', function () {
    var _prop = $(this).attr('name')
    $('button[data-save="' + _prop + '"]').removeClass('hide').addClass('show')
})

$('.js-save').on('click', function () {
    $(this).removeClass('show').addClass('hide')
    if (settings.settings.projects_path.slice(-1) !== '/') {
        settings.settings.projects_path = settings.settings.projects_path + '/'
    }
    ipcRenderer.send('write_settings', settings.settings)
})

$('.js-close-editor').on('click', function () {
    editor.display = 'hide-editor'
    editor.save_btn = false
})

$('.js-save-editor').on('click', function () {
    var _data = {
        file: editor.file,
        text: editor.text
    }
    ipcRenderer.send('save_file', _data)
})