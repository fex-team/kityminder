/* global Renderer: true */

var TextRenderer = KityMinder.TextRenderer = kity.createClass('TextRenderer', {
    base: Renderer,

    create: function() {
        return new kity.Group().setId(KityMinder.uuid('node_text'));
    },

    update: function(textGroup,node) {

        var textArr = node.getText(true);

        var lineHeight = node.getStyle('line-height');

        var fontSize = node.getData('font-size') || node.getStyle('font-size');

        var height = textArr.length *
            node.getStyle('line-height') * (node.getData('font-size') || node.getStyle('font-size')) / 2;
        var rBox = new kity.Box(),

            r = Math.round;



        this.setTextStyle(node, textGroup);

        for(var i= 0,text,textShape;
            (text=textArr[i],textShape=textGroup.getItem(i),
                text!==undefined||textShape!==undefined);i++){

            if(text === undefined && textShape){
                textGroup.removeItem(i);
            }else{
                if(text!==undefined&&!textShape){
                    textShape = new kity.Text()
                        .setVerticalAlign('top')
                        .setAttr('text-rendering', 'inherit');
                    textGroup.addItem(textShape);
                }
                textShape.setContent(text);


            }

        }
        this.setTextStyle(node, textGroup);

        textGroup.eachItem(function(i,textShape){
            var y = i * fontSize * lineHeight - height;

            textShape.setY(y);

            rBox = rBox.merge(new kity.Box(0, y, textShape.getBoundaryBox().width, fontSize));
        });

        var nBox = new kity.Box(r(rBox.x), r(rBox.y),r(rBox.width), r(rBox.height));

        node._currentTextGroupBox = nBox;
        return function() {
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

kity.extendClass(MinderNode,{
    getTextGroup : function() {
        return  this.getRenderer('TextRenderer').getRenderShape();
    }
});
KityMinder.registerModule('text', {
    'renderers': {
        center: TextRenderer
    }
});