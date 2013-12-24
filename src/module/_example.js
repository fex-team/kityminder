/**
 * 模块初始化函数：模块名称大写，以 Module 作为后缀
 */
KityMinder.registerModule( "ExampleModule", function () {
    console.log( "You can cheat: 上下左右ABAB" );

    // TODO: 初始化模块静态变量
    var cheatCode = "38 40 37 39 65 66 65 66".split( ' ' );

    // TODO: 进行模块命令定义
    // HINT: 复杂的命令也可以在其它的文件中定义
    var ExampleCommand = kity.createClass( "ExampleCommand", {
        base: Command,

        /**
         * 命令执行函数
         * @required
         * @param {KityMinder} km 命令执行时的 KityMinder 实例
         */
        execute: function ( km ) {
            // this.setContentChange(true) 可以告知 KM 命令的执行导致了内容的变化，KM会抛出 contentchange 事件
            // this.setSelectionChange(true) 可以告知 KM 命令的执行导致了选区的变化，KM会抛出 selectionchange 事件
            window.alert( 'you cheat!' );
        },

        /**
         * 命令状态查询
         * @optional
         * @param {KityMinder} km 命令查询针对的 KityMinder 实例
         * @return {int} 返回 0 表示命令在正常状态(Default)
         *               返回 1 表示命令在生效的状态
         *               返回 -1 表示命令当前不可用
         */
        queryState: function ( km ) {

        },

        /**
         * 命令当前值查询
         * @param  {KityMinder} km 命令查询针对的 KityMinder 实例
         * @return {any} 返回命令自定义类型数据。
         */
        queryValue: function ( km ) {

        }
    } );

    return {

        // TODO: 需要注册的命令
        "commands": {

            // 约定：命令名称全用小写
            "cheat": ExampleCommand
        },

        // TODO: 需要注册的事件
        "events": {

            "click": function ( e ) {
                // 支持的鼠标事件：mousedown, mouseup, mousemove, click
            },

            "keydown": function ( e ) {
                // 支持的键盘事件：keydown, keyup, keypress
                if ( !this._cheated || this._cheated[ 0 ] != e.keyCode ) {
                    this._cheated = cheatCode.slice( 0 );
                }
                if ( this._cheated[ 0 ] == e.keyCode ) {
                    this._cheated.shift();
                }
                console.log( this._cheated );
                if ( this._cheated.length === 0 ) {
                    this.execCommand( 'cheat' );
                }
            },

            "beforecommand": function ( e ) {
                // e.cancel() 方法可以阻止 before 事件进入下个阶段
                // e.cancelImmediately() 方法可以阻止当前回调后的回调执行，并且阻止事件进入下个阶段
                // console.log( e.type + ' fired' );
            },

            "command": function ( e ) {
                // 命令执行后的事件
                // console.log( e.type + ' fired' );
            },

            "contentchange": function ( e ) {
                // 内容改变后的事件
            },

            "selectionchange": function ( e ) {
                // 选区改变后的事件
            }
        },

        // TODO: 定义模块的destroy方法
        "destroy": function () {
            console.log( "destroy" );
        },

        // TODO: 定义模块的reset方法
        "reset": function () {
            console.log( "reset" );
        }
    };
} );