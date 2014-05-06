KityMinder.registerModule( "HistoryModule", function () {

    var km = this;

    var Scene = kity.createClass( 'Scene', {
        constructor: function ( root ) {
            this.data = root.clone( function ( node, cloneNode ) {
                km.fire( 'cloneNode', {
                    'targetNode': cloneNode,
                    'sourceNode': node
                } )
            } );
        },
        getData: function () {
            return this.data;
        },
        cloneData: function () {
            var fn = function ( node, cloneNode ) {
                km.fire( 'cloneNode', {
                    'targetNode': cloneNode,
                    'sourceNode': node
                } )
            };
            return this.getData().clone( fn );
        },
        equals: function ( scene ) {
            return this.getData().equals( scene.getData() )
        }
    } );
    var HistoryManager = kity.createClass( 'HistoryManager', {
        constructor: function ( km ) {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
            this.km = km;
        },
        undo: function () {
            if ( this.hasUndo ) {
                if ( !this.list[ this.index - 1 ] && this.list.length == 1 ) {
                    this.reset();
                    return;
                }
                while ( this.list[ this.index ].equals( this.list[ this.index - 1 ] ) ) {
                    this.index--;
                    if ( this.index == 0 ) {
                        return this.restore( 0 );
                    }
                }
                this.restore( --this.index );
            }
        },
        redo: function () {
            if ( this.hasRedo ) {
                while ( this.list[ this.index ].equals( this.list[ this.index + 1 ] ) ) {
                    this.index++;
                    if ( this.index == this.list.length - 1 ) {
                        return this.restore( this.index );
                    }
                }
                this.restore( ++this.index );
            }
        },
        restore: function () {
            var scene = this.list[ this.index ];

            this.km.setRoot( scene.cloneData() );
            this.km.removeAllSelectedNodes();
            this.km.initStyle();

            this.update();
            this.km.fire( 'restoreScene' );
            this.km.fire( 'contentChange' );
        },
        getScene: function () {
            return new Scene( this.km.getRoot() )
        },
        saveScene: function () {
            var currentScene = this.getScene();
            var lastScene = this.list[ this.index ];
            if ( lastScene && lastScene.equals( currentScene ) ) {
                return
            }
            this.list = this.list.slice( 0, this.index + 1 );
            this.list.push( currentScene );
            //如果大于最大数量了，就把最前的剔除
            if ( this.list.length > this.km.getOptions( 'maxUndoCount' ) ) {
                this.list.shift();
            }
            this.index = this.list.length - 1;
            //跟新undo/redo状态
            this.update();
        },
        update: function () {
            this.hasRedo = !! this.list[ this.index + 1 ];
            this.hasUndo = !! this.list[ this.index - 1 ];
        },
        reset: function () {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
        }
    } );
    //为km实例添加history管理
    this.historyManager = new HistoryManager( this );

    var keys = {
        /*Shift*/
        16: 1,
        /*Ctrl*/
        17: 1,
        /*Alt*/
        18: 1,
        /*Command*/
        91: 1,
        37: 1,
        38: 1,
        39: 1,
        40: 1
    },
        keycont = 0,
        lastKeyCode,
        saveSceneTimer;
    return {
        defaultOptions: {
            maxUndoCount: 20,
            maxInputCount: 20
        },
        "commands": {
            "undo": kity.createClass( "UndoCommand", {
                base: Command,

                execute: function ( km ) {
                    km.historyManager.undo()
                },

                queryState: function ( km ) {
                    return km.historyManager.hasUndo ? 0 : -1;
                },

                isNeedUndo: function () {
                    return false;
                }
            } ),
            "redo": kity.createClass( "RedoCommand", {
                base: Command,

                execute: function ( km ) {
                    km.historyManager.redo()
                },

                queryState: function ( km ) {
                    return km.historyManager.hasRedo ? 0 : -1;
                },
                isNeedUndo: function () {
                    return false;
                }
            } )
        },
        addShortcutKeys: {
            "Undo": "ctrl+z", //undo
            "Redo": "ctrl+y" //redo
        },
        "events": {
            "saveScene": function ( e ) {
                this.historyManager.saveScene();
            },
            'renderNode': function ( e ) {
                var node = e.node;
                if ( node.isSelected() ) {
                    this.select( node )
                }
            },
            "keydown": function ( e ) {
                var orgEvt = e.originEvent;
                var keyCode = orgEvt.keyCode || orgEvt.which;
                if ( !keys[ keyCode ] && !orgEvt.ctrlKey && !orgEvt.metaKey && !orgEvt.shiftKey && !orgEvt.altKey ) {


                    if ( km.historyManager.list.length == 0 ) {
                        km.historyManager.saveScene();
                    }
                    clearTimeout( saveSceneTimer );

                    saveSceneTimer = setTimeout( function () {
                        km.historyManager.saveScene();
                    }, 200 );

                    lastKeyCode = keyCode;
                    keycont++;
                    if ( keycont >= km.getOptions( 'maxInputCount' ) ) {
                        km.historyManager.saveScene()
                    }
                }
            },
            "import": function () {
                this.historyManager.reset()
            }
        }
    };
} );