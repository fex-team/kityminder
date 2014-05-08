KM.registerToolbarUI( 'zoom', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getOptions( name ) || [],
            itemStyles: [],
            value: me.getOptions( name ),
            autowidthitem: [],
            enabledRecord: false

        },
        $combox = null;
    if ( options.items.length == 0 ) {
        return null;
    }

    //实例化
    $combox = $.kmuibuttoncombobox( transForInserttopic( options ) ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    var comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand('zoom', res.value );
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
            comboboxWidget.selectItemByLabel( value + '%' );
        }

    } );
    //comboboxWidget.button().kmui().disabled(-1);
    return comboboxWidget.button().addClass( 'kmui-combobox' );



    function transForInserttopic( options ) {

        var tempItems = [];

        utils.each( options.items, function ( k, v ) {
            options.value.push( v );
            tempItems.push( v + '%' );
            options.autowidthitem.push( $.wordCountAdaptive( tempItems[ tempItems.length - 1 ] ) );
        } );

        options.items = tempItems;
        return options;

    }

} );