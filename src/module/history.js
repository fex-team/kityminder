KityMinder.registerModule( "HistoryModule", function () {

    var Scene = kity.createClass( 'Scene', {
        constructor: function ( root ) {
            this.data = root.clone();

        },
        getData: function () {
            return this.data;
        },
        cloneData: function () {
            return this.getData().clone();
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
            this.km.initStyle();
            this.update();
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

    return {
        defaultOptions: {
            maxUndoCount: 20
        },
        "commands": {
            "undo": kity.createClass( "UndoCommand", {
                base: Command,

                execute: function ( km ) {
                    km.historyManager.undo()
                },

                queryState: function ( km ) {
                    km.historyManager.hasUndo ? 0 : -1;
                },
                isNeedUndo: true
            } ),
            "redo": kity.createClass( "RedoCommand", {
                base: Command,

                execute: function ( km ) {
                    km.historyManager.redo()
                },

                queryState: function ( km ) {
                    return km.historyManager.hasRedo ? 0 : -1;
                },
                isNeedUndo: true
            } )
        },

        "events": {
            "saveScene": function ( e ) {
                this.historyManager.saveScene();
            }
        }
    };
} );