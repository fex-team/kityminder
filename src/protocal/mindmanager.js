/*

    http://www.mindjet.com/mindmanager/

    mindmanager的后缀为.mmap，实际文件格式是zip，解压之后核心文件是Document.xml

*/

KityMinder.registerProtocal( 'mindmanager', function () {

    // 标签 map
    var markerMap = {
        'urn:mindjet:Prio1': [ 'PriorityIcon', 1 ],
        'urn:mindjet:Prio2': [ 'PriorityIcon', 2 ],
        'urn:mindjet:Prio3': [ 'PriorityIcon', 3 ],
        'urn:mindjet:Prio4': [ 'PriorityIcon', 4 ],
        'urn:mindjet:Prio5': [ 'PriorityIcon', 5 ],
        '0': [ 'ProgressIcon', 1 ],
        '25': [ 'ProgressIcon', 2 ],
        '50': [ 'ProgressIcon', 3 ],
        '75': [ 'ProgressIcon', 4 ],
        '100': [ 'ProgressIcon', 5 ]
    };

    function processTopic( topic, obj ) {
        //处理文本
        obj.data = {
            text: topic.Text && topic.Text.PlainText || ''
        }; // 节点默认的文本，没有Text属性

        // 处理标签
        if ( topic.Task ) {

            var type;
            if ( topic.Task.TaskPriority ) {
                type = markerMap[ topic.Task.TaskPriority ];
                type && ( obj.data[ type[ 0 ] ] = type[ 1 ] );
            }

            if ( topic.Task.TaskPercentage ) {
                type = markerMap[ topic.Task.TaskPercentage ];
                type && ( obj.data[ type[ 0 ] ] = type[ 1 ] );
            }
        }

        //处理子节点
        if ( topic.SubTopics && topic.SubTopics.Topic ) {

            var tmp = topic.SubTopics.Topic;
            if ( tmp.length && tmp.length > 0 ) { //多个子节点
                obj.children = [];

                for ( var i in tmp ) {
                    obj.children.push( {} );
                    processTopic( tmp[ i ], obj.children[ i ] );
                }

            } else { //一个子节点
                obj.children = [ {} ];
                processTopic( tmp, obj.children[ 0 ] );
            }
        }
    }

    function xml2km( xml ) {
        var json = $.xml2json( xml );
        var result = {};
        processTopic( json.OneTopic.Topic, result );
        return result;
    }

    function getEntries( file, onend ) {
        zip.createReader( new zip.BlobReader( file ), function ( zipReader ) {
            zipReader.getEntries( onend );
        }, onerror );
    }

    return {
        fileDescription: 'mindmanager格式文件',
        fileExtension: '.mmap',

        decode: function ( local ) {

            return {
                then: function ( local, callback ) {

                    getEntries( local, function ( entries ) {
                        entries.forEach( function ( entry ) {
                            if ( entry.filename == 'Document.xml' ) {
                                entry.getData( new zip.TextWriter(), function ( text ) {
                                    var km = xml2km( $.parseXML( text ) );
                                    callback && callback( km );
                                } );
                            }
                        } );
                    } );
                }
            };

        },
        // recognize: recognize,
        recognizePriority: -1
    };

} );