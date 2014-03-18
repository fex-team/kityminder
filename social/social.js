$.extend( $.fn, {
    disabled: function ( value ) {
        if ( value === undefined ) return !!this.attr( 'disabled' );
        if ( value ) {
            this.attr( 'disabled', 'disabled' );
        } else {
            this.removeAttr( 'disabled' );
        }
        return this;
    },
    loading: function ( text ) {
        if ( text ) {
            this.disabled( true );
            this.attr( 'origin-text', this.text() );
            this.text( text );
        } else {
            this.text( this.attr( 'origin-text' ) );
            this.removeAttr( 'origin-text' );
            this.disabled( false );
        }
        return this;
    },
    text: ( function () {
        var originFn = $.fn.text;
        return function () {
            var textSpan = this.children( 'span.text' );
            if ( textSpan.length ) {
                return originFn.apply( textSpan, arguments );
            } else {
                return originFn.apply( this, arguments );
            }
        };
    } )()
} );

$( function () {
    var $panel = $( '<div id="social"></div>' ).appendTo( 'body' );
    var $login_btn, $save_btn, $share_btn, $user_btn, $user_menu;

    var baseUrl = ( function () {
        var scripts = document.getElementsByTagName( 'script' );
        for ( var i = 0; i < scripts.length; i++ ) {
            var index = scripts[ i ].src.indexOf( 'social.js' );
            if ( ~index ) {
                return scripts[ i ].src.substr( 0, index );
            }
        }
    } )();

    $login_btn = $( '<button>登录</button>' ).addClass( 'login' ).click( login ).appendTo( $panel );

    $user_btn = $( '<button><span class="text"></span></button>' ).addClass( 'user-file' );

    $user_menu = $.kmuidropmenu( {
        data: [ {
            label: '新建脑图',
            click: newFile
        }, {
            label: '到网盘管理文件...',
            click: function () {
                window.open( 'http://pan.baidu.com/disk/home#dir/path=/apps/kityminder' );
            }
        }, {
            divider: true
        } ]
    } ).addClass( 'user-file-menu' ).appendTo( 'body' ).kmui();

    $user_menu.attachTo( $user_btn );

    $save_btn = $( '<button>保存</button>' ).click( saveThisFile )
        .addClass( 'baidu-cloud' ).appendTo( $panel ).disabled( true );

    $share_btn = $( '<button>分享</button>' ).click( shareThisFile )
        .addClass( 'share' ).appendTo( $panel ).disabled( true );


    var AK, thisMapFilename, currentUser, share_id = uuid(),
        isShareLink, isFileSaved = true,
        draft = {};

    AK = 'wiE55BGOG8BkGnpPs6UNtPbb';

    baidu.frontia.init( AK );
    baidu.frontia.social.setLoginCallback( {
        success: setCurrentUser,
        error: function ( error ) {
            console.log( error );
        }
    } );

    function login() {
        var options = {
            response_type: 'token',
            media_type: 'baidu',
            redirect_uri: window.location.href,
            client_type: 'web'
        };
        baidu.frontia.social.login( options );
    }

    function setCurrentUser( user ) {
        currentUser = user;
        $user_btn.text( user.getName() + ' 的脑图' );
        $user_btn.prependTo( $panel );
        $save_btn.disabled( false );
        $share_btn.disabled( false );
        $login_btn.detach();
        loadRecent();
        loadAvator();
        window.location.hash = '';
    }

    function loadAvator() {
        currentUser.getDetailInfo( {
            success: function ( user ) {
                var $img = $( '<img />' ).attr( {
                    'src': user.extra.tinyurl,
                    'width': 16,
                    'height': 16
                } );
                $img.prependTo( $user_btn );
            }
        } );
    }

    function loadRecent() {
        var sto = baidu.frontia.personalStorage;
        $user_btn.loading( '加载最近脑图...' );
        sto.listFile( 'apps/kityminder/', {
            by: 'time',
            success: function ( result ) {
                if ( result.list.length ) {
                    if ( !isShareLink && !thisMapFilename ) {
                        loadPersonal( result.list[ 0 ].path );
                    } else {
                        $user_btn.loading( false );
                    }
                    addToRecentMenu( result.list );
                }
            }
        } );
    }

    function addToRecentMenu( list ) {
        list.splice( 8 );
        list.forEach( function ( file ) {
            $user_menu.appendItem( {
                item: {
                    label: getFileName( file.path ),
                    value: file.path
                },
                click: openFile
            } );
        } );
    }

    function getFileName( path ) {
        var filename = path.substr( path.lastIndexOf( '/' ) + 1 );
        return filename.substr( 0, filename.lastIndexOf( '.' ) );
    }

    function openFile( e ) {
        var path = $( this ).data( 'value' );
        loadPersonal( path );
    }

    function loadPersonal( path ) {
        var sto = baidu.frontia.personalStorage;
        thisMapFilename = path;
        if ( thisMapFilename == draft.filename ) {
            $user_btn.loading( false ).text( getFileName( path ) );
            setFileSaved( false );
        } else {
            $user_btn.loading( '加载“' + getFileName( path ) + '”...' );
            sto.getFileUrl( path, {
                success: function ( url ) {
                    $.ajax( {
                        cache: false,
                        url: url,
                        dataType: 'text',
                        success: function ( result ) {
                            window.km.importData( result, 'json' );
                            $user_btn.loading( false ).text( getFileName( path ) );
                            isFileSaved = true;
                        }
                    } );
                }
            } );
        }
    }

    function getMapFileName() {
        return '/apps/kityminder/' + window.km.getMinderTitle() + '.km';
    }

    function newFile() {
        thisMapFilename = null;
        window.km.importData( '新建脑图', 'plain' );
        window.km.execCommand( 'camera', window.km.getRoot() );
        $user_btn.text( '<新建脑图>' );
    }

    function saveThisFile() {
        var data = window.km.exportData( 'json' );
        save( data, thisMapFilename || getMapFileName(), function ( success, info ) {
            if ( success ) {
                $save_btn.text( '已保存！' );
                if ( !thisMapFilename ) {
                    thisMapFilename = info.path;
                    addToRecentMenu( [ info ] );
                    $user_btn.text( getFileName( thisMapFilename ) );
                }
            }
            console.log( info );
        } );
        $save_btn.loading( '正在保存...' );
    }

    function save( file, filename, callback ) {
        var sto = baidu.frontia.personalStorage;
        var options = {
            ondup: thisMapFilename ? sto.constant.ONDUP_OVERWRITE : sto.constant.ONDUP_NEWCOPY,
            success: function ( result ) {
                setFileSaved( true );
                callback( true, result );
            },
            error: function ( error ) {
                callback( false, error );
            }
        };
        sto.uploadTextFile( file, filename, options );
    }

    function uuid() {
        return ( ( +new Date() * 10000 ) + ( Math.random() * 9999 ) ).toString( 36 );
    }

    function shareThisFile() {
        if ( $share_btn.disabled() ) {
            return;
        }

        var data = window.km.exportData( 'json' );
        $share_btn.loading( '正在分享...' );

        var currentUrl = window.location.origin + window.location.pathname;
        var shareUrl = currentUrl + '?share_id=' + share_id;
        share( data, share_id, function ( success ) {
            if ( success ) {
                var $popup = $( '<div></div>' ).addClass( 'popup' ).appendTo( 'body' );
                $popup.css( {
                    'position': 'absolute',
                    'right': 10,
                    'top': $share_btn.offset().top + $share_btn.height() + 10,
                    'width': 250,
                    'padding': 10,
                    'background': 'white',
                    'border-radius': '5px',
                    'box-shadow': '1px 2px 4px rgba(0, 0, 0, .3)'
                } );
                $popup.append( '<p style="margin: 5px 0; font-size: 12px;">分享成功，请复制URL：</p>' );

                var $input = $( '<input type="text" style="width: 250px;" value="' + shareUrl + '"></input>' ).appendTo( $popup );
                $input[ 0 ].select();

                $popup.mousedown( function ( e ) {
                    e.stopPropagation();
                } );
                $( 'body' ).on( 'mousedown', function ( e ) {
                    $popup.fadeOut( 'fast', function () {
                        $popup.remove();
                    } );
                    $share_btn.loading( false );
                    $( 'body' ).off( 'mousedown', arguments.callee );
                } );
            }
        } );
    }

    function share( text, shareId, callback ) {
        var data = new baidu.frontia.Data( {
            shareMinder: {
                id: shareId,
                data: text
            }
        } );
        var handles = {
            success: function ( result ) {
                callback( true );
            },
            error: function ( e ) {
                callback( false );
            }
        };
        baidu.frontia.storage.insertData( data, handles );
    }

    function loadShare() {
        var pattern = /share_id=(\w+)([&#]|$)/;
        var match = pattern.exec( window.location ) || pattern.exec( document.referrer );
        if ( !match ) return;
        var shareId = match[ 1 ];
        var query = new baidu.frontia.storage.Query();
        query.on( 'shareMinder.id' ).equal( shareId );

        $share_btn.loading( '正在加载分享内容...' );
        baidu.frontia.storage.findData( query, {
            success: function ( ret ) {
                window.km.importData( ret.result[ 0 ].obj.shareMinder.data, 'json' );
                $share_btn.loading( false );
            },
            error: function ( e ) {
                console.log( e );
            }
        } );
        isShareLink = true;
    }

    function loadPath() {
        var pattern = /path=(.+?)([&#]|$)/;
        var match = pattern.exec( window.location ) || pattern.exec( document.referrer );
        if ( !match ) return;
        thisMapFilename = decodeURIComponent( match[ 1 ] );
    }

    function setFileSaved( saved ) {
        $save_btn.disabled( saved || !currentUser );
        if ( saved ) {
            $user_btn.text( getFileName( thisMapFilename ) );
        } else {
            $save_btn.text( '保存' );
            $user_btn.text( getFileName( thisMapFilename || getMapFileName() ) + ' *' );
        }
    }

    function checkAutoSave() {
        var sto = window.localStorage;
        if ( !sto ) return;
        draft = {
            filename: thisMapFilename,
            data: window.km.exportData( 'json' )
        };
        sto.setItem( 'draft_filename', draft.filename );
        sto.setItem( 'draft_data', draft.data );
        setFileSaved( false );
    }

    function loadAutoSave() {
        var sto = window.localStorage;

        if ( !sto ) return;

        draft.data = sto.getItem( 'draft_data' );
        draft.filename = sto.getItem( 'draft_filename' );
        if ( draft.data ) {
            window.km.importData( draft.data, 'json' );
            setFileSaved( false );
        }
    }

    loadAutoSave();

    loadShare();

    currentUser = baidu.frontia.getCurrentAccount();
    if ( currentUser ) {
        setCurrentUser( currentUser );
        loadPath();
        if ( thisMapFilename ) {
            loadPersonal( thisMapFilename );
        }
    } else {
        loadAutoSave();
    }

    window.km.on( 'contentchange', function () {
        checkAutoSave();
    } );
} );