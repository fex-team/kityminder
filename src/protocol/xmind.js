/* global zip:true */
/*
    http://www.xmind.net/developer/
    Parsing XMind file
    XMind files are generated in XMind Workbook (.xmind) format, an open format
    that is based on the principles of OpenDocument. It consists of a ZIP
    compressed archive containing separate XML documents for content and styles,
    a .jpg image file for thumbnails, and directories for related attachments.
 */
KityMinder.registerProtocol('xmind', function(minder) {

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
        fileDescription: 'XMind 格式',
        fileExtension: '.xmind',
        dataType: 'blob',
        mineType: 'application/octet-stream',

        decode: function(local) {

            function processTopic(topic, obj) {

                //处理文本
                obj.data = {
                    text: topic.title
                };

                // 处理标签
                if (topic.marker_refs && topic.marker_refs.marker_ref) {
                    var markers = topic.marker_refs.marker_ref;
                    var type;
                    if (markers.length && markers.length > 0) {
                        for (var i in markers) {
                            type = markerMap[markers[i].marker_id];
                            if (type) obj.data[type[0]] = type[1];
                        }
                    } else {
                        type = markerMap[markers.marker_id];
                        if (type) obj.data[type[0]] = type[1];
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

            function getEntries(file, onend) {
                return new Promise(function(resolve, reject) {                    
                    zip.createReader(new zip.BlobReader(file), function(zipReader) {
                        zipReader.getEntries(resolve);
                    }, reject);
                });
            }

            function readDocument(entries) {
                return new Promise(function(resolve, reject) {
                    var entry, json;

                    // 查找文档入口
                    while ((entry = entries.pop())) {

                        if (entry.filename.split('/').pop() == 'content.xml') break;

                        entry = null;

                    }

                    // 找到了读取数据
                    if (entry) {

                        entry.getData(new zip.TextWriter(), function(text) {
                            try {
                                json = xml2km($.parseXML(text));
                                resolve(json);
                            } catch (e) {
                                reject(e);
                            }
                        });

                    } 

                    // 找不到返回失败
                    else {
                        reject(new Error('Content document missing'));
                    }
                });
            }

            return getEntries(local).then(readDocument);

        },

        encode: function(json, km, options) {
            var url = 'native-support/export.php';
            var data = JSON.stringify(json);

            function fetch() {
                return new Promise(function(resolve, reject) {

                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', url);

                    xhr.responseType = 'blob';
                    xhr.onload = resolve;
                    xhr.onerror = reject;

                    var form = new FormData();
                    form.append('type', 'xmind');
                    form.append('data', data);

                    xhr.send(form);

                }).then(function(e) {
                    return e.target.response;
                });
            }

            function download() {
                var filename = options.filename || 'xmind.xmind';

                var form = document.createElement('form');
                form.setAttribute('action', url);
                form.setAttribute('method', 'POST');
                form.appendChild(field('filename', filename));
                form.appendChild(field('type', 'xmind'));
                form.appendChild(field('data', data));
                form.appendChild(field('download', '1'));
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);

                function field(name, content) {
                    var input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = content;
                    return input;
                }
            }

            if (options && options.download) {
                return download();
            } else {
                return fetch();
            }
        },

        // recognize: recognize,
        recognizePriority: -1
    };

});