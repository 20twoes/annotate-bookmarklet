var Ant = function($) {
	//console && console.log('Ant1');
	var self = {};

	self.video = (function() {
		// Get the video we're going to annotate
		var video = document.getElementsByTagName('video');
		//console && console.log(ant.video);
		video = video[0] || null;

		//console && console.log(video.src);

		return video;
	})();


	self.Note = Backbone.Model.extend({
//		defaults: { time: 0 }
	});


	self.NoteList = Backbone.Collection.extend({
		model: self.Note,

		localStorage: new Store('ant'),

		comparator: function(note) {
			return note.get('time');
		}

	});


	self.NoteView = Backbone.View.extend({
		/*
		self.template = _.template('<p><%= name %></p>');
		$(self.template( {'name': 'al'} )).appendTo('body');
		*/
		tagName: 'li',

		template: _.template(
			'<div class="ant-note-display">\
				<a href="#" class="ant-note-link" data-time="<%= time %>" title="<%= time %> sec"><%= text %></a>\
				________<span class="ant-note-destroy">[Delete]</span>\
			</div>\
			<div class="ant-note-edit" style="display:none;">\
				<input class="ant-note-input" type="text" value="" />\
			</div>'
		),

		events: {
			'click .ant-note-destroy': 'clear',
			// TODO: implement updateVideo
			//'click .ant-note-link': 'updateVideo',
			'click .ant-note-link': 'edit',
			'keypress .ant-note-input': 'updateOnEnter'
		},

		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);

			// Set the time the note was taken
			this.model.set({time: self.video.currentTime});
		},

		render: function() {
			$(this.el).html(this.template(this.model.toJSON()));
			this.setText();
			return this;
		},

		setText: function() {
			var text = this.model.get('text');
			this.$('.ant-note-link').text(text);
			this.input = this.$('.ant-note-input');
			this.input.bind('blur', _.bind(this.close, this)).val(text);
		},

		edit: function() {
			//$(this.el).addClass('editing');
			this.$('.ant-note-display').hide();
			this.$('.ant-note-edit').show();
			this.input.focus();
			return false;
		},

		close: function() {
			this.model.save({text: this.input.val()});
			//$(this.el).removeClass('editing');
			this.$('.ant-note-display').show();
			this.$('.ant-note-edit').hide();
		},

		updateOnEnter: function(e) {
			if (e.keyCode == 13)
				this.close();
		},

		remove: function() {
			$(this.el).remove();
		},

		clear: function() {
			this.model.destroy();
		}
	});



	self.AppView = Backbone.View.extend({

		template: _.template(
			'<h1>Notes</h1>\
			<div class="ant-content">\
				<div id="create-note">\
					<input id="ant-new-note" placeholder="Enter a note about the video" type="text" />\
					<span class="ant-ui-tooltip-top" style="display:none;">Press Enter to save this note</span>\
				</div>\
				<div id="ant-notes">\
					<ul id="ant-note-list"></ul>\
				</div>\
				<div>Double-click on a note to edit.</div>\
			</div>'
		),

		events: {
			'keypress #ant-new-note': 'createOnEnter',
			'keyup #ant-new-note': 'showTooltip'
		},

		initialize: function() {
			self.Notes.bind('add', this.addOne, this);
			self.Notes.bind('reset', this.addAll, this);

			// Must create #ant-new-note in render() before using it
			this.render();
			this.input = this.$('#ant-new-note');

			// Fetch after rendering
			self.Notes.fetch();
		},

		render: function() {
			$(this.el).html(this.template());
			return this;
		},

		addOne: function(note) {
			var view = new self.NoteView({model: note});
			this.$('#ant-note-list').append(view.render().el);
		},

		addAll: function() {
			self.Notes.each(this.addOne);
		},

		createOnEnter: function(e) {
			var text = this.input.val();
			if (!text || e.keyCode != 13)
				return;
			self.Notes.create({text: text});
			this.input.val('');
		},

		showTooltip: function(e) {
			var tooltip = this.$('.ant-ui-tooltip-top');
			var val = this.input.val();
			tooltip.fadeOut();
			if (this.tooltipTimeout)
				clearTimeout(this.tooltipTimeout);
			if (val == '' || val == this.input.attr('placeholder'))
				return;
			var show = function() {
				tooltip.show().fadeIn();
			};
			this.tooltipTimeout = _.delay(show, 1000);
		}
	});


	// Create Notes collection
	self.Notes = new self.NoteList;

	// Create encompassing div first
	var el = (new Backbone.View).make('div', {id: 'ant-app'});
	$('body').append(el);

	// Inject app into new div
	self.App = new self.AppView({el: el});

	return self;
};


function AntLoad() {

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
			src: 'https://raw.github.com/jeromegn/Backbone.localStorage/master/backbone.localStorage.js'
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
	document.getElementById('ant-script5').addEventListener('load', AntMain);
};


function AntMain() {
	new Ant(jQuery);
};


AntLoad();
