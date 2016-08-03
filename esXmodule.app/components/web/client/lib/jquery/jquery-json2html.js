/**
* JavaScript Pluggin
* @file: jquery-json2html.js 
* @autor: Aleksej Tokarev
* @lizenz: GNU GPL
* @version: 1.2
*/
(function($){
$.fn.json2html = function(pJson, pCollapsAll){
	// CSS inkludieren
	var cssId = 'jquery-json2html-css-style';
	if(!$('#'+cssId).length){ // Wenn noch kein CSS eingebunden ist
		$('<style id="'+cssId+'">')
		.prop("type", "text/css")
		.html("\
			.js2html-array{\
			\
			}\
			.js2html-object{\
			\
			}\
			.js2html-toggler{\
				font-style: italic;\
				cursor: pointer;\
				font-size: 80%;\
			}\
			.js2html-toggler:hover{\
				background-color: #0F0;\
			}\
			\
			js2html-selected{\
				background-color: #999;\
			}\
			.js2html-key{\
				cursor: pointer;\
				font-weight: bold;\
			}\
			.js2html-key:hover{\
				color: #00E;\
			}\
			.js2html-key-hidden{\
				color: #999;\
				text-shadow: 1px 0px #000;\
				text-decoration: underline;\
			}\
			.js2html-string{\
				font-style: italic;\
				color: #00A;\
			}\
			.js2html-number{\
				color: #F00;\
			}\
			.js2html-boolean{\
				color: #A00;\
			}\
			.js2html-symbol{\
				color: #A00;\
			}\
			.js2html-undefined{\
				font-style: italic;\
				text-decoration: underline;\
				color: #F00;\
			}\
			.js2html-function{\
			\
			}\
			.js2html-other{\
			\
			}\
		")
		.appendTo("head");
	}
	var collapsAll = pCollapsAll, // Defaultmäsig aus Parameter nemen
	closeElement	= '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
	openElement		= ' . . . ';

	// Wenn über Tag bestimmt wird, dann übergebene Parameter "pCollapsAll" ignorieren und aus attribut "collaps-all" bestimmen
	if(this.attr('collaps-all')){
		collapsAll = (this.attr('collaps-all').toLowerCase() === 'true');
	}

	var html			= convert(pJson, collapsAll),
		clickTiemoutId	= -1,
		clickCount		= 0,
		clickDelay		= 250; // Abstand zwischen klicks
	
	this.html(html);
	
	// Geändert von Aleksej 15.02.2016
	this.find(".js2html-toggler").mousedown(function(e){
		// Geändert von Aleksej 19.05.2016
		// Damit Click-Event nicht aus dem Plugin rauskommt
		// Macht Sinn wenn Element in einer Tabelle eingefügt ist und man mit "ctrl"+"click" auf Öffnen klickt, dann widt Tabellenzelle als selektiert markiert. Genau das mus verhindetr werden!
		e.stopPropagation();
		e.preventDefault();
		return false;
	}).dblclick(function (e) {
		//system double-click event Stoppen
		e.preventDefault();
	}).click(function(e){
		clickCount++;
		
		if (clickCount === 1) {
			clickTiemoutId = setTimeout(function () {
				clickCount = 0;
				// Singleklick
				toogle($(this), false); // Nur geklickte Elment toggeln
			}.bind(this), clickDelay);
		} else {
			clearTimeout(clickTiemoutId);
			clickCount = 0;
			// Doppelklick
			toogle($(this), true); // Auch unterelement toogeln
		}
		
		return false;
	});
	
	function toogle(toggler, propagate) {
		var div = toggler.next("div");
		
		div.toggle("fast", function(){
			if(div.is(":visible")){
				toggler.html(closeElement);
				
				// Geändert von Aleksej 19.05.2016
				if (propagate) {
					div.find(".js2html-array").show("fast");
					div.find(".js2html-object").show("fast");
					div.find(".js2html-toggler").html(closeElement);
				}
			}else{
				toggler.html(openElement);
				
				// Geändert von Aleksej 19.05.2016
				if (propagate) {
					div.find(".js2html-array").hide("fast");
					div.find(".js2html-object").hide("fast");
					div.find(".js2html-toggler").html(openElement);
				}
			}
		});
	};
	
	function convert(jsonObject, collapsAll){
		var html = '<div class="js2html-body">';
		
		var colapser = closeElement, 
		divvisible = 'style = "display: block"';
		if(collapsAll){
			colapser = openElement;
			divvisible = 'style = "display: none"';
		}
		
		function _createSpace(length){
			var space = '<span>';
			for(var i=0; i<length; i++){
				space += '&nbsp;&nbsp;&nbsp;&nbsp;';
			}
			return space+'</span>';
		};

		function _escape(str){
			var div = document.createElement('div');
			div.appendChild(document.createTextNode(str));
			return div.innerHTML;
		};
		
		function _parseRekursive(o, level){
			level++;
			var result = "";
			if(Object.prototype.toString.call(o) === '[object Array]'){
				result += '[ <span class="js2html-toggler">'+colapser+'</span> <div class="js2html-array" '+divvisible+'>';
				for(var i=0; i<o.length; i++){
					result += _createSpace(level)+_parseRekursive(o[i], level)+',<br/>';
				}
				// letzte Komma und <br/> abschneiden
				if(result.charAt(result.length-6) === ','){
					result = result.substr(0, result.length-6);
				}
				result += '</div>'+_createSpace(level-1)+']';
			}else if(Object.prototype.toString.call(o) === '[object Object]'){
				result += '{ <span class="js2html-toggler">'+colapser+'</span> <div class="js2html-object" '+divvisible+'>';
				for(var key in o){
					if(o.hasOwnProperty(key)){
						result += _createSpace(level)+'"<span class="js2html-key">'+key+'</span>" : '+_parseRekursive(o[key], level)+',<br/>';
					}
				}
				// letzte Komma und <br/> abschneiden
				if(result.charAt(result.length-6) === ','){
					result = result.substr(0, result.length-6);
				}
				result += '</div>'+_createSpace(level-1)+'}';
			}else{
				if(typeof o === 'string' || o instanceof String){
					result += ' <span class="js2html-string">"'+_escape(o)+'"</span>';
				}else if(typeof o === 'boolean'){
					result += ' <span class="js2html-boolean">'+o+'</span>';
				}else if(typeof o === 'symbol'){
					result += ' <span class="js2html-symbol">'+o+'</span>';
				}else if(typeof o === 'undefined'){
					result += ' <span class="js2html-undefined">"'+o+'"</span>';
				}else if(typeof o === 'function'){
					result += ' <span class="js2html-function">"'+o+'"</span>';
				}else if(!isNaN(o)){
					result += ' <span class="js2html-number">'+o+'</span>';
				}else{
					result += ' <span class="js2html-other">'+_escape(o)+'</span>';
				}
			}
			
			return result;
		};

		html += _parseRekursive(jsonObject, 0);
		
		return html+'</div>';
	};
	
	return html;
};
}(jQuery));