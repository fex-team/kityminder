KityMinder.registerModule( "basestylemodule", function () {

    return {

        "commands": {
            "bold": kity.createClass( "boldCommand", {
                base: Command,

                execute: function ( km ) {
                    var nodes = km.getSelectedNodes();
                    if(this.queryState('bold') == 1){
                        utils.each(nodes,function(i,n){
                            n.setData('bold');
                            n.getTextShape().setAttr('font-weight');
                        })
                    }else{
                        utils.each(nodes,function(i,n){
                            n.setData('bold',true);
                            n.getTextShape().setAttr('font-weight','bold');
                        })
                    }

                },
                queryState: function ( km ) {
                    var nodes = km.getSelectedNodes(),
                        result = 0;
                    utils.each(nodes,function(i,n){
                        if(n.setData('bold')){
                            result = 1;
                            return false;
                        }
                    });
                    return result;
                }
            } ),
            "italic": kity.createClass( "italicCommand", {
                base: Command,

                execute: function ( km ) {

                },

                queryState: function ( km ) {

                }
            } )
        },
        addShortcutKeys: {
            "bold": "ctrl+90", //undo
            "italic": "ctrl+89" //redo
        },
        "events": {
            "beforerendernode": function ( e ) {

            }
        }
    };
} );