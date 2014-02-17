KM.registerUI( 'hand',
    function ( name ) {
        var me = this;
        var $btn = $.kmuibutton( {
            icon: name,
            click: function ( e ) {
                var drag = me._onDragMode = !me._onDragMode;
                me._paper.setStyle( 'cursor', drag ? 'pointer' : 'default' );
                me._paper.setStyle( 'cursor', drag ? '-webkit-grab' : 'default' );
                $btn.kmui().active( drag );
                if ( drag ) {
                    me._paper.drag();
                } else {
                    me._paper.undrag();
                }
            },
            title: this.getLang( 'tooltips.' )[ name ] || ''
        } );
        me.on( 'beforemousemove', function ( e ) {
            if ( this._onDragMode ) {
                e.stopPropagation();
            }
        } );
        kity.extendClass( kity.Paper, kity.Draggable );
        return $btn;
    }
);