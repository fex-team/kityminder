/**
 * @fileOverview
 *
 * 脑图缩略图导航功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('nav', function (minder) {

    var $previewNavigator = $('<div>')
        .addClass('preview-navigator')
        .appendTo('#content-wrapper');

    var width = $previewNavigator.width();
    var height = $previewNavigator.height();
    var paper = new kity.Paper($previewNavigator[0]);

    paper.setWidth(width);
    paper.setHeight(height);

    var nodePath = paper.put(new kity.Path()).fill(minder.getStyle('root-background'));
    var connectPath = paper.put(new kity.Path()).stroke(minder.getStyle('connect-color'));

    function preview() {
        var view = minder.getRenderContainer().getBoundaryBox();
        paper.setViewBox(view.x - 0.5, view.y - 0.5, view.width + 1, view.height + 1);

        var nodePathData = [];
        var connectPathData = [];

        minder.getRoot().traverse(function(node) {
            var box = node.getLayoutBox();
            nodePathData.push('M', box.x, box.y, 
                'h', box.width, 'v', box.height,
                'h', -box.width, 'z');
            if (node.getConnection() && node.parent && node.parent.isExpanded()) {
                connectPathData.push(node.getConnection().getPathData());
                console.log(node, node.getConnection().getPathData());
            }
        });

        nodePath.setPathData(nodePathData);
        connectPath.setPathData(connectPathData);
    }

    minder.on('layoutallfinish', preview);
});