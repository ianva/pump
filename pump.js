/**
 * Utilities for fetching js and css files.
 */
;(function(win) {
  var doc = document
  var head = doc.head ||
      doc.getElementsByTagName('head')[0] ||
      doc.documentElement

  var IS_IE = !+'\v1'
  var baseElement = head.getElementsByTagName('base')[0]
  var IS_IMG_RE = /\.jpg|jpeg|png|gif|bmp(?:\?|$)/i
  var IS_CSS_RE = /\.css(?:\?|$)/i
  var READY_STATE_RE = /loaded|complete|undefined/

  var currentlyAddingScript
  var interactiveScript

  var AP = Array.prototype;
  var toString = Object.prototype.toString;
  var isFunction = function(val) {
    return toString.call(val) === '[object Function]'
  }
  var isString = function(val) {
    return toString.call(val) === '[object String]'
  }
  var isArray = function(val) {
    return toString.call(val) === '[object Array]'
  }

  var fetch = function(url, callback, charset) {
    var isCSS = IS_CSS_RE.test(url);
    var isImg = IS_IMG_RE.test(url);
    var node = isImg?(new Image())
                    :document.createElement(isCSS ? 'link' : 'script')

    if (charset) {
      var cs = isFunction(charset) ? charset(url) : charset
      cs && (node.charset = cs)
    }

    assetOnload(node, callback || noop)
    if(isImg){
        node.src = url;
        return
    }
    if (isCSS) {
      node.rel = 'stylesheet'
      node.href = url
    }
    else {
      node.async = 'async'
      node.src = url
    }

    // For some cache cases in IE 6-9, the script executes IMMEDIATELY after
    // the end of the insertBefore execution, so use `currentlyAddingScript`
    // to hold current node, for deriving url in `define`.
    currentlyAddingScript = node

    // ref: #185 & http://dev.jquery.com/ticket/2709
    baseElement ?
        head.insertBefore(node, baseElement) :
        head.appendChild(node)

    currentlyAddingScript = null
  }

  function assetOnload(node, callback) {
    if(node.nodeName === 'IMG'){
        imgOload(node,callback);
        return
    }
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, callback)
    } else {
      styleOnload(node, callback)
    }
  }
  function removeNode(node){
      if(IS_IE){
          node.removeNode();
      }else{
        if(node && node.parentNode){
            node.parentNode.removeChild(node);
        }
      } 
  }
  function imgOload(node,callback){
      node.onload = node.onerror = function(){
        node.onload = node.onerror = null;
        removeNode(node);
        node = undefined;
        callback();
      }
  }
  function scriptOnload(node, callback) {
    node.onload = node.onerror = node.onreadystatechange = function() {
      if (READY_STATE_RE.test(node.readyState)) {

        // Ensure only run once and handle memory leak in IE
        node.onload = node.onerror = node.onreadystatechange = null

        // Remove the script to reduce memory leak
        removeNode(node);

        // Dereference the node
        node = undefined

        callback()
      }
    }

  }

  function styleOnload(node, callback) {
    // for Old WebKit and Old Firefox
    if (isOldWebKit || isOldFirefox) {
      setTimeout(function() {
        poll(node, callback)
      }, 1) // Begin after node insertion
    }
    else {
      node.onload = node.onerror = function() {
        node.onload = node.onerror = null
        node = undefined
        callback()
      }
    }

  }

  function poll(node, callback) {
    var isLoaded

    // for WebKit < 536
    if (isOldWebKit) {
      if (node['sheet']) {
        isLoaded = true
      }
    }
    // for Firefox < 9.0
    else if (node['sheet']) {
      try {
        if (node['sheet'].cssRules) {
          isLoaded = true
        }
      } catch (ex) {
        // The value of `ex.name` is changed from
        // 'NS_ERROR_DOM_SECURITY_ERR' to 'SecurityError' since Firefox 13.0
        // But Firefox is less than 9.0 in here, So it is ok to just rely on
        // 'NS_ERROR_DOM_SECURITY_ERR'
        if (ex.name === 'NS_ERROR_DOM_SECURITY_ERR') {
          isLoaded = true
        }
      }
    }

    setTimeout(function() {
      if (isLoaded) {
        // Place callback in here due to giving time for style rendering.
        callback()
      } else {
        poll(node, callback)
      }
    }, 1)
  }

    function noop() { }

    function getCurrentScript() {
        //firefox4 and opera
        if (document.currentScript) {
            return document.currentScript;
        } else if (document.attachEvent) {
            if (currentlyAddingScript) {
              return currentlyAddingScript
            }
            // For IE6-9 browsers, the script onload event may not fire right
            // after the the script is evaluated. Kris Zyp found that it
            // could query the script nodes and the one that is in "interactive"
            // mode indicates the current script.
            // Ref: http://goo.gl/JHfFW
            if (interactiveScript &&
                interactiveScript.readyState === 'interactive') {
              return interactiveScript
            }
            var scripts = head.getElementsByTagName('script')
            for (var i = 0; i < scripts.length; i++) {
              var script = scripts[i]
              if (script.readyState === 'interactive') {
                interactiveScript = script
                return script
              }
            }
        } else {
            // 参考 https://github.com/samyk/jiagra/blob/master/jiagra.js
            // chrome and firefox4以前的版本
            var stack;
            try {
                makeReferenceError
            } catch (e) {
                stack = e.stack;
            }
            if (!stack)
                return undefined;
            // chrome uses at, ff uses @
            var e = stack.indexOf(' at ') !== -1 ? ' at ' : '@';
            while (stack.indexOf(e) !== -1) {
                stack = stack.substring(stack.indexOf(e) + e.length);
            }
            stack = stack.replace(/:\d+:\d+$/ig, "");

            var scripts = document.getElementsByTagName('script');
            for (var i = scripts.length - 1; i > -1; i--) {
                if (scripts[i].src === stack) {
                    return scripts[i];
                }
            }
        }
    }
  function currentScriptSrc(){
    var node = getCurrentScript();
    if(!node) return ''
    return (node.hasAttribute ? // non-IE6/7
            node.src :
            // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
            node.getAttribute('src', 4))
  }
  var UA = navigator.userAgent

  // `onload` event is supported in WebKit since 535.23
  // Ref:
  //  - https://bugs.webkit.org/show_activity.cgi?id=38995
  var isOldWebKit = Number(UA.replace(/.*AppleWebKit\/(\d+)\..*/, '$1')) < 536

  // `onload/onerror` event is supported since Firefox 9.0
  // Ref:
  //  - https://bugzilla.mozilla.org/show_bug.cgi?id=185236
  //  - https://developer.mozilla.org/en/HTML/Element/link#Stylesheet_load_events
  var isOldFirefox = UA.indexOf('Firefox') > 0 &&
      !('onload' in document.createElement('link'))

  /*
   * contentloaded.js
   *
   * Author: Diego Perini (diego.perini at gmail.com)
   * Summary: cross-browser wrapper for DOMContentLoaded
   * Updated: 20101020
   * License: MIT
   * Version: 1.2
   *
   * URL:
   * http://javascript.nwbox.com/ContentLoaded/
   * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
   *
   */

  // @win window reference
  // @fn function reference
  function contentLoaded (fn) {
    var done = false, top = true, 
    doc = win.document, 
    root = doc.documentElement,
    add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
    rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
    pre = doc.addEventListener ? '' : 'on',

    init = function(e) {
      if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
      (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
      if (!done && (done = true)) fn.call(win, e.type || e);
    },

    poll = function() {
      try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
      init('poll');
    };

    if (doc.readyState == 'complete') fn.call(win, 'lazy');
    else {
      if (doc.createEventObject && root.doScroll) {
        try { top = !win.frameElement; } catch(e) { }
        if (top) {
          poll();
        }
      }
      doc[add](pre + 'DOMContentLoaded', init, false);
      doc[add](pre + 'readystatechange', init, false);
      win[add](pre + 'load', init, false);
    }
  }
  function fireReadyList() {
    var i = 0, list;
    if (readyList.length) {
      for(; list = readyList[i++]; ) {
         list();
      }
    }
  }
//--------------------

/* pump version 1.0
 * creator : ianva
 * update : 2012.8.9
 */

// {url:'', callChain:[], loaded: true, called : false, type: 'serial'}
var loadList = []
,   readyList = []
,   modules = {}
,   config = {
        charset : 'gbk',
        type : 'serial'
    }
;
var pump = function(name, callback){
    var args = arguments
    ,   length = loadList.length
    ,   index = length -1
    ,   last = loadList[ index ]
    ,   charset = config.charset
    ,   currentScript = getCurrentScript()
    ,   init
    ;
    var moduleInit = function(fn){
        if(length == 0){
            fn();
            return 
        }
        // 在外联scirpt中的模块直接执行
        if( currentScriptSrc() ){
            fn();
            return
        }
        // 内联script中的模块放在前一个外联script的执行队列中
        if(last){ 
            last.loaded? fn() : last.callChain.push( fn )
            return
        }
        fn();
    };

    if( !isFunction(name) && !isString(name)) return

    // 第一个参数为function 
    if(isFunction(name)){
        callback = name;
        moduleInit(callback)
        return
    }
    callback || (callback = noop); 
    
    //只有一个参数为模块名
    if( args.length === 1 ){
       return modules[ name ] && modules[ name ].exports
    }
    //存在两个参数,第一个参数为模块名
    modules[ name ] = {
        init :function(){
            var exports = modules[name].exports;
            callback( exports );
            return exports;
        },
        exports : {}
    }
    init = modules[name].init
    moduleInit(init)
}

var callChain = function(item){
    var  calls = item.callChain
    ,   le = calls.length
    ;
    for(var i = 0; i<le ; i++){
        calls[i].call(win);
    }
    item.called = true;
}

pump.serialLoad = function(src, callback){
    var index 
    ,   prev 
    ,   charset = config.charset
    ;    
    var srcCallback = function(){
        var current = loadList[ index ]
        ,   length = loadList.length
        ;
        current.loade = true;
        callChain( current );
        if( current = loadList[ index + 1 ] ){
            index++
            fetch(current.url, arguments.callee, charset );
        }
    }
    loadList.push({
        url : src,
        callChain : [callback],
        loaded : false,
        called : false,
        type: 'serial'
    });        
    index = loadList.length - 1;
    prev = loadList[ index - 1 ];
    if(index == 0 || prev && prev.called){
        fetch( src, srcCallback, charset ); 
    }
}
pump.parallelLoad = function(src, callback){
    var index 
    ,   charset = config.charset
    ;
    var srcCallback = function (){
        var current = loadList[ index ]
        ,   length = loadList.length
        ,   prev = loadList[ index -1 ]
        ;
        current.loaded = true;
        if( index == 0 || (prev && prev.called) ){
            // 执行当前调用队列
            callChain( current );
            //执行之后已loaded的脚本的调用队列
            for(var i = index;loadList[i++];){
                if(loadList[i] && loadList[i].loaded){
                    callChain( loadList[i] )
                }else{
                    break;
                }
            }    
        }
    }
    loadList.push({
        url : src,
        callChain:[callback], 
        loaded: false, 
        called: false,
        type: 'parallel'
    });
    index = loadList.length - 1; 
    fetch( src, srcCallback, charset );
}
pump.asyncLoad = function(src, callback, charset){
    fetch( src, callback, config.charset);
}
pump.load = function( src, callback, type ){
    if(isString(callback)){
        type = callback;
        callback = noop;
    }
    if(arguments.length == 1){
        callback = noop;
    }
    type = type || config.type;
    return pump[type + 'Load'].call( win, src, callback, config.charset );
}
pump.ready = function( name, callback ){
    if(isFunction(name) && arguments.length == 1) callback = name;
    readyList.push(function(){
        pump(name,callback);
    });
}
pump.clean = function(){
    loadList = [];
    modules = [];
    readyList = [];
}

// domready 
contentLoaded(function(){
    fireReadyList();
});

pump.modules = modules;
pump.config = config;

win.pump = pump;

})(window)
