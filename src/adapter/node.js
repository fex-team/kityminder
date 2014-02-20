KM.registerToolbarUI( 'node', function ( name ) {
    var  shortcutKeys =  {
        "appendsiblingnode": "enter",
        "appendchildnode": "tab",
        "removenode":"del|backspace"
    };

    var me = this,
        msg = me.getLang('node'),
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: me.getOptions( name ) || [],
            itemStyles: [],
            value: [],
            autowidthitem: []
        },
        $combox = null;

    if ( options.items.length == 0 ) {
        return null;
    }

    //实例化
    $combox = $.kmuibuttoncombobox( transForInserttopic( options ) ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        me.execCommand( res.value );
    }).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
    });

    return comboboxWidget.button().addClass( 'kmui-combobox' );



    function transForInserttopic( options ) {

        var tempItems = [];

        utils.each( options.items, function ( k, v ) {
            options.value.push( v );

            tempItems.push( (msg[k]||k)  + '(' + shortcutKeys[v].toUpperCase() + ')');
            options.autowidthitem.push( $.wordCountAdaptive( tempItems[ tempItems.length - 1 ] ) );
        } );

        options.items = tempItems;

        return options;

    }

});

