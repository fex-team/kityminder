KM.registerToolbarUI( 'bold italic redo undo unhyperlink removeimage expandnode collapsenode hand zoom-in zoom-out',
    function ( name ) {
        var me = this;
        var $btn = $.kmuibutton( {
            icon: name,
            click: function () {
                me.execCommand( name );
            },
            title: this.getLang( 'tooltips' )[ name ] || ''
        } );
        this.on( 'interactchange', function () {
            var state = this.queryCommandState( name );
            $btn.kmui().disabled( state == -1 ).active( state == 1 );
        } );
        return $btn;
    }
);