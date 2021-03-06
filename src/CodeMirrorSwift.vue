<template>
  <textarea />
</template>

<script>
const theme = 'one-dark'
const mode = { name: 'swift' }
const CodeMirror = require('codemirror/lib/codemirror.js')
require('codemirror/lib/codemirror.css')
require(`../themes/${theme}.css`)

export default {
  props: {
    code: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: () => false
    },
    options: {
      type: Object,
      default: function () {
        return {
          extraKeys: this.keyMap,
          mode: mode,
          readOnly: this.readonly,
          lineNumbers: true,
          lineWrapping: true,
          indentWithTabs: false,
          tabSize: 4,
          indentUnit: 4,
          autoCloseBrackets: true,
          styleActiveLine: true,
          undoDepth: 100,
          historyEventDelay: 500,
        }
      }
    },
    lintOptions: {
      type: Object,
      default: function () {
        return { sub: true }
      }
    },
    replaceRange: {
      type: Object,
      default: function () {
        return null
      }
    }
  },
  data: function () {
    return {
      content: '',
      editor: null,
      keyMap: { 'Ctrl-Space': 'autocomplete'},
      changesCounter: 0
    }
  },
  watch: {
    code (newVal, oldVal) {
      const editorValue = this.editor.getValue()
      if (newVal !== editorValue) {
        let scrollInfo = this.editor.getScrollInfo()
        this.editor.setValue(newVal)
        this.content = newVal
        this.editor.scrollTo(scrollInfo.left, scrollInfo.top)
      }
    },
    value (newVal, oldVal) {
      const editorValue = this.editor.getValue()
      if (newVal !== editorValue) {
        let scrollInfo = this.editor.getScrollInfo()
        this.editor.setValue(newVal)
        this.content = newVal
        this.editor.scrollTo(scrollInfo.left, scrollInfo.top)
      }
    },
    readonly () {
      this.editor.setOption('readOnly', this.readonly)
      let codeMirrorEl = document.querySelector('.CodeMirror-wrap', this.$el.parentElement)
      if (this.readonly) {
        codeMirrorEl.classList.add('readonly')
      } else {
        codeMirrorEl.classList.remove('readonly')
      }
    },
    /**
     * Replace string from & to a certain range. If `to` is equal to `from` it will just insert a string at that position.
     * @see https://codemirror.net/doc/manual.html#replaceRange
     */
    replaceRange: {
      handler (newVal, oldVal) {
        if (newVal && this.editor) {
          const cursor = this.editor.getCursor()
          const cursorLineAndCh = {
            line: cursor.line,
            ch: cursor.ch
          }
          const insert = {
            ...newVal,
            from: newVal.from || cursorLineAndCh,
            to: newVal.to || cursorLineAndCh
          }
          this.editor.replaceRange(
            insert.replacement,
            insert.from,
            insert.to
          )
        }
      },
      deep: true
    }
  },
  created () {
    // Require language mode config & basic addons.
    require(`codemirror/mode/swift/swift.js`)
    require('codemirror/addon/edit/closebrackets.js')
    require('codemirror/addon/search/match-highlighter.js')
    require('codemirror/addon/selection/active-line.js')
    require('codemirror/addon/edit/matchbrackets.js')
  },
  mounted () {
    const options = { ...this.options, lint: this.lintOptions, theme: theme }
    this.editor = CodeMirror.fromTextArea(this.$el, options)
    this.editor.setValue(this.code || this.value || this.content)
    this.editor.addKeyMap(this.keyMap)
    this.editor.on('change', (cm, changeObj) => {
      this.updateChangesCounter(changeObj.origin)
      this.firstLoaded = false
      this.content = cm.getValue()
      if (this.$emit) {
        this.$emit('changed', this.content)
        this.$emit('input', this.content)
      }
    })
    this.editor.on('cursorActivity', (cm) => {
      if (this.$emit) {
        this.$emit('cursor', this.cursorContext(cm))
      }
    })
  },
  beforeDestroy () { 
    this.editor.getWrapperElement().remove()
  },
  methods: {
    cursorContext (cm) {
      let cursor = cm.getCursor(), line = cm.getLine(cursor.line)
      let start = cursor.ch, end = cursor.ch
      while (start && /[\wæøåÆØÅ]/.test(line.charAt(start - 1))) --start
      while (end < line.length && /[\wæøåÆØÅ]/.test(line.charAt(end))) ++end
      let word = line.slice(start, end)
      return {
        word,
        start,
        end,
        line: cursor.line
      }
    },
    clearEditorHistory () {
      this.editor.setValue('')
      this.changesCounter = 0
      this.editor.clearHistory()
    },
    determineCursorPosition () {
      let cursor = this.editor.getCursor()
      return {line: cursor.line - this.emptyLinesAtTheBeginningCount(), ch: cursor.ch}
    },
    emptyLinesAtTheBeginningCount () {
      let emptyLinesNumber = 0
      for(let i = 0; i < this.editor.lineCount(); i++) {
        if (!this.editor.getLine(i) || !this.editor.getLine(i).trim()) {
          emptyLinesNumber++
        } else {
          return emptyLinesNumber
        }
      }
    },
    updateChangesCounter (changeOrigin) {
      if (changeOrigin === 'undo') {
        this.changesCounter--
      } else {
        this.changesCounter++
      }
    }
  }
}
</script>