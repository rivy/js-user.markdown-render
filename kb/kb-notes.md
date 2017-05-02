## plans

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
