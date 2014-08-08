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

                item.exec.apply(me);
            }else{
                me.execCommand(item.cmdName);
            }

            this.hide();
        }
    });
    me.$container.append($menu);
    me.on('contextmenu', function(e) {
        e.preventDefault();
    });
    me.on('mouseup', function (e) {
        //e.preventDefault();
        
        if (me.getStatus() == 'hand' || !e.isRightMB()) return;

        var node = e.getTargetNode();
        if(node){
            this.removeAllSelectedNodes();
            this.select(node);
        }


        var items = me.getContextmenu();
        var data = [];

        utils.each(items,function(i,item){
            if(item.divider){
                data.length &&  data.push(item);
                return;
            }
            if(item.query){
                if(item.query.apply(me) != -1)
                    data.push({
                        label:item.label,
                        value:item.cmdName
                    });
                return;
            }
            if(me.queryCommandState(item.cmdName)!=-1){
                data.push({
                    label:item.label,
                    value:item.cmdName
                });
            }
        });
        if(data.length){
            var item = data[data.length-1];
            if(item.divider){
                data.pop();
            }
            var pos = e.getPosition('screen');
            var offset = $(me.getPaper().container).offset();
            pos.y -= offset.top;
            pos.x -= offset.left;
            $menu.kmui().setData({
                data:data
            }).position(pos).show();
        }

    });
    me.on('afterclick',function(){
        $menu.kmui().hide();
    });
    me.on('beforemousedown',function(e){
        if(e.isRightMB()){
            //e.stopPropagationImmediately();
        }
    });
} );

