KM.registerToolbarUI('markers help preference resource', function(name) {

    var me = this,
        currentRange, $dialog,
        opt = {
            title: this.getLang('tooltips')[name] || '',
            url: me.getOptions('KITYMINDER_HOME_URL') + 'dialogs/' + name + '/' + name + '.js',
        };

    var $btn = $.kmuibutton({
        icon: name,
        title: this.getLang('tooltips')[name] || ''
    });
    //加载模版数据
    utils.loadFile(document, {
        src: opt.url,
        tag: 'script',
        type: 'text/javascript',
        defer: 'defer'
    }, function() {

        $dialog = $.kmuimodal(opt);

        $dialog.attr('id', 'kmui-dialog-' + name).addClass('kmui-dialog-' + name)
            .find('.kmui-modal-body').addClass('kmui-dialog-' + name + '-body');

        $dialog.kmui().on('beforeshow', function() {
            var $root = this.root(),
                win = null,
                offset = null;
            if (!$root.parent()[0]) {
                me.$container.find('.kmui-dialog-container').append($root);
            }
            KM.setWidgetBody(name, $dialog, me);
        }).attachTo($btn);

        if (name == 'help') {
            $dialog.kmui().on('beforeshow', function() {
                $btn.kmui().active(true);
                $('.kmui-editor-body').addClass('blur');
            }).on('beforehide', function() {
                $btn.kmui().active(false);
                $('.kmui-editor-body').removeClass('blur');
            });
        }
    });

    me.on('interactchange', function() {
        var state = this.queryCommandState(name);
        $btn.kmui().disabled(state == -1).active(state == 1);
    });

    switch (name) {
        case 'markers':
            me.addContextmenu([{
                label: me.getLang('marker.marker'),
                exec: function() {
                    $dialog.kmui().show();
                },
                cmdName: 'markers'
            }]);
            break;
        case 'resource':
            me.addContextmenu([{
                label: me.getLang('resource.resource'),
                exec: function() {
                    $dialog.kmui().show();
                },
                cmdName: 'resource'
            }]);
    }
    return $btn;
});