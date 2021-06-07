const {
    app,
    BrowserWindow,
    ipcRenderer
} = require('electron')
const path = require('path')
const fs = require('fs');
const $ = require('./../_assets/module/jquery/jquery.min.js')
const Vue = require('./../_assets/module/vue/vue.min.js')

function runBashScript(options) {
    ipcRenderer.send('run-bash-script-req', options)
}

ipcRenderer.on('system-res', (event, arg) => {
    console.log(arg)
});

$('#run').on('click', function () {
    runBashScript('options')
});

var app5 = new Vue({
    el: '#app-5',
    data: {
        message: 'Привет, Vue.js!'
    },
    methods: {
        reverseMessage: function () {
            this.message = this.message.split('').reverse().join('')
        }
    }
})