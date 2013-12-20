var mindermoduleRender = function () {
    console.log( "render loaded" );

    var commandDrawShape = kity.createClass( "commandDrawShape", {
        base: Command,
        "execute": function ( km, config ) {
            var node = kity.createClass( {
                base: kity.Group,

            } );
        }
    } );

    return {
        "commands": {
            //todo:command字典，name－action  键值对模式编写
            ommandDrawRect: commandDrawShape
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