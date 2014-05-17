KityMinder.registerModule("IconModule", function () {
	var minder = this;
	var renderPriorityIcon = function (node, val) {
		var colors = ["", "#A92E24", "#29A6BD", "#1E8D54", "#eb6100", "#876DDA", "#828282", "#828282", "#828282", "#828282"];
		var bgcolor = colors[val];
		var _bg = new kity.Rect().fill(colors[val]).setRadius(3).setWidth(20).setHeight(20);
		var _number = new kity.Text().setContent(val).fill("white").setSize(12);
		var _rc = new kity.Group();
		_rc.addShapes([_bg, _number]);
		node.getContRc().addShape(_rc);
		_number.setTranslate(6, 15);
		var rcHeight = _rc.getHeight();
		_rc.setTranslate(0, -rcHeight / 2);
	};

	var renderProgressIcon = function (node, val) {
		var _rc = new kity.Group();
		var _contRc = node.getContRc();
		var _bg = new kity.Circle().setRadius(8).fill("white").stroke(new kity.Pen("#29A6BD", 2));
		var _percent, d;
		if (val < 9) {
			_percent = new kity.Path();
			d = _percent.getDrawer();
			d.moveTo(0, 0).lineTo(0, -6);
		} else _percent = new kity.Group();
		_rc.addShapes([_bg, _percent]);
		_contRc.addShape(_rc);
		//r, laf, sf, x, y
		//large-arc-flag 为1 表示大角度弧线，0 代表小角度弧线。
		//sweep-flag 为1代表从起点到终点弧线绕中心顺时针方向，0 代表逆时针方向。
		switch (val) {
		case 1:
			break;
		case 2:
			d.carcTo(6, 0, 1, 6 * Math.cos(2 * Math.PI / 8), -6 * Math.sin(2 * Math.PI / 8));
			break;
		case 3:
			d.carcTo(6, 0, 1, 6, 0);
			break;
		case 4:
			d.carcTo(6, 0, 1, 6 * Math.cos(2 * Math.PI / 8), 6 * Math.sin(2 * Math.PI / 8));
			break;
		case 5:
			d.carcTo(6, 0, 1, 0, 6);
			break;
		case 6:
			d.carcTo(6, 1, 1, -6 * Math.cos(2 * Math.PI / 8), 6 * Math.sin(2 * Math.PI / 8));
			break;
		case 7:
			d.carcTo(6, 1, 1, -6, 0);
			break;
		case 8:
			d.carcTo(6, 1, 1, -6 * Math.cos(2 * Math.PI / 8), -6 * Math.sin(2 * Math.PI / 8));
			break;
		case 9:
			var check = new kity.Path();
			_percent.addShapes([new kity.Circle().setRadius(6).fill("#29A6BD"), check]);
			check.getDrawer().moveTo(-3, 0).lineTo(-1, 3).lineTo(3, -2);
			check.stroke(new kity.Pen("white", 2).setLineCap("round"));
			break;
		}
		if (val && val < 8) d.close();
		_percent.fill("#29A6BD");
		var pre = node.getData("PriorityIcon");
		var style = minder.getCurrentLayoutStyle()[node.getType()];
		if (!pre) _rc.setTranslate(_rc.getWidth() / 2, 0);
		else _rc.setTranslate(_contRc.getWidth() + style.spaceLeft, 0);
	};
	var setPriorityCommand = kity.createClass("SetPriorityCommand", (function () {
		return {
			base: Command,
			execute: function (km, value) {
				var nodes = km.getSelectedNodes();
				for (var i = 0; i < nodes.length; i++) {
					nodes[i].setData("PriorityIcon", value);
					km.updateLayout(nodes[i]);
				}
			},
			queryValue: function (km) {
				var nodes = km.getSelectedNodes();
				var val;
				for (var i = 0; i < nodes.length; i++) {
					val = nodes[i].getData("PriorityIcon");
					if (val) break;
				}
				return val;
			}
		};
	})());
	var setProgressCommand = kity.createClass("SetProgressCommand", (function () {
		return {
			base: Command,
			execute: function (km, value) {
				var nodes = km.getSelectedNodes();
				for (var i = 0; i < nodes.length; i++) {
					nodes[i].setData("ProgressIcon", value);
					km.updateLayout(nodes[i]);
				}
			},
			queryValue: function (km) {
				var nodes = km.getSelectedNodes();
				var val;
				for (var i = 0; i < nodes.length; i++) {
					val = nodes[i].getData("ProgressIcon");
					if (val) break;
				}
				return val;
			}
		};
	})());
	return {
		"commands": {
			"priority": setPriorityCommand,
			"progress": setProgressCommand
		},
		"events": {
			"RenderNodeLeft": function (e) {
				var node = e.node;
				var PriorityIconVal = node.getData("PriorityIcon");
				var ProgressIconVal = node.getData("ProgressIcon");
				var contRc = node.getContRc();
				if (PriorityIconVal) {
					renderPriorityIcon(node, PriorityIconVal);
				}
				if (ProgressIconVal) {
					renderProgressIcon(node, ProgressIconVal);
				}
			}
		}
	};
});