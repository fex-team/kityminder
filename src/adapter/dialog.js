KM.registerUI('markers',function(name){

    var me = this, currentRange, $dialog,
        opt = {
            title: this.getLang('tooltips')[name] || '',
            url: me.getOptions('KITYMINDER_HOME_URL') + 'dialogs/' + name + '/' + name + '.js'
        };

    var $btn = $.kmuibutton({
        icon: name,
        title:  this.getLang('tooltips')[name] || ''
    });
    //加载模版数据
    utils.loadFile(document,{
        src: opt.url,
        tag: "script",
        type: "text/javascript",
        defer: "defer"
    },function(){
        //调整数据
        var data = KM.getWidgetData(name);
        if(data.buttons){
            var ok = data.buttons.ok;
            if(ok){
                opt.oklabel = ok.label || me.getLang('ok');
                if(ok.exec){
                    opt.okFn = function(){
                        return $.proxy(ok.exec,null,me,$dialog)()
                    }
                }
            }
            var cancel = data.buttons.cancel;
            if(cancel){
                opt.cancellabel = cancel.label || me.getLang('cancel');
                if(cancel.exec){
                    opt.cancelFn = function(){
                        return $.proxy(cancel.exec,null,me,$dialog)()
                    }
                }
            }
        }
        data.width && (opt.width = data.width);
        data.height && (opt.height = data.height);

        $dialog = $.kmuimodal(opt);

        $dialog.attr('id', 'kmui-dialog-' + name).addClass('kmui-dialog-' + name)
            .find('.kmui-modal-body').addClass('kmui-dialog-' + name + '-body');

        $dialog.kmui().on('beforeshow', function () {
                var $root = this.root(),
                    win = null,
                    offset = null;

                if (!$root.parent()[0]) {
                    me.$container.find('.kmui-dialog-container').append($root);
                }
                KM.setWidgetBody(name,$dialog,me);

        }).on('afterbackdrop',function(){
            this.$backdrop.css('zIndex',me.getOptions('zIndex')+1).appendTo(me.$container.find('.kmui-dialog-container'))
            $dialog.css('zIndex',me.getOptions('zIndex')+2)
        }).attachTo($btn)
    });




    me.on('interactchange', function () {
        var state = this.queryCommandState(name);
        $btn.kmui().disabled(state == -1).active(state == 1)
    });
    return $btn;
});