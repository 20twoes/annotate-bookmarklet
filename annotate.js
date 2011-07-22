var ant = ant || {};

// Holds the current time of the video
ant.time = 0;

ant.logger = {

	key : 'vidplay.' + window.location,

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
	$("script[src='http://al.mediabistro.net/labs/al/annotate/annotate.js']").remove();

	// Build interface __
	
	// Get video position in window
	ant.video.position = $(ant.video).position();
	ant.video.x = ant.video.position.left;
	ant.video.lowerY = ant.video.position.top + $(ant.video).height();
	console && console.log( ant.video );
	console && console.log( 'test' );

	// input text box
	if (!$('#ant-input').length) {
		ant.input = $('<div id=\'ant-input-wrap\'><input type=\'text\' id=\'ant-input\' value=\'Enter comments!!!\' /></div>');
		$('body').append(ant.input);
		$('#ant-input').width('50%');
	}

	// display
	if (!$('#ant-display').length) {
		ant.display = $('<div id=\'ant-display\'><ul></ul></div>');
		$('body').append(ant.display);
	}


	// Comments controller __
	ant.comments = {

		arr : [],
		list : $('#ant-display ul'),

		add : function(val) {

			if (!val)
				return;

			var o = { comment: val, time: ant.time };
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

			var str = '<a href=\'#rm\' class=\'ant-comment-rm\' data-id=\'' + i + '\' title=\'Delete\'>[x]</a> :: <a href=\'#\' class=\'ant-comment-link\' data-time=\'' + o.time + '\' title=\'' + o.time + ' sec\'>' + o.comment + '</a>';
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
				ant.comments.add( th.val() );
				th.val('');
			}
		})
		.focus( function() {
			var th = $(this);
			th.val('');
		});

	$('.ant-comment-link').live('click', function(e) {
		var t = $(this);
		//console.log( t.attr('data-time'));
		ant.video.currentTime = t.attr('data-time');
		e.preventDefault();
	});

	$('.ant-comment-rm').live('click', function(e) {
		var t = $(this);
		ant.comments.delete( t.attr('data-id') );
		t.parent().remove();
		e.preventDefault();
	});

	$(window).unload( function() {
		ant.logger.log( ant.comments.arr );
	});

	ant.highlightComment = function() {
		var defaultVal = '16px';
		var highlightedVal = '50px';
		var cssProperty = 'font-size';
		var t = parseInt(ant.video.currentTime);
		var links = $('.ant-comment-link');
		var resetHighlights = function() {
			links.each( function() {
				$(this).css(cssProperty, defaultVal);
			});
		};
		links.each( function() {
			var th = $(this);
			if ( t == parseInt(th.attr('data-time')) ) {
				resetHighlights();
				th.css(cssProperty, highlightedVal);
			}
		});
		setTimeout('ant.highlightComment();', 500);
	};

	$(document).ready( function() {
		// Load from local storage
		if (ant.comments) {
			ant.comments.arr = ant.logger.get() || [];
			ant.comments.refresh();
		}

		ant.highlightComment();
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

	console && console.log(ant.video);

	if (typeof jQuery == 'undefined') {
		ant.load( 'jquery', 'https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js' );
		ant.jquery.addEventListener('load', ant.loadJqueryUI);
	} else {
		ant.loadJqueryUI();
	}
};

ant.bootleg();
