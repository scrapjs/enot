(function(){function fa(a,b){if(a)for(var c=z.parse(a+""),d=c[0].split(/\s*,\s*/),e=0;e<d.length;e++)b(z.stringify(d[e],c),e)}function ga(a,b){var c=this===window?document:this;return"string"==typeof a?b?ha.call(c.querySelectorAll(a),0):c.querySelector(a):a instanceof Node||a===window||!a.length?b?[a]:a:ha.call(a,0)}function s(a,b){var c=D.get(a);return b?c&&c[b]||[]:c||{}}function p(a,b,c){if(a){var d,e;if(void 0===c){var f=a.removeAll||a.removeAllListeners;f&&f.call(a,b,c);d=ia(a);if(void 0===b)for(b in d)p(a,
b);else b.split(/\s+/).forEach(function(b){if(d[b])for(var c=d[b].length;c--;)p(a,b,d[b][c])})}else{var q=a.off||a.removeEventListener||a.removeListener;b.split(/\s+/).forEach(function(b){if(q)if(ja.freeze(a,"off"+b))q.call(a,b,c),ja.a(a,"off"+b);else return;b=ia(a,b);for(e=0;e<b.length;e++)if(b[e]===c||b[e].fn===c){b.splice(e,1);break}})}}}function l(a,b,c,d){if(a){var e=a.on||a.addEventListener||a.addListener,f;f=d?l.wrap(c,d):c;b.split(/\s+/).forEach(function(b){if(e)if(ka.freeze(a,"on"+b))e.call(a,
b,f),ka.a(a,"on"+b);else return f;Ba.add(a,b,f,d)});return f}}function E(a,b,c,d){return Ca(a,b,E.wrap(a,b,c,d))}function la(a,b,c,d){var e,f=b;a.nodeType||a===Da||a===Ea?(b instanceof Event?f=b:(f=document.createEvent("CustomEvent"),f.initCustomEvent(b,d,!0,c)),e=a.dispatchEvent):Q&&a instanceof Q?(f=Q.Event(b,c),f.detail=c,e=d?targte.trigger:a.triggerHandler):e=a.emit||a.trigger||a.fire||a.dispatchEvent;var q=R(arguments,2);if(e&&ma.freeze(a,"emit"+b))e.apply(a,[f].concat(q)),ma.a(a,"emit"+b);else for(e=
Fa(a,f),e=R(e),f=0;f<e.length;f++)e[f]&&e[f].apply(a,q)}function F(a,b,c,d){return na(a,b,F.wrap(a,b,c,d))}function G(a,b,c,d){return oa(a,b,G.wrap(a,b,c,d))}function A(a,b,c){if(a){var d=a.once||a.one||a.addOnceEventListener||a.addOnceListener,e;e=A.wrap(a,b,c,Ga);b.split(/\s+/).forEach(function(b){if(d&&pa.freeze(a,"one"+b)){var q=d.call(a,b,c);pa.a(a,"one"+b);return q}Ha(a,b,e)});return e}}function H(a,b,c,d){return qa(a,b,H.wrap(a,b,c,d))}function I(a,b,c,d){return ra(a,b,I.wrap(a,b,c,d))}function h(a){if(a){for(var b in t)a[b]=
t[b];return a}}function sa(a,b){if(!b)return w(a)?a:[a];if(a===window)a===[S];else if(!Ia(a)&&!w(a))return[a];b=ta(a,b);var c,d,e=J.parse(b);if(c=/:(parent|closest|next|prev|root)(?:\\([0-9]+))?/.exec(e[0])){d=c[1];var f=c.index,q=J.stringify(e[c[2]],e);c=c[0];f&&(a=ua(a,J.stringify(e[0].slice(0,f),e)));d=T(a,U[d],q);if(!d)return null;if(w(d)&&!d.length)return d;e=J.stringify(e[0].slice(f+c.length).trim(),e);e=ta(d,e);d=sa(d,e)}else d=ua(a,b);return d}function ua(a,b){return w(a)?T(a,function(a,b){return ga.call(a,
b,!0)},b):ga.call(a,b,!0)}function T(a,b,c){var d=[];w(a)||(a=[a]);for(var e=a.length,f;e--;)(f=a[e])&&(f=b(f,c))&&(d=[].concat(f,d));return d}function ta(a,b){if(!Ja(b))return b;b=b.trim();if(!va){if(":scope"===b.slice(0,6))b=b.slice(6);else if(">"!==b[0])return b;var c=(1E9*Math.random()>>>0)+Ka++;T(a,function(a,b){a.setAttribute("data-__qr",b);return a},c);b='[data-__qr="'+c+'"]'+b}else if(">"===b[0])return":scope "+b;return b}function r(a){if(!a)return a;for(var b in B)a[b]=B[b];return a}function K(a,
b){var c=b[0],d=b[1];La(d)||V(c)?(c=null,d=b[0],b=C(b,0)):b=C(b,1);if(d)if(b=C(b,1),d&&"object"===typeof d&&d.constructor===Object)for(var e in d)fa(e,function(b){K(a,[c,b].concat(d[b]))});else V(d)?fa(d,function(d){var e=W(d),g;g=c;e=e[0];g||(g=[document]);g=e?"window"===e?[window]:"document"===e?[document]:Ma(g,e,!0):Na(g)?g:[g];for(var e=0,h=g.length;e<h;e++)a.apply(g[e],[g[e],d].concat(b))}):a.apply(c,[c,d].concat(b))}function W(a){var b=["",""],c=a.match(/[\w\.\:\$\-]+(?:\:[\w\.\:\-\$]+(?:\(.+\))?)*$/)[0];
b[0]=a.slice(0,-c.length).trim();a="on"===c.slice(0,2)?L(c.slice(2)):c;b[1]=a;return b}function Oa(a,b,c){if(c){var d=c,e=wa.parse(b);b=e[0].split(":");var f=b.shift();b.sort(function(a,b){return"once"===a||"one"===a?-1:"once"===b||"one"===b?1:0}).forEach(function(b){var g=b.split("\\");b=g[0];(g=wa.stringify(e[g[1]],e))||(g=function(a,b,d){X(a,b,d);X(a,b,c)});m[b]&&(d=m[b](a,f,d,g))});return d}}window.Emitter=r;var L,u,x,y,M,Y,v,xa,n,k,z,N,O,Z;L=function(a){return a.toLowerCase()};u={freeze:function(a,
b){var c=P.get(a);if(c&&c[b])return!1;c||(c={},P.set(a,c));return c[b]=!0},a:function(a,b){var c=P.get(a);if(!c||!c[b])return!1;c[b]=null;return!0},isFrozen:function(a,b){var c=P.get(a);return c&&c[b]}};var P=new WeakMap;"use strict";k=Element.prototype;var ya=k.matches||k.matchesSelector||k.webkitMatchesSelector||k.mozMatchesSelector||k.msMatchesSelector||k.b;x=function(a,b){if(ya)return ya.call(a,b);for(var c=a.parentNode.querySelectorAll(b),d=0;d<c.length;d++)if(c[d]==a)return!0;return!1};y=function(a){return"string"===
typeof a||a instanceof String};var D=new WeakMap;s.add=function(a,b,c){D.has(a)||D.set(a,{});a=D.get(a);(a[b]=a[b]||[]).push(c)};M=function(a,b){if(a.contains)return a.contains(b);var c=a.compareDocumentPosition(b);return 0===c||c&16};L=function(a){return(a+"").toLowerCase()};Y=function(a){return a instanceof Array};var ha=[].slice;v=function(a){return!(!a||!a.apply)};(function(a){function b(a){for(var b=[],c=0;c<a.length;c++)-1===b.indexOf(a[c])&&b.push(a[c]);return b}function c(a){var b=new Set;
return a.filter(function(a){if(!b.has(a))return b.add(a),!0})}function d(a){var b=[];(new Set(a)).forEach(function(a){b.push(a)});return b}function e(){var a=!1;(new Set([!0])).forEach(function(b){a=b});return a}xa="Set"in a?"function"===typeof Set.prototype.forEach&&e()?d:c:b}).call(this,"undefined"!==typeof global?global:"undefined"!==typeof self?self:"undefined"!==typeof window?window:{});n=function(a){return"undefined"!==typeof document&&a instanceof Node};k=k=function(a,b,c){var d=[],e=a.length;
if(0===e)return d;b=0>b?Math.max(0,b+e):b||0;for(void 0!==c&&(e=0>c?c+e:c);e-- >b;)d[e-b]=a[e];return d};var ja=u,ia=s,ka=u,Ba=s;l.wrap=function(a,b,c,d){function e(){if(d.apply(a,arguments))return c.apply(a,arguments)}e.fn=c;return e};z={parse:function(a,b){function c(a){return"\\"+d.push(a.slice(1,-1))}if("string"!==typeof a)return[a];var d=[],e;b=b||"()";for(var f=new RegExp(["\\",b[0],"[^\\",b[0],"\\",b[1],"]*\\",b[1]].join(""));a!=e;)e=a,a=a.replace(f,c);d.unshift(a);return d},stringify:function(a,
b,c){function d(a){return c[0]+b[a.slice(1)]+c[1]}var e;if(!a)return"";"string"!==typeof a&&(c=b,b=a,a=b[0]);for(c=c||"()";a!=e;)e=a,a=a.replace(/\\[0-9]+/,d);return a}};var aa=document,Pa=aa.documentElement;N=function(a,b){if(!n(a))throw Error("Bad argument "+a);if(a===aa)return Pa;if(!b||(n(b)?a==b:x(a,b)))return a;for(;(a=a.parentNode)&&a!==aa;)if(!b||(n(b)?a==b:x(a,b)))return a};var Ca=l;E.wrap=function(a,b,c,d){function e(){var a=arguments,b=this;setTimeout(function(){c.apply(b,a)},d)}v(d)&&
(a=d,d=c,c=a);e.fn=c;return e};var ba=document,Qa=ba.documentElement,ma=u,Fa=s,R=k;O=function(a,b){if(a){var c=arguments;if(y(b))b.split(/\s+/).forEach(function(b){la.apply(this,[a,b].concat(R(c,2)))});else return la.apply(this,arguments)}};var Q="undefined"===typeof jQuery?void 0:jQuery,Da="undefined"===typeof document?void 0:document,Ea="undefined"===typeof window?void 0:window;Z=function(a){return Y(a)||a&&!y(a)&&!a.nodeType&&("undefined"!=typeof window?a!=window:!0)&&!v(a)&&"number"===typeof a.length};
var Ra={"\u2325":18,alt:18,option:18,backspace:8,capslock:20,caps:20,clear:12,context:93,"\u2318":91,cmd:91,command:91,"\u2303":17,ctrl:17,control:17,del:46,"delete":46,down:40,end:35,"\u2386":13,enter:13,"return":13,esc:27,escape:27,home:36,insert:45,left:37,pagedown:34,"pg-down":34,pageup:33,"pg-up":33,pause:19,right:39,"\u21e7":16,shift:16,space:32,tab:9,up:38,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,leftmouse:1,rightmouse:3,middlemouse:2,"*":106,"+":107,
plus:107,"-":109,minus:109,";":186,semicolon:186,"=":187,equals:187,",":188,dash:189,".":190,"/":191,"`":192,"~":192,"[":219,"\\":220,"]":221,"'":222},Sa=L,na=l;F.wrap=function(a,b,c,d){if(d)return d=Y(d)?d:y(d)?d.split(/\s*,\s*/):[d],d=d.map(Sa),na.wrap(a,b,c,function(a){for(var b=void 0!==a.which?a.which:a.keyCode,c=d.length;c--;)if(a=d[c],b==a||Ra[a]==b)return!0})};var oa=l;G.wrap=function(a,b,c,d){function e(){c.apply(a,arguments);p(a,b,e);setTimeout(function(){oa(a,b,e)},d)}if(v(d)){var f=d;
d=c;c=f}e.fn=c;return e};var pa=u,Ha=l,Ga=p;A.wrap=function(a,b,c,d){function e(){d(a,b,e);c.apply(a,arguments)}e.fn=c;return e};var qa=l,za="undefined"!==typeof document?N:null;H.wrap=function(a,b,c,d){if(za){if(v(d)){var e=d;d=c;c=e}return qa.wrap(a,b,c,function(b){b=b.target;return M(a,b)?(b=za(b,d))&&M(a,b)?!1:!0:!1})}};var ra=l,Aa="undefined"!==typeof document?N:null;I.wrap=function(a,b,c,d){if(Aa){if(v(d)){var e=d;d=c;c=e}return ra.wrap(a,b,c,function(b){var c=b.target;if(c!==a&&(c=Aa(c,d))&&
a!==c&&M(a,c))return b.delegateTarget=c,!0})}};var Ta=k,t=h.prototype;t.on=function(a,b,c){l(this,a,b,c);return this};t.once=function(a,b){A(this,a,b);return this};t.off=function(a,b){p(this,a,b);return this};t.emit=function(){O.apply(this,[this].concat(Ta(arguments)));return this};t.listeners=function(a){return s(this,a)};t.hasListeners=function(a){return!!s(this,a).length};var Ua=document.documentElement,S=document,U={closest:N,parent:function(a,b){if(!n(a))throw Error("Bad argument "+a);if(a===
ba)return Qa;for(;(a=a.parentNode)&&a!==ba;)if(!b||(n(b)?a==b:x(a,b)))return a},prev:function(a,b){if(!n(a))throw Error("Bad argument "+a);for(;a=a.previousSibling;)if(1===a.nodeType&&(!b||(n(b)?a===b:x(a,b))))return a},next:function(a,b){if(!n(a))throw Error("Bad argument "+a);for(;a=a.nextSibling;)if(1===a.nodeType&&(!b||(n(b)?a===b:x(a,b))))return a},root:function(){return Ua}},w=Z,Ja=y,Ia=n,J=z,Va=xa,va=!0;try{S.querySelector(":scope")}catch(Ya){va=!1}u=function(a,b,c){"string"===typeof a&&(c=
b,b=a,a=S);if(!a)return c?[]:null;a=sa(a,b);return!c&&w(a)?a[0]:Va(a)};var Ka=Date.now()%1E9,ca;for(ca in U)u[ca]=U[ca];h.on=function(a,b,c,d){l(a,b,c,d);return this};h.once=function(a,b,c){A(a,b,c);return this};h.off=function(a,b,c){p(a,b,c);return this};h.emit=function(){O.apply(this,arguments);return this};h.delegate=function(a,b,c,d){I(a,b,c,d);return this};h.later=function(a,b,c,d){E(a,b,c,d);return this};h.keypass=function(a,b,c,d){F(a,b,c,d);return this};h.throttle=function(a,b,c,d){G(a,b,
c,d);return this};h.not=function(a,b,c,d){H(a,b,c,d);return this};h.listeners=s;h.hasListeners=function(a,b){return!!s(a,b).length};var C=k,La=v,V=y,Na=Z,Ma=u,wa=z,da;for(da in h)r[da]=h[da];var B=r.prototype=Object.create(h.prototype);B.on=function(a,b,c){Wa(this,a,b,c);return this};B.off=function(a,b){p(this,a,b);X(this,a,b);return this};B.emit=function(){Xa.apply(this,[this].concat(C(arguments)));return this};var ea=new WeakMap,Wa=r.on=function(){K(function(a,b,c){if(c){var d=W(b);b=d[1].split(":")[0];
var d=Oa(a,d[1],c),e;(e=ea.get(c))||ea.set(c,e={});(e[b]||(e[b]=[])).push(d);l(a,b,d)}},arguments);return r},X=r.off=function(){K(function(a,b,c){b=W(b)[1].split(":")[0];if(c){if(c=ea.get(c))if(c=c[b])for(var d=c.length;d--;)p(a,b,c[d])}else p(a,b,c)},arguments);return r},Xa=r.emit=function(){K(function(a,b){V(b)&&(b=b.split(":")[0]);O.apply(a,[a,b].concat(C(arguments,2)))},arguments);return r},m={};m.on=m.delegate=I.wrap;m.not=H.wrap;m.pass=m.keypass=F.wrap;m.one=m.once=A.wrap;m.throttle=G.wrap;
m.later=E.wrap})();
