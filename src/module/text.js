/* global Renderer: true */

var TextRenderer = KityMinder.TextRenderer = kity.createClass('TextRenderer', {
    base: Renderer,

    create: function() {
        return new kity.Text()
            .setId(KityMinder.uuid('node_text'))
            .setVerticalAlign('middle');
    },

    update: function(text, node) {
        this.setTextStyle(node, text.setContent(node.getText()));
        return text.getBoundaryBox();
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
    getTextShape : function(){
        return  this.getRenderer('TextRenderer').getRenderShape();
    }
});
KityMinder.registerModule('text', {
    'renderers': {
        center: TextRenderer
    }
});