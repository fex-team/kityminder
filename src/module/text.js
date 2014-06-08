/* global Renderer: true */

kity.extendClass(MinderNode, {
    getTextShape: function() {
        return this._textShape;
    }
});

KityMinder.registerModule('text', {
    'renderers': {
        center: kity.createClass('TextRenderer', {
            base: Renderer,
            create: function(node) {
                var textShape = new kity.Text().setId(KityMinder.uuid('node_text'));

                node.getRenderContainer().addShape(textShape);

                node._textShape = textShape;
            },
            update: function(node) {
                function dataOrStyle(name) {
                    return node.getData(name) || node.getStyle(name);
                }
                return node.getTextShape()
                    .setContent(node.getText())
                    .setFont({
                        family: dataOrStyle('font-family'),
                        size: dataOrStyle('font-size'),
                        weight: dataOrStyle('font-weight'),
                        style: dataOrStyle('font-style')
                    })
                    .setVerticalAlign('middle')
                    .fill(node.getData('color') || node.getStyle('color'))
                    .getBoundaryBox();

            }
        })
    }
});