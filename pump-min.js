(function(D){var e=document;var i=e.head||e.getElementsByTagName("head")[0]||e.documentElement;var t=!+"\v1";var a=i.getElementsByTagName("base")[0];var b=/\.jpg|jpeg|png|gif|bmp(?:\?|$)/i;var h=/\.css(?:\?|$)/i;var H=/loaded|complete|undefined/;var A;var n;var G=Array.prototype;var d=Object.prototype.toString;var k=function(K){return d.call(K)==="[object Function]"};var g=function(K){return d.call(K)==="[object String]"};var q=function(K){return d.call(K)==="[object Array]"};var z=function(L,Q,P){var K=h.test(L);var O=b.test(L);var N=O?(new Image()):document.createElement(K?"link":"script");if(!O&&P){var M=k(P)?P(L):P;M&&(N.charset=M)}E(N,Q||F);if(O){N.src=L;return}if(K){N.rel="stylesheet";N.href=L}else{N.async="async";N.src=L}A=N;a?i.insertBefore(N,a):i.appendChild(N);A=null};function E(K,L){if(K.nodeName==="IMG"){C(K,L);return}if(K.nodeName==="SCRIPT"){c(K,L)}else{J(K,L)}}function f(K){if(t){K.removeNode()}else{if(K&&K.parentNode){K.parentNode.removeChild(K)}}}function C(K,L){K.onload=K.onerror=function(){K.onload=K.onerror=null;f(K);K=undefined;L()}}function c(K,L){K.onload=K.onerror=K.onreadystatechange=function(){if(H.test(K.readyState)){K.onload=K.onerror=K.onreadystatechange=null;f(K);K=undefined;L()}}}function J(K,L){if(o||m){setTimeout(function(){B(K,L)},1)}else{K.onload=K.onerror=function(){K.onload=K.onerror=null;K=undefined;L()}}}function B(M,N){var K;if(o){if(M.sheet){K=true}}else{if(M.sheet){try{if(M.sheet.cssRules){K=true}}catch(L){if(L.name==="NS_ERROR_DOM_SECURITY_ERR"){K=true}}}}setTimeout(function(){if(K){N()}else{B(M,N)}},1)}function F(){}function l(){if(document.currentScript){return document.currentScript}else{if(document.attachEvent){if(A){return A}if(n&&n.readyState==="interactive"){return n}var L=i.getElementsByTagName("script");for(var N=0;N<L.length;N++){var M=L[N];if(M.readyState==="interactive"){n=M;return M}}}else{var K;try{makeReferenceError}catch(O){K=O.stack}if(!K){return undefined}var O=K.indexOf(" at ")!==-1?" at ":"@";while(K.indexOf(O)!==-1){K=K.substring(K.indexOf(O)+O.length)}K=K.replace(/:\d+:\d+$/ig,"");var L=document.getElementsByTagName("script");for(var N=L.length-1;N>-1;N--){if(L[N].src===K){return L[N]}}}}}function I(){var K=l();if(!K){return""}return(K.hasAttribute?K.src:K.getAttribute("src",4))}var u=navigator.userAgent;var o=Number(u.replace(/.*AppleWebKit\/(\d+)\..*/,"$1"))<536;var m=u.indexOf("Firefox")>0&&!("onload" in document.createElement("link"));function j(P){var L=false,O=true,R=D.document,Q=R.documentElement,U=R.addEventListener?"addEventListener":"attachEvent",S=R.addEventListener?"removeEventListener":"detachEvent",K=R.addEventListener?"":"on",T=function(V){if(V.type=="readystatechange"&&R.readyState!="complete"){return}(V.type=="load"?D:R)[S](K+V.type,T,false);if(!L&&(L=true)){P.call(D,V.type||V)}},N=function(){try{Q.doScroll("left")}catch(V){setTimeout(N,50);return}T("poll")};if(R.readyState=="complete"){P.call(D,"lazy")}else{if(R.createEventObject&&Q.doScroll){try{O=!D.frameElement}catch(M){}if(O){N()}}R[U](K+"DOMContentLoaded",T,false);R[U](K+"readystatechange",T,false);D[U](K+"load",T,false)}}function x(){var K=0,L;if(r.length){for(;L=r[K++];){L()}}}var w=[],r=[],s={},y={charset:"gbk",type:"serial"};var v=function(K,R){var P=arguments,L=w.length,O=L-1,Q=w[O],M=y.charset,N=l(),T;var S=function(U){if(L==0){U();return}if(I()){U();return}if(Q){Q.loaded?U():Q.callChain.push(U);return}U()};if(!k(K)&&!g(K)){return}if(k(K)){R=K;S(R);return}R||(R=F);if(P.length===1){return s[K]&&s[K].exports}s[K]={init:function(){var U=s[K].exports;R(U);return U},exports:{}};T=s[K].init;S(T)};var p=function(N){var M=N.callChain,L=M.length;for(var K=0;K<L;K++){M[K].call(D)}N.called=true};v.serialLoad=function(N,P){var L,M,O=y.charset;var K=function(){var R=w[L],Q=w.length;R.loade=true;p(R);if(R=w[L+1]){L++;z(R.url,arguments.callee,O)}};w.push({url:N,callChain:[P],loaded:false,called:false,type:"serial"});L=w.length-1;M=w[L-1];if(L==0||M&&M.called){z(N,K,O)}};v.parallelLoad=function(M,O){var L,N=y.charset;var K=function(){var S=w[L],R=w.length,Q=w[L-1];S.loaded=true;if(L==0||(Q&&Q.called)){p(S);for(var P=L;w[P++];){if(w[P]&&w[P].loaded){p(w[P])}else{break}}}};w.push({url:M,callChain:[O],loaded:false,called:false,type:"parallel"});L=w.length-1;z(M,K,N)};v.asyncLoad=function(K,M,L){z(K,M,y.charset)};v.load=function(L,M,K){if(g(M)){K=M;M=F}if(arguments.length==1){M=F}K=K||y.type;return v[K+"Load"].call(D,L,M,y.charset)};v.ready=function(K,L){if(k(K)&&arguments.length==1){L=K}r.push(function(){v(K,L)})};v.clean=function(){w=[];s=[];r=[]};j(function(){x()});v.modules=s;v.config=y;D.pump=v})(window);
