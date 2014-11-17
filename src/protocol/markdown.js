/**
 * @fileOverview
 *
 * Markdown 格式导入导出支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerProtocol('markdown', function() {

    function encode(json) {

    }

    function decode(markdown) {

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