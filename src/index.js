const CodeMirror = require('codemirror/lib/codemirror.js')
const CmComponent = require('./CodeMirror.vue')

module.exports = {
  CodeMirror: CodeMirror,
  codemirror: CmComponent,
  install: function(Vue) {
    Vue.component('codemirror', CmComponent)
  }
}