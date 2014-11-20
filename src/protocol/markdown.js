/**
 * @fileOverview
 *
 * Markdown 格式导入导出支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerProtocol('markdown', function() {
    var LINE_ENDING_SPLITER = /\r\n|\r|\n/;
    var EMPTY_LINE = '';
    var NOTE_MARK_START = '<!--Note-->';
    var NOTE_MARK_CLOSE = '<!--/Note-->';

    function encode(json) {

        return _build(json, 1).join('\n');
    }

    function _build(node, level) {
        var lines = [];

        level = level || 1;

        var sharps = _generateHeaderSharp(level);
        lines.push(sharps + ' ' + node.data.text);
        lines.push(EMPTY_LINE);
        
        var note = node.data.note;
        if (note) {
            var hasSharp = /^#/.test(note);
            if (hasSharp) {
                lines.push(NOTE_MARK_START);
                note = note.replace(/^#+/gm, function($0) {
                    return sharps + $0;
                });
            }
            lines.push(note);
            if (hasSharp) {
                lines.push(NOTE_MARK_CLOSE);
            }
            lines.push(EMPTY_LINE);
        }

        if (node.children) node.children.forEach(function(child) {
            lines = lines.concat(_build(child, level + 1));
        });

        return lines;
    }

    function _generateHeaderSharp(level) {
        var sharps = '';
        while(level--) sharps += '#';
        return sharps;
    }

    function decode(markdown) {

        var json,
            parentMap = {},
            lines, line, lineInfo, level, node, parent, noteProgress, codeBlock;

        // 一级标题转换 `{title}\n===` => `# {title}`
        markdown = markdown.replace(/^(.+)\n={3,}/, function($0, $1) {
            return '# ' + $1;
        });

        lines = markdown.split(LINE_ENDING_SPLITER);

        // 按行分析
        for (var i = 0; i < lines.length; i++) {
            line = lines[i];

            lineInfo = _resolveLine(line);

            // 备注标记处理
            if (lineInfo.noteClose) {
                noteProgress = false;
                continue;
            } else if (lineInfo.noteStart) {
                noteProgress = true;
                continue;
            }

            // 代码块处理
            codeBlock = lineInfo.codeBlock ? !codeBlock : codeBlock;

            // 备注条件：备注标签中，非标题定义，或标题越位
            if (noteProgress || codeBlock || !lineInfo.level || lineInfo.level > level + 1) {
                if (node) _pushNote(node, line);
                continue;
            }

            // 标题处理
            level = lineInfo.level;
            node = _initNode(lineInfo.content, parentMap[level - 1]);
            parentMap[level] = node;
        }

        _cleanUp(parentMap[1]);
        return parentMap[1];
    }

    function _initNode(text, parent) {
        var node = {
            data: {
                text: text,
                note: ''
            }
        };
        if (parent) {
            if (parent.children) parent.children.push(node);
            else parent.children = [node];
        }
        return node;
    }

    function _pushNote(node, line) {
        node.data.note += line + '\n';
    }

    function _isEmpty(line) {
        return !/\S/.test(line);
    }

    function _resolveLine(line) {
        var match = /^(#+)?\s*(.*)$/.exec(line);
        return {
            level: match[1] && match[1].length || null,
            content: match[2],
            noteStart: line == NOTE_MARK_START,
            noteClose: line == NOTE_MARK_CLOSE,
            codeBlock: /^\s*```/.test(line)
        };
    }

    function _cleanUp(node) {
        if (!/\S/.test(node.data.note)) {
            node.data.note = null;
            delete node.data.note;
        } else {
            var notes = node.data.note.split('\n');
            while(notes.length && !/\S/.test(notes[0])) notes.shift();
            while(notes.length && !/\S/.test(notes[notes.length - 1])) notes.pop();
            node.data.note = notes.join('\n');
        }
        if (node.children) node.children.forEach(_cleanUp);
    }

    return {
        fileDescription: 'Markdown/GFM 格式',
        fileExtension: '.md',
        mineType: 'text/markdown',
        dataType: 'text',

        encode: function(json) {
            return encode(json);
        },

        decode: function(markdown) {
            return decode(markdown);
        },

        recognizePriority: -1
    };
});