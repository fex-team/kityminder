/* global Renderer: true */

var FONT_ADJUST = {
    '微软雅黑,Microsoft YaHei': -0.15,
    'arial black,avant garde': -0.17,
    'default': -0.15
};

var TextRenderer = KityMinder.TextRenderer = kity.createClass('TextRenderer', {
    base: Renderer,

    create: function() {
        return new kity.Group().setId(KityMinder.uuid('node_text'));
    },

    update: function(textGroup, node) {

        function s(name) {
            return node.getData(name) || node.getStyle(name);
        }

        var textArr = node.getText(true);

        var lineHeight = node.getStyle('line-height');

        var fontSize = s('font-size');
        var fontFamily = s('font-family') || 'default';

        var height = (lineHeight * fontSize) * textArr.length - (lineHeight - 1) * fontSize;
        var yStart = -height / 2;

        var adjust = FONT_ADJUST[fontFamily] || 0;

        textGroup.setTranslate(0, adjust * fontSize);

        var rBox = new kity.Box(),
            r = Math.round;

        this.setTextStyle(node, textGroup);

        var textLength = textArr.length;

        var textGroupLength = textGroup.getItems().length;

        if(textLength < textGroupLength){
            for( var i = textLength,ci;ci = textGroup.getItem(i);){
                textGroup.removeItem(i);
            }
        }else if(textLength > textGroupLength){
            var length = textLength - textGroupLength;
            for(var i = 0;i < length;i++){
                var textShape = new kity.Text()
                    .setAttr('text-rendering', 'inherit');
                if (kity.Browser.ie) {
                    textShape.setVerticalAlign('top');
                } else {
                    textShape.setAttr('dominant-baseline', 'text-before-edge');
                }
                textGroup.addItem(textShape);
            }
        }


        for (var i = 0, text, textShape;
            (text = textArr[i], textShape = textGroup.getItem(i)); i++) {
            textShape.setContent(text);
        }

        this.setTextStyle(node, textGroup);

        return function() {
            textGroup.eachItem(function(i, textShape) {
                var y = yStart + i * fontSize * lineHeight;

                textShape.setY(y);

                rBox = rBox.merge(new kity.Box(0, y, textShape.getBoundaryBox().width || 1, fontSize));
            });

            var nBox = new kity.Box(r(rBox.x), r(rBox.y), r(rBox.width), r(rBox.height));

            node._currentTextGroupBox = nBox;
            return nBox;
        };

    },

    setTextStyle: function(node, text) {
        var hooks = TextRenderer._styleHooks;
        hooks.forEach(function(hook) {
            hook(node, text);
        });
    }
});

utils.extend(TextRenderer, {
    _styleHooks: [],

    registerStyleHook: function(fn) {
        TextRenderer._styleHooks.push(fn);
    }
});

kity.extendClass(MinderNode, {
    getTextGroup: function() {
        return this.getRenderer('TextRenderer').getRenderShape();
    }
});
KityMinder.registerModule('text', {
    'renderers': {
        center: TextRenderer
    }
});