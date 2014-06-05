/* global Layout:true */

KityMinder.registerLayout('default', kity.createClass({
    base: Layout,

    doLayout: function(node) {
        node.getChildren().forEach(function(childNode) {
            childNode.layout();
        });
        var y = 0;
        node.getChildren().forEach(function(childNode) {
        	childNode.layoutX = node.getContentBox().right - childNode.getContentBox().x + node.getStyle('margin-right');
        	childNode.layoutY = y;
        	y += 50;
        	console.log(childNode.layoutX, childNode.layoutY);
        });
        node.layoutX = 0;
        node.layoutY = 0;
    }
}));