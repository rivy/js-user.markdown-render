2019-08-17
==========

  * add 'markdown-it-replacements' to fix faulty 'markdown-it' ellipsis replacment
  * update to markdown-it@9.0+
  * change ~ remove CSS 'blockquote bulge'
  * add ~ blockquote types
  * refactor ~ use local MathJax3 (beta) for math rendering
  * refactor ~ improve CDN URL usage (DRY)
  * add header anchors (via 'markdown-it-anchor'; with CSS)
  * docs ~ polish and update README (for new distribution model)
  * maint ~ spelling/spellcheck improvements
  * change ~ add dev dependencies for script and CSS handling
  * upgrade 'clipboard' module
  * change ~ update author info
  * change ~ remove local copy of CodeMirror themes (using node_modules\... instead)
  * add local copy of normalization CSS
  * wip ~ todo for browser global module name generation
  * docs ~ README improvements
  * maint ~ lint and spelling corrections
  * add .gitignore (including 'node_modules')
  * update VERSION
  * docs ~ update README
  * add support for YAML front matter
  * change! to modular, local-only ('static') version
    - single 'static', lazy, local, packed script
    - use webpack as build tool
    - terser webpack plugin; compressed and uncompressed dist files
    - activate 'devtool:source-map' enabling uncompressed output

2019-03-18
==========

  * initialize as an NPM module

2019-03-16
==========

  * update VERSION
  * change ~ add single dollars as possible inline math signal characters
  * docs ~ update notes/ToDO
  * wip ~ refactor ~ refactor variable use (add var/const where invariant is expected)
  * maint ~ update comments and whitespace
  * update author info
  * update 'bracketed-spans' plugin
  * add notation for possible future KaTeX rendering
  * add 'bracketed-spans' plugin for 'markdown-it'
  * update MathJax and KaTeX versions

2019-03-15
==========

  * change from deprecated rawgit to jsdelivr CDN
  * maint ~ spelling improvements
  * update notes
  * add .editorconfig

2018-01-30
==========

  * change ~ use updated CSS (via CDN)
  * change ~ improve CodeMirror block aesthestics (in !override CSS)

2018-01-28
==========

  * docs ~ add references and some explanatory comments to CSS
  * docs ~ clarity and phrasing improvements

2018-01-12
==========

  * change ~ use updated CSS (via CDN)
  * change ~ improve list aesthetics (in base CSS)
  * update ~ ToDOs
  * docs ~ add local file access instructions to README

2018-01-10
==========

  * change ~ use updated CSS (via CDN)
  * change ~ improve reponsive page width aesthetics (in base CSS)
  * change ~ improve base CSS
  * maint ~ update notes / ToDOs
  * fix ~ add basic prefix gutter CSS

2018-01-09
==========

  * change ~ use updated CSS (via CDN)
  * change ~ improve base CSS
  * maint ~ improve README

2018-01-07
==========

  * update ~ upstream 'markdown-it-attrs' to v1.2.1
  * update ~ README

2018-01-06
==========

  * add ~ README
  * change ~ full implementation of gutter prefix area
  * update ~ use updated CSS (via CDN)
  * update ~ notes
  * change ~ improve base CSS
  * change ~ improve parsing of code language/mode

2018-01-05
==========

  * update ~ use updated CSS (via CDN)
  * fix ~ base CSS
  * update ~ improve base CSS
  * update ~ improve alignment of clip button appearance between browsers
  * update ~ DRY refactor of URLs
  * update ~ clean up CSS URLs
  * update ~ script source URL
  * fix ~ align snippet button CSS with bootstrap-reboot

2018-01-04
==========

  * add ~ Bootstrap 'reboot' CSS
  * fix ~ line-wrapped code blocks also sometimes need gutter adjustment

2018-01-03
==========

  * fix ~ MathJax rendering requires access to 'unsafeWindow' when using the user-script sandbox
  * fix ~ logic error within Chrome gutter HACK
  * fix ~ narrow Chrome gutter height HACK to just Chrome browsers
  * update ~ CodeMirror version => 5.33.0
  * fix ~ implement gutter height HACK for Chrome height miscalculations

2018-01-02
==========

  * update ~ VERSION
  * add ~ initial implementation of a gutter prefix area
  * fix ~ remove superfluous selection CSS (already in 'css\!override.css')
  * fix ~ improve CodeMirror 'auto' height CSS
  * fix ~ eliminate duplicate theme CSS downloads in transform_codeblocks_to_CodeMirror()
  * fix ~ clipboard.js collision with new Chrome v61+ clipboard API
  * fix ~ filter out null/empty uris in load_assets(), avoiding exceptions

2018-01-01
==========

  * add ~ load_assets(): extend uri_extension calculation to consider hash fragment when missing from URI path
  * fix ~ load_assets(): uri_extension duplicates uri_filename when missing
  * add ~ user CSS customization (via GM_config + menu access)
  * update ~ upstream 'markdown-it-attrs' to v1.2.0
  * fix ~ dequote(): incorrect matching logic
  * change ~ improve UX; add trailing newline when copied using snippet button
  * update ~ VERSION
  * change ~ add placeholder reminders for possible later asset loading refactor
  * fix ~ add additional JIT theme loading for CodeMirror
  * change ~ jshint + code improvements
