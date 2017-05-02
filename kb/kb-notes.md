## plans

### code display implementation

see CodeMirror implementation with a JSFiddle-style theme @ <https://jsfiddle.net/rivy/r8emrr46/18>
see clipboard button implementation(s) for CodeMirror @ <http://jsfiddle.net/rivy/q8n4tsub/5> (from <http://stackoverflow.com/questions/9492842/does-codemirror-provide-cut-copy-and-paste-api/33182647#33182647> @@ <http://archive.is/dcYQb>)

Additionally, possibly add a 'toolbar', similar to <http://jagthedrummer.github.io/codemirror-ui> (repo @ <https://github.com/jagthedrummer/codemirror-ui>). The toolbar could contain the clipboard button as well as language, name/caption information. Alternatively, the panel addon from CodeMirror could be used (see `display/panel.js` within <http://codemirror.net/doc/manual.html#addons>). The "CodeMirror buttons addon" (see <https://github.com/samdark/codemirror-buttons>) may be a useful tool or reference as well.

There are further addons listed at <https://github.com/codemirror/CodeMirror/wiki/CodeMirror-addons>.

New CodeMirror themes (such as Humane or Humanity/Humanx) may be developed at <http://mkaminsky11.github.io/codemirror-themes> (repo at <https://github.com/mkaminsky11/codemirror-themes>).

### dynamic loading

Both PrismJS and CodeMirror require loading of language files which are not automatically loaded. Some of the most common ones can be using the jQuery method. But a more dynamic method loading the needed languages on the fly might be better. RequireJS (see <http://requirejs.org/docs/api.html>) may be helpful with this instead of refactoring / adding code to the current jQuery `load...` methods.
