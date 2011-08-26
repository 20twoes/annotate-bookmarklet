window.Ant = {};


Ant.init = function() {

	// __Load dependencies
	var dependencies = [
		{
			obj: 'jQuery',
			src: 'https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js'
		},
		{
			obj: 'jQuery.ui',
			src: 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js'
		},
		{
			obj: '_',
			src: 'http://documentcloud.github.com/underscore/underscore-min.js'
		},
		{
			obj: 'Backbone',
			src: 'http://documentcloud.github.com/backbone/backbone-min.js'
		},
		{
			obj: 'Store',
			src: 'https://raw.github.com/jeromegn/localtodos/master/javascripts/backbone.localStorage.js'
		}
	];

	var scriptID = 1;
	var load = function(src) {
		var el = document.createElement('script');
		el.type = 'text/javascript';
		el.src = src;
		el.id = 'ant-script' + scriptID++;
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(el);
	};

	for (var i = 0; i < dependencies.length; ++i) {
		var o = dependencies[i];
		try {
			eval(o.obj)
		} catch(e) {
			// Load if obj not defined
			load(o.src);
		}
	}
	

	// Start when our last script loads
	// This is a temp solution
	// Does not ensure that all scripts have loaded
	document.getElementById('ant-script5').addEventListener('load', Ant.main);
};


Ant.main = function() {
	console && console.log('main');
	this.Note = Backbone.Model.extend({

	});

	this.NoteList = Backbone.Collection.extend({
		model: this.Note,

		localStorage: new Store('ant'),

		comparator: function(note) {
			return note.get('time');
		}

	});
};


Ant.init();
