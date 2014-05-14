//接收者
Minder.Receiver = kity.createClass( 'Receiver', {
    clear: function () {
        this.container.innerHTML = '';
        this.selection && this.selection.setHide();
        this.range && this.range.nativeSel.removeAllRanges();
        this.index = 0;
        this.inputLength = 0;
        return this;
    },
    setTextEditStatus: function ( status ) {
        this.textEditStatus = status || false;
        return this;
    },
    isTextEditStatus: function () {
        return this.textEditStatus;
    },
    constructor: function ( km ) {
        var me = this;
        this.setKityMinder( km );
        this.textEditStatus = false;
        var _div = document.createElement( 'div' );
        _div.setAttribute( 'contenteditable', true );
        _div.className = 'km_receiver';
        this.container = document.body.insertBefore( _div, document.body.firstChild );
        if ( browser.ie && browser.version == 11 ) {
            utils.listen( this.container, 'keydown keypress keyup', function ( e ) {
                me.keyboardEvents.call( me, new MinderEvent( e.type == 'keyup' ? "beforekeyup" : e.type, e ) )
            } )
        }
        utils.addCssRule( 'km_receiver_css', ' .km_receiver{white-space:nowrap;position:absolute;padding:0;margin:0;word-wrap:break-word;clip:rect(1em 1em 1em 1em);}' ); //
        this.km.on( 'textedit.beforekeyup textedit.keydown textedit.keypress textedit.paste', utils.proxy( this.keyboardEvents, this ) );
        this.timer = null;
        this.index = 0;
    },
    setRange: function ( range, index ) {

        this.index = index || this.index;

        var text = this.container.firstChild;
        this.range = range;
        range.setStart( text || this.container, this.index ).collapse( true );
        var me = this;
        setTimeout( function () {
            me.container.focus();
            range.select()
        } );
        return this;
    },
    setTextShape: function ( textShape ) {
        if ( !textShape ) {
            textShape = new kity.Text();
        }
        this.textShape = textShape;
        this.container.innerHTML = utils.unhtml( textShape.getContent() );
        return this;
    },
    setTextShapeSize: function ( size ) {
        this.textShape.setSize( size );
        return this;
    },
    getTextShapeHeight: function () {
        return this.textShape.getRenderBox().height;
    },
    appendTextShapeToPaper: function ( paper ) {
        paper.addShape( this.textShape );
        return this;
    },
    setKityMinder: function ( km ) {
        this.km = km;
        return this;
    },
    setMinderNode: function ( node ) {
        this.minderNode = node;
        return this;
    },
    keyboardEvents: function ( e ) {

        clearTimeout( this.timer );
        var me = this;
        var orgEvt = e.originEvent;
        var keyCode = orgEvt.keyCode;
        var keys = KityMinder.keymap;

        function setTextToContainer() {
            if(!me.range.hasNativeRange()){
                return;
            }
            var text = me.container.textContent.replace( /[\u200b\t\r\n]/g, '' );

            if ( me.textShape.getOpacity() == 0 ) {
                me.textShape.setOpacity( 1 );
            }
            //#46 修复在ff下定位到文字后方空格光标不移动问题
            if ( browser.gecko && /\s$/.test( text ) ) {
                text += "\u200b";
            }

            me.setContainerStyle();
            me.minderNode.setText( text );
            if ( text.length == 0 ) {
                me.minderNode.setText( 'a' );
            }
            me.km.updateLayout( me.minderNode );


            me.textShape = me.minderNode.getTextShape();
            if ( text.length == 0 ) {
                me.textShape.setOpacity( 0 );
            }
            me.setBaseOffset();
            me.updateTextData();

            me.updateIndex();


            if( me.selection.getSelectionShowStatus()) {
                me.updateSelection();
                me.timer = setTimeout(function () {
                    me.selection.setShow()
                }, 500)
            }

        }
        var isTypeText = false;
        var isKeypress = false;
        switch ( e.type ) {

        case 'keydown':

            isTypeText = false;
            isKeypress = false;
            switch ( e.originEvent.keyCode ) {
                case keys.Enter:
                case keys.Tab:
                    this.selection.setHide();
                    this.clear().setTextEditStatus( false );
                    this.km.fire( 'contentchange' );
                    this.km.setStatus( 'normal' );
                    e.preventDefault();
                    return;
                    break;

            }

            if ( e.originEvent.ctrlKey || e.originEvent.metaKey ) {

                //粘贴
                if ( keyCode == keymap.v ) {

                    setTimeout( function () {
                        me.range.updateNativeRange().insertNode( $( '<span>$$_kityminder_bookmark_$$</span>' )[ 0 ] );
                        me.container.innerHTML = utils.unhtml( me.container.textContent.replace( /[\u200b\t\r\n]/g, '' ) );
                        var index = me.container.textContent.indexOf( '$$_kityminder_bookmark_$$' );
                        me.container.textContent = me.container.textContent.replace( '$$_kityminder_bookmark_$$', '' );
                        me.range.setStart( me.container.firstChild, index ).collapse( true ).select();
                        setTextToContainer()
                    }, 100 );
                }
                //剪切
                if ( keyCode == keymap.x ) {
                    setTimeout( function () {
                        setTextToContainer()
                    }, 100 );
                }
                return;
            }
            isTypeText = true;

            if(!orgEvt.ctrlKey && !orgEvt.metaKey && !orgEvt.shiftKey && !orgEvt.altKey){
                setTextToContainer();
            }

            break;



        case 'keypress':

            isKeypress = true;
            break;

        case 'beforekeyup':

            switch ( keyCode ) {
            case keymap.Enter:
            case keymap.Tab:
            case keymap.F2:
                if ( this.keydownNode === this.minderNode ) {
                    this.rollbackStatus();
                    this.setTextEditStatus( false );
                    this.clear();
                }
                e.preventDefault();
                return;


            }

            if ( !isKeypress && !orgEvt.ctrlKey && !orgEvt.metaKey && !orgEvt.shiftKey && !orgEvt.altKey ) {
                setTextToContainer();
            }
            return true;
        }


    },

    updateIndex: function () {
        this.index = this.range.getStart().startOffset;
        return this;
    },
    updateTextData: function () {
        this.textShape.textData = this.getTextOffsetData();
        return this;
    },
    setSelection: function ( selection ) {
        this.selection = selection;
        return this;
    },
    updateSelection: function () {
        this.selection.setShowHold();
        this.selection.bringTop();
        //更新模拟选区的范围
        this.selection.setStartOffset( this.index ).collapse( true );
        if ( this.index == this.textData.length ) {
            if ( this.index == 0 ) {
                this.selection.setPosition( this.getBaseOffset() )
            } else {
                this.selection.setPosition( {
                    x: this.textData[ this.index - 1 ].x + this.textData[ this.index - 1 ].width,
                    y: this.textData[ this.index - 1 ].y
                } )
            }


        } else {
            this.selection.setPosition( this.textData[ this.index ] )
        }
        return this;
    },
    getBaseOffset: function ( refer ) {
        var rb = this.textShape.getRenderBox( refer || this.km.getRenderContainer() );
        //        if(!this.pr) {
        //            this.km.getRenderContainer().addShape(this.pr = new kity.Rect().stroke('green'));
        //        }
        //        this.pr.setSize(rb.width, rb.height).setPosition(rb.x, rb.y);
        return rb;
    },
    setBaseOffset: function () {
        this.offset = this.textShape.getRenderBox( this.km.getRenderContainer() );
        return this;
    },
    setContainerStyle: function () {
        var textShapeBox = this.getBaseOffset( 'screen' );
        this.container.style.cssText = ";left:" + textShapeBox.x + 'px;top:' + ( textShapeBox.y - 5 ) + 'px;width:' + textShapeBox.width + 'px;height:' + textShapeBox.height + 'px;';

        if ( !this.selection.isShow() ) {
            var paperContainer = this.km.getPaper();
            var width = paperContainer.node.parentNode.clientWidth;
            var height = paperContainer.node.parentNode.clientHeight;
            if ( width < this.container.offsetWidth + this.container.offsetLeft ) {
                this.km.getRenderContainer().translate( width / -3, 0 );
                this.setContainerStyle();
            } else if ( height < this.container.offsetTop + this.container.offsetHeight ) {
                this.km.getRenderContainer().translate( 0, height / -3 );
                this.setContainerStyle()
            }
        }


        return this;
    },
    getTextOffsetData: function () {
        var text = this.textShape.getContent();
        this.textData = [];

        for ( var i = 0, l = text.length; i < l; i++ ) {
            try {
                var box = this.textShape.getExtentOfChar( i );
            } catch ( e ) {
                console.log( e )
            }

            this.textData.push( {
                x: box.x + this.offset.x,
                y: this.offset.y,
                width: box.width,
                height: box.height
            } )
        }
        return this;
    },
    setCurrentIndex: function ( offset ) {
        var me = this;
        this.getTextOffsetData();
        var hadChanged = false;
        utils.each( this.textData, function ( i, v ) {
            //点击开始之前
            if ( i == 0 && offset.x <= v.x ) {
                me.index = 0;
                return false;
            }
            if ( offset.x >= v.x && offset.x <= v.x + v.width ) {
                if ( offset.x - v.x > v.width / 2 ) {
                    me.index = i + 1;

                } else {
                    me.index = i

                }
                hadChanged = true;
                return false;
            }
            if ( i == me.textData.length - 1 && offset.x >= v.x ) {
                me.index = me.textData.length;
                return false;
            }
        } );

        return this;

    },
    setSelectionHeight: function () {
        this.selection.setHeight( this.getTextShapeHeight() );
        return this;
    },

    updateSelectionByMousePosition: function ( offset, dir ) {

        var me = this;
        utils.each( this.textData, function ( i, v ) {
            //点击开始之前
            if ( i == 0 && offset.x <= v.x ) {
                me.selection.setStartOffset( 0 );
                return false;
            }

            if ( i == me.textData.length - 1 && offset.x >= v.x ) {
                me.selection.setEndOffset( me.textData.length );
                return false;
            }
            if ( offset.x >= v.x && offset.x <= v.x + v.width ) {

                if ( me.index == i ) {
                    if ( i == 0 ) {
                        me.selection.setStartOffset( i )
                    }
                    if ( offset.x <= v.x + v.width / 2 ) {
                        me.selection.collapse()
                    } else {
                        me.selection.setEndOffset( i + ( ( me.selection.endOffset > i || dir == 1 ) && i != me.textData.length - 1 ? 1 : 0 ) )
                    }

                } else if ( i > me.index ) {
                    me.selection.setStartOffset( me.index );
                    me.selection.setEndOffset( i + 1 )
                } else {
                    if ( dir == 1 ) {
                        me.selection.setStartOffset( i + ( offset.x >= v.x + v.width / 2 && i != me.textData.length - 1 ? 1 : 0 ) );
                    } else {
                        me.selection.setStartOffset( i );
                    }

                    me.selection.setEndOffset( me.index )
                }

                return false;
            }
        } );
        return this;
    },
    updateSelectionShow: function () {
        var startOffset = this.textData[ this.selection.startOffset ],
            endOffset = this.textData[ this.selection.endOffset ],
            width = 0;
        if ( this.selection.collapsed ) {
            this.selection.updateShow( startOffset || this.textData[ this.textData.length - 1 ], 1 );
            return this;
        }
        if ( !endOffset ) {
            try {
                var lastOffset = this.textData[ this.textData.length - 1 ];
                width = lastOffset.x - startOffset.x + lastOffset.width;
            } catch ( e ) {
                console.log( e )
            }

        } else {
            width = endOffset.x - startOffset.x;
        }

        this.selection.updateShow( startOffset, width );
        return this;
    },
    updateRange: function ( range ) {
        var node = this.container.firstChild;
        range.setStart( node, this.selection.startOffset );
        range.setEnd( node, this.selection.endOffset );
        range.select();
        return this;
    },
    setIndex: function ( index ) {
        this.index = index;
        return this
    },
    setContainerTxt: function ( txt ) {
        this.container.textContent = txt;
        return this;
    }

} );