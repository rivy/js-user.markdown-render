## plans

### `lang='en'` attribute

* needed for automatic CSS hypenation
* allow changing ? via meta tag hoisted to head or body?

ref: https://www.w3.org/International/questions/qa-html-language-declarations
ref: http://blog.adrianroselli.com/2015/01/on-use-of-lang-attribute.html @@ http://archive.is/H0ExZ (older, better typeography) + http://archive.is/chYjS


### MathJax can't handle single `$` signal characters

Currently, because *MathJax* can't handle single `$` signal characters,`$\phantom{}` ... `\phantom{}$` are used as a *hack-ish* method of implementing inline LaTeX that works for both `pandoc` and markdown. It is possible that KaTeX may offer a more compatible solution when the no `quirks` mode issue is resolved.

* see

### Printing Fidelity / Issues

#### `@page` CSS

Currently, [2017-05], headers and footers of printed media are not malleable. The CSS3 `@page` class may allow furture customization for improved book-like output.

#### improve print fidelity for CodeMirror

* current printing leaves fairly large un-even gaps around code, especially code containing a scrollbar
  - currently using JavaScript to using CM.refresh() which reduces some of the issue
    - ? a CSS issue, related to the need to set additional CSS beyond the declared `.CodeMirror, .CodeMirror-scroll { height: auto; } .CodeMirror-gutters {height: auto !important}`
  - ? dynamically change to/from word-wrapping
  - see <https://github.com/codemirror/CodeMirror/issues/3123> and re-open / discuss

ref: http://stackoverflow.com/questions/3339789/onbeforeprint-and-onafterprint-equivalent-for-non-ie-browsers/15662720#15662720 @@ http://archive.is/y6aoM
ref: https://www.tjvantoll.com/2012/06/15/detecting-print-requests-with-javascript @@ http://archive.is/FXABE

### CodeMirror mode loading change

* possible optimization

see "mode/loadmode.js" from CodeMirror

Defines a CodeMirror.requireMode(modename, callback) function that will try to load a given mode and call the callback when it succeeded. You'll have to set CodeMirror.modeURL to a string that mode paths can be constructed from, for example "mode/%N/%N.js"—the %N's will be replaced with the mode name. Also defines CodeMirror.autoLoadMode(instance, mode), which will ensure the given mode is loaded and cause the given editor instance to refresh its mode when the loading succeeded. See the demo."

* use something similar to this to load and refresh the individual CodeMirror editors (keeping track of previously loaded languages); this will prevent delaying the render until the CodeMirror modes are loaded

### code display implementation

see CodeMirror implementation with a JSFiddle-style theme @ <https://jsfiddle.net/rivy/r8emrr46/18>
see clipboard button implementation(s) for CodeMirror @ <http://jsfiddle.net/rivy/q8n4tsub/5> (from <http://stackoverflow.com/questions/9492842/does-codemirror-provide-cut-copy-and-paste-api/33182647#33182647> @@ <http://archive.is/dcYQb>)

Additionally, possibly add a 'toolbar', similar to <http://jagthedrummer.github.io/codemirror-ui> (repo @ <https://github.com/jagthedrummer/codemirror-ui>). The toolbar could contain the clipboard button as well as language, name/caption information. Alternatively, the panel addon from CodeMirror could be used (see `display/panel.js` within <http://codemirror.net/doc/manual.html#addons>). The "CodeMirror buttons addon" (see <https://github.com/samdark/codemirror-buttons>) may be a useful tool or reference as well. "w2ui" (<https://w2ui.com>; repo @ <https://github.com/vitmalina/w2ui>) may have some helpful UI tools to clean up the look.

There are further addons listed at <https://github.com/codemirror/CodeMirror/wiki/CodeMirror-addons>.

New CodeMirror themes (such as Humane or Humanity/Humanx) may be developed at <http://mkaminsky11.github.io/codemirror-themes> (repo at <https://github.com/mkaminsky11/codemirror-themes>).

FontAwesome (see http://fontawesome.io/get-started) may be useful for iconography.

### dynamic loading

Both PrismJS and CodeMirror require loading of language files which are not automatically loaded. Some of the most common ones can be using the jQuery method. But a more dynamic method loading the needed languages on the fly might be better. RequireJS (see <http://requirejs.org/docs/api.html>) may be helpful with this instead of refactoring / adding code to the current jQuery `load...` methods.

### investigate

#### "markdown-it-decorate"

Look into "markdown-it-decorate" as an alternative to "markdown-it-attr".

The attributes are hidden to other markdown processors, but may need massaging for pandoc compatiblity.

#### "markdown-it-sub" & "markdown-it-sup"

For super/subscript markdown ...

"markdown-it-sub", repo @ <https://github.com/markdown-it/markdown-it-sub>

"markdown-it-sup", repo @ <https://github.com/markdown-it/markdown-it-sup>

#### "markdown-it-pandoc-renderer"

info @ <https://www.npmjs.com/package/markdown-it-pandoc-renderer>; repo @ <https://github.com/classeur/markdown-it-pandoc-renderer>

#### "markdown-it-meta"

For parsing YAML front matter...

info / repo @ <https://github.com/CaliStyle/markdown-it-meta>

#### "markdown-it-replacements"

For parsing "em-dash", "en-dashes", ellipses, and "plus-minus" symbols...

info / repo @ <https://github.com/edemaine/markdown-it-replacements>

The main script file is written in coffee script... not sure how that effects direct loading within a UserScript.

#### show "rendering" text

Instead of the progressive changes to the markdown page being visible, @run-at document-start and hide the page content until it's rendered, possibly showing some sort of progression text. A discussion for page hiding during calculations, containing some UserScript, is at <https://forum.tampermonkey.net/viewtopic.php?t=301>[`@@`]<http://archive.is/xxM0f>.
