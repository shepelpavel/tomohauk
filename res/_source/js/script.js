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
            time: Date.now,
            text: '... started'
        }]
    }
})

ipcRenderer.on('system-res', (event, resp) => {
    terminal.terminal_items.push({
        time: Date.now,
        text: resp
    })
});

$('.js-button').on('click', function () {
    let _exec = $(this).attr('data-exec')
    ipcRenderer.send(_exec)
});