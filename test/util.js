//testing helpers stuff


function listen(el, evt, fn){
	//bind target fn
	if (typeof $ !== "undefined"){
		//delegate to jquery
		$(el).on(evt, fn);
	} else {
		//listen element
		el.addEventListener(evt, fn)
	}
}
function stopListen(el, evt, fn){
	//bind target fn
	if (typeof $ !== "undefined"){
		//delegate to jquery
		$(el).off(evt, fn);
	} else {
		//listen element
		el.removeEventListener(evt, fn)
	}
}