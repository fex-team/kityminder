if (!kity.Browser.ie) {

    KityMinder.registerProtocol('svg', function(minder) {

        return {
            fileDescription: 'SVG 矢量图',
            fileExtension: '.svg',
            mineType: 'image/svg+xml',
            dataType: 'text',

            encode: function(json) {

                var paper = minder.getPaper(),
                    paperTransform = paper.shapeNode.getAttribute('transform'),
                    svgXml,
                    $svg,

                    renderContainer = minder.getRenderContainer(),
                    renderBox = renderContainer.getRenderBox(),
                    transform = renderContainer.getTransform(),
                    width = renderBox.width,
                    height = renderBox.height,
                    padding = 20;

                paper.shapeNode.setAttribute('transform', 'translate(0.5, 0.5)');
                svgXml = paper.container.innerHTML;
                paper.shapeNode.setAttribute('transform', paperTransform);

                $svg = $(svgXml).filter('svg');
                $svg.attr({
                    width: width + padding * 2 | 0,
                    height: height + padding * 2 | 0,
                    style: 'font-family: Arial, "Microsoft Yahei",  "Heiti SC"; background: ' + minder.getStyle('background')
                });
                $svg[0].setAttribute('viewBox', [renderBox.x - padding | 0,
                    renderBox.y - padding | 0,
                    width + padding * 2 | 0,
                    height + padding * 2 | 0
                ].join(' '));

                // need a xml with width and height
                svgXml = $('<div></div>').append($svg).html();

                svgXml = $('<div></div>').append($svg).html();

                // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
                svgXml = svgXml.replace(/&nbsp;/g, '&#xa0;');

                // svg 含有 &nbsp; 符号导出报错 Entity 'nbsp' not defined
                return svgXml;
            },

            recognizePriority: -1
        };
    });
}