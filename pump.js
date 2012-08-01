/**
 * Utilities for fetching js and css files.
 */
;(function() {
  var doc = document
  var head = doc.head ||
      doc.getElementsByTagName('head')[0] ||
      doc.documentElement

  var baseElement = head.getElementsByTagName('base')[0]

  var IS_CSS_RE = /\.css(?:\?|$)/i
  var IS_SRC_RE=/\.(?:css|js)(?:\?|$)/i 
  var READY_STATE_RE = /loaded|complete|undefined/

  var currentlyAddingScript

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
  /**
   * The safe wrapper of console.log/error/...
   */
  var log = function() {
    if (typeof console !== 'undefined') {
      var args = AP.slice.call(arguments)

      var type = 'log'
      var last = args[args.length - 1]
      console[last] && (type = args.pop())

      // Only show log info in debug mode
      if (type === 'log' && !config.debug) return

      var out = type === 'dir' ? args[0] : AP.join.call(args, ' ')
      console[type](out)
    }
  }

  var fetch = function(url, callback, charset) {
    var isCSS = IS_CSS_RE.test(url)
    var node = document.createElement(isCSS ? 'link' : 'script')

    if (charset) {
      var cs = isFunction(charset) ? charset(url) : charset
      cs && (node.charset = cs)
    }

    assetOnload(node, callback || noop)

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
    if (node.nodeName === 'SCRIPT') {
      scriptOnload(node, callback)
    } else {
      styleOnload(node, callback)
    }
  }

  function scriptOnload(node, callback) {

    node.onload = node.onerror = node.onreadystatechange = function() {
      if (READY_STATE_RE.test(node.readyState)) {

        // Ensure only run once and handle memory leak in IE
        node.onload = node.onerror = node.onreadystatechange = null

        // Remove the script to reduce memory leak
        if (node.parentNode) {
          head.removeChild(node)
        }

        // Dereference the node
        node = undefined

        callback()
      }
    }

  }

  function styleOnload(node, callback) {

    // for Old WebKit and Old Firefox
    if (isOldWebKit || isOldFirefox) {
      log('Start poll to fetch css')

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

//--------------------

/* pump version 1.0
 * creator : ianva
 * update : 2012.7.31
 */

// {url:'', callChain:[], loaded: true, asyn: false}
var loadList = []
,   domreadyList = []
,   config = {
        charset : 'gbk'
    }
;
var pump = function(name, callback, status){
    var args = arguments
    ,   length = loadList.length
    ,   index = length -1
    ,   last = loadList[ index ]
    ,   charset = config.charset
    ;
    /*var push2Chain = function(){
        if(!last) return 
        // asyn 不挂载任何 callback
        // 存在 asyn 属性时找上一个src
        if( last.asyn ){
            if (index = 0){
                callback();
            }else{
                last = loadList[ index-- ];
                arguments.callee()
            }
        }else{
            last.callChain.push( callback )
        }
    }*/
    var srcCallback = function(){
        var current = last 
        ,   calls = current.callChain
        ,   le = calls.length
        ;

        for(var i = 0; i<le ; i++){
            calls[i]()
        }
        current.loaded = true
    }

    callback || callback = noop; 
    
    // 第一个参数为function 
    if(isFunction(name)){

        callback = name;
        status = callback;

        if(length == 0){
            callback();
            return 
        }
        if( status == 'domready' ){
            domreadyList.push(callback) 
            return
        }
        last && last.callChain.push( callback )
        return
    }
    // 第一个参数为js,css
    if( IS_SRC_RE.test(name) ){
        if( status == 'asyn' ){
            fetch( name, callback, charset);
            return
        }
        loadList.push({
            url : name,
            callChain:[callback], 
            loaded: false, 
            asyn: false
        });
        fetch( name, srcCallback, charset );
    }
    
    
}   



})()



