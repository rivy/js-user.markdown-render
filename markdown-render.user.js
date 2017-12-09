// ==UserScript==
// @name        markdown-render
// @namespace   com.houseofivy
// @description renders markdown files
//
// @version     0.139
// @//updateURL   https://raw.githubusercontent.com/rivy/gms-markdown_viewer.custom-css/master/markdown_viewer.custom-css.user.js
//
// file extension: .m(arkdown|kdn?|d(o?wn)?)
// @include     file://*.markdown
// @include     file://*.mkdn
// @include     file://*.mkd
// @include     file://*.mdown
// @include     file://*.mdwn
// @include     file://*.md
//
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
//
// @grant       none
// ==/UserScript==

(function( /* USERjs, */ window, $ ){
'use strict';

// #### config

// note: using cloudflare (primary) and rawgit CDNs ~ for rawgit, (see https://github.com/rgrove/rawgit/blob/master/FAQ.md @@ http://archive.is/rMkAp)
// note: see CDN ref @ https://cdnjs.com
var CDN_base_url = '//cdnjs.cloudflare.com/ajax/libs/';
var CM_base_url = CDN_base_url + 'codemirror/5.25.0/';
var CSS_base_url = '//cdn.rawgit.com/rivy/js-user.markdown-render/fc3bd254160472a626686d317134ae8b4bd39620/css/';
var assets_js = [
  // clipboard support
  CDN_base_url + "clipboard.js/1.6.1/clipboard.min.js",
  // markdown conversion
  CDN_base_url + "markdown-it/8.3.1/markdown-it.min.js",
  // markdown-it ~ definition lists
  "//cdn.rawgit.com/markdown-it/markdown-it-deflist/8f2414f23316a2ec1c54bf4631a294fb2ae57ddd/dist/markdown-it-deflist.min.js", // markdown-it-deflist-2.0.1
  // markdown-it ~ attributes (pandoc compatible)
  "//cdn.rawgit.com/arve0/markdown-it-attrs/ce98279c9d3ad32bc0f94a9c1ab1206e6a9abaa8/markdown-it-attrs.browser.js", // markdown-it-attrs-0.8.0
  // markdown-it ~ footnotes
  CDN_base_url + "markdown-it-footnote/3.0.1/markdown-it-footnote.min.js",
  // markdown-it ~ YAML :: ? ... see https://github.com/CaliStyle/markdown-it-meta
  // CodeMirror / highlighting
  CM_base_url + "codemirror.min.js",
  CM_base_url + "mode/meta.min.js",
  CM_base_url + "addon/runmode/runmode.min.js",
  CM_base_url + "addon/runmode/colorize.min.js",
  CM_base_url + "addon/selection/mark-selection.js",
  // MathJax
//  CDN_base_url + "mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML&delayStartupUntil=configured",
  //CDN_base_url + "mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML",
//  ],
  //// KaTeX
  //CDN_base_url + "KaTeX/0.7.1/katex.min.js",
  //CDN_base_url + "KaTeX/0.7.1/contrib/auto-render.min.js",
  ];
var assets_css = [
  // reset ~ see http://meyerweb.com/eric/tools/css/reset @@ http://archive.is/XvC4w
  // ... see https://stackoverflow.com/questions/3388705/why-is-a-table-not-using-the-body-font-size-even-though-i-havent-set-the-table/3388766#3388766 @@ http://archive.is/wePmk
  CDN_base_url + "meyer-reset/2.0/reset.min.css",
//  // ref: [normalize] http://necolas.github.io/normalize.css @@ http://archive.is/Fo0od ; info: http://nicolasgallagher.com/about-normalize-css @@ http://archive.is/RSXip ; repo: https://github.com/necolas/normalize.css
//  "//cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css",
  // basic
  CSS_base_url + "_default.css",
  CSS_base_url + "_fontface.css",
  CSS_base_url + "base.css",
//  "//raw.githubusercontent.com/Thiht/markdown-viewer/master/chrome/lib/sss/sss.css",
//  "//raw.githubusercontent.com/Thiht/markdown-viewer/master/chrome/lib/sss/sss.print.css",
  // tooltip CSS
  CSS_base_url + "tooltips.css",
  // syntax highlighter
  CM_base_url + "codemirror.min.css",
  // overrides (* last in order to override prior CSS, without requiring increased CSS specificity)
  CSS_base_url + "!override.css",
  ];

// #### main()

(function main(){

console.log('document.compatMode = ' + document.compatMode);

$.when([])  // `.when([])` resolves immediately
    .then( ()=>{ return load_raw_text(); } )
    .then( ()=>{ return $('html').attr('lang','en'); } ) // ref: http://blog.adrianroselli.com/2015/01/on-use-of-lang-attribute.html @@ http://archive.is/H0ExZ (older, better typography) + http://archive.is/chYjS
    .then( ()=>{ return load_assets( assets_css.concat( assets_js ) ); } )
    .then( ()=>{ return $.when(
                   do_render() ,
                   $.getScript( [ 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML&delayStartupUntil=configured' ] ).then( trigger_render_MathJax ).then( ()=>{console.log('MathJax triggered');} ) , // ToDO: discuss the MathJax requirement for `$.getScript( ... )` instead of being able to `eval( ... )` with a MathJax root config on <https://github.com/mathjax/MathJax/issues>
                   $.when([]) // placeholder at end-of-list (only syntactic sugar)
                   );
               }
         )
    //.then( function(){ console.log( 'main(): promise chain completed' ); })
    //.done( function(){ console.log( 'main(): DONE ' ); } )
    //.catch( function(){ console.log( 'main(): CATCH ' ); } )
    //.always( function(){ console.log( 'main(): ALWAYS ' ); } )
    ;
})();

// #### subs

function do_render() { // () : {jQuery.Deferred}
    let _ME = 'do_render()';
    console.log(_ME + ': rendering markdown');
    let original = $('body pre').text();
    let render = render_markdown( original );
    $('body pre').remove();
    $('<div style="display:none"/>').html( $('<pre/>').text( original ) ).attr('id', '_src').appendTo('body');
    $('<div/>').html( render ).appendTo('body');

    console.log(_ME + ': write data for CODE');
    set_code_data();

    console.log(_ME + ': package codeblocks');
    package_codeblocks();

    // find any needed CodeMirror modes (for lazy loading)
    let CodeMirror_mode_js_map = new Map();
//    $('code [class*="language-"]').each( function( index ) {
    $('code').each( function( index ) {
        let $CODE = $(this);
        let name = get_language_name( $CODE );
        let mime = get_language_mime( $CODE );
        if ((name === mime) && (name === undefined)) { return; }
        let CM_mode = find_CM_mode( mime ) || find_CM_mode( name );
        if ((CM_mode.mode === 'null') || (mime === 'text/plain') || (name === 'none') || (name === 'null') || (name === 'plain')) { return; }
        if ( ! CM_mode ) { warn(`unknown code language ('${name}'; mime:'${mime}')`); return; }
        let CM_mode_template = CM_base_url + "mode/%N/%N.min.js";
        let CM_mode_uri = CM_mode_template.replace(/%N/g, CM_mode.mode);
        ///console.log(`found CodeMirror.mode='${CM_mode.mode}' for language='${name}'; URL = '${CM_mode_uri}'`);
        CodeMirror_mode_js_map.set( CM_mode_uri, (CodeMirror_mode_js_map.get( CM_mode_uri ) || 0) + 1 );
//        CodeMirror_mode_js_map.set( CM_mode_uri, true );
        });

    // find any needed CodeMirror themes (for lazy loading)
    let CodeMirror_theme_css_map = new Map();
    $('code').each( function( index ) {
        let $CODE = $(this);
        let theme = get_theme( $CODE );
        if ((theme === undefined) || (theme === 'default')) { return; }
        let CM_theme_template = CM_base_url + "theme/%N.min.css";
        let CM_theme_uri = CM_theme_template.replace(/%N/g, (theme.split(/[\s.]+/))[0]);
        console.log(`found needed theme='${theme}'; URL = '${CM_theme_uri}'`);
        CodeMirror_theme_css_map.set( CM_theme_uri, (CodeMirror_theme_css_map.get( theme ) || 0) + 1 );
        });

    let assets = Array.from(CodeMirror_theme_css_map.keys()).concat(Array.from(CodeMirror_mode_js_map.keys()));

    return $.when([])
        .then( ()=>{ return load_assets( assets, undefined, true ); } )
        .then( ()=>{
            console.log(_ME + ': transform codeblocks');
            // required CSS
            // ToDO: discuss the need for '.CodeMirror-scroll { height: auto; }' on <https://discuss.codemirror.net>
            //  ...  ? why; And is there a way to calculate the true height? ... (show `... .find('.CodeMirror-sizer').height()`, which fails if scrollbar is shown)
            //  ...  without `.CodeMirror-gutters { height: auto !important }` the inner portion of the editor is over-sized and captures scroll-wheel movement (scrolling text off screen)
            $('head').append('<style type="text/css">.CodeMirror, .CodeMirror-scroll { height: auto; } .CodeMirror-gutters {height: auto !important}</style>');
            //$('head').append('<style type="text/css">.CodeMirror, .CodeMirror-scroll { height: auto; }</style>');

            transform_codeblocks_to_CodeMirror();
            // NOTE: all <code> within CODEBLOCKS have, at this point, been removed by conversion to CodeMirror components; only inline-type <code> elements remain

            add_codeblock_snippet_support();

            highlight_code();  // highlight <code/> elements, as needed (only those tagged with a language)
            });
}

var css_class_button    = 'button';
var css_class_codeblock = 'codeblock';
var css_class_tooltip   = 'tooltipped';
var css_class_tooltip__below = 'tooltipped--s'; // tooltipped--s == position tooltip below

function add_codeblock_snippet_support(){
    let _ME = 'add_codeblock_snippet_support()';

    let css_class_snip_button = `${css_class_button}--snip`;                     // unique / identifying class name
    let css_class_snip_button$ = `${css_class_snip_button} ${css_class_button}`; // unique / ID class must be leftmost in the string
    let css_class_snip_button_tooltip$ = `${css_class_tooltip} ${css_class_tooltip__below}`;

    let clipboard_src = 'https://cdn.rawgit.com/rivy/js-user.markdown-render/master/assets/clippy.svg';
    let clipboard_alt = 'Copy to clipboard';

    /* expected CSS */
    $('head').append(
        '<style type="text/css">' +
        `.${css_class_button} { height: 1.75em; }` +
        `.${css_class_codeblock} { position: relative; }` +
        //`.${css_class_codeblock} { page-break-inside: avoid; }` +
        `.${css_class_codeblock} .${css_class_snip_button} { position: absolute; top: 0.2em; right: 0.2em; z-index: 101; opacity: 0; transition: opacity 0.3s ease-in-out; -webkit-transition: opacity 0.3s ease-in-out; }` + /* z-index is used within CodeMirror, use a larger index; heuristic == 10; ToDO: investigate via CodeMirror discourse */
        `.${css_class_codeblock}:hover .${css_class_snip_button} { opacity: 1; }` + /* z-index is used within CodeMirror, use a larger index; heuristic == 10; ToDO: investigate via CodeMirror discourse */
        '</style>'
    );

    let $codeblocks = $(`.${css_class_codeblock}`);
    $codeblocks.each( function( index ){
      ///console.log( _ME + ': index = ' + index );
      //let content = $('<img />', { height:'100%', src: clipboard_src, alt: clipboard_alt} );
      let content = 'Copy';
      let $button = $('<button>', { 'class': css_class_snip_button$ } ).prepend( content );
      $(this).prepend( $button );
      //$(this).find('.CodeMirror').get(0).CodeMirror.refresh();
      });

    //(function(){
    let _selector = `.${css_class_snip_button}`;
    ///console.log( '_selector = '+_selector );
    let snippers = new Clipboard( _selector, {
      text: function( trigger ) {
      let $cm = $( trigger ).parent().find('.CodeMirror');
      return $cm.get(0).CodeMirror.getDoc().getValue();
      }
    });
    snippers.on('success', function(e) {
        e.clearSelection();
        showTooltip(e.trigger, 'Copied!');
        });
    snippers.on('error', function(e) {
        showTooltip(e.trigger, fallbackMessage(e.action));
        });

    let buttons = document.querySelectorAll( _selector );
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener('mouseleave', function(e) {
          $(e.currentTarget).removeClass( css_class_snip_button_tooltip$ );
          e.currentTarget.removeAttribute('aria-label');
        });
    }
    function showTooltip(elem, msg) {
        $(elem).addClass( css_class_snip_button_tooltip$ );
        elem.setAttribute('aria-label', msg);
    }
    function fallbackMessage(action) {
        var actionMsg = '';
        var actionKey = (action === 'cut' ? 'X' : 'C');
        if (/iPhone|iPad/i.test(navigator.userAgent)) {
            actionMsg = 'No support :(';
        } else if (/Mac/i.test(navigator.userAgent)) {
            actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
        } else {
            actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
        }
        return actionMsg;
    }
    //})();
}

function trigger_render_MathJax(){
    if (window.MathJax === undefined) return;
//    let MathJax_root_uri = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1';
    window.MathJax.Hub.Config({
      //root: MathJax_root_uri,
      tex2jax: {
        inlineMath: [ ['${','}$'], ['$\\phantom{}','\\phantom{}$']  ],
        displayMath: [ ['$$','$$'], ['$${','}$$'] ],
        processEnvironments: true,
      }
    });
    window.MathJax.Hub.Configured();
}

function package_codeblocks(){
    let _ME = 'package_codeblocks()';
    $('pre code').each(function(){
        let $CODE = $(this);
        let class_text = $CODE.attr('class') ? 'class = "'+$CODE.attr('class')+'"' : 'class not defined';
        console.log(_ME + ': block found == CODE(' + class_text + ')');
        // hoist 'id' and copy attributes from CODE to PRE
        let $PRE = $CODE.parent('pre');
        $PRE.hoistID($CODE);
        $PRE.copyAllAttributes($CODE);
        // create new DIV 'codeblock' and hoist id from PRE to DIV
        let $DIV = $PRE.wrapAll('<div/>').parent('div');
        $DIV.addClass(css_class_codeblock);
        $DIV.hoistID($PRE);
        $DIV.copyAllAttributes($PRE);
        });
}

function find_CM_mode( name ){
    return CodeMirror.findModeByMIME( name ) || CodeMirror.findModeByName( name ) ||
        (function(mode){
            mode = mode.toLowerCase();
            for (var i = 0; i < CodeMirror.modeInfo.length; i++) {
                var info = CodeMirror.modeInfo[i];
                if (info.mode.toLowerCase() == mode) return info;
            }
        })( name )
        ;
}

function get_language_name( $node ){
    let _ME = 'get_language_name()';
    let attr_class = $node.attr('class') || '';
    let match = dequote( $node.attr('data-lang') || ( attr_class.match(/(?:^|\s)language-(\S+)/) || attr_class.match(/^\s*(\S+)/) || [null, undefined] )[1] );
    return match;
}

function get_language_mime( $node ){
    let _ME = 'get_language_mime()';
    let mime = dequote( $node.attr('data-mime')  );
    if ( mime !== undefined ) { return mime; }
    let name = get_language_name( $node );
    if ( name === undefined ) { return undefined; }
    let CM_mode = find_CM_mode( name ) || CodeMirror.findModeByName( 'Plain Text' );
    return dequote( CM_mode.mime );
}

function get_theme( $node ){
    let _ME = 'get_theme()';
    return dequote( $node.attr('data-theme') || $node.css('--theme') || 'default' ).trim();
}

function set_code_data(){
    let _ME = 'set_code_data()';
    $('code').each(function(){
        // add a 'data-lang' and 'data-mime' attributes, if needed and possible
        let $CODE = $(this);
        $CODE.attr('data-lang', get_language_name( $CODE ) || null );
        $CODE.attr('data-mime', get_language_mime( $CODE ) || null );
        });
}

function highlight_code(){
    // highlight all <code/> elements which are tagged with a language
    let _ME = 'highlight_code()';
    let $code_with_language = $('code[data-lang]');
    CodeMirror.colorize( $code_with_language );
    // add CodeMirror theme, if defined
    let index = 0;
    $code_with_language.each( function(){
        let $CODE = $(this);
        let theme = get_theme( $CODE );
        ///console.log(_ME + `: theme = ${theme}` );
        if ( theme !== 'default' ) {
            $CODE.removeClass('cm-s-default');
            let theme_classes = theme.split(/[\s.]+/);
            theme_classes = theme_classes.map( (element)=>{ return ( 'cm-s-' + element ).trim(); } );
            $CODE.addClass( theme_classes.join(' ') );
            // note: color / background for themes is defined by 'cm-s-theme.CodeMirror ...', but assigning a CodeMirror class pulls in other, inappropriate, CSS
            // add .CodeMirror (but only temporarily)
            let had_class_CM = $CODE.hasClass('CodeMirror');
            $CODE.addClass('CodeMirror');
            let background_color = $CODE.css('background-color');
            let color = $CODE.css('color');
            if (! had_class_CM ) $CODE.removeClass('CodeMirror');
            let css_class = ['code'].concat(theme_classes).join('.');
            ///console.log( _ME+`: background_color = ${background_color}`);
            ///console.log( _ME+`: color = ${color}`);
            ///console.log( _ME+`: css_class = ${css_class}`);
            let id = '_'+css_class;
            let $CSS = $(`#${id}`).length || $('<style type="text/css" />').html(`${css_class} { background-color: ${background_color}; color: ${color} }`).attr('id',id).appendTo('head');
            }
        });
}

function transform_codeblocks_to_CodeMirror(){
// setup CodeMirror as container and syntax highlighter
    let _ME = 'transform_codeblocks_to_CodeMirror()';
    /* expected CSS for *mark-selection* */
    $('head').append(
        '<style type="text/css">' +
        '.CodeMirror-selected  { background-color: blue !important; }' +
        //'.CodeMirror-selectedtext { color: white; }' +
        '</style>'
    );
    let $codeblock = $(`.${css_class_codeblock}`);
    $codeblock.children('pre').children('code').each(function(){
        let $CODE = $(this);
        let class_text = $CODE.attr('class') ? 'class = "'+$CODE.attr('class')+'"' : 'class not defined';
        console.log(_ME + ': block found == CODE(' + class_text + ')');
        let $PRE = $CODE.parent('pre');
        let $DIV = $PRE.parent('div');
        let $codeblock = $DIV;
        console.log(_ME + ': codeblock(' + $codeblock.attr('class') + ')');

        let _lineWrapping = $DIV.hasClass('line-wrapping') || $DIV.hasClass('line-wrap') || $DIV.hasClass('wrapLines') || $DIV.hasClass('wordwrap');
        let _lineNumbers = $DIV.hasClass('line-numbers') || $DIV.hasClass('numberLines');
        let _firstLineNumber = isDefined($DIV.attr('startFrom')) ? parseInt($DIV.attr('startFrom')) : 1; // NOTE: for conversion alternatives, see https://coderwall.com/p/5tlhmw/converting-strings-to-number-in-javascript-pitfalls @@ http://archive.is/1CH5w
        let _gutters = _lineNumbers ? ['CodeMirror-linenumbers'] : ['CodeMirror-gutter-extra'];
        let _mode = dequote( $DIV.attr('data-mime') || 'text/plain' );
        console.log('_mode = ' + _mode);
        let _theme = get_theme( $DIV );
        console.log('_theme = ' + _theme);

        let _value = $('<div/>').html($CODE.html()).text().trimRight();

        // use the CodeMirror standard <textarea/> idiom ## (not strictly necessary, but may save coding aggravation)
        $DIV.empty();
        $DIV.append('<textarea/>');

        let $element = $DIV.children('textarea'); $element.text(_value);
        let cm = CodeMirror.fromTextArea( $element.get(0), {
            mode: _mode,
            lineNumbers: _lineNumbers,
            lineWrapping: _lineWrapping,
            firstLineNumber: _firstLineNumber,
            gutters: _gutters,
            theme: _theme,
            //
            styleSelectedText: true,
            //
            readOnly: true,
            viewportMargin: Infinity,
        });

        ///console.log( 'sizer.height = ' + $element.find('.CodeMirror-sizer').height());
        ///console.log( 'cm.getScrollerElement().clientHeight = ' + cm.getScrollerElement().clientHeight );
        ///console.log( 'cm.getWrapperElement().offsetHeight ' + cm.getWrapperElement().offsetHeight );
        ///console.log( 'scrollerElement.scrollHeight = ' + cm.getScrollerElement().scrollHeight );
        ///console.log( 'doc.height = ' + cm.doc.height );
        ///console.log( 'hscrollbar.height = ' + $element.find('.CodeMirror-hscrollbar').height());
        //cm.setSize( null, $element.find('.CodeMirror-sizer').height());
        //cm.setSize( null, 'auto');
        //cm.setSize();
        //cm.refresh();

        // zebra-fy
        //let BACK_CLASS = 'CodeMirror-activeline-background';
        let BACK_CLASS = 'codeblock-line';
        let lineCount = cm.lineCount();
        for (let i = 1; i <= lineCount; i++) {
            let suffix = '-odd';
            if ((i % 2) === 0) { suffix = '-even'; }
            cm.addLineClass( (i-1), 'background', BACK_CLASS+suffix );
            }
      });
}

function render_markdown( text ){
    //md = md || new markdownit( 'commonmark', {
    let md = new markdownit({
      html: true,
      //linkify: true,
      typographer: true,
      //highlight: highlight_code,
      });
    // plugins
    md.use(markdownItAttrs);
    md.use(markdownitDeflist);
    md.use(markdownitFootnote);

    return md.render(text);
    }

// ** load functions (async)

function load_raw_text( uri, timeout ){ // ( {array}, {int} ) : {jQuery.Deferred}
    // Firefox misinterprets non-HTML (non .htm/.html extension) files as HTML if they contain initial HTML tags and irretrievably alters the text ... this replaces the body content with text equivalent to chrome's interpretation
    // NOTE: no perceptable speed difference when using this on a high-end machine (via both SSD or HD)
    //   ... *unneeded by chrome* (also, blocked by cross-origin issue ... ; see below comments) */
    // ToDO: comment / request fix on "support.mozilla.org" (simlar to: https://support.mozilla.org/en-US/questions/898460)
    let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
    let retVal = $.Deferred;
    if (isFirefox) {
        uri = uri || document.location.href;
        timeout = (timeout !== null) && (timeout >= 0) ? timeout : 2 * 1000/* ms */;
        // 'chrome'-only: ajax throws here for the "file:///" protocol => "VM4117:7 XMLHttpRequest cannot load file:///C:/Users/Roy/OneDrive/Projects/%23kb/%23pandoc/README.md. Cross origin requests are only supported for protocol schemes: http, data, chrome, chrome-extension, https."
        // ref: http://stackoverflow.com/questions/4819060/allow-google-chrome-to-use-xmlhttprequest-to-load-a-url-from-a-local-file/18137280#18137280 @@ http://archive.is/W7a9M
        retVal = $.ajax( uri, { cache: true, dataType: 'text', timeout: timeout } )
            .done( function( data, statusText, jqXHR ) { $('body').empty(); $('<pre/>', { style: 'word-wrap: break-word; white-space: pre-wrap;' }).text(data).appendTo('body'); } )
            ;
        }
    return retVal;
}

function load_assets( uris, timeout, optional ) { // ( {array} [, {int}timeout=0] [, {bool}optional=false] ) => {jQuery.Deferred}
/**
 * load assets in parallel, insert/initialize results *in order* within the document (creating determinate content from async downloads)
 * @param {array} : an array of script uris, loaded asynchronously, but placed into the file in the given order
 * @param {int}   : a timeout for download failure (default == 0 (aka, no timeout))
 * @returns {jQuery.Deferred}
 * ref: (based on) https://stackoverflow.com/questions/9711160/jquery-load-scripts-in-order/19777866#19777866 @@ https://archive.is/yt1su
 * ref: (based on) https://gist.github.com/rivy/5f1bd5225d4ee315a8d7f3c89986600f from https://gist.github.com/ngryman/7309432
 * ref: https://community.oracle.com/blogs/driscoll/2009/09/08/eval-javascript-global-context @@ http://archive.is/qy9fL
 * ref: [jqXHR ~ .done/.fail/.always/.then argument documentation] http://api.jquery.com/jQuery.ajax/#jqXHR
 */
// NOTE: this function is needed b/c CSS and JS have order dependence (for rules with equivalent specificity and initialization dependencies, respectively)
    timeout = ((timeout !== null) && (timeout >= 0)) ?  timeout : 2 * 1000/* ms */;
    optional = (optional !== null) ? !!optional : false;
    let _ME = 'load_assets()';
    let asset_uris = $.isArray( uris ) ? uris : [ uris ];
    let retVal = $.Deferred;
    ///console.log( `${_ME}: asset_uris = ${JSON.stringify( asset_uris )}`);
    if (asset_uris.length < 1) { return retVal; }
    let default_protocol = (window.location.protocol === 'http:') ? 'http:' : 'https:'; // use 'https:' unless current page is using 'http:'
    let requests = asset_uris.map( function( asset_uri ) {
        let uri = asset_uri.trim();
        ///console.log( `${_ME}: uri = ${JSON.stringify( uri )}`);
        if ( /^[\/\\][\/\\]/.test(uri) ) { uri = default_protocol + uri; }
        let uri_path = new URL( uri, window.location ).pathname;
        let uri_filename = uri_path.replace(/^.*[\\\/]/, '');
        let uri_extension = uri_filename.replace(/^.*(?=\.)/, '');
        console.log( `${_ME}: initiating AJAX download of "${uri}")` );
        let jqXHR = $.ajax( uri, { cache: true, dataType: 'text', timeout: timeout } );
        jqXHR.uri = uri;
        jqXHR.extension = uri_extension;
        return jqXHR;
        });
    ///console.log( `${_ME}: requests::${JSON.stringify(requests)}::` );

    retVal = $.when.apply($, requests)
        .done( function() {
            let args = $.isArray( arguments[0] ) ? arguments : [ arguments ];
            Array.prototype.forEach.call( args, function( request /* :: [data, textStatus, jqXHR] */, index ) {
                let jqXHR = request[2];
                let data = request[0];
                ///console.log( `${_ME}: done::${JSON.stringify(request)}:: (${jqXHR.status}) '${jqXHR.statusText}' for "${jqXHR.uri}"` );
                if (jqXHR.extension === '.css') {
                    console.log( `insert style from "${jqXHR.uri}"` );
                    $('<style type="text/css" />').html(data).attr('_uri', jqXHR.uri).attr('_index', index).appendTo('head');
                    }
                if (jqXHR.extension === '.js') {
                    console.log( `eval() script from "${jqXHR.uri}"` );
                    /* jshint ignore:start */
                    window.eval.call( window, data );
                    /* jshint ignore:end */
                    }
                });})
        .fail( function() { Array.prototype.forEach.call( arguments, function( request /* :: [jqXHR, textStatus, errorThrown] */, index ) {
            let message = `failed to load ${optional ? '( optional ) ' : ''}asset "${request.uri}"`;
            if (optional) {
                console.log( _ME+`: warn: ${message}`);
              } else {
                console.log( `${_ME}: ERR!: ${message} ::${JSON.stringify(request)}::` );
                error( message + '; render halted' );
                throw Error(`${_ME}: ERR!: ${message}`);
                }
            });})
        ;

    return retVal;
}

// ** jQuery "graft-on" functions

(function ($) {
    // ref: http://stackoverflow.com/questions/6753362/jquery-how-to-copy-all-the-attributes-of-one-element-and-apply-them-to-another/24626637#24626637 @@ http://archive.is/i92ld
    $.fn.hoistID = function( from ) {
        // from: source jQuery element
        if ( $(from).attr('id') ) {
            $(this).attr('id', $(from).attr('id'));
            $(from).removeAttr('id');
        }
        return this;
    };
})(jQuery);

(function ($) {
    // ref: http://stackoverflow.com/questions/6753362/jquery-how-to-copy-all-the-attributes-of-one-element-and-apply-them-to-another/24626637#24626637 @@ http://archive.is/i92ld
    $.fn.copyAllAttributes = function( from ) {
        // from: source jQuery element
        let to = this;

        // place holder for all attributes
        var allAttributes = ($(from) && $(from).length > 0) ?
            $(from).prop("attributes") : null;

        // Iterate through attributes and add
        if (allAttributes && $(to) && $(to).length == 1) {
            $.each(allAttributes, function() {
                // Ensure that class names are not copied but rather added
                if (this.name == "class") {
                    $(to).addClass(this.value);
                } else if (this.name == "id") {
                    // skip id's
                } else {
                    to.attr(this.name, this.value);
                }
            });
        }
        return to;
    };
})(jQuery);

// ** print render fixup

// NOTE: Firefox print rendering is *broken* b/c Firefox doesn't apply "@media print" CSS to the page before triggering the `beforePrint` event and the print content is "hidden"
//   ... see: <https://bugzilla.mozilla.org/show_bug.cgi?id=1048317> and <https://bugzilla.mozilla.org/show_bug.cgi?id=774398>
//   ... IMO, despite being "in-spec" by one interpretation, this is a Firefox *bug* ... so, print using Chrome

var print_form = false; // signal current document form; used to minimize refresh/setSize on Chrome (which may call these multiple times when printing)

var beforePrint = function() {
    ///console.log(`beforePrint()`);
    if ( ! print_form ) {
       let $cb = $('.codeblock');
       $cb.each(function(index){
          let $CB = $(this);
          let cm = $CB.find('.CodeMirror').get(0).CodeMirror;
          cm.setOption('lineWrapping', true);
          cm.refresh(); // re-calculate correct height / width
          let height = $CB.find('.CodeMirror-lines').outerHeight();
          cm.setSize( null, height );
          });
       print_form = true;
       }
};

var afterPrint = function() {
    ///console.log(`afterPrint()`);
    if ( print_form ) {
       let $cb = $('.codeblock');
       $cb.each(function(index){
          let $CB = $(this);
          let cm = $CB.find('.CodeMirror').get(0).CodeMirror;
          let _lineWrapping = $CB.hasClass('line-wrapping') || $CB.hasClass('line-wrap') || $CB.hasClass('wrapLines') || $CB.hasClass('wordwrap');
          cm.setOption('lineWrapping', _lineWrapping);
          cm.setSize( null, 'auto' );
          cm.refresh(); // fix minor size / text position abberations after `setSize()`
          });
       }
    print_form = false;
};

//# install print hooks
// matchMedia API
function handleMatchMediaPrint( mql ) {
    if ( mql.matches ) { beforePrint(); } else { afterPrint(); }
}
if (window.matchMedia) {
    // matchMedia() API is available
    let mediaQueryList = window.matchMedia('print');
    mediaQueryList.addListener( handleMatchMediaPrint );
}
// older API
$(window).on('beforeprint', beforePrint);
$(window).on('afterprint', afterPrint);

// ** utility functions

function isDefined( variable ){
    // ref: http://www.codereadability.com/how-to-check-for-undefined-in-javascript @@ http://archive.is/RDiQz
    ///return (typeof variable !== undefined);
    return (variable !== undefined);
}

//# assertion

function assert(condition, message) {
    // based on : http://stackoverflow.com/questions/15313418/javascript-assert/15313435#15313435 @@ http://archive.is/XPo6F
    if (!condition) {
        message = message || "Assertion failed";
        error( message );
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

//# user/browser messaging

let messaging_id = '_messages';

function add_messaging_area(){
    if ($(`#${messaging_id}`).length < 1) {
        // basic CSS
        $('<style>').text(
            `#${messaging_id} { border: red solid 2px; margin: 0; padding: 0 0.5em; }` +
            `#${messaging_id} p { margin: 0.5em 0; font-family: monospace }` +
            '').appendTo('head');
        // node
        $('<div/>', { id: messaging_id }).hide().prependTo($('body'));
        }
}

function warn( message ){ // ( {array} ) : {void}
    let messages = $.isArray( message ) ? message : [ message ];
    if ( $(`#${messaging_id}`).length < 1 ) { add_messaging_area(); }
    messages.forEach( (message)=>{ $(`#${messaging_id}`).append($('<p/>', {text: 'warn: '+message})); } );
    $(`#${messaging_id}`).show();
}

function error( message ){ // ( {array} ) : {void}
    let messages = $.isArray( message ) ? message : [ message ];
    if ( $(`#${messaging_id}`).length < 1 ) { add_messaging_area(); }
    messages.forEach( (message)=>{ $(`#${messaging_id}`).append($('<p/>', {text: 'ERR!: '+message})); } );
    $(`#${messaging_id}`).show();
}

//# string / text functions

function dequote( s ){
    // remove any surrounding quotes (including any outer surrounding whitespace)
    if (( s === undefined ) || ( s === null )) { return s; }
    let retval = s.trim();
    let quotes = /["']/;
    let match = retval.charAt(0).match( quotes );
    if ( match && ( match[0].charAt[0] === retval.charAt[ retval.length ] ) ) { retval = retval.slice(1, -1); }
    return match ? retval : s;
}

// ####

})( /* window.USERjs = window.USERjs || {}, */ window, jQuery );
