KM.registerToolbarUI( 'switchlayout', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getLayoutStyleItems() || [],
            itemStyles: [],
            value: me.getLayoutStyleItems(),
            autowidthitem: [],
            enabledRecord:false
        },
        $combox = null;
    if ( options.items.length == 0 ) {
        return null;
    }

    //实例化
    $combox = $.kmuibuttoncombobox( options ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand( name, res.value );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }

    } );
    //状态反射
    me.on( 'interactchange', function () {
        var state = this.queryCommandState( name ),
            value = this.queryCommandValue( name );
        //设置按钮状态
        comboboxWidget.button().kmui().disabled( state == -1 ).active( state == 1 );

        if ( value ) {
            //设置label
            value = value.replace( /['"]/g, '' ).toLowerCase().split( /['|"]?\s*,\s*[\1]?/ );
            comboboxWidget.selectItemByLabel( value );
        }
    } );
    return comboboxWidget.button().addClass( 'kmui-combobox' );
} );