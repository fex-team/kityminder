KityMinder.registerModule('Resource', function() {

    /**
     * 自动使用的颜色序列
     */
    var RESOURCE_COLOR_SERIES = [51, 303, 75, 200, 157, 0, 26, 254].map(function(h) {
        return kity.Color.createHSL(h, 100, 85);
    });

    var RESOURCE_COLOR_OVERFLOW = kity.Color.createHSL(0, 0, 95);

    /**
     * 在 Minder 上拓展一些关于资源的支持接口
     */
    kity.extendClass(Minder, {

        /**
         * 获取脑图中某个资源对应的颜色
         *
         * 如果存在同名资源，则返回已经分配给该资源的颜色，否则分配给该资源一个颜色，并且返回
         *
         * 如果资源数超过颜色序列数量，返回白色
         *
         * @param {String} resource 资源名称
         * @return {Color}
         */
        getResourceColor: function(resource) {
            var colorMapping = this._getResourceColorIndexMapping();
            var nextIndex;

            if (!colorMapping.hasOwnProperty(resource)) {
                // 找不到找下个可用索引
                nextIndex = this._getNextResourceColorIndex();
                colorMapping[resource] = nextIndex;
            }

            // 资源过多，找不到可用索引颜色，统一返回白色
            return RESOURCE_COLOR_SERIES[colorMapping[resource]] || RESOURCE_COLOR_OVERFLOW;
        },

        /**
         * 获得已使用的资源的列表
         *
         * @return {Array}
         */
        getUsedResource: function() {
            var mapping = this._getResourceColorIndexMapping();
            var used = [],
                resource;

            for (resource in mapping) {
                if (mapping.hasOwnProperty(resource)) {
                    used.push(resource);
                }
            }

            return used;
        },

        /**
         * 获取脑图下一个可用的资源颜色索引
         *
         * @return {int}
         */
        _getNextResourceColorIndex: function() {
            // 获取现有颜色映射
            //     resource => color_index
            var colorMapping = this._getResourceColorIndexMapping();

            var resource, used, i;

            used = [];

            // 抽取已经使用的值到 used 数组
            for (resource in colorMapping) {
                if (colorMapping.hasOwnProperty(resource)) {
                    used.push(colorMapping[resource]);
                }
            }

            // 枚举所有的可用值，如果还没被使用，返回
            for (i = 0; i < RESOURCE_COLOR_SERIES.length; i++) {
                if (!~used.indexOf(i)) return i;
            }

            // 没有可用的颜色了
            return -1;
        },

        // 获取现有颜色映射
        //     resource => color_index
        _getResourceColorIndexMapping: function() {
            return this._resourceColorMapping || (this._resourceColorMapping = {});
        }

    });


    /**
     * @class 设置资源的命令
     *
     * @example
     *
     * // 设置选中节点资源为 "张三"
     * minder.execCommand('resource', ['张三']);
     *
     * // 添加资源 "李四" 到选中节点
     * var resource = minder.queryCommandValue();
     * resource.push('李四');
     * minder.execCommand('resource', resource);
     *
     * // 清除选中节点的资源
     * minder.execCommand('resource', null);
     */
    var ResourceCommand = kity.createClass('ResourceCommand', {

        base: Command,

        execute: function(minder, resource) {
            var nodes = minder.getSelectedNodes();

            if (typeof(resource) == 'string') {
                resource = [resource];
            }

            nodes.forEach(function(node) {
                node.setData('resource', resource).render();
            });

            minder.layout(200);
        },

        queryValue: function(minder) {
            var nodes = minder.getSelectedNodes();
            var resource = [];

            nodes.forEach(function(node) {
                var nodeResource = node.getData('resource');

                if (!nodeResource) return;

                nodeResource.forEach(function(name) {
                    if (!~resource.indexOf(name)) {
                        resource.push(name);
                    }
                });
            });

            return resource;
        },

        queryState: function(km) {
            return km.getSelectedNode() ? 0 : -1;
        }
    });

    /**
     * @class 资源的覆盖图形
     *
     * 该类为一个资源以指定的颜色渲染一个动态的覆盖图形
     */
    var ResourceOverlay = kity.createClass('ResourceOverlay', {
        base: kity.Group,

        constructor: function() {
            this.callBase();

            var text, rect;

            rect = this.rect = new kity.Rect().setRadius(4);

            text = this.text = new kity.Text()
                .setFontSize(12)
                .setVerticalAlign('middle');

            this.addShapes([rect, text]);
        },

        setValue: function(resourceName, color) {
            var paddingX = 8,
                paddingY = 4,
                borderRadius = 4;
            var text, box, rect;

            text = this.text;

            if (resourceName == this.lastResourceName) {

                box = this.lastBox;

            } else {

                text.setContent(resourceName);

                box = text.getBoundaryBox();
                this.lastResourceName = resourceName;
                this.lastBox = box;

            }

            text.setX(paddingX).fill(color.dec('l', 70));

            rect = this.rect;
            rect.setPosition(0, box.y - paddingY);
            this.width = Math.round(box.width + paddingX * 2);
            this.height = Math.round(box.height + paddingY * 2);
            rect.setSize(this.width, this.height);
            rect.fill(color);
        }
    });

    /**
     * @class 资源渲染器
     */
    var ResourceRenderer = kity.createClass('ResourceRenderer', {
        base: KityMinder.Renderer,

        create: function(node) {
            this.overlays = [];
            return new kity.Group();
        },

        shouldRender: function(node) {
            return node.getData('resource') && node.getData('resource').length;
        },

        update: function(container, node, box) {
            var spaceRight = node.getStyle('space-right');

            var overlays = this.overlays;
            var resource = node.getData('resource');
            var minder = node.getMinder();
            var i, overlay, x;

            x = 0;
            for (i = 0; i < resource.length; i++) {
                x += spaceRight;

                overlay = overlays[i];
                if (!overlay) {
                    overlay = new ResourceOverlay();
                    overlays.push(overlay);
                    container.addShape(overlay);
                }
                overlay.setVisible(true);
                overlay.setValue(resource[i], minder.getResourceColor(resource[i]));
                overlay.setTranslate(x, -1);

                x += overlay.width;
            }

            while ((overlay = overlays[i++])) overlay.setVisible(false);

            container.setTranslate(box.right, 0);

            return new kity.Box({
                x: box.right,
                y: Math.round(-overlays[0].height / 2),
                width: x,
                height: overlays[0].height
            });
        }
    });

    return {
        commands: {
            'resource': ResourceCommand
        },

        renderers: {
            right: ResourceRenderer
        }
    };
});