KityMinder.registerModule("image", function () {
    function loadImageSize(url, callback) {
        var img = document.createElement('img');
        img.onload = function () {
            callback(img.width, img.height);
        };
        img.onerror = function () {
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
    return {
        "defaultOptions": {
            "maxImageWidth": 200,
            "maxImageHeight": 200
        },
        "commands": {
            "image": kity.createClass("ImageCommand", {
                base: Command,

                execute: function (km, url) {
                    var nodes = km.getSelectedNodes();

                    loadImageSize(url, function (width, height) {
                        if (!width) return;
                        utils.each(nodes, function (i, n) {
                            n.setData('image', url);
                            n.setData('imageWidth', width);
                            n.setData('imageHeight', height);
                            km.updateLayout(n);
                        });
                    });

                },
                queryState: function (km) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if (nodes.length === 0) {
                        return -1;
                    }
                    utils.each(nodes, function (i, n) {
                        if (n && n.getData('image')) {
                            result = 0;
                            return false;
                        }
                    });
                    return result;
                },
                queryValue: function (km) {
                    var node = km.getSelectedNode();
                    return node.getData('image');
                }
            }),
            "removeimage": kity.createClass("RemoveImageCommand", {
                base: Command,

                execute: function (km) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes, function (i, n) {
                        n.setData('image');
                        km.updateLayout(n);
                    });
                },
                queryState: function (km) {
                    var nodes = km.getSelectedNodes();

                    if (nodes.length == 0) {
                        return -1;
                    }
                    var image = false;
                    utils.each(nodes, function (i, n) {
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
            })
        },
        "events": {
            "RenderNodeTop": function (e) {
                var node = e.node,
                    url = node.getData('image');
                var link, img, size, currentBox;
                var curStyle = this.getCurrentLayoutStyle();
                var nodeType = node.getType();
                var spaceBottom = curStyle[nodeType].spaceBottom;

                if (url) {

                    size = fitImageSize(
                        node.getData('imageWidth'),
                        node.getData('imageHeight'),
                        this.getOptions('maxImageWidth'),
                        this.getOptions('maxImageHeight'));

                    img = new kity.Image(url, size.width, size.height);

                    link = new kity.HyperLink(url);
                    link.addShape(img);
                    link.setTarget('_blank');
                    link.setStyle('cursor', 'pointer');

                    currentBox = node.getContRc().getBoundaryBox();
                    node.getContRc().addShape(link.setTranslate(0, currentBox.y - size.height - spaceBottom));

                }
            }
        }
    };
});