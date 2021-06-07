const {
    app,
    BrowserWindow,
    ipcRenderer
} = require('electron')
const path = require('path')
const fs = require('fs');
const $ = require('./../_assets/module/jquery/jquery.min.js')
const Vue = require('./../_assets/module/vue/vue.min.js')

let terminal = new Vue({
    el: '#terminal',
    data: {
        terminal_items: [{
            time: new Date(),
            text: '... started'
        }]
    }
})

ipcRenderer.on('system-res', (event, resp) => {
    terminal.terminal_items.push({
        time: new Date(),
        text: resp
    })
    $('#terminal').stop().animate({
        scrollTop: $('#terminal')[0].scrollHeight
    }, 800);
});

$('.js-button').on('click', function () {
    let _exec = $(this).attr('data-exec')
    ipcRenderer.send(_exec)
});