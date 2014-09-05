/* global Renderer: true */

var TextRenderer = KityMinder.TextRenderer = kity.createClass('TextRenderer', {
    base: Renderer,

    create: function() {
        return new kity.Text()
            .setId(KityMinder.uuid('node_text'))
            .setVerticalAlign('middle')
            .setAttr('text-rendering', 'inherit');
    },

    update: function(text,node) {

        var tmpText = node.getText();

        this.setTextStyle(node, text.setContent(tmpText));

        if(tmpText.length || !this._lastBox){

            var box = text.getBoundaryBox();
            var r = Math.round;
            if (kity.Browser.ie) {
                box.y += 1;
            }

            this._lastBox = {
                x : r(box.x),
                y : r(box.y),
                width : r(box.width),
                height: r(box.height)
            };
        }else {
            this._lastBox.width = 0;
        }
        var lastBox = this._lastBox;
        node._lastTextShapeBox = lastBox;
        return function() {
            return new kity.Box(lastBox.x, lastBox.y,lastBox.width, lastBox.height);
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

kity.extendClass(MinderNode,{
    getTextShape : function() {
        return  this.getRenderer('TextRenderer').getRenderShape();
    }
});
KityMinder.registerModule('text', {
    'renderers': {
        center: TextRenderer
    }
});