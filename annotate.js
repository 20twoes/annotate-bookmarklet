var Ant = function($) {
	var self = {};


	// Our video element.
	//
	self.video = (function() {
		// Get the video we're going to annotate
		var video = document.getElementsByTagName('video');
		video = video[0] || null;

		return video;
	})();


	// Our model for a note.
	//
	self.Note = Backbone.Model.extend({

		initialize: function() {
			var that = this;
			// Get video time rounded to 2 decimal places.
			// TODO: Account for delayed reaction time? (by subtracting .5)
			var getTime = function() {
				var now = Math.round(self.video.currentTime * 100)/100;
				// Don't override the time if exists,
				// like when we first fetch from local storage.
				return that.get('time') || now;
			};

			// Set the time the note was taken
			this.set({time: getTime()});
		}
	});


	// Our collection object for notes.
	//
	self.NoteList = Backbone.Collection.extend({
		model: self.Note,

		localStorage: new Store('ant'),

		comparator: function(note) {
			return note.get('time');
		}

	});


	// Our model view for a note.
	//
	self.NoteView = Backbone.View.extend({
		tagName: 'li',

		template: _.template(
			'<div class="ant-note-display">\
				<a href="#" class="ant-note-link" data-time="<%= time %>" title="<%= time %> sec"><%= text %></a>\
				________<span class="ant-note-edit-button">[Edit]</span><span class="ant-note-destroy">[Delete]</span>\
			</div>\
			<div class="ant-note-edit" style="display:none;">\
				<input class="ant-note-input" type="text" value="" />\
			</div>'
		),

		events: {
			'click .ant-note-destroy': 'clear',
			'click .ant-note-link': 'updateVideo',
			'click .ant-note-edit-button': 'edit',
			'keypress .ant-note-input': 'updateOnEnter'
		},

		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);

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
		},

		updateVideo: function() {
			self.video.currentTime = this.model.get('time');
		}
	});


	// Our application view.
	//
	self.AppView = Backbone.View.extend({

		template: _.template(
			'<h1>Notes</h1>\
			<div class="ant-content">\
				<div id="ant-create-note">\
					<input id="ant-new-note" placeholder="Enter a note about the video" type="text" />\
					<span class="ant-ui-tooltip-top" style="display:none;">Press Enter to save this note</span>\
				</div>\
				<div id="ant-notes">\
					<ul id="ant-note-list"></ul>\
				</div>\
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
	var el = (new Backbone.View).make('div', {id: 'ant-app', class: 'ant-draggable'});
	$(el).offset(function() {
		// Get video position in window
		var offset = self.video && $(self.video).offset();
		if (offset) {
			offset.left += $(self.video).width() + 12;  // plus padding
			//offset.top += $(self.video).height() + 50;
		} else {
			offset = { top: 0, left: 0 };
		}

		return offset;
	});
	$('body').append(el);
	$('.ant-draggable').draggable();

	// Inject app into new div
	self.App = new self.AppView({el: el});

	return self;
};


function AntLoad() {

	// __Load dependencies
	// TODO:  Stop linking from other domains.

	var assetID = 0;
	var load = function(src, type) {
		if (type) {
			var el = document.createElement('link');
			el.type = 'text/css';
			el.rel = "stylesheet";
			el.href = src;
		} else {
			var el = document.createElement('script');
			el.type = 'text/javascript';
			el.src = src;
		}
		el.id = 'ant-asset' + (++assetID);
		(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(el);
	};

	// Load styles
	load('http://20twoes.github.com/annotate-bookmarklet/assets/annotate.css', 'css');

	// Load RequireJS
	try {
		if (requirejs == undefined)
			throw "RequireJS is undefined.";
		else
			AntMain();
	} catch(e) {
		// Load if obj not defined
		load('http://requirejs.org/docs/release/1.0.7/minified/require.js');
	}

	// Load the rest of our dependencies
	document.getElementById('ant-asset' + assetID).addEventListener('load', AntMain);
};


function AntMain() {
	require([
			'https://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js',
			'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.14/jquery-ui.min.js',
			'http://documentcloud.github.com/underscore/underscore-min.js',
			'http://documentcloud.github.com/backbone/backbone-min.js',
			'https://raw.github.com/jeromegn/Backbone.localStorage/master/backbone.localStorage.js'
		], function() {
		window.ant = new Ant(jQuery);
	});
};


AntLoad();
