(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.CodeMirrorSwift = {}));
}(this, function (exports) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var theme = 'one-dark';
  var mode = {
    name: 'swift'
  };

  var CodeMirror = require('codemirror/lib/codemirror.js');

  require('codemirror/lib/codemirror.css');

  require("../themes/".concat(theme, ".css"));

  var script = {
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
        default: function _default() {
          return false;
        }
      },
      options: {
        type: Object,
        default: function _default() {
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
            historyEventDelay: 500
          };
        }
      },
      lintOptions: {
        type: Object,
        default: function _default() {
          return {
            sub: true
          };
        }
      },
      replaceRange: {
        type: Object,
        default: function _default() {
          return null;
        }
      }
    },
    data: function data() {
      return {
        content: '',
        editor: null,
        keyMap: {
          'Ctrl-Space': 'autocomplete'
        },
        changesCounter: 0
      };
    },
    watch: {
      code: function code(newVal, oldVal) {
        var editorValue = this.editor.getValue();

        if (newVal !== editorValue) {
          var scrollInfo = this.editor.getScrollInfo();
          this.editor.setValue(newVal);
          this.content = newVal;
          this.editor.scrollTo(scrollInfo.left, scrollInfo.top);
        }
      },
      value: function value(newVal, oldVal) {
        var editorValue = this.editor.getValue();

        if (newVal !== editorValue) {
          var scrollInfo = this.editor.getScrollInfo();
          this.editor.setValue(newVal);
          this.content = newVal;
          this.editor.scrollTo(scrollInfo.left, scrollInfo.top);
        }
      },
      readonly: function readonly() {
        this.editor.setOption('readOnly', this.readonly);
        var codeMirrorEl = document.querySelector('.CodeMirror-wrap', this.$el.parentElement);

        if (this.readonly) {
          codeMirrorEl.classList.add('readonly');
        } else {
          codeMirrorEl.classList.remove('readonly');
        }
      },
      replaceRange: {
        handler: function handler(newVal, oldVal) {
          if (newVal && this.editor) {
            var cursor = this.editor.getCursor();
            var cursorLineAndCh = {
              line: cursor.line,
              ch: cursor.ch
            };

            var insert = _objectSpread({}, newVal, {
              from: newVal.from || cursorLineAndCh,
              to: newVal.to || cursorLineAndCh
            });

            this.editor.replaceRange(insert.replacement, insert.from, insert.to);
          }
        },
        deep: true
      }
    },
    created: function created() {
      require("codemirror/mode/swift/swift.js");

      require('codemirror/addon/edit/closebrackets.js');

      require('codemirror/addon/search/match-highlighter.js');

      require('codemirror/addon/selection/active-line.js');

      require('codemirror/addon/edit/matchbrackets.js');
    },
    mounted: function mounted() {
      var _this = this;

      var options = _objectSpread({}, this.options, {
        lint: this.lintOptions,
        theme: theme
      });

      this.editor = CodeMirror.fromTextArea(this.$el, options);
      this.editor.setValue(this.code || this.value || this.content);
      this.editor.addKeyMap(this.keyMap);
      this.editor.on('change', function (cm, changeObj) {
        _this.updateChangesCounter(changeObj.origin);

        _this.firstLoaded = false;
        _this.content = cm.getValue();

        if (_this.$emit) {
          _this.$emit('changed', _this.content);

          _this.$emit('input', _this.content);
        }
      });
      this.editor.on('cursorActivity', function (cm) {
        if (_this.$emit) {
          _this.$emit('cursor', _this.cursorContext(cm));
        }
      });
    },
    beforeDestroy: function beforeDestroy() {
      this.editor.getWrapperElement().remove();
    },
    methods: {
      cursorContext: function cursorContext(cm) {
        var cursor = cm.getCursor(),
            line = cm.getLine(cursor.line);
        var start = cursor.ch,
            end = cursor.ch;

        while (start && /[\wæøåÆØÅ]/.test(line.charAt(start - 1))) {
          --start;
        }

        while (end < line.length && /[\wæøåÆØÅ]/.test(line.charAt(end))) {
          ++end;
        }

        var word = line.slice(start, end);
        return {
          word: word,
          start: start,
          end: end,
          line: cursor.line
        };
      },
      clearEditorHistory: function clearEditorHistory() {
        this.editor.setValue('');
        this.changesCounter = 0;
        this.editor.clearHistory();
      },
      determineCursorPosition: function determineCursorPosition() {
        var cursor = this.editor.getCursor();
        return {
          line: cursor.line - this.emptyLinesAtTheBeginningCount(),
          ch: cursor.ch
        };
      },
      emptyLinesAtTheBeginningCount: function emptyLinesAtTheBeginningCount() {
        var emptyLinesNumber = 0;

        for (var i = 0; i < this.editor.lineCount(); i++) {
          if (!this.editor.getLine(i) || !this.editor.getLine(i).trim()) {
            emptyLinesNumber++;
          } else {
            return emptyLinesNumber;
          }
        }
      },
      updateChangesCounter: function updateChangesCounter(changeOrigin) {
        if (changeOrigin === 'undo') {
          this.changesCounter--;
        } else {
          this.changesCounter++;
        }
      }
    }
  };

  function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
  /* server only */
  , shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
      createInjectorSSR = createInjector;
      createInjector = shadowMode;
      shadowMode = false;
    } // Vue.extend constructor export interop.


    var options = typeof script === 'function' ? script.options : script; // render functions

    if (template && template.render) {
      options.render = template.render;
      options.staticRenderFns = template.staticRenderFns;
      options._compiled = true; // functional template

      if (isFunctionalTemplate) {
        options.functional = true;
      }
    } // scopedId


    if (scopeId) {
      options._scopeId = scopeId;
    }

    var hook;

    if (moduleIdentifier) {
      // server build
      hook = function hook(context) {
        // 2.3 injection
        context = context || // cached call
        this.$vnode && this.$vnode.ssrContext || // stateful
        this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
        // 2.2 with runInNewContext: true

        if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
          context = __VUE_SSR_CONTEXT__;
        } // inject component styles


        if (style) {
          style.call(this, createInjectorSSR(context));
        } // register component module identifier for async chunk inference


        if (context && context._registeredComponents) {
          context._registeredComponents.add(moduleIdentifier);
        }
      }; // used by ssr in case component is cached and beforeCreate
      // never gets called


      options._ssrRegister = hook;
    } else if (style) {
      hook = shadowMode ? function () {
        style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
      } : function (context) {
        style.call(this, createInjector(context));
      };
    }

    if (hook) {
      if (options.functional) {
        // register for functional component in vue file
        var originalRender = options.render;

        options.render = function renderWithStyleInjection(h, context) {
          hook.call(context);
          return originalRender(h, context);
        };
      } else {
        // inject component registration as beforeCreate hook
        var existing = options.beforeCreate;
        options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
      }
    }

    return script;
  }

  var normalizeComponent_1 = normalizeComponent;

  /* script */
  const __vue_script__ = script;

  /* template */
  var __vue_render__ = function() {
    var _vm = this;
    var _h = _vm.$createElement;
    var _c = _vm._self._c || _h;
    return _c("textarea")
  };
  var __vue_staticRenderFns__ = [];
  __vue_render__._withStripped = true;

    /* style */
    const __vue_inject_styles__ = undefined;
    /* scoped */
    const __vue_scope_id__ = undefined;
    /* module identifier */
    const __vue_module_identifier__ = undefined;
    /* functional template */
    const __vue_is_functional_template__ = false;
    /* style inject */
    
    /* style inject SSR */
    

    
    var component = normalizeComponent_1(
      { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
      __vue_inject_styles__,
      __vue_script__,
      __vue_scope_id__,
      __vue_is_functional_template__,
      __vue_module_identifier__,
      undefined,
      undefined
    );

  function install(Vue) {
    if (install.installed) return;
    install.installed = true;
    Vue.component('CodeMirrorSwift', component);
  }
  var plugin = {
    install: install
  };
  var GlobalVue = null;

  if (typeof window !== 'undefined') {
    GlobalVue = window.Vue;
  } else if (typeof global !== 'undefined') {
    GlobalVue = global.Vue;
  }

  if (GlobalVue) {
    GlobalVue.use(plugin);
  }

  exports.install = install;
  exports.default = component;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
