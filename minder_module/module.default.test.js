var mindermoduleDefaultTest = function () {
    console.log( "test loaded" );
    var stroredData = "stored";

    return {
        "commands": {
            //todo:command字典，name－action  键值对模式编写
            "testCommand": kity.createClass( "testCommand", {
                base: Command,
                "execute": function ( km, arg1, arg2, arg3 ) {
                    console.log( arg1, arg2, arg3 );
                }
            } ),
            "testCommand2": kity.createClass( "testCommand", {
                base: Command,
                "execute": function ( km, arg1, arg2, arg3 ) {
                    console.log( arg1, arg2, arg3 );
                }
            } )
        },

        "events": {
            //todo:事件响应函数绑定列表,事件名-响应函数  键值对模式编写
            "click": function ( e ) {
                window.alert( "hahaha" );
            },
            "keydown keyup": function ( e ) {
                window.alert( "key" );
            },
            "beforecommand": function ( e ) {
                console.log( "precommand:", e );
                e.cancel();
            },
            "command": function ( e ) {
                console.log( "command exec!", e );
            },
            "contentchange": function ( e ) {
                console.log( "contentchange!" );
            }
        }
    };
};