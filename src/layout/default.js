/* global Layout:true */

KityMinder.registerLayout('default', kity.createClass({
    base: Layout,
    doLayout: function(node) {
        node.getChildren().forEach(function(childNode) {
            childNode.layout();
        });

    }
}));