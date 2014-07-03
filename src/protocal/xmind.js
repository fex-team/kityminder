/*
    http://www.xmind.net/developer/
    Parsing XMind file
    XMind files are generated in XMind Workbook (.xmind) format, an open format
    that is based on the principles of OpenDocument. It consists of a ZIP
    compressed archive containing separate XML documents for content and styles,
    a .jpg image file for thumbnails, and directories for related attachments.
 */

KityMinder.registerProtocal('xmind', function() {

    // 标签 map
    var markerMap = {
        'priority-1': ['priority', 1],
        'priority-2': ['priority', 2],
        'priority-3': ['priority', 3],
        'priority-4': ['priority', 4],
        'priority-5': ['priority', 5],
        'priority-6': ['priority', 6],
        'priority-7': ['priority', 7],
        'priority-8': ['priority', 8],

        'task-start': ['progress', 1],
        'task-oct': ['progress', 2],
        'task-quarter': ['progress', 3],
        'task-3oct': ['progress', 4],
        'task-half': ['progress', 5],
        'task-5oct': ['progress', 6],
        'task-3quar': ['progress', 7],
        'task-7oct': ['progress', 8],
        'task-done': ['progress', 9]
    };

    return {
        fileDescription: 'xmind格式文件',
        fileExtension: '.xmind',

        decode: function(local) {
            var successCall, errorCall;


            function processTopic(topic, obj) {

                //处理文本
                obj.data = {
                    text: topic.title
                };

                // 处理标签
                if (topic.marker_refs && topic.marker_refs.marker_ref) {
                    var markers = topic.marker_refs.marker_ref;
                    if (markers.length && markers.length > 0) {
                        for (var i in markers) {
                            var type = markerMap[markers[i]['marker_id']];
                            type && (obj.data[type[0]] = type[1]);
                        }
                    } else {
                        var type = markerMap[markers['marker_id']];
                        type && (obj.data[type[0]] = type[1]);
                    }
                }

                // 处理超链接
                if (topic['xlink:href']) {
                    obj.data.hyperlink = topic['xlink:href'];
                }
                //处理子节点
                var topics = topic.children && topic.children.topics;
                var subTopics = topics && (topics.topic || topics[0] && topics[0].topic);
                if (subTopics) {
                    var tmp = subTopics;
                    if (tmp.length && tmp.length > 0) { //多个子节点
                        obj.children = [];

                        for (var i in tmp) {
                            obj.children.push({});
                            processTopic(tmp[i], obj.children[i]);
                        }

                    } else { //一个子节点
                        obj.children = [{}];
                        processTopic(tmp, obj.children[0]);
                    }
                }
            }

            function xml2km(xml) {
                var json = $.xml2json(xml);
                var result = {};
                var sheet = json.sheet;
                var topic = utils.isArray(sheet) ? sheet[0].topic : sheet.topic;
                processTopic(topic, result);
                return result;
            }

            function onerror() {
                errorCall('ziperror');
            }

            function getEntries(file, onend) {
                zip.createReader(new zip.BlobReader(file), function(zipReader) {
                    zipReader.getEntries(onend);
                }, onerror);
            }
            return {
                then: function(callback) {

                    getEntries(local, function(entries) {
                        var hasMainDoc = false;
                        entries.forEach(function(entry) {
                            if (entry.filename == 'content.xml') {
                                hasMainDoc = true;
                                entry.getData(new zip.TextWriter(), function(text) {
                                    try {
                                        var km = xml2km($.parseXML(text));
                                        callback && callback(km);
                                    } catch (e) {
                                        errorCall && errorCall('parseerror');
                                    }
                                });
                            }
                        });

                        !hasMainDoc && errorCall && errorCall('parseerror');
                    });
                    return this;
                },
                error: function(callback) {
                    errorCall = callback;
                }
            };

        },
        // recognize: recognize,
        recognizePriority: -1
    };

});