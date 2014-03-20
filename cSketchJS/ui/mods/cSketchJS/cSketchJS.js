var cSketchJS = (function () {

	var cSketchJS = {};

	cSketchJS.colors = [ '#05ABE0', '#d72828', '#d7d728', '#28d728' ];

	cSketchJS.defaultOptions = {
		defaultColor: cSketchJS.colors[0],
		defaultTool: "marker",
		toolLinks: true
	};

	cSketchJS.drawButton = 18; // ALT

	cSketchJS.currentColor = function() { return $('#cSketchJS').sketch().color; };

	cSketchJS.currentTool = function() { return $('#cSketchJS').sketch().tool; };

	cSketchJS.createCanvas = function() {
		var _height = $('body').height();
		var _width = $('body').width();

		$('body').prepend("<canvas id=\"cSketchJS\" class=\"ignoreMouse\" width=\"" + _width + "\" height=\"" + _height + "\"></canvas>");
		$('#cSketchJS').sketch(cSketchJS.defaultOptions);

		$('body').on("keydown", function(e) {
			if(e.which == cSketchJS.drawButton) {
				$('#cSketchJS').removeClass("ignoreMouse");
			}
		});

		$('body').on("keyup", function(e) {
			if(e.which == cSketchJS.drawButton) {
				$('#cSketchJS').addClass("ignoreMouse");
			}
		});
	};

	cSketchJS.createToolbox = function() {

		// http://www.javascripter.net/faq/hextorgb.htm
		function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
		function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
		function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
		function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

		createFloatingFrame("cSketchJS_toolbox", 45, 155, {
			"rememberPosition" : false,
			"left":20,
			"top":200
		});


		$.each(cSketchJS.colors, function(_index, _color) {
			var rgbColor = [];

			rgbColor[0] = hexToR(_color);
			rgbColor[1] = hexToG(_color);
			rgbColor[2] = hexToB(_color);

			var lightColor = [];

			lightColor[0] = Math.floor((255 - rgbColor[0]) / 2 + rgbColor[0]);
			lightColor[1] = Math.floor((255 - rgbColor[1]) / 2 + rgbColor[1]);
			lightColor[2] = Math.floor((255 - rgbColor[2]) / 2 + rgbColor[2]);

			var _background = "linear-gradient(135deg, rgba(" + lightColor[0] + "," + lightColor[1] + "," + lightColor[2] + ",1) 0%,rgba(" + rgbColor[0] + "," + rgbColor[1] + "," + rgbColor[2] + ",1) 100%)";

			$('#cSketchJS_toolbox_content').append("<a href='#cSketchJS' class=\"color\" data-color='" + _color + "' style='background: " + _background + ";'></a> ");
		});

		$('#cSketchJS_toolbox_content').append("<hr />");

		$('#cSketchJS_toolbox_content').append("<a id=\"cSketchJS_line\" class=\"tool\" href='#cSketchJS' data-tool=\"marker\"></a> ");
		$('#cSketchJS_toolbox_content').append("<a id=\"cSketchJS_arrow\" class=\"tool\" href='#cSketchJS' data-tool=\"arrow\"></a> ");
		$('#cSketchJS_toolbox_content').append("<a id=\"cSketchJS_stamp\" class=\"tool\" href='#cSketchJS' data-tool=\"stamp\"></a> ");

		$('#cSketchJS_toolbox_content').append("<hr />");

		$('#cSketchJS_toolbox_content').append("<a id=\"cSketchJS_clear\" href=\"javascript:cSketchJS.clearSketch();\"></a> ");

		$("#cSketchJS_toolbox_content a.color").on("click", function() {
			$("#cSketchJS_toolbox_content a.color").removeClass("selected");
			$(this).addClass("selected");
		});

		$("#cSketchJS_toolbox_content a.tool").on("click", function() {
			$("#cSketchJS_toolbox_content a.tool").removeClass("selected");
			$(this).addClass("selected");
		});

		$("#cSketchJS_toolbox_content a.color:first").addClass("selected");
		$("#cSketchJS_toolbox_content a.tool:first").addClass("selected");
	};

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

(function() {
	cSketchJS.createCanvas();
	cSketchJS.createToolbox();
}());