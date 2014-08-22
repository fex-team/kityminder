KityMinder.registerProtocol('plain', function(minder) {
    var LINE_ENDING = '\r',
        LINE_ENDING_SPLITER = /\r\n|\r|\n/,
        TAB_CHAR = '\t';

    function repeat(s, n) {
        var result = '';
        while (n--) result += s;
        return result;
    }

    function encode(json, level) {
        var local = '';
        level = level || 0;
        local += repeat(TAB_CHAR, level);
        local += json.data.text + LINE_ENDING;
        if (json.children) {
            json.children.forEach(function(child) {
                local += encode(child, level + 1);
            });
        }
        return local;
    }

    function isEmpty(line) {
        return !/\S/.test(line);
    }

    function getLevel(line) {
        var level = 0;
        while (line.charAt(level) === TAB_CHAR) level++;
        return level;
    }

    function getNode(line) {
        return {
            data: {
                text: line.replace(new RegExp('^' + TAB_CHAR + '*'), '')
            }
        };
    }

    function decode(local) {
        var json,
            parentMap = {},
            lines = local.split(LINE_ENDING_SPLITER),
            line, level, node;

        function addChild(parent, child) {
            var children = parent.children || (parent.children = []);
            children.push(child);
        }

        for (var i = 0; i < lines.length; i++) {
            line = lines[i];
            if (isEmpty(line)) continue;

            level = getLevel(line);
            node = getNode(line);

            if (level === 0) {
                if (json) {
                    throw new Error('Invalid local format');
                }
                json = node;
            } else {
                if (!parentMap[level - 1]) {
                    throw new Error('Invalid local format');
                }
                addChild(parentMap[level - 1], node);
            }
            parentMap[level] = node;
        }
        return json;
    }

    return {
        fileDescription: '大纲文本',
        fileExtension: '.txt',
        mineType: 'text/plain',
        dataType: 'text',

        encode: function(json) {
            return encode(json, 0);
        },

        decode: function(local) {
            return decode(local);
        },

        recognizePriority: -1
    };
});