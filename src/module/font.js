KityMinder.registerModule( "fontmodule", function () {

    return {

        "commands": {
            "fontcolor": kity.createClass( "fontcolorCommand", {
                base: Command,

                execute: function ( km,color ) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes,function(i,n){
                        n.setData('fontcolor',color);
                        n.getTextShape().fill(color)
                    })
                }

            } ),
            "fontfamily": kity.createClass( "fontfamilyCommand", {
                base: Command,

                execute: function ( km,family) {
                    var nodes = km.getSelectedNodes();
                    utils.each(nodes,function(i,n){
                        n.setData('fontfamily',family);
                        n.getTextShape().setAttr('font-family',family);
                    })
                }
            } )
        },

        "events": {
            "beforeRenderNode": function ( e ) {
                var val;
                if(val = e.node.getData('fontfamily')){
                    e.node.getTextShape().setAttr('font-family',val);
                }
                if(val = e.node.getData('fontcolor')){
                    e.node.getTextShape().fill(val);
                }
            }
        }
    };
} );