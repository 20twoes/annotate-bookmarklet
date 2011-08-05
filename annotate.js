var ant = ant || {};

// Holds the current time of the video
ant.time = 0;

ant.logger = {

	key : null,
		  
	init : function() {
		this.key = 'mediabistro.ant.' + window.location + '.' + ant.video.src;
	},

	log : function( val ) {
		window.localStorage.setItem( this.key, JSON.stringify(val) );
		//console.log(this.key);
	},

	get : function() {
		//console.log(this.key);
		return JSON.parse( window.localStorage.getItem( this.key ) );
	}
};

ant.main = function($) {
	console && console.log('main');

	// Define storage key
	this.logger.init();

	// Remove script so that we don't accumulate on multiple bookmarklet presses
	$("script[src='http://al.mediabistro.net/labs/al/annotate/annotate.js']").remove();


	// Build interface __
	
	// Get video position in window
	this.video.offset = $(this.video).offset();
	this.video.offset.right = this.video.offset.left + $(this.video).width();
	this.video.offset.bottom = this.video.offset.top + $(this.video).height();

	// input text box
	if (!$('#ant-input').length) {
		this.input = $('<div id="ant-input-wrap" class="ant-draggable"><div class="ant-move">[move]</div><input type="text" id="ant-input" value="Enter notes!!!" /></div>');
		$('body').append(this.input);
		$('#ant-input-wrap').css({
			'margin': '1em 0',
			'padding': '0 1em 1em 1em',
			'border': '5px solid #000',
			'background-color': '#fff',
			'position': 'absolute',
			'top': this.video.offset.bottom,
			'left': this.video.offset.left,
			'width': '400px',
			'z-index': '99999'
		});
		$('#ant-input').css({
			'width': '100%'
		});
	}

	// display
	if (!$('#ant-display').length) {
		this.display = $('<div id="ant-display" class="ant-draggable"><div class="ant-move">[move]</div><h2>Notes</h2><ul></ul></div>');
		$('body').append(this.display);
		$('#ant-display').css({
			'margin': '0 1em',
			'padding': '0 1em 1em 1em',
			'border': '5px solid #000',
			'background-color': '#fff',
			'position': 'absolute',
			'top': this.video.offset.top,
			'left': this.video.offset.right,
			'background-color': 'white',
			'text-align': 'left',
			'z-index': '99999'
		});
		$('#ant-display ul').css({
			'margin': '0',
			'padding': '0',
			'list-style-type': 'none'
		});
		$('#ant-display h2').css({
			'color': '#000'
		});
	}

	// Allow boxes to be moved around
	$(function() {
		$('.ant-draggable').draggable();
	});
	$('.ant-move').css({
		'margin': '0 0 1em 0',
		'padding': '0',
		'text-align': 'right',
		'color': '#000'
	});


	// Notes controller __

	this.notes = {

		arr : [],
		list : $('#ant-display ul'),

		add : function(val) {

			if (!val)
				return;

			var o = { note: val, time: this.time };
			this.arr.push(o);
			//console.log(this.arr);
			this.updateList();
			this.arr.sort( function(a,b) {
				return (a.time - b.time);
			});
			this.refresh();
		},

		updateList : function (i) {
			if (i == null) {
				i = this.arr.length - 1;
			}
			var o = this.arr[i];

			//console.log(o);

			var str = '<a href="#rm" class="ant-note-rm" data-id="' + i + '" title="Delete">[x]</a> :: <a href="#" class="ant-note-link" data-time="' + o.time + '" title="' + o.time + ' sec">' + o.note + '</a>';
			this.list.append( '<li>' + str + '</li>' );
		},

		refresh : function () {
			this.list.empty();

			//console.log(this.list.html());

			for ( var i = 0; i < this.arr.length; ++i ) {
				this.updateList( i );
			}
		},

		delete : function(i) {
			this.arr.splice( i, 1 );
		}

	};

	
	// Attach event handlers __

	// init text input field
	$('#ant-input')
		.keypress( function( pEvent ) {
			var th = $(this);

			// use the time when you start typing instead of when you hit enter
			// minus a second 
			if ( !th.val() ) {
				ant.time = ant.video.currentTime - 1;
			}

			if ( pEvent.which == '13' ) {
				ant.notes.add( th.val() );
				th.val('');
			}
		})
		.focus( function() {
			var th = $(this);
			th.val('');
		});

	$('.ant-note-link').live('click', function(e) {
		var t = $(this);
		//console.log( t.attr('data-time'));
		ant.video.currentTime = t.attr('data-time');
		e.preventDefault();
	});

	$('.ant-note-rm').live('click', function(e) {
		var t = $(this);
		ant.notes.delete( t.attr('data-id') );
		t.parent().remove();
		e.preventDefault();
	});

	$(window).unload( function() {
		ant.logger.log( ant.notes.arr );
	});


	// Highlight note when video time matches __

	this.highlightNote = function() {
		var defaultVal = '16px';
		var highlightedVal = '32px';
		var cssProperty = 'font-size';
		var t = parseInt(this.video.currentTime);
		var links = $('.ant-note-link');
		var resetHighlights = function() {
			links.each( function() {
				$(this).css(cssProperty, defaultVal);
				//console && console.log(defaultVal);
			});
		};
		links.each( function() {
			var th = $(this);
			if ( t == parseInt(th.attr('data-time')) ) {
				resetHighlights();
				th.css(cssProperty, highlightedVal);
			}
		});
		setTimeout('ant.highlightNote();', 500);
	};


	// Init __

	$(document).ready( function() {

		// Load notes from local storage
		if (ant.notes) {
			ant.notes.arr = ant.logger.get() || [];
			ant.notes.refresh();
		}

		// Run highlighting engine
		ant.highlightNote();
	});

};


// Dependencies
ant.load = function(id, src) {
	var el = document.createElement('script');
	el.type = 'text/javascript';
	el.src = src;
	(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(el);
	ant[id] = el;
};
ant.loadJqueryUI = function() {
	var main = function() {
		ant.main(jQuery);
	};

	if (typeof jQuery.ui == 'undefined') {
		ant.load( 'jqueryui', 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js' );
		ant.jqueryui.addEventListener('load', main);
	} else {
		main();
	}
};


// Bootleg
ant.bootleg = function() {
	// Get the video we're going to annotate
	ant.video = document.getElementsByTagName('video');
	ant.video = ant.video[0];

	// Stop if no video!
	if (!ant.video) return;

	console && console.log(ant.video.src);

	if (typeof jQuery == 'undefined') {
		ant.load( 'jquery', 'https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js' );
		ant.jquery.addEventListener('load', ant.loadJqueryUI);
	} else {
		ant.loadJqueryUI();
	}
};

ant.bootleg();
