var mindermoduleTest = function () {
    console.log( "test loaded" );
    var stroredData = "stored";
    return {
        "ready": function () {
            //todo:基本的初始化工作
            console.log( stroredData );
        },

        "commands": {
            //todo:command字典，name－action  键值对模式编写
            "testCommand1": function ( km, arg ) {
                console.log( "testCommand1" );
            }
        },

        "events": {
            //todo:事件响应函数绑定列表,事件名-响应函数  键值对模式编写
            "click": function ( e ) {

            },
            "keydown keyup": function ( e ) {

            }
        }
    };
};