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
        }]
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
        ipcRenderer.send('get_php_ver')
    }
})

var editor = new Vue({
    el: '#editor',
    data: {
        text: '',
        display: 'hide-editor'
    }
})

ipcRenderer.on('system-res', (event, resp) => {
    terminal.terminal_items.push({
        time: new Date(),
        text: resp
    })
    $('#terminal').stop().animate({
        scrollTop: $('#terminal')[0].scrollHeight
    }, 800)
})
ipcRenderer.on('php-available', (event, resp) => {
    settings.php_ver = resp
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
    let _exec = $(this).attr('data-exec')
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
})