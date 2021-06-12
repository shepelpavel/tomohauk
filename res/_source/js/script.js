const {
    app,
    BrowserWindow,
    ipcRenderer
} = require('electron')
const path = require('path')
const fs = require('fs')
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
        settings_file: './../settings/settings.json',
        settings: {}
    },
    mounted: function () {
        $.getJSON(this.settings_file, function (json_settings) {
            settings.settings = json_settings
        })
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
    ipcRenderer.send('write_settings', settings.settings)
})