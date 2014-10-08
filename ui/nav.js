/**
 * @fileOverview
 *
 * 脑图缩略图导航功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('nav', function(minder) {

    var memory = minder.getUI('memory');

    var $navBar = $('<div>').addClass('nav-bar').appendTo('#content-wrapper');
    var $commandbutton = minder.getUI('widget/commandbutton');

    var $zoomIn = $commandbutton.generate('zoom-in').appendTo($navBar[0]);
    var $zoomPan = createZoomPan($navBar);
    var $zoomOut = $commandbutton.generate('zoom-out').appendTo($navBar[0]);

    var $previewNavigator = createViewNavigator();

    var $hand = $commandbutton.generate('hand').appendTo($navBar[0]);
    var $root = $commandbutton.generate('camera', function() {
        minder.execCommand('camera', minder.getRoot(), 600);
    }).appendTo($navBar[0]);

    var $previewTrigger = createPreviewTrigger($previewNavigator).appendTo($navBar);

    function createZoomPan($parent) {
        var $pan = $('<div>').addClass('zoom-pan').appendTo($parent);
        var zoomStack = minder.getOptions('zoom');
        var minValue = zoomStack[0];
        var maxValue = zoomStack[zoomStack.length - 1];
        var valueRange = maxValue - minValue;

        var totalHeight = $pan.height();
        function getHeight(value) {
            return (1 - (value - minValue) / valueRange) * totalHeight;
        }

        var $origin = $('<div>')
            .addClass('origin')
            .appendTo($pan)
            .css('y', getHeight(100));

        var $indicator = $('<div>')
            .addClass('indicator')
            .appendTo($pan)
            .css('y', getHeight(100));

        function indicate(value) {
            $indicator.animate({
                'y': getHeight(value)
            }, 200);
        }

        minder.on('zoom', function(e) {
            indicate(e.zoom);
        });

        $origin.click(function() {
            minder.execCommand('zoom', 100);
        });

        return $pan;
    }

    /**
     * 创建导航器的 DOM 元素以及交互的逻辑代码
     */
    function createViewNavigator() {
        var $previewNavigator = $('<div>')
            .addClass('preview-navigator')
            .appendTo('#content-wrapper');

        // 画布，渲染缩略图
        var paper = new kity.Paper($previewNavigator[0]);

        // 用两个路径来挥之节点和连线的缩略图
        var nodeThumb = paper.put(new kity.Path());
        var connectionThumb = paper.put(new kity.Path());

        // 表示可视区域的矩形
        var visibleRect = paper.put(new kity.Rect(100, 100).stroke('red', '1%'));

        var contentView = new kity.Box(), visibleView = new kity.Box();

        navigate();

        $previewNavigator.show = function() {
            $.fn.show.call(this);
            bind();
            updateContentView();
            updateVisibleView();
        };

        $previewNavigator.hide = function() {
            $.fn.hide.call(this);
            unbind();
        };

        function bind() {
            minder.on('layout layoutallfinish', updateContentView);
            minder.on('viewchange', updateVisibleView);
        }

        function unbind() {
            minder.off('layout layoutallfinish', updateContentView);
            minder.off('viewchange', updateVisibleView);
        }

        window.u = updateContentView;

        function navigate() {

            function moveView(center, duration) {
                var box = visibleView;
                center.x = -center.x;
                center.y = -center.y;

                var viewMatrix = minder.getPaper().getViewPortMatrix();
                box = viewMatrix.transformBox(box);

                var targetPosition = center.offset(box.width / 2, box.height / 2);

                minder.getViewDragger().moveTo(targetPosition, duration);
            }

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
        }

        function updateContentView() {

            var view = minder.getRenderContainer().getBoundaryBox();

            contentView = view;

            var padding = 30;

            paper.setViewBox(
                view.x - padding - 0.5,
                view.y - padding - 0.5,
                view.width + padding * 2 + 1,
                view.height + padding * 2 + 1);

            var nodePathData = [];
            var connectionThumbData = [];

            minder.getRoot().traverse(function(node) {
                var box = node.getLayoutBox();
                nodePathData.push('M', box.x, box.y,
                    'h', box.width, 'v', box.height,
                    'h', -box.width, 'z');
                if (node.getConnection() && node.parent && node.parent.isExpanded()) {
                    connectionThumbData.push(node.getConnection().getPathData());
                }
            });

            paper.setStyle('background', minder.getStyle('background'));

            if (nodePathData.length) {
                nodeThumb
                    .fill(minder.getStyle('root-background'))
                    .setPathData(nodePathData);
            } else {
                nodeThumb.setPathData(null);
            }

            if (connectionThumbData.length) {
                connectionThumb
                    .stroke(minder.getStyle('connect-color'), '0.5%')
                    .setPathData(connectionThumbData);
            } else {
                connectionThumb.setPathData(null);
            }

            updateVisibleView();
        }

        function updateVisibleView() {
            visibleView = minder.getViewDragger().getView();
            visibleRect.setBox(visibleView.intersect(contentView));
        }

        return $previewNavigator;
    }

    function createPreviewTrigger($previewNavigator) {
        var $trigger = $('<div>').addClass('command-button nav-trigger');

        $trigger.append('<div class="fui-icon">');
        $trigger.click(toggle);
        $trigger.attr('title', minder.getLang('ui.navigator'));

        function toggle() {
            if ($trigger.toggleClass('active').hasClass('active')) {
                $previewNavigator.show();
                memory.set('navigator-hidden', false);
            } else {
                $previewNavigator.hide();
                memory.set('navigator-hidden', true);
            }
        }

        if (memory.get('navigator-hidden')) toggle();
        toggle();

        return $trigger;
    }

});