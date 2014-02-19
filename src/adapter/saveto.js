KM.registerToolbarUI( 'saveto', function ( name ) {

    var me = this,
        label = me.getLang( 'tooltips.' + name ),
        options = {
            label: label,
            title: label,
            comboboxName: name,
            items: [],
            itemStyles: [],
            value: [],
            autowidthitem: []
        },
        $combox = null,
        comboboxWidget = null;

    var downloadLink = document.createElement( 'a' );

    utils.each( KityMinder.getAllRegisteredProtocals(), function ( k ) {
        var p = KityMinder.findProtocal( k );
        var text = p.fileDescription + '（' + p.fileExtension + '）';
        options.value.push( k );
        options.items.push( text );
        options.autowidthitem.push( $.wordCountAdaptive( text ), true );
    } );


    //实例化
    $combox = $.kmuibuttoncombobox( options ).css( 'zIndex', me.getOptions( 'zIndex' ) + 1 );
    comboboxWidget = $combox.kmui();

    comboboxWidget.on( 'comboboxselect', function ( evt, res ) {
        var data = me.exportData( res.value );
        var p = KityMinder.findProtocal( res.value );
        var a = downloadLink;
        a.setAttribute( 'download', 'MyMind' + p.fileExtension );
        a.setAttribute( 'href', 'data:text/plain; utf-8,' + encodeURI( data ) );
        a.dispatchEvent( new MouseEvent( 'click' ) );
    } ).on( "beforeshow", function () {
        if ( $combox.parent().length === 0 ) {
            $combox.appendTo( me.$container.find( '.kmui-dialog-container' ) );
        }
    } ).on( 'aftercomboboxselect', function () {
        this.setLabelWithDefaultValue();
    } );



    return comboboxWidget.button().addClass( 'kmui-combobox' );

} );