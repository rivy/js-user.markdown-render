// ==UserScript==
// @name        markdown-render
// @namespace   com.houseofivy
// @description renders markdown files
//
// @version     0.039
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

var protocol = document.location.protocol; if (protocol === 'file:') { protocol = 'https:'; }
var required_js = [
  // NOTE: see library CDN ref @ https://cdnjs.com
  // clipboard support
  protocol+"//cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.6.1/clipboard.min.js",
//  [
  // syntax highlighter (with plugins)
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/prism.min.js",
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-highlight/prism-line-highlight.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.js",
//  ],
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/toolbar/prism-toolbar.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js",
  [
  // syntax highlighter grammers (ToDO: change to lazy loading)
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-haskell.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-perl.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-python.min.js",
  ],
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
  // KaTeX
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/katex.min.js",
  //protocol+"//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.7.1/contrib/auto-render.min.js",
  ];
var optional_css = [
  // reset
  // see https://stackoverflow.com/questions/3388705/why-is-a-table-not-using-the-body-font-size-even-though-i-havent-set-the-table/3388766#3388766 @@ http://archive.is/wePmk
  protocol+"cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.min.css",
  // basic
  protocol+"//cdn.rawgit.com/rivy/js-user.markdown-render/21e0a5f8043b4e07d537eaed448ba053b4a8bf10/css/s.css",
  //protocol+"//raw.githubusercontent.com/Thiht/markdown-viewer/master/chrome/lib/sss/sss.css",
  //protocol+"//raw.githubusercontent.com/Thiht/markdown-viewer/master/chrome/lib/sss/sss.print.css",
  // syntax highlighter
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism.min.css",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism-solarizedlight.min.css",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-highlight/prism-line-highlight.min.css",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.css",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/toolbar/prism-toolbar.min.css",
  ];

(function ($) {
    // ref: http://stackoverflow.com/questions/6753362/jquery-how-to-copy-all-the-attributes-of-one-element-and-apply-them-to-another/24626637#24626637 @@ http://archive.is/i92ld
    // Define the function here
    $.fn.copyAllAttributes = function(sourceElement) {
        // 'that' contains a pointer to the destination element
        var that = this;

        // Place holder for all attributes
        var allAttributes = ($(sourceElement) && $(sourceElement).length > 0) ?
            $(sourceElement).prop("attributes") : null;

        // Iterate through attributes and add
        if (allAttributes && $(that) && $(that).length == 1) {
            $.each(allAttributes, function() {
                // Ensure that class names are not copied but rather added
                if (this.name == "class") {
                    $(that).addClass(this.value);
                } else if (this.name == "id") {
                    // skip id's
                } else {
                    that.attr(this.name, this.value);
                }
            });
        }
        return that;
    };
    $.fn.copyID = function(sourceElement) {
        // 'that' contains a pointer to the destination element
        var that = this;

        // Place holder for all attributes
        var allAttributes = ($(sourceElement) && $(sourceElement).length > 0) ?
            $(sourceElement).prop("attributes") : null;

        // Iterate through attributes and add
        if (allAttributes && $(that) && $(that).length == 1) {
            $.each(allAttributes, function() {
                // only id is copied and removed
                if (this.name == "id") {
                    that.attr(this.name, this.value);
    //                this.removeAttr("id");
                }
            });
        }
        return that;
    };
})(jQuery);

load_js_inorder( required_js, function(){
    console.log('rendering');
    document.body.innerHTML = render_markdown( document.body.textContent );
    console.log( 'document.compatMode = '+document.compatMode );
    MathJax.Hub.Config({
      tex2jax: {
        inlineMath: [ ['$\\phantom{}','\\phantom{}$'], ["\\(","\\)"] ],
        processEnvironments: true,
      }
    });
    MathJax.Hub.Configured();

    // hoist 'id' from CODE to PRE; merge 'class' and duplicate other attributes from CODE into PRE
    $('pre code').each(function(){
        console.log( $(this).attr('class') );
        if ( $(this).attr('class') ) {
            $(this).parent('pre').attr('id', $(this).attr('id'));
            $(this).removeAttr('id');
            //
            $(this).parent('pre').copyAllAttributes($(this));
        }
        //$(this).parent('pre').
    });

    Prism.highlightAll();
    });

load_css( optional_css );


// #### subs

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

var md;
function render_markdown( text ){
    md = md || new markdownit({
      html: true,
      //linkify: true,
      typographer: true,
      //highlight: highlight_code,
      });
    // plugins
    md.use(markdownitDeflist);
    md.use(markdownitFootnote);
    md.use(markdownItAttrs);

    return md.render(text);
    }

})( /* window.USERjs = window.USERjs || {}, */ window, jQuery );
