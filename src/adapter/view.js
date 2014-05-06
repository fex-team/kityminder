KM.registerToolbarUI( 'hand zoom-in zoom-out expand contract',
    function ( name ) {
        var me = this;
        var $btn = $.kmuibutton( {
            icon: name,
            click: function () {
                console.log( name );
                me.execCommand( name );
            },
            title: this.getLang( 'tooltips.' )[ name ] || ''
        } );
        me.on( 'interactchange', function () {
            var state = me.queryCommandState( name );
            $btn.kmui().disabled( state == -1 ).active( state == 1 );
        } );
        return $btn;
    }
);