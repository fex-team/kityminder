KM.registerToolbarUI( 'layout', function ( name ) {
    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getLayoutStyleItems() || [],
            itemStyles: [],
            value: me.getLayoutStyleItems(),
            autowidthitem: []
        },
        $combox = null;
    if ( options.items.length == 0 ) {
        return null;
    }

    //实例化
    $combox = $.kmuibuttoncombobox( options ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand( "switchlayout", res.value );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
    } );
    me.on( 'interactchange', function () {
        var value = this.queryCommandValue( "switchlayout" );
        if ( value ) {
            //设置label
            comboboxWidget.selectItemByLabel( value );
        }
    } );


    return comboboxWidget.button().addClass( 'kmui-combobox' );
} );