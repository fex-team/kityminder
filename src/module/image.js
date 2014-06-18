KityMinder.registerModule('image', function() {
    function loadImageSize(url, callback) {
        var img = document.createElement('img');
        img.onload = function() {
            callback(img.width, img.height);
        };
        img.onerror = function() {
            callback(null);
        };
        img.src = url;
    }

    function fitImageSize(width, height, maxWidth, maxHeight) {
        var ratio = width / height,
            fitRatio = maxWidth / maxHeight;

        // 宽高比大于最大尺寸的宽高比，以宽度为标准适应
        if (ratio > fitRatio && width > maxWidth) {
            width = maxWidth;
            height = maxWidth / ratio;
        } else if (height > maxHeight) {
            height = maxHeight;
            width = maxHeight / ratio;
        }

        return {
            width: width,
            height: height
        };
    }

    var ImageCommand = kity.createClass('ImageCommand', {
        base: Command,

        execute: function(km, url) {
            var nodes = km.getSelectedNodes();

            loadImageSize(url, function(width, height) {
                if (!width) return;
                utils.each(nodes, function(i, n) {
                    var size = fitImageSize(
                        width, height,
                        km.getOptions('maxImageWidth'),
                        km.getOptions('maxImageHeight'));
                    n.setData('image', url);
                    n.setData('imageSize', size);
                    n.render();
                });
                km.layout(300);
            });

        },
        queryState: function(km) {
            var nodes = km.getSelectedNodes(),
                result = 0;
            if (nodes.length === 0) {
                return -1;
            }
            utils.each(nodes, function(i, n) {
                if (n && n.getData('image')) {
                    result = 0;
                    return false;
                }
            });
            return result;
        },
        queryValue: function(km) {
            var node = km.getSelectedNode();
            return node.getData('image');
        }
    });

    var RemoveImageCommand = kity.createClass('RemoveImageCommand', {
        base: Command,

        execute: function(km) {
            var nodes = km.getSelectedNodes();
            utils.each(nodes, function(i, n) {
                n.setData('image').render();
            });
            km.layout(300);
        },
        queryState: function(km) {
            var nodes = km.getSelectedNodes();

            if (nodes.length === 0) {
                return -1;
            }
            var image = false;
            utils.each(nodes, function(i, n) {
                if (n.getData('image')) {
                    image = true;
                    return false;
                }
            });
            if (image) {
                return 0;
            }
            return -1;
        }
    });

    var ImageRenderer = kity.createClass('ImageRenderer', {
        base: KityMinder.Renderer,

        create: function(node) {
            return new kity.Image();
        },

        shouldRender: function(node) {
            return node.getData('image');
        },

        update: function(image, node, box) {
            var url = node.getData('image');
            var size = node.getData('imageSize');
            var spaceTop = node.getStyle('space-top');

            if (!size) return;

            image
                .setUrl(url)
                .setX(box.cx - size.width / 2)
                .setY(box.y - size.height - spaceTop)
                .setWidth(size.width)
                .setHeight(size.height);

            return new kity.Box(image.getX(), image.getY(), size.width, size.height);
        }
    });

    return {
        'defaultOptions': {
            'maxImageWidth': 200,
            'maxImageHeight': 200
        },
        'commands': {
            'image': ImageCommand,
            'removeimage': RemoveImageCommand
        },
        'renderers': {
            'top': ImageRenderer
        }
    };
});