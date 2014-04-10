KityMinder.registerModule( "basestylemodule", function () {
    var km = this;
    return {

        "commands": {
            "bold": kity.createClass( "boldCommand", {
                base: Command,

                execute: function (  ) {

                    var nodes = km.getSelectedNodes();
                    if(this.queryState('bold') == 1){
                        utils.each(nodes,function(i,n){
                            n.setData('bold');
                            n.getTextShape().setAttr('font-weight');
                            km.updateLayout(n)
                        })
                    }else{
                        utils.each(nodes,function(i,n){
                            n.setData('bold',true);
                            n.getTextShape().setAttr('font-weight','bold');
                            km.updateLayout(n)
                        })
                    }
                },
                queryState: function (  ) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if(nodes.length == 0){
                        return -1;
                    }
                    utils.each(nodes,function(i,n){
                        if( n && n.getData('bold') ){
                            result = 1;
                            return false;
                        }
                    });
                    return result;
                }
            } ),
            "italic": kity.createClass( "italicCommand", {
                base: Command,

                execute: function (  ) {

                    var nodes = km.getSelectedNodes();
                    if(this.queryState('italic') == 1){
                        utils.each(nodes,function(i,n){
                            n.setData('italic');
                            n.getTextShape().setAttr('font-style');
                            km.updateLayout(n)
                        })
                    }else{
                        utils.each(nodes,function(i,n){
                            n.setData('italic',true);
                            n.getTextShape().setAttr('font-style','italic');
                            km.updateLayout(n)
                        })
                    }
                },
                queryState: function (  ) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    if(nodes.length == 0){
                        return -1;
                    }
                    utils.each(nodes,function(i,n){
                        if( n && n.getData('italic') ){
                            result = 1;
                            return false;
                        }
                    });
                    return result;
                }
            } )
        },
        addShortcutKeys: {
            "bold": "ctrl+b", //bold
            "italic": "ctrl+i" //italic
        },
        "events": {
            "beforeRenderNode": function ( e ) {
                //加粗
                if(e.node.getData('bold')){
                    e.node.getTextShape().setAttr('font-weight','bold');
                }

                if(e.node.getData('italic')){
                    e.node.getTextShape().setAttr('font-style','italic');
                }
            }
        }
    };
} );