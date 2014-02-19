KM.registerUI( 'tooltips',
    function ( name ) {
        var km = this;
        //添加tooltip;
        if($.kmuitooltip){

            $("[data-original-title]",km.$container).each(function(i,n){
                var tooltips = km.getLang('tooltips');
                var tooltip = $(n).data('original-title');
                utils.each(tooltips,function(v,k){

                    if(k == tooltip && km.getShortcutKey(v)){
                        $(n).attr('data-original-title',tooltip + ' (' + km.getShortcutKey(v).toUpperCase() + ')');

                    }
                })
            });
            $.kmuitooltip('attachTo', $("[data-original-title]",km.$container)).css('z-index',km.getOptions('zIndex')+1);
        }
        km.$container.find('a').click(function(evt){
            evt.preventDefault()
        });
    }
);