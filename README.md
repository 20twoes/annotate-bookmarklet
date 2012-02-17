Annotate Bookmarklet
====================

Ever wanted to make a note while you were watching that YouTube video?  Well now you can!

The Annotate Bookmarklet works with any site that use the HTML5 `<video>` tag for their videos (like YouTube if you're in a modern browser).  Just click on the bookmarklet after the video has loaded and a little Notes console will display next to the video.

To get the bookmarklet, drag [this link](javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://raw.github.com/20twoes/annotate-bookmarklet/annotate.js';})(); "Annotate Bookmarklet") up to your bookmarks bar.

Features
--------

* Edit and delete your notes
* Reposition the Notes console anywhere on the page
* Click on the note to reposition the video back to the point you took the note
* Your notes will show up again the next time you view the video (uses browser's local storage and depends on URL)
