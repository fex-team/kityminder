utils.extend( KityMinder, function () {
    var _kityminderUI = {},
        _kityminderToolbarUI = {},
        _activeWidget = null,
        _widgetData = {},
        _widgetCallBack = {};
    return {
        registerUI: function ( uiname, fn ) {
            utils.each( uiname.split( /\s+/ ), function ( i, name ) {
                _kityminderUI[ name ] = fn;
            } )
        },
        registerToolbarUI: function ( uiname, fn ) {
            utils.each( uiname.split( /\s+/ ), function ( i, name ) {
                _kityminderToolbarUI[ name ] = fn;
            } )
        },
        loadUI: function ( km ) {
            utils.each( _kityminderUI, function ( i, fn ) {
                fn.call( km )
            } )
        },
        _createUI: function ( id ) {
            var $cont = $( '<div class="kmui-container"></div>' ),
                $toolbar = $.kmuitoolbar(),
                $kmbody = $( '<div class="kmui-editor-body"></div>' ),
                $statusbar = $( '<div class="kmui-statusbar"></div>' );

            $cont.append( $toolbar ).append( $kmbody ).append( $statusbar );
            $( utils.isString( id ) ? '#' + id : id ).append( $cont );

            return {
                '$container': $cont,
                '$toolbar': $toolbar,
                '$body': $kmbody,
                '$statusbar': $statusbar
            };
        },
        _createToolbar: function ( $toolbar, km ) {
            var toolbars = km.getOptions( 'toolbars' );
            if ( toolbars && toolbars.length ) {
                var btns = [];
                $.each( toolbars, function ( i, uiNames ) {
                    $.each( uiNames.split( /\s+/ ), function ( index, name ) {
                        if ( name == '|' ) {
                            $.kmuiseparator && btns.push( $.kmuiseparator() );
                        } else {
                            if ( _kityminderToolbarUI[ name ] ) {
                                var ui = _kityminderToolbarUI[ name ].call( km, name );
                                ui && btns.push( ui );
                            }

                        }

                    } );
                    btns.length && $toolbar.kmui().appendToBtnmenu( btns );
                } );
                $toolbar.append( $( '<div class="kmui-dialog-container"></div>' ) );
            }else{
                $toolbar.hide()
            }

        },
        _createStatusbar: function ( $statusbar, km ) {

        },
        getKityMinder: function ( id, options ) {
            var containers = this._createUI( id );
            var km = this.getMinder( containers.$body.get( 0 ), options );
            this._createToolbar( containers.$toolbar, km );
            this._createStatusbar( containers.$statusbar, km );
            km.$container = containers.$container;

            this.loadUI( km );
            return km.fire( 'interactchange' );
        },
        registerWidget: function ( name, pro, cb ) {
            _widgetData[ name ] = $.extend2( pro, {
                $root: '',
                _preventDefault: false,
                root: function ( $el ) {
                    return this.$root || ( this.$root = $el );
                },
                preventDefault: function () {
                    this._preventDefault = true;
                },
                clear: false
            } );
            if ( cb ) {
                _widgetCallBack[ name ] = cb;
            }
        },
        getWidgetData: function ( name ) {
            return _widgetData[ name ]
        },
        setWidgetBody: function ( name, $widget, km ) {
            if ( !km._widgetData ) {

                utils.extend( km, {
                    _widgetData: {},
                    getWidgetData: function ( name ) {
                        return this._widgetData[ name ];
                    },
                    getWidgetCallback: function ( widgetName ) {
                        var me = this;
                        return function () {
                            return _widgetCallBack[ widgetName ].apply( me, [ me, $widget ].concat( utils.argsToArray( arguments, 0 ) ) )
                        }
                    }
                } )

            }
            var pro = _widgetData[ name ];
            if ( !pro ) {
                return null;
            }
            pro = km._widgetData[ name ];
            if ( !pro ) {
                pro = _widgetData[ name ];
                pro = km._widgetData[ name ] = $.type( pro ) == 'function' ? pro : utils.clone( pro );
            }

            pro.root( $widget.kmui().getBodyContainer() );

            //清除光标
            km.fire('selectionclear');
            pro.initContent( km, $widget );
            //在dialog上阻止键盘冒泡，导致跟编辑输入冲突的问题
            $widget.on('keydown keyup keypress',function(e){
                e.stopPropagation()
            });
            if ( !pro._preventDefault ) {
                pro.initEvent( km, $widget );
            }

            pro.width && $widget.width( pro.width );
        },
        setActiveWidget: function ( $widget ) {
            _activeWidget = $widget;
        }
    }
}() );