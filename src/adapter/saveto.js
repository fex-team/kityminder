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
            autowidthitem: [],
            enabledRecord: false
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
        if ( res.value === "png" ) {
            var svghtml = $( "#kityminder .kmui-editor-body" ).html();
            var bgImg = $( "#kityminder .kmui-editor-body" ).css( "backgroundImage" ).replace( /"/g, "" ).replace( /url\(|\)$/ig, "" );
            var renderBox = me.getRenderContainer().getRenderBox( "top" );
            var renderContainer = me.getRenderContainer();
            var transform = renderContainer.getTransform();
            renderContainer.clearTransform();
            var loop = 0;
            var svg = $( svghtml ).attr( {
                width: renderBox.width,
                height: renderBox.height,
                viewBox: null
            } );
            var div = $( "<div></div>" ).append( svg );
            svghtml = div.html();
            var canvas = $( '<canvas width="' + ( parseInt( renderBox.width ) + 40 ) + '" height="' + ( parseInt( renderBox.height ) + 40 ) + '"></canvas>' );
            var ctx = canvas[ 0 ].getContext( "2d" );
            var DOMURL = self.URL || self.webkitURL || self;
            var img = new Image();
            var svg = new Blob( [ svghtml ], {
                type: "image/svg+xml;charset=utf-8"
            } );
            var url = DOMURL.createObjectURL( svg );
            img.onload = function () {
                var bgTexture = document.createElement( 'img' );
                bgTexture.src = bgImg;
                bgTexture.onload = function () {
                    var bgfill = ctx.createPattern( bgTexture, "repeat" );
                    ctx.fillStyle = bgfill;
                    ctx.fillRect( 0, 0, renderBox.width + 40, renderBox.height + 40 );
                    ctx.drawImage( img, -renderBox.x + 20, -renderBox.y + 20 );
                    DOMURL.revokeObjectURL( url );
                    var type = 'png';
                    var imgData = canvas[ 0 ].toDataURL( type );
                    var _fixType = function ( type ) {
                        type = type.toLowerCase().replace( /jpg/i, 'jpeg' );
                        var r = type.match( /png|jpeg|bmp|gif/ )[ 0 ];
                        return 'image/' + r;
                    };
                    imgData = imgData.replace( _fixType( type ), 'image/octet-stream' );
                    var saveFile = function ( data, filename ) {
                        var save_link = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'a' );
                        save_link.href = data;
                        save_link.download = filename;
                        var event = document.createEvent( 'MouseEvents' );
                        event.initMouseEvent( 'click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
                        save_link.dispatchEvent( event );
                    };

                    // 下载后的文件名
                    var filename = 'kityminder_' + ( new Date() ).getTime() + '.' + type;
                    // download
                    saveFile( imgData, filename );
                    renderContainer.setTransform( transform );
                };
            };
            img.src = url;
            return "png";
        } else if ( res.value === "svg" ) {
            var svghtml = $( "#kityminder .kmui-editor-body" ).html();
            var saveFile = function ( data, filename ) {
                var save_link = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'a' );
                save_link.href = 'data:image/svg+xml; utf-8,' + encodeURI( svghtml );
                save_link.download = filename;
                var event = document.createEvent( 'MouseEvents' );
                event.initMouseEvent( 'click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
                save_link.dispatchEvent( event );
            };
            var filename = 'kityminder_' + ( new Date() ).getTime() + '.svg';
            saveFile( svg, filename );
            return "svg";
        }
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