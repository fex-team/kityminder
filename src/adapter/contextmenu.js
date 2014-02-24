KM.registerUI( 'contextmenu', function () {
    var me = this;

    function getItemByLabel(label){
        var result;
        utils.each(me.getContextmenu(),function(i,item){
            if(item.label == label){
                result = item;
                return false;
            }
        });
        return result;
    }
    var $menu = $.kmuidropmenu({
        click:function(e,v,l){

            var item = getItemByLabel(l);

            if(item.exec){

                item.exec.apply(km)
            }else{
                me.execCommand(item.cmdName);
            }

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

            $menu.kmui().setData({
                data:data
            }).position(e.getPosition()).show();


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

