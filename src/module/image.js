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
        if (width > maxWidth && ratio > fitRatio) {
            width = maxWidth;
            height = width / ratio;
        } else if (height > maxHeight) {
            height = maxHeight;
            width = height * ratio;
        }

        return {
            width: width | 0,
            height: height | 0
        };
    }

    var ImageCommand = kity.createClass('ImageCommand', {
        base: Command,

        execute: function(km, url, title) {
            var nodes = km.getSelectedNodes();

            loadImageSize(url, function(width, height) {
                if (!width) return;
                utils.each(nodes, function(i, n) {
                    var size = fitImageSize(
                        width, height,
                        km.getOptions('maxImageWidth'),
                        km.getOptions('maxImageHeight'));
                    n.setData('image', url);
                    n.setData('imageTitle', title);
                    n.setData('imageSize', size);
                    n.render();
                });
                km.fire("saveScene");
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
            return {
                url: node.getData('image'),
                title: node.getData('imageTitle')
            };
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
            return new kity.Image(node.getData('image'));
        },

        shouldRender: function(node) {
            return node.getData('image');
        },

        update: function(image, node, box) {
            var url = node.getData('image');
            var title = node.getData('imageTitle');
            var size = node.getData('imageSize');
            var spaceTop = node.getStyle('space-top');

            if (!size) return;

            if (title) {
                image.node.setAttributeNS('http://www.w3.org/1999/xlink', 'title', title);
            }

            var x = box.cx - size.width / 2;
            var y = box.y - size.height - spaceTop;

            image
                .setUrl(url)
                .setX(x | 0)
                .setY(y | 0)
                .setWidth(size.width | 0)
                .setHeight(size.height | 0);

            return new kity.Box(x | 0, y | 0, size.width | 0, size.height | 0);
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