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
        var node = e.getTargetNode();
        if(node){
            this.removeAllSelectedNodes();
            this.select(node)
        }


        var items = me.getContextmenu();
        var data = [];

        utils.each(items,function(i,item){
            if(item.divider){
                data.length &&  data.push(item);
                return;
            }
            if(me.queryCommandState(item.cmdName)!=-1){
                data.push({
                    label:item.label,
                    value:item.cmdName
                })
            }
        });
        if(data.length){
            var item = data[data.length-1];
            if(item.divider){
                data.pop();
            }
            $menu.kmui().setData({
                data:data
            }).position(e.getPosition()).show();
        }
        e.preventDefault()

    });
    me.on('click',function(){
        $menu.kmui().hide();
    });
    me.on('beforemousedown',function(e){
        if(e.isRightMB()){
            e.stopPropagationImmediately();
        }
    })
} );

