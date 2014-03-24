/**
 * cSketchJS
 * By Captain Conundrum, LavaSnake, Martenus
 *
 * Adds a sketch.js layer over the game window so that casters can draw lines or arrows on the screen.
 */

var cSketchJS = (function () {

	var cSketchJS = {};

	/**
	 * CONFIGURATION OPTIONS
	 */

	// These are the colors that show up in the toolbox.
	cSketchJS.colors = [ '#05ABE0', '#d72828', '#d7d728', '#28d728' ];

	// These options are sent to sketchJS when it is created.
	cSketchJS.defaultOptions = {
		defaultColor: cSketchJS.colors[0],
		defaultTool: "marker",
		toolLinks: true
	};

	// Options sent to rFloatFrame when the toolbox is created.
	cSketchJS.floatingFrameOptions = {
		"rememberPosition" : true,
		"left":20,
		"top":200
	};

	// Hold this key to draw
	cSketchJS.drawButton = 18; // ALT

	// Press this key to clear the canvas
	cSketchJS.clearButton = 9; // TAB

	// Override the default LavaDraw StampImg and set it here.
	// The only reason to do this is just to keep all the configs in one place.
	LavaDraw.StampImg = "https://d3f1e1s5hz92ob.cloudfront.net/asset-version/z91a2e88bb4ecb89d84c97370febce7d9/Content/UberNetSite/images/img_item_detail_delta.png";

	/**
	 * UTILITY FUNCTIONS
	 */

	cSketchJS.currentColor = function() { return $('#cSketchJS').sketch().color; };

	cSketchJS.currentTool = function() { return $('#cSketchJS').sketch().tool; };

	/**
	 * MAIN cSketchJS CODE
	 */

	// Attach the drawing area to the top of the window and set up key listeners
	cSketchJS.createCanvas = function() {
		var _height = $('body').height();
		var _width = $('body').width();

		// Create a canvas that covers the whole screen.
		// Set it to ignore all mouse events so that it doesn't interfere with the game.
		$('body').prepend("<canvas id=\"cSketchJS\" class=\"ignoreMouse\" width=\"" + _width + "\" height=\"" + _height + "\"></canvas>");
		// Tell sketchJS to control this canvas
		$('#cSketchJS').sketch(cSketchJS.defaultOptions);

		// Attach key listener
		$('body').on("keydown", function(e) {
			// Start drawing
			if(e.which == cSketchJS.drawButton) {
				$('#cSketchJS').removeClass("ignoreMouse");
			}
			// Clear the canvas
			if(e.which == cSketchJS.clearButton) {
				cSketchJS.clearSketch();
			}
		});

		// Attach listener
		$('body').on("keyup", function(e) {
			// Stop drawing
			if(e.which == cSketchJS.drawButton) {
				$('#cSketchJS').addClass("ignoreMouse");
			}
		});
	};

	// Set up the UI
	cSketchJS.createToolbox = function() {

		// Helper functions for Hex to RGB
		// http://www.javascripter.net/faq/hextorgb.htm
		function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
		function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
		function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
		function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

		// Use rFloatFrame to make the toolbox draggable
		createFloatingFrame("cSketchJS_toolbox", 45, 155, cSketchJS.floatingFrameOptions);

		// Add the colors to the toolbox
		$.each(cSketchJS.colors, function(_index, _color) {
			var rgbColor = [];

			// Draw color
			rgbColor[0] = hexToR(_color);
			rgbColor[1] = hexToG(_color);
			rgbColor[2] = hexToB(_color);

			var lightColor = [];

			// Lighter color. This is for the gradient on the button
			lightColor[0] = Math.floor((255 - rgbColor[0]) / 2 + rgbColor[0]);
			lightColor[1] = Math.floor((255 - rgbColor[1]) / 2 + rgbColor[1]);
			lightColor[2] = Math.floor((255 - rgbColor[2]) / 2 + rgbColor[2]);

			// Create the gradient
			var _background = "linear-gradient(135deg, rgba(" + lightColor[0] + "," + lightColor[1] + "," + lightColor[2] + ",1) 0%,rgba(" + rgbColor[0] + "," + rgbColor[1] + "," + rgbColor[2] + ",1) 100%)";

			// Attach the color button
			$('#cSketchJS_toolbox_content').append("<a href='#cSketchJS' class=\"color\" data-color='" + _color + "' style='background: " + _background + ";'></a> ");
		});

		$('#cSketchJS_toolbox_content').append("<hr />");

		// Attach the tools
		$('#cSketchJS_toolbox_content').append("<a id=\"cSketchJS_line\" class=\"tool\" href='#cSketchJS' data-tool=\"marker\"></a> ");
		$('#cSketchJS_toolbox_content').append("<a id=\"cSketchJS_arrow\" class=\"tool\" href='#cSketchJS' data-tool=\"arrow\"></a> ");
		$('#cSketchJS_toolbox_content').append("<a id=\"cSketchJS_stamp\" class=\"tool\" href='#cSketchJS' data-tool=\"stamp\"></a> ");

		$('#cSketchJS_toolbox_content').append("<hr />");

		$('#cSketchJS_toolbox_content').append("<a id=\"cSketchJS_clear\" href=\"javascript:cSketchJS.clearSketch();\"></a> ");

		// Attach "click" listener
		$("#cSketchJS_toolbox_content a.color").on("click", function() {
			$("#cSketchJS_toolbox_content a.color").removeClass("selected");
			$(this).addClass("selected");
		});

		// Attach "click" listener
		$("#cSketchJS_toolbox_content a.tool").on("click", function() {
			$("#cSketchJS_toolbox_content a.tool").removeClass("selected");
			$(this).addClass("selected");
		});

		// Mark the first color and first tool as selected
		$("#cSketchJS_toolbox_content a.color:first").addClass("selected");
		$("#cSketchJS_toolbox_content a.tool:first").addClass("selected");
	};

	// Replace the canvas with a clean one
	cSketchJS.clearSketch = function() {
		var currentColor = cSketchJS.currentColor();
		cSketchJS.defaultOptions.defaultColor = currentColor;
		var currentTool = cSketchJS.currentTool();
		cSketchJS.defaultOptions.defaultTool = currentTool;
		$('#cSketchJS').remove();
		cSketchJS.createCanvas();
	};

	return cSketchJS;
})();

// Initialize cSketchJS
(function() {
	cSketchJS.createCanvas();
	cSketchJS.createToolbox();
}());