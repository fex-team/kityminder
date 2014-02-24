KM.registerUI( 'contextmenu', function () {
    var me = this;
    var $menu = $.kmuidropmenu({
        click:function(e,v){
            me.execCommand(v);
            this.hide();
        }
    });
    me.$container.append($menu);
    me.on('contextmenu',function(e){
        var items = me.getContextmenu();
        var data = [];
        utils.each(items,function(i,item){
            if(me.queryCommandState(item.cmdName)!=-1){
                data.push({
                    label:item.label,
                    value:item.cmdName
                })
            }
        });
        if(data.length){
            var offset = e.getPosition();

            $menu.kmui().setData({
                data:data
            }).position({
                    left: offset.x,
                    top: offset.y
                }).show();
            e.preventDefault()
        }

    });
    me.on('click',function(){
        $menu.kmui().hide();
    });

    me.on('beforemousedown',function(e){
        var isRightMB;


        if ("which" in e.originEvent)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
            isRightMB = e.originEvent.which == 3;
        else if ("button" in e.originEvent)  // IE, Opera
            isRightMB = e.originEvent.button == 2;

        if(isRightMB){

            e.stopPropagationImmediately();

        }
    })
} );

