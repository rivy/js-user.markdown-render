// ==UserScript==
// @name        markdown-render
// @namespace   com.houseofivy
// @description renders markdown files
//
// @version     0.071
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

function alt_loadCss(url) {
    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = url;
    document.getElementsByTagName("head")[0].appendChild(link);
}

/**
 * Load scripts in parallel keeping execution order.
 * @param {array} An array of script urls. They will parsed in the order of the array.
 * @returns {$.Deferred}
 */
function getScripts(scripts) {
    var xhrs = scripts.map(function(url) {
        return $.ajax({
            url: url,
            dataType: 'text',
            cache: true
        });
    });

    return $.when.apply($, xhrs).done(function() {
        Array.prototype.forEach.call(arguments, function(res) {
            eval.call(this, res[0]);
        });
    });
}

function load_css( uri, timeout ) {
/**
 * load CSS in parallel keeping order for document placement
 * @param {array} : an array of script uris, loaded asynchronously, but placed into the file in the given order
 * @param {int}   : a timeout for download failure (default == 0 (aka, no timeout))
 * @returns {$.Deferred}
 * ref: (based on) https://stackoverflow.com/questions/9711160/jquery-load-scripts-in-order/19777866#19777866 @@ https://archive.is/yt1su
 * ref: (based on) https://gist.github.com/rivy/5f1bd5225d4ee315a8d7f3c89986600f from https://gist.github.com/ngryman/7309432
 */
// CSS has order dependence (for rules with equivalent specificity); this function places the CSS in the specified order, creating determinate content for the document
    timeout = ((timeout !== null) && (timeout >= 0)) ?  timeout : 2 * 1000/* ms */;
    let _ME = 'get_css()';
    let style_uris = Array.from( uri );
    let requests = style_uris.map( function( style_uri ) {
        console.log( `${_ME}: initiating AJAX download ("${style_uri}")` );
        let jqXHR = $.ajax( style_uri, { cache: true, dataType: 'text', timeout: timeout } );
        jqXHR.uri = style_uri;
        return jqXHR;
        });

    return $.when.apply($, requests)
        .done( function() {
            Array.prototype.forEach.call( arguments, function( request /* :: [data, textStatus, jqXHR] */, index ) {
                console.log( `${_ME}: done::${JSON.stringify(request)}:: (${request[2].status}) '${request[2].statusText}' for "${request[2].uri}"` );
                let css = request[0];
                $('<style type="text/css"/>').html(css).attr('_uri', request[2].uri).attr('_index', index).appendTo("head");
                });})
        //.fail( function() { Array.prototype.forEach.call( arguments, function( request /* :: [jqXHR, textStatus, errorThrown] */, index ) { console.log( `${_ME}: FAIL::${JSON.stringify(request)}::` ); throw new Error(`${_ME}: FAIL`); }); })
        //.always( function() { Array.prototype.forEach.call( arguments, function( request /* :: [data | jqXHR, textStatus, jqXHR | errorThrown] */, index ) { console.log( `${_ME}: ALWAYS: '${request[1]}'` ); }); })
        ;
}

// #### config

var protocol = document.location.protocol; if (protocol === 'file:') { protocol = 'https:'; }
var required_js = [
  // ToDO: investigate RequireJS to async load but initialize dependent modules in correct order
  // NOTE: see library CDN ref @ https://cdnjs.com
  // clipboard support
  protocol+"//cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.6.1/clipboard.min.js",
//  [
  // // syntax highlighter (with plugins)
  // protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/prism.min.js",
  // //protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-highlight/prism-line-highlight.min.js",
  // protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.js",
//  ],
//  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/toolbar/prism-toolbar.min.js",
//  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js",
  // [
  // // syntax highlighter grammers (ToDO: change to lazy loading)
  // protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-haskell.min.js",
  // protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-perl.min.js",
  // protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-python.min.js",
  // ],
  // markdown conversion
  protocol+"//cdnjs.cloudflare.com/ajax/libs/markdown-it/8.3.1/markdown-it.min.js",
  [
  // note: (using rawgit ~ see https://github.com/rgrove/rawgit/blob/master/FAQ.md @@ http://archive.is/rMkAp)
  // markdown-it ~ definition lists
  protocol+"//cdn.rawgit.com/markdown-it/markdown-it-deflist/8f2414f23316a2ec1c54bf4631a294fb2ae57ddd/dist/markdown-it-deflist.min.js", // markdown-it-deflist-2.0.1
  // markdown-it ~ attributes (pandoc compatible)
  protocol+"//cdn.rawgit.com/arve0/markdown-it-attrs/ce98279c9d3ad32bc0f94a9c1ab1206e6a9abaa8/markdown-it-attrs.browser.js", // markdown-it-attrs-0.8.0
  // markdown-it ~ footnotes
  protocol+"//cdnjs.cloudflare.com/ajax/libs/markdown-it-footnote/3.0.1/markdown-it-footnote.min.js",
  // MathJax
  protocol+"//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML&delayStartupUntil=configured",
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML",
  ],
  //// KaTeX
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.js",
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/contrib/auto-render.min.js",
  // CodeMirror
  protocol+"//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.2/codemirror.min.js",
//  [
  // CodeMirror modes (aka languages)
  protocol+"//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.2/mode/haskell/haskell.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.2/mode/javascript/javascript.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.2/mode/perl/perl.min.js",
//  ],
  ];
var optional_css = [
  // ToDO: CSS order is significant ("later directives with same specificity wins"), so investigate RequireJS to async load but insert in-order
  // reset
  // see https://stackoverflow.com/questions/3388705/why-is-a-table-not-using-the-body-font-size-even-though-i-havent-set-the-table/3388766#3388766 @@ http://archive.is/wePmk
//  protocol+"//cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css",
  // ref: [normalize] http://necolas.github.io/normalize.css @@ http://archive.is/Fo0od ; info: http://nicolasgallagher.com/about-normalize-css @@ http://archive.is/RSXip ; repo: https://github.com/necolas/normalize.css
  protocol+"//cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css",
  // basic
  protocol+"//cdn.rawgit.com/rivy/js-user.markdown-render/21e0a5f8043b4e07d537eaed448ba053b4a8bf10/css/s.css",
  protocol+"//cdn.rawgit.com/rivy/js-user.markdown-render/03542f43a1c5adbaf30f6d4eb9901a4b87613d00/css/snippet.css",
//  protocol+"//raw.githubusercontent.com/Thiht/markdown-viewer/master/chrome/lib/sss/sss.css",
//  protocol+"//raw.githubusercontent.com/Thiht/markdown-viewer/master/chrome/lib/sss/sss.print.css",
  // syntax highlighter
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism.min.css",
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism-solarizedlight.min.css",
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-highlight/prism-line-highlight.min.css",
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.css",
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/toolbar/prism-toolbar.min.css",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/codemirror/5.25.2/codemirror.min.css",
  //"http://codemirror.net/lib/codemirror.css",
  ];

// #### main()

(function main(){

console.log('document.compatMode = ' + document.compatMode);

//$('<div/>', { id:'_message', class: 'message', text: 'TESTING!', style:'display:none'}).prependTo($('body'));

let defer = $.when([])
//defer
    .then( ()=>{ return load_css( optional_css ); } )
//    .then( ()=>{ load_css( optional_css ); } )
    .then( ()=>{ load_js_inorder( required_js, do_render ); } )
    .then( function(){ console.log( 'main(): promise chain completed' ); })
    .done( function(){ console.log( 'main(): DONE ' ); } )
    .catch( function(){ console.log( 'main(): CATCH ' ); } )
    .always( function(){ console.log( 'main(): ALWAYS ' ); } )
    ;

//defer.resolve();

//load_css( optional_css );
//load_js_inorder( required_js, do_render );

})();

// #### subs

function do_render(){
    let _ME = 'do_render()';
    console.log(_ME + ': rendering markdown');
    document.body.innerHTML = render_markdown( document.body.textContent );

    console.log(_ME + ': initiating MathJax render');
    trigger_render_MathJax();

    console.log(_ME + ': package codeblocks');
    package_codeblocks();

    console.log(_ME + ': transform codeblocks');
    // ToDO: discuss the need for '.CodeMirror-scroll { height: auto; }' on <https://discuss.codemirror.net>
    //  ...  ? why; And is there a way to calculate the true height? ... (show `... .find('.CodeMirror-sizer').height()`, which fails if scrollbar is shown)
    //  ...  without `.CodeMirror-gutters { height: auto !important }` the inner portion of the editor is over-sized and captures scroll-wheel movement (scrolling text off screen)
    $('head').append('<style type="text/css">.CodeMirror, .CodeMirror-scroll { height: auto; } .CodeMirror-gutters {height: auto !important}</style>');
    //$('head').append('<style type="text/css">.CodeMirror-gutters {height: auto !important}</style>');
    transform_codeblocks_to_CodeMirror();

    add_codeblock_snippet_support();
}

var css_class_button    = 'button';
var css_class_codeblock = 'codeblock';
var css_class_tooltip   = 'tooltipped';
var css_class_tooltip__below = 'tooltipped-s'; // tooltipped-s == position tooltip below

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
        `.${css_class_button} { height: 2em; }` +
        `.${css_class_codeblock} { position: relative; }` +
        `.${css_class_codeblock} .${css_class_snip_button} { position: absolute; top: 0.25em; right: 0.25em; z-index: 101; opacity: 0; transition: opacity 0.3s ease-in-out; -webkit-transition: opacity 0.3s ease-in-out; }` + /* z-index is used within CodeMirror, use a larger index; heuristic == 10; ToDO: investigate via CodeMirror discourse */
        `.${css_class_codeblock}:hover .${css_class_snip_button} { opacity: 1; }` + /* z-index is used within CodeMirror, use a larger index; heuristic == 10; ToDO: investigate via CodeMirror discourse */
        '</style>'
    );

    let $codeblocks = $(`.${css_class_codeblock}`);
    $codeblocks.each( function( index ){
      console.log( _ME + ': index = ' + index );
      let $img = $('<img />', { height:'100%', src: clipboard_src, alt: clipboard_alt} );
      let $button = $('<button>', { 'class': css_class_snip_button$ } ).prepend( $img );
      $(this).prepend( $button );
      //$(this).find('.CodeMirror').get(0).CodeMirror.refresh();
      });

    //(function(){
    let _selector = `.${css_class_snip_button}`;
    console.log( '_selector = '+_selector );
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
    MathJax.Hub.Config({
      tex2jax: {
        inlineMath: [ ['$\\phantom{}','\\phantom{}$'], ["\\(","\\)"] ],
        processEnvironments: true,
      }
    });
    MathJax.Hub.Configured();
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

function transform_codeblocks_to_CodeMirror(){
// setup CodeMirror as container and syntax highlighter
    let _ME = 'transform_codeblocks_to_CodeMirror()';
    let $codeblock = $(`.${css_class_codeblock}`);
    $codeblock.children('pre').children('code').each(function(){
        let $CODE = $(this);
        let class_text = $CODE.attr('class') ? 'class = "'+$CODE.attr('class')+'"' : 'class not defined';
        console.log(_ME + ': block found == CODE(' + class_text + ')');
        let $PRE = $CODE.parent('pre');
        let $DIV = $PRE.parent('div');

        let _linewrapping = $DIV.hasClass('line-wrapping') || $DIV.hasClass('line-wrap') || $DIV.hasClass('wrapLines') || $DIV.hasClass('wordwrap');
        let _linenumbers = $DIV.hasClass('line-numbers') || $DIV.hasClass('numberLines');
        let _gutters = _linenumbers ? ['CodeMirror-linenumbers'] : ['CodeMirror-gutter-extra'];
        let attr_class = $DIV.attr('class') || '';
        let language_match = attr_class.match(/(?:^|\s)language-(\S+)/) || [null, 'plain-text'];
        let _mode = language_match[1];
        console.log('_mode = ' + _mode);
        let _value = $('<div/>').html($CODE.html()).text().trimRight();

        // use the CodeMirror standard <textarea/> idiom ## (not strictly necessary, but may save coding aggravation)
        $DIV.empty();
        $DIV.append('<textarea/>');

        let $element = $DIV.children('textarea'); $element.text(_value);
        let cm = CodeMirror.fromTextArea( $element.get(0), {
            //value: _value,
            mode: _mode,
            lineNumbers: _linenumbers,
            lineWrapping: _linewrapping,
            gutters: _gutters,
            readOnly: true,
            //scrollbarStyle: "null",
            viewportMargin: Infinity,
        });
        console.log( 'sizer.height = ' + $element.find('.CodeMirror-sizer').height());
        console.log( 'cm.getScrollerElement().clientHeight = ' + cm.getScrollerElement().clientHeight );
        console.log( 'cm.getWrapperElement().offsetHeight ' + cm.getWrapperElement().offsetHeight );
        console.log( 'scrollerElement.scrollHeight = ' + cm.getScrollerElement().scrollHeight );
        console.log( 'doc.height = ' + cm.doc.height );
        console.log( 'hscrollbar.height = ' + $element.find('.CodeMirror-hscrollbar').height());
        //cm.setSize( null, $element.find('.CodeMirror-sizer').height());
        //cm.setSize( null, 'auto');
        //cm.setSize();
        //cm.refresh();
      });
}

/* ## jQuery graft-on functions */

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

/*
function load_css( uri ) {
var styles = Array.from(uri);
styles.forEach( function( style ){
    console.log( 'load_css:style = ' + style );
    $.get( style, function(css){
       $('<style type="text/css"></style>')
       .html(css)
       .appendTo("head");
       });
});
}
*/

function load_js_inorder( uri, callback, timeout ) {
callback = callback || function(){};
timeout = timeout || ( 2 * 1000 );
var scripts = Array.from(uri);
if (scripts.length > 0) {
    var script = scripts.shift();
    console.log('load_js_inorder:script = ' + script);
    console.log('load_js_inorder:scripts[' + scripts.length + '] = ' + scripts);
    var true_callback;
    if (scripts.length === 0) { true_callback = callback; } else { true_callback = function(){ load_js_inorder( scripts, callback, timeout ); }; }
    if ( $.isArray(script) ) { load_js( script, true_callback, timeout ); }
    else {
      $.ajax( script, { cache: true, dataType: 'script', timeout: timeout } )
       .done( function() {
          console.log('ajax:load:success:' + script);
          true_callback();
          })
       .fail( () => { console.log('$:getScript:FAIL: ' + script); } )
      ;
    }
} else { callback(); }
}

function load_js( uri, callback, timeout ){
callback = callback || function(){};
timeout = timeout || ( 10 * 1000 );
// jQuery
var scripts = Array.from(uri);
var progress = 0;
scripts.forEach( function( script ){
    console.log( 'load_js:script = ' + script );
    $.ajax( script, { cache: true, dataType: 'script', timeout: timeout } )
     .done( function() {
        console.log('ajax:load:success:[' + progress + ']' + script);
        if (++progress == scripts.length) callback();
        })
     .fail( () => { console.log('$:getScript:FAIL: ' + script); } )
    ;
});
}

function highlight_code ( s, lang ) {
    console.log('here#1: '+lang);
    // //let grammer = Prism.languages[lang];
    // // let grammer = get_prism_grammer(lang);
    // const prismLang = Prism.languages[lang];
    // if (grammer) {
    //     console.log('here#2: '+ lang);
    //     try {
    //         return Prism.highlight(s, grammer).value;
    //     } catch (__) {}
    // }
    var grammer = Prism.languages[lang];
    if (grammer) {
        console.log('here#2: '+ lang);
        return Prism.highlight( s, grammer);
    }
}

function get_prism_grammer(lang, callback){
    var grammer = Prism.languages[lang];
//    if (grammer !== undefined) {
//       }
    return grammer;
}

const DEFAULTS = {
    plugins: [],
    init: () => {}
};
function p_highlight(text, lang) {
    const prismLang = Prism.languages[lang];
    if (prismLang) {
        return Prism.highlightElement(text, prismLang);
    }
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

})( /* window.USERjs = window.USERjs || {}, */ window, jQuery );
