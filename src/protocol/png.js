if (!kity.Browser.ie) {

    KityMinder.registerProtocol('png', function(minder) {

        var DomURL = window.URL || window.webkitURL || window;

        function loadImage(url, callback) {
            return new Promise(function(resolve, reject) {
                var image = document.createElement('img');
                image.onload = function() {
                    resolve(this);
                };
                image.onerror = function(err) {
                    reject(err);
                };
                image.crossOrigin = '';
                image.src = url;
            });
        }

        function getSVGInfo() {
            var paper = minder.getPaper(),
                paperTransform,
                domContainer = paper.container,
                svgXml,
                $svg,

                renderContainer = minder.getRenderContainer(),
                renderBox = renderContainer.getRenderBox(),
                width = renderBox.width + 1,
                height = renderBox.height + 1,

                blob, svgUrl, img;

            // 保存原始变换，并且移动到合适的位置
            paperTransform = paper.shapeNode.getAttribute('transform');
            paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');
            renderContainer.translate(-renderBox.x, -renderBox.y);

            // 获取当前的 XML 代码
            svgXml = paper.container.innerHTML;

            // 回复原始变换及位置
            renderContainer.translate(renderBox.x, renderBox.y);
            paper.shapeNode.setAttribute('transform', paperTransform);

            // 过滤内容
            $svg = $(svgXml).filter('svg');
            $svg.attr({
                width: renderBox.width + 1,
                height: renderBox.height + 1,
                style: 'font-family: Arial, "Microsoft Yahei","Heiti SC";'
            });
            $svg.removeAttr('id').find('*[id]').removeAttr('id');

            svgXml = $('<div></div>').append($svg).html();

            // Dummy IE
            svgXml = svgXml.replace(' xmlns="http://www.w3.org/2000/svg" xmlns:NS1="" NS1:ns1:xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:NS2="" NS2:xmlns:ns1=""', '');

            // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
            svgXml = svgXml.replace(/&nbsp;/g, '&#xa0;');

            blob = new Blob([svgXml], {
                type: 'image/svg+xml'
            });

            svgUrl = DomURL.createObjectURL(blob);

            //svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgXml);

            return {
                width: width,
                height: height,
                dataUrl: svgUrl
            };
        }

        function encode(json) {

            /* 绘制 PNG 的画布及上下文 */
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');

            /* 尝试获取背景图片 URL 或背景颜色 */
            var bgDeclare = minder.getStyle('background').toString();
            var bgUrl = /url\((.+)\)/.exec(bgDeclare);
            var bgColor = kity.Color.parse(bgDeclare);

            /* 获取 SVG 文件内容 */
            var svgInfo = getSVGInfo();
            var width = svgInfo.width;
            var height = svgInfo.height;
            var svgDataUrl = svgInfo.dataUrl;

            /* 画布的填充大小 */
            var padding = 20;

            canvas.width = width + padding * 2;
            canvas.height = height + padding * 2;

            function fillBackground(ctx, style) {
                ctx.save();
                ctx.fillStyle = style;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            function drawImage(ctx, image, x, y) {
                ctx.drawImage(image, x, y);
            }

            function generateDataUrl(canvas) {
                var url = canvas.toDataURL('png');
                return url;
            }

            function drawSVG() {
                return loadImage(svgDataUrl).then(function(svgImage) {
                    drawImage(ctx, svgImage, padding, padding);
                    DomURL.revokeObjectURL(svgDataUrl);
                    return generateDataUrl(canvas);
                });
            }

            if (bgUrl) {

                return loadImage(bgUrl[1]).then(function(image) {

                    fillBackground(ctx, ctx.createPattern(image, 'repeat'));

                    return drawSVG();

                });

            } else {

                fillBackground(ctx, bgColor.toString());
                return drawSVG();

            }
        }

        return {
            fileDescription: 'PNG 图片',
            fileExtension: '.png',
            mineType: 'image/png',
            dataType: 'base64',
            encode: encode,
            recognizePriority: -1
        };
    });
}