// ==UserScript==
// @name        markdown-render
// @namespace   com.houseofivy
// @description renders markdown files
//
// @version     0.001
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
// @//require     //cdnjs.cloudflare.com/ajax/libs/labjs/2.0.3/LAB-debug.min.js
// @require     //cdnjs.cloudflare.com/ajax/libs/labjs/2.0.3/LAB.min.js
//
// @grant       none
// ==/UserScript==
// library CDN ref @ https://cdnjs.com

$LAB.script("https://cdnjs.cloudflare.com/ajax/libs/markdown-it/8.3.1/markdown-it.min.js");
$LAB.script("https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/prism.min.js").wait()
    .script("https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-highlight/prism-line-highlight.min.js")
    .script("https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.js")
    ;

//var doc = document.all;
//var sd = new Showdown.converter();

//var newLinedMarkdown = doc.replace(/(?:\r\n|\r|\n)/g, "\n\n");
//var html = converter.makeHtml(newLinedMarkdown);
//$('.page_footer').html(html);

//var md = new markdownit();

//var h = new hljs(); // require('highlight.js'); // https://highlightjs.org/

var doc = document;

//// highlightjs
//var md = new markdownit({
//  highlight: function (str, lang) {
//    if (lang && hljs.getLanguage(lang)) {
//      try {
//        return hljs.highlight(lang, str).value;
//      } catch (__) {}
//    }
//    return ''; // use external default escaping
//  }
//});

// prism
const DEFAULTS = {
    plugins: [],
    init: () => {}
};

/**
 * Loads the provided <code>lang</code> into prism.
 *
 * @param <String> lang
 *      Code of the language to load.
 * @return <Object?> The prism language object for the provided <code>lang</code> code. <code>undefined</code> if the code is not known to prism.
 */
function loadPrismLang(lang) {
    let langObject = Prism.languages[lang];
    if (langObject === undefined) {
        try {
            require('prismjs/components/prism-' + lang);
            return Prism.languages[lang];
        } catch (e) {
            // nothing to do
        }
    }
    return langObject;
}

function loadPrismPlugin(name) {
    try {
        require(`prismjs/plugins/${name}/prism-${name}`);
    } catch(e) {
        throw new Error(`Cannot load Prism plugin "${name}". Please check the spelling.`);
    }
}

/**
 * Highlights the provided text using Prism.
 *
 * @param <String> text
 *      The text to highlight.
 * @param <String> lang
 *      Code of the language to highlight the text in.
 * @return <String> If Prism can highlight <code>text</code> in using <code>lang</code>, the highlighted code. Unchanged <code>text</code> otherwise.
 */
function highlight(text, lang) {
    const prismLang = loadPrismLang(lang);
    if (prismLang) {
        return Prism.highlight(text, prismLang);
    }
}

function markdownItPrism(markdownit, useroptions) {
    const options = Object.assign({}, DEFAULTS, useroptions);

    options.plugins.forEach(loadPrismPlugin);
    options.init(Prism);

    // register ourselves as highlighter
    markdownit.options.highlight = highlight;
}

var md = new markdownit({
   html:         true,
   highlight: function (str, lang) {
    console.log('here#1: '+lang);
    let grammer = Prism.languages[lang];
    if (grammer !== undefined) {
      try {
        console.log('here#2: '+ lang);
        return Prism.highlight(str, grammer).value;
      } catch (__) {}
    }
    return ''; // use external default escaping
  }
});


//var text      = '#hello, markdown!';
var text = doc.body.textContent;
//var html = sd.makeHtml(text);
var html = md.render(text);

//window.document.write(html);
doc.body.innerHTML = html;

function create_css_link( uri ) { var link = window.document.createElement("link"); link.rel = 'stylesheet'; link.type = 'text/css'; link.href = uri; return link; }

//var cssfile = doc.createElement("link");
//cssfile.id = "mdv_css";
//cssfile.setAttribute("rel", "stylesheet");
//cssfile.setAttribute("type", "text/css");
////cssfile.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/8.6/styles/default.min.css");
//cssfile.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism.min.css");
//doc.head.appendChild(cssfile);
//cssfile.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism-solarizedlight.min.css");
//doc.head.appendChild(cssfile);
//cssfile.setAttribute("href", "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.css");
//doc.head.appendChild(cssfile);

//doc.head.appendChild( doc, "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism.min.css" );
//doc.head.appendChild( doc, "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism-solarizedlight.min.css" );
//doc.head.appendChild( doc, "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.css" );

var link1 = window.document.createElement("link"); link1.rel = 'stylesheet'; link1.type = 'text/css'; link1.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism.min.css";
doc.head.appendChild(link1);
var link2 = window.document.createElement("link"); link2.rel = 'stylesheet'; link2.type = 'text/css'; link2.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism-solarizedlight.min.css";
doc.head.appendChild(link2);
var link3 = window.document.createElement("link"); link3.rel = 'stylesheet'; link3.type = 'text/css'; link3.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.css";
doc.head.appendChild(link3);
var link4 = window.document.createElement("link"); link4.rel = 'stylesheet'; link4.type = 'text/css'; link4.href = "https://cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-highlight/prism-line-highlight.min.css";
doc.head.appendChild(link4);

function replace_document_content() { document.head.innerHTML = doc.head.innerHTML; document.body.innerHTML = doc.body.innerHTML; Prism.highlightAll(); }
window.onload = replace_document_content();

var link = window.document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'data:text/css,' +
  // css selectors
  // ref: [base css ~ sss.css] https://github.com/Thiht/sss/blob/master/sss.css
  // see http://www.cssfontstack.com for font stack info
  'body { font-family: Lora, "Noto Serif", "DejaVu Serif", Palatino, serif; font-size: 1.2em; line-height: 1.35; }' +
  'body { max-width: 90%; }' +
  'h1, h2, h3, h4, h5, h6 { font-family: "Fira Sans", "Open Sans", "DejaVu Sans", Calibri, Arial, sans-serif; }' +
  'h1, h2 { font-weight: 400; }' +
  'h3, h4 { font-weight: 300; }' +
  'h5, h6 { font-weight: 200; }' +
  'h1 { font-size: 3em; }' +
  'h2 { font-size: 2.5em }' +
  'h3 { font-size: 2em }' +
  'h4 { font-size: 1.5em }' +
  'h5, h6 { font-size: 1.25em }' +
  // // see jsfiddle @ http://jsfiddle.net/5HQ7p
  // + "h1:after { content:' '; display:block; border:1px dashed #505050; border-radius:2px; -webkit-border-radius:2px; -moz-border-radius:2px; }"
  'h1 { border-bottom: 0.05em solid lightgrey; border-radius: 2px; }' +
  'h6 { color: grey }' +
  'pre { border-left: 4px solid green; }' +
  'code { font-family: "Fira Mono", "Open Sans Mono", "Anonymous Pro", monospace; font-size: 80%; }' +
  'code { border: 1px solid teal; border-radius: 2px; }' +
  'pre code { padding: 0; border: none; background: none; font-size: 75%; line-height: 1.5; }' +
  'sup code { padding: 0; background: none; font-size: 75%; border: none; }' +
  'table { width: auto; }' +
//`
//.hljs-number,.hljs-symbol,.hljs-literal,.hljs-deletion,.hljs-link { color: #cc6666 }
//.hljs-keyword { color: red }
//` +
  '';
document.getElementsByTagName('HEAD')[0].appendChild(link);
document.getElementsByTagName('BODY')[0].appendChild(link);
