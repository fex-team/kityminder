/**
 * @fileOverview
 *
 * 脑图缩略图导航功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('nav', function(minder) {

    var $navBar = $('<div>').addClass('nav-bar').appendTo('#content-wrapper');
    var $commandbutton = minder.getUI('widget/commandbutton');

    var $zoomIn = $commandbutton.generate('zoom-in').appendTo($navBar[0]);
    var $zoomPan = createZoomPan().appendTo($navBar);
    var $zoomOut = $commandbutton.generate('zoom-out').appendTo($navBar[0]);

    var $previewNavigator = createViewNavigator();

    var $hand = $commandbutton.generate('hand').appendTo($navBar[0]);
    var $root = $commandbutton.generate('camera', function() {
        minder.execCommand('camera', minder.getRoot(), 600);
    }).appendTo($navBar[0]);

    var $previewTrigger = createPreviewTrigger($previewNavigator).appendTo($navBar);

    function createZoomPan() {
        var $pan = $('<div>').addClass('zoom-pan');
        var zoomStack = minder.getOptions('zoom');
        var minValue = zoomStack[0];
        var maxValue = zoomStack[zoomStack.length - 1];
        var valueRange = maxValue - minValue;

        function getHeight(value) {
            return (100 - (value - minValue) / valueRange * 100) + '%';
        }

        var $origin = $('<div>')
            .addClass('origin')
            .appendTo($pan)
            .css('top', getHeight(100));

        var $indicator = $('<div>')
            .addClass('indicator')
            .appendTo($pan)
            .css('top', getHeight(100));

        minder.on('interactchange', function() {
            var zoom = minder.queryCommandValue('zoom');
            $indicator.animate({
                'top': getHeight(zoom)
            }, 100);
        });

        $origin.click(function() {
            minder.execCommand('zoom', 100);
        });

        return $pan;
    }

    function createViewNavigator() {
        var $previewNavigator = $('<div>')
            .addClass('preview-navigator')
            .appendTo('#content-wrapper');

        var width = $previewNavigator.width();
        var height = $previewNavigator.height();
        var paper = new kity.Paper($previewNavigator[0]);

        paper.setWidth(width);
        paper.setHeight(height);

        var nodePath = paper.put(new kity.Path());
        var connectPath = paper.put(new kity.Path());
        var currentView = paper.put(new kity.Rect(100, 100).stroke('red', '1%'));

        minder.on('layout layoutallfinish', preview);
        minder.on('viewchange', updateView);

        var dragging = false;

        paper.on('mousedown', function(e) {
            dragging = true;
            moveView(e.getPosition('top'), 200);
            $previewNavigator.addClass('grab');
        });

        paper.on('mousemove', function(e) {
            if (dragging) {
                moveView(e.getPosition('top'));
            }
        });

        $(window).on('mouseup', function() {
            dragging = false;
            $previewNavigator.removeClass('grab');
        });

        function preview() {
            var view = minder.getRenderContainer().getBoundaryBox();
            var padding = 30;
            paper.setViewBox(
                view.x - padding - 0.5,
                view.y - padding - 0.5,
                view.width + padding * 2 + 1,
                view.height + padding * 2 + 1);

            var nodePathData = [];
            var connectPathData = [];

            minder.getRoot().traverse(function(node) {
                var box = node.getLayoutBox();
                nodePathData.push('M', box.x, box.y,
                    'h', box.width, 'v', box.height,
                    'h', -box.width, 'z');
                if (node.getConnection() && node.parent && node.parent.isExpanded()) {
                    connectPathData.push(node.getConnection().getPathData());
                }
            });

            paper.setStyle('background', minder.getStyle('background'));

            if (nodePathData.length) {
                nodePath
                    .fill(minder.getStyle('root-background'))
                    .setPathData(nodePathData);
            } else {
                nodePath.setPathData(null);
            }

            if (connectPathData.length) {
                connectPath
                    .stroke(minder.getStyle('connect-color'), '0.5%')
                    .setPathData(connectPathData);
            } else {
                connectPath.setPathData(null);
            }
        }

        function updateView() {
            var view = minder.getViewDragger().getView();
            currentView.setBox(view);
        }

        function moveView(center, duration) {
            var box = currentView.getBox();
            center.x = -center.x;
            center.y = -center.y;
            minder.getViewDragger().moveTo(center.offset(box.width / 2, box.height / 2), duration);
        }

        return $previewNavigator;
    }

    function createPreviewTrigger($previewNavigator) {
        var $trigger = $('<div>').addClass('command-button nav-trigger');
        $trigger.append('<div class="fui-icon">');
        $trigger.click(function() {
            $trigger.toggleClass('active');
            if ($trigger.hasClass('active')) {
                $previewNavigator.show();
            } else {
                $previewNavigator.hide();
            }
        }).click();
        $trigger.attr('title', minder.getLang('ui.navigator'));
        return $trigger;
    }

});