KM.registerToolbarUI( 'image', function ( name ) {

    var me = this,
        currentRange, $dialog,
        opt = {
            title: this.getLang( 'tooltips' )[ name ] || '',
            url: me.getOptions( 'KITYMINDER_HOME_URL' ) + 'dialogs/' + name + '/' + name + '.js'

        };

    var $btn = $.kmuibutton( {
        icon: name,
        title: this.getLang( 'tooltips' )[ name ] || ''
    } );

    //加载模版数据
    utils.loadFile( document, {
        src: opt.url,
        tag: "script",
        type: "text/javascript",
        defer: "defer"
    }, function () {

        $dialog = $.kmuimodal( opt );

        $dialog.attr( 'id', 'kmui-dialog-' + name ).addClass( 'kmui-dialog-' + name )
            .find( '.kmui-modal-body' ).addClass( 'kmui-dialog-' + name + '-body' );

        $dialog.kmui().on( 'beforeshow', function () {
            var $root = this.root(),
                win = null,
                offset = null;
            if ( !$root.parent()[ 0 ] ) {
                me.$container.find( '.kmui-dialog-container' ).append( $root );
            }
            KM.setWidgetBody( name, $dialog, me );
        } ).attachTo( $btn );


    } );

    me.addContextmenu( [ {
            label: me.getLang( 'image.image' ),
            exec: function (url) {
                $dialog.kmui().show();
            },
            cmdName: 'image'
        },{
            label: me.getLang( 'image.removeimage' ),
            exec: function () {
                this.execCommand( 'removeimage' );
            },
            cmdName: 'removeimage'
        }
    ]);

    me.on( 'interactchange', function () {
        var state = this.queryCommandState( name );
        $btn.kmui().disabled( state == -1 ).active( state == 1 );
    } );
    return $btn;
} );