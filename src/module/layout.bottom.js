KityMinder.registerModule("LayoutBottom", function () {
	var _target = this.getRenderTarget();

	function getMinderSize() {
		return {
			width: _target.clientWidth,
			height: _target.clientHeight
		};
	}
	var minder = this;
	//收缩-展开子树的节点
	var ShIcon = kity.createClass("DefaultshIcon", (function () {
		return {
			constructor: function (node) {
				this._show = false;
				this._node = node;
				var iconShape = this.shape = new kity.Group();
				iconShape.class = "shicon";
				iconShape.icon = this;
				var rect = this._rect = new kity.Rect().fill("white").stroke("gray").setRadius(2).setWidth(10).setHeight(10);
				var plus = this._plus = new kity.Path();
				plus.getDrawer()
					.moveTo(2, 5)
					.lineTo(8, 5)
					.moveTo(5, 2)
					.lineTo(5, 8);
				plus.stroke("gray");
				var dec = this._dec = new kity.Path();
				dec.getDrawer()
					.moveTo(2, 5)
					.lineTo(8, 5);
				dec.stroke("gray");
				if (node.getType() === "main") minder.getRenderContainer().addShape(iconShape);
				else {
					node.getLayout().subgroup.addShape(iconShape);
				}
				iconShape.addShapes([rect, plus, dec]);
				this.update();
				//this.switchState();
			},
			switchState: function (val) {
				if (val === true || val === false)
					this._show = !val;
				if (!this._show) {
					this._plus.setOpacity(0);
					this._dec.setOpacity(1);
					this._show = true;
				} else {
					this._plus.setOpacity(1);
					this._dec.setOpacity(0);
					this._show = false;
				}
				return this._show;
			},
			update: function () {
				var node = this._node;
				var Layout = node.getLayout();
				var nodeShape = node.getRenderContainer();
				var nodeType = node.getType();
				var nodeX = nodeShape.getRenderBox().closurePoints[1].x + 5;
				var nodeY = nodeShape.getRenderBox().closurePoints[0].y;
				this.shape.setTranslate(nodeX, nodeY);
			},
			remove: function () {
				this.shape.remove();
			}
		};
	})());
	//样式的配置（包括颜色、字号等）
	var nodeStyles = {
		"root": {
			color: '#430',
			fill: '#e9df98',
			fontSize: 24,
			padding: [15.5, 25.5, 15.5, 25.5],
			margin: [0, 0, 20, 0],
			radius: 0,
			highlight: 'rgb(254, 219, 0)',
			spaceLeft: 3,
			spaceRight: 0,
			spaceTop: 3,
			spaceBottom: 10
		},
		"main": {
			stroke: new kity.Pen("white", 2).setLineCap("round").setLineJoin("round"),
			fill: '#A4c5c0',
			color: "#333",
			padding: [6.5, 20, 6.5, 20],
			fontSize: 16,
			margin: [20, 20, 10, 10],
			radius: 0,
			highlight: 'rgb(254, 219, 0)',
			spaceLeft: 3,
			spaceRight: 0,
			spaceTop: 3,
			spaceBottom: 10
		},
		"sub": {
			stroke: new kity.Pen("white", 2).setLineCap("round").setLineJoin("round"),
			color: "#333",
			fontSize: 12,
			margin: [10, 10, 10, 30],
			padding: [5, 10, 5.5, 10],
			highlight: 'rgb(254, 219, 0)',
			fill: 'rgb(231, 243, 255)',
			spaceLeft: 3,
			spaceRight: 0,
			spaceTop: 3,
			spaceBottom: 10
		}
	};
	//更新背景
	var updateBg = function (node) {
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[nodeType];
		var Layout = node.getLayout();
		switch (node.getType()) {
		case "root":
		case "main":
			var bg = node.getBgRc().clear();
			bg.addShape(Layout.bgShadow = new kity.Rect());
			bg.addShape(Layout.bgRect = new kity.Rect());
			Layout.bgRect.fill(nodeStyle.fill).setRadius(nodeStyle.radius);
			Layout.bgShadow.fill('black').setOpacity(0.2).setRadius(nodeStyle.radius).translate(3, 5);
			break;
		case "sub":
			var bgRc = node.getBgRc().clear();
			bgRc.addShape(Layout.bgRect = new kity.Rect());
			Layout.bgRect.fill(nodeStyle.fill);
			break;
		default:
			break;
		}
	};
	//初始化样式
	var initLayout = function (node) {
		var Layout = node.getLayout();
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[nodeType];
		if (nodeType === "main") {
			var subgroup = Layout.subgroup = new kity.Group();
			minder.getRenderContainer().addShape(subgroup);
		}
	};
	//根据内容调整节点尺寸
	var updateShapeByCont = function (node) {
		var contRc = node.getContRc();
		var nodeType = node.getType();
		var nodeStyle = nodeStyles[nodeType];
		var _contRCWidth = contRc.getWidth();
		var _contRCHeight = contRc.getHeight();
		var Layout = node.getLayout();
		switch (nodeType) {
		case "root":
		case "main":
			var width = _contRCWidth + nodeStyle.padding[1] + nodeStyle.padding[3],
				height = _contRCHeight + nodeStyle.padding[0] + nodeStyle.padding[2];
			Layout.bgRect.setWidth(width).setHeight(height);
			Layout.bgShadow.setWidth(width).setHeight(height);
			break;
		case "sub":
			width = _contRCWidth + nodeStyle.padding[1] + nodeStyle.padding[3];
			height = _contRCHeight + nodeStyle.padding[0] + nodeStyle.padding[2];
			Layout.bgRect.setWidth(width).setHeight(height);
			break;
		default:
			break;
		}
		var rBox = contRc.getRenderBox();
		// Todo：很坑的改法，不知为何就对了，需要处理
		contRc.setTranslate(nodeStyle.padding[3], 0);
		contRc.translate(0, nodeStyle.padding[0] - rBox.top);
	};
	var updateLayoutMain = function () {
		var _root = minder.getRoot();
		var mainnodes = (function () {
			var main_added = [];
			var children = _root.getChildren();
			for (var i = 0; i < children.length; i++) {
				if (children[i].getLayout().added) main_added.push(children[i]);
			}
			return main_added;
		})();
		var countMainWidth = function (node) {
			var nLayout = node.getLayout();
			var selfwidth = node.getRenderContainer().getWidth() + nodeStyles.main.margin[1] + nodeStyles.main.margin[3];
			var childwidth = 0;
			if (nLayout.added) {
				childwidth = nLayout.subgroup.getWidth() + nodeStyles.main.margin[1] + nodeStyles.sub.margin[3];
			}
			var branchwidth = nLayout.branchwidth = (selfwidth > childwidth ? selfwidth : childwidth);
			return branchwidth;
		};
		var rootLayout = _root.getLayout();
		var rootbranchwidth = 0;
		for (var j = 0; j < mainnodes.length; j++) {
			rootbranchwidth += countMainWidth(mainnodes[j]);
		}
		var sX = rootLayout.x - rootbranchwidth / 2;
		for (var k = 0; k < mainnodes.length; k++) {
			var mLayout = mainnodes[k].getLayout();
			mLayout.x = sX + nodeStyles.main.margin[3] + 5;
			sX += mLayout.branchwidth;
		}
		return mainnodes;
	};
	var updateLayoutAll = function (node, parent, action) {
		var effectSet = [];
		var nodeType = node.getType();
		var Layout = node.getLayout();
		var _root = minder.getRoot();
		var rootLayout = _root.getLayout();
		if (nodeType === "root") {
			Layout.x = getMinderSize().width / 2;
			Layout.y = 100;
			Layout.align = "center";
			effectSet.push(node);
			var children = node.getChildren();
			for (var i = 0; i < children.length; i++) {
				var childLayout = children[i].getLayout();
				childLayout.y = Layout.y + node.getRenderContainer().getHeight() + nodeStyles.root.margin[2] + nodeStyles.main.margin[0];
			}
			effectSet = [_root];
			var mains = _root.getChildren();
			for (var x = 0; x < mains.length; x++) {
				if (mains[x].getLayout().added)
					effectSet.push(mains[x]);
			}
		} else if (nodeType === "main") {
			Layout.align = "left";
			if (action === "append" || action === "contract") {
				Layout.y = rootLayout.y + _root.getRenderContainer().getHeight() + nodeStyles.root.margin[2] + nodeStyles.main.margin[0];
			}
			effectSet = updateLayoutMain();
		} else {
			Layout.align = "left";
			var parentLayout = parent.getLayout();
			if (action === "append") {
				if (parent.getType() === "main") {
					Layout.x = nodeStyles.sub.margin[3];
				} else {
					Layout.x = parentLayout.x + nodeStyles.sub.margin[3];
				}
			}
			if (action === "append" || action === "contract") {
				Layout.branchheight = node.getRenderContainer().getHeight() + nodeStyles.sub.margin[0] + nodeStyles.sub.margin[2];
			}
			var prt = parent;
			if (action === "change") {
				prt = node;
			}
			//自底向上更新branchheight
			while (prt.getType() !== "main") {
				var c = prt.getChildren();
				var prtLayout = prt.getLayout();
				var branchHeight = prt.getRenderContainer().getHeight() + nodeStyles.sub.margin[0] + nodeStyles.sub.margin[2];
				for (var i1 = 0; i1 < c.length; i1++) {
					if (c[i1].getLayout().added) branchHeight += c[i1].getLayout().branchheight;
				}
				prtLayout.branchheight = branchHeight;
				prt = prt.getParent();
			}
			//自顶向下更新y
			var _buffer = [prt];
			while (_buffer.length !== 0) {
				var childrenC = _buffer[0].getChildren();
				childrenC = (function () {
					var result = [];
					for (var len = 0; len < childrenC.length; len++) {
						var l = childrenC[len].getLayout();
						if (l.added) {
							result.push(childrenC[len]);
						}
					}
					return result;
				})();
				_buffer = _buffer.concat(childrenC);
				var _buffer0Layout = _buffer[0].getLayout();
				var _buffer0Style = nodeStyles[_buffer[0].getType()];
				var sY;
				if (_buffer[0].getType() === "main") sY = 0;
				else sY = _buffer0Layout.y + _buffer[0].getRenderContainer().getHeight() + _buffer0Style.margin[2];
				for (var s = 0; s < childrenC.length; s++) {
					var childLayoutC = childrenC[s].getLayout();
					var childStyleC = nodeStyles[childrenC[s].getType()];
					childLayoutC.y = sY + childStyleC.margin[0];
					sY += childLayoutC.branchheight;
				}
				if (_buffer[0] !== _root && _buffer[0].getLayout().added) effectSet.push(_buffer[0]);
				_buffer.shift();
			}
		}
		return effectSet;
	};
	var translateNode = function (node) {
		var Layout = node.getLayout();
		var nodeShape = node.getRenderContainer();
		var align = Layout.align;
		var _rectHeight = nodeShape.getHeight();
		var _rectWidth = nodeShape.getWidth();
		switch (align) {
		case "right":
			nodeShape.setTranslate(Layout.x - _rectWidth, Layout.y);
			break;
		case "center":
			nodeShape.setTranslate(Layout.x - _rectWidth / 2, Layout.y);
			break;
		default:
			nodeShape.setTranslate(Layout.x, Layout.y);
			break;
		}
		if (node.getType() === "main") {
			Layout.subgroup.setTranslate(Layout.x, Layout.y + node.getRenderContainer().getHeight());
		}
		node.setPoint(Layout.x, Layout.y);
	};
	var updateConnectAndshIcon = function (node) {
		var nodeType = node.getType();
		var Layout = node.getLayout();
		var nodeStyle = nodeStyles[node.getType()];
		var connect;
		var _root = minder.getRoot();
		var _rootLayout = _root.getLayout();
		//更新连线
		if (nodeType === "main") {
			if (!Layout.connect) {
				connect = Layout.connect = new kity.Path();
				minder.getRenderContainer().addShape(connect);
			}
			connect = Layout.connect;
			var sX = _rootLayout.x;
			var sY = _rootLayout.y + _root.getRenderContainer().getHeight();
			var transX = Layout.x + node.getRenderContainer().getWidth() / 2;
			var transY = sY + nodeStyles.root.margin[2];
			connect.getDrawer().clear()
				.moveTo(sX, sY)
				.lineTo(sX, transY)
				.lineTo(transX, transY)
				.lineTo(transX, Layout.y);
			connect.stroke(nodeStyles.main.stroke);
		} else if (nodeType === "sub") {
			var parent = node.getParent();
			var parentLayout = parent.getLayout();
			if (!Layout.connect) {
				connect = Layout.connect = new kity.Path();
				parentLayout.subgroup.addShape(connect);
			}
			connect = Layout.connect;
			var ssX, ssY;
			if (parent.getType() === "main") {
				ssX = 10;
				ssY = 0;
			} else {
				ssX = parentLayout.x + 10;
				ssY = parentLayout.y + parent.getRenderContainer().getHeight() + 10;
			}
			var transsY = Layout.y + node.getRenderContainer().getHeight() / 2;
			connect.getDrawer().clear()
				.moveTo(ssX, ssY)
				.lineTo(ssX, transsY)
				.lineTo(Layout.x, transsY);
			connect.stroke(nodeStyles.sub.stroke);
		}
		//更新收放icon
		if (nodeType !== "root" && node.getChildren().length !== 0) {
			if (!Layout.shicon) {
				Layout.shicon = new ShIcon(node);
			}
			Layout.shicon.update();
		}
	};
	var _style = {
		getCurrentLayoutStyle: function () {
			return nodeStyles;
		},
		highlightNode: function (node) {
			var highlight = node.isHighlight();
			var nodeType = node.getType();
			var nodeStyle = nodeStyles[nodeType];
			var Layout = node.getLayout();
			switch (nodeType) {
			case "root":
			case "main":
			case "sub":
				if (highlight) {
					Layout.bgRect.fill(nodeStyle.highlight);
				} else {
					Layout.bgRect.fill(nodeStyle.fill);
				}
				break;
			default:
				break;
			}
		},
		updateLayout: function (node) {
			node.getContRc().clear();
			this._firePharse(new MinderEvent("RenderNodeLeft", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNodeCenter", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNodeRight", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNodeBottom", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNodeTop", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNode", {
				node: node
			}, false));
			updateShapeByCont(node);
			var set = updateLayoutAll(node, node.getParent(), "change");
			for (var i = 0; i < set.length; i++) {
				translateNode(set [i]);
				updateConnectAndshIcon(set [i]);
			}
			if (node.getType() === "sub") {
				var set1 = updateLayoutMain();
				for (var j = 0; j < set1.length; j++) {
					translateNode(set1[j]);
					updateConnectAndshIcon(set1[j]);
				}
			}
		},
		initStyle: function () {
			var _root = minder.getRoot();
			minder.handelNodeInsert(_root);
			//设置root的align
			_root.getLayout().align = "center";
			updateBg(_root);
			initLayout(_root);
			_root.getContRc().clear();
			this._firePharse(new MinderEvent("RenderNodeLeft", {
				node: _root
			}, false));
			this._firePharse(new MinderEvent("RenderNodeCenter", {
				node: _root
			}, false));
			this._firePharse(new MinderEvent("RenderNodeRight", {
				node: _root
			}, false));
			this._firePharse(new MinderEvent("RenderNodeBottom", {
				node: _root
			}, false));
			this._firePharse(new MinderEvent("RenderNodeTop", {
				node: _root
			}, false));
			this._firePharse(new MinderEvent("RenderNode", {
				node: _root
			}, false));
			updateShapeByCont(_root);
			updateLayoutAll(_root);
			translateNode(_root);

			var mains = _root.getChildren();
			for (var i = 0; i < mains.length; i++) {
				this.appendChildNode(_root, mains[i]);
				if (mains[i].isExpanded() && (mains[i].getChildren().length > 0)) {
					minder.expandNode(mains[i]);
				}
			}
		},
		appendChildNode: function (parent, node, sibling) {
			node.clearLayout();
			node.getContRc().clear();
			var Layout = node.getLayout();
			Layout = node.getLayout();
			if (!Layout.added) minder.handelNodeInsert(node);
			Layout.added = true;
			var parentLayout = parent.getLayout();
			var children = parent.getChildren();
			var exist = (children.indexOf(node) !== -1);
			//设置分支类型
			if (parent.getType() === "root") {
				node.setType("main");
			} else {
				node.setType("sub");
				//将节点加入到main分支的subgroup中
				parentLayout.subgroup.addShape(node.getRenderContainer());
				node.getLayout().subgroup = parentLayout.subgroup;
			}
			initLayout(node);
			if (sibling) {
				if (!exist) parent.insertChild(node, sibling.getIndex() + 1);
			} else {
				if (!exist) parent.appendChild(node);
			}
			//计算位置等流程
			this._firePharse(new MinderEvent("RenderNodeLeft", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNodeCenter", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNodeRight", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNodeBottom", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNodeTop", {
				node: node
			}, false));
			this._firePharse(new MinderEvent("RenderNode", {
				node: node
			}, false));
			updateBg(node);
			updateShapeByCont(node);
			var set = updateLayoutAll(node, parent, "append");
			for (var i = 0; i < set.length; i++) {
				translateNode(set [i]);
				updateConnectAndshIcon(set [i]);
			}
			if (node.getType() === "sub") {
				var set1 = updateLayoutMain();
				for (var j = 0; j < set1.length; j++) {
					translateNode(set1[j]);
					updateConnectAndshIcon(set1[j]);
				}
			}

			parent.expand();
			var shicon = parent.getLayout().shicon;
			if (shicon) shicon.switchState(true);
		},
		appendSiblingNode: function (sibling, node) {
			var parent = sibling.getParent();
			this.appendChildNode(parent, node, sibling);
		},
		removeNode: function (nodes) {
			while (nodes.length !== 0) {
				var parent = nodes[0].getParent();
				if (!parent) {
					nodes.splice(0, 1);
					return false;
				}
				var nodeLayout = nodes[0].getLayout();
				parent.removeChild(nodes[0]);
				if (parent.getType() !== "root" && parent.getChildren().length === 0) {
					var prtLayout = parent.getLayout();
					prtLayout.shicon.remove();
					prtLayout.shicon = null;
				}
				var set = updateLayoutAll(nodes[0], parent, "remove");
				for (var j = 0; j < set.length; j++) {
					translateNode(set [j]);
					updateConnectAndshIcon(set [j]);
				}
				var set1 = updateLayoutMain();
				for (var k = 0; k < set1.length; k++) {
					translateNode(set1[k]);
					updateConnectAndshIcon(set1[k]);
				}
				var _buffer = [nodes[0]];
				while (_buffer.length !== 0) {
					_buffer = _buffer.concat(_buffer[0].getChildren());
					try {
						_buffer[0].getRenderContainer().remove();
						var Layout = _buffer[0].getLayout();
						Layout.connect.remove();
						Layout.shicon.remove();
					} catch (error) {
						console.log("isRemoved");
					}
					//检测当前节点是否在选中的数组中，如果在的话，从选中数组中去除
					var idx = nodes.indexOf(_buffer[0]);
					if (idx !== -1) {
						nodes.splice(idx, 1);
					}
					_buffer.shift();
				}
			}
		},
		expandNode: function (ico) {
			var isExpand, node;
			if (ico instanceof MinderNode) {
				node = ico;
				isExpand = node.getLayout().shicon.switchState();
			} else {
				isExpand = ico.icon.switchState();
				node = ico.icon._node;
			}
			var _buffer;
			if (isExpand) {
				node.expand();
				//遍历子树展开需要展开的节点
				_buffer = [node];
				while (_buffer.length !== 0) {
					var c = _buffer[0].getChildren();
					if (_buffer[0].isExpanded() && c.length !== 0) {
						for (var x = 0; x < c.length; x++) {
							minder.appendChildNode(_buffer[0], c[x]);
						}
						_buffer = _buffer.concat(c);
					}
					_buffer.shift();
				}
			} else {
				node.collapse();
				//遍历子树移除需要移除的节点
				_buffer = node.getChildren();
				while (_buffer.length !== 0) {
					var Layout = _buffer[0].getLayout();
					if (Layout.added) {
						Layout.added = false;
						_buffer[0].getRenderContainer().remove();
						Layout.connect.remove();
						if (Layout.shicon) Layout.shicon.remove();
					}
					_buffer = _buffer.concat(_buffer[0].getChildren());
					_buffer.shift();
				}
				var set = updateLayoutAll(node, node.getParent(), "contract");
				for (var i = 0; i < set.length; i++) {
					translateNode(set [i]);
					updateConnectAndshIcon(set [i]);
				}
			}
		}
	};
	this.addLayoutStyle("bottom", _style);
	return {};
});