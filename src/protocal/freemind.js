/*

    http://freemind.sourceforge.net/

    freemind文件后缀为.mm，实际格式为xml

*/

KityMinder.registerProtocal( 'freemind', function () {

    // 标签 map
    var markerMap = {
         'full-1'   : ['PriorityIcon', 1]
        ,'full-2'   : ['PriorityIcon', 2]
        ,'full-3'   : ['PriorityIcon', 3]
        ,'full-4'   : ['PriorityIcon', 4]
        ,'full-5'   : ['PriorityIcon', 5]
        ,'full-6'   : null
        ,'full-7'   : null
        ,'full-8'   : null
        ,'full-9'   : null
        ,'full-0'   : null
    };

    function processTopic(topic, obj){

        //处理文本
        obj.data =  { text : topic.TEXT };

        // 处理标签
        if(topic.icon){
            var icons = topic.icon;
            if(icons.length && icons.length > 0){
                for (var i in icons) {
                    var type = markerMap[ icons[i]['BUILTIN'] ];
                    type && (obj.data[ type[0] ] = type[1]);
                }
            }else{
                var type = markerMap[ icons['BUILTIN'] ];
                type && (obj.data[ type[0] ] = type[1]);
            }
        }
        
        // 处理超链接
        if(topic.LINK){
            obj.data.hyperlink = topic.LINK;
        }

        //处理子节点
        if( topic.node ){

            var tmp = topic.node;
            if( tmp.length && tmp.length > 0 ){ //多个子节点
                obj.children = [];

                for(var i in tmp){
                    obj.children.push({});
                    processTopic(tmp[i], obj.children[i]);
                }

            }else{ //一个子节点
                obj.children = [{}];
                processTopic(tmp, obj.children[0]);
            }
        }
    }

    function xml2km(xml){
        var json = $.xml2json(xml);
        var result = {};
        processTopic(json.node, result);
        console.log(result);
        return result;
    }

    return {
        fileDescription: 'xmind格式文件',
        fileExtension: '.xmind',

        decode: function ( local ) {
            var json = xml2km( local );

            return json;
        },
        // recognize: recognize,
        recognizePriority: -1
    };
    
} );


