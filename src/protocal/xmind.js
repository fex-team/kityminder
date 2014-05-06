/*

    http://www.xmind.net/developer/

    Parsing XMind file

    XMind files are generated in XMind Workbook (.xmind) format, an open format that is based on the principles of OpenDocument. It consists of a ZIP compressed archive containing separate XML documents for content and styles, a .jpg image file for thumbnails, and directories for related attachments.
 */

KityMinder.registerProtocal( 'xmind', function () {

    // 标签 map
    var markerMap = {
         'priority-1'   : ['PriorityIcon', 1]
        ,'priority-2'   : ['PriorityIcon', 2]
        ,'priority-3'   : ['PriorityIcon', 3]
        ,'priority-4'   : ['PriorityIcon', 4]
        ,'priority-5'   : ['PriorityIcon', 5]

        ,'task-start'   : ['ProgressIcon', 1]
        ,'task-quarter' : ['ProgressIcon', 2]
        ,'task-half'    : ['ProgressIcon', 3]
        ,'task-3quar'   : ['ProgressIcon', 4]
        ,'task-done'    : ['ProgressIcon', 5]

        ,'task-oct'     : null
        ,'task-3oct'    : null
        ,'task-5oct'    : null
        ,'task-7oct'    : null
    };

    function processTopic(topic, obj){

        //处理文本
        obj.data =  { text : topic.title };

        // 处理标签
        if(topic.marker_refs && topic.marker_refs.marker_ref){
            var markers = topic.marker_refs.marker_ref;
            if( markers.length && markers.length > 0 ){
                for (var i in markers) {
                    var type = markerMap[ markers[i]['marker_id'] ];
                    type && (obj.data[ type[0] ] = type[1]);
                }
            }else{
                var type = markerMap[ markers['marker_id'] ];
                type && (obj.data[ type[0] ] = type[1]);
            }
        }

        // 处理超链接
        if(topic['xlink:href']){
            obj.data.hyperlink = topic['xlink:href'];
        }

        //处理子节点
        if( topic.children && topic.children.topics && topic.children.topics.topic ){
            var tmp = topic.children.topics.topic;
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
        var sheet = json.sheet;
        var topic = utils.isArray(sheet) ? sheet[0].topic : sheet.topic;
        processTopic(topic, result);
        return result;
    }

    function getEntries(file, onend) {
        zip.createReader(new zip.BlobReader(file), function(zipReader) {
            zipReader.getEntries(onend);
        }, onerror);
    }

    return {
        fileDescription: 'xmind格式文件',
        fileExtension: '.xmind',
        
        decode: function ( local ) {

            return {
                then : function(local, callback){

                    getEntries( local, function( entries ) {
                        entries.forEach(function( entry ) {
                            if(entry.filename == 'content.xml'){
                                entry.getData(new zip.TextWriter(), function(text) {
                                    var km = xml2km($.parseXML(text));
                                    callback && callback( km );
                                });
                            }
                        });
                    });
                }
            };

        },
        // recognize: recognize,
        recognizePriority: -1
    };
    
} );


