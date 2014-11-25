/**
 * @fileOverview
 *
 * 节点笔记支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
/* global marked: true */
KityMinder.registerUI('ribbon/idea/note', function(minder) {
    var axss = minder.getUI('axss');

    marked.setOptions({
        gfm: true,
        breaks: true
    });

    var $previewer = $('<div id="note-previewer"></div>').appendTo('#content-wrapper');

    var visible = false;
    var selectedNode = null;

    var previewTimer;
    minder.on('shownoterequest', function(e) {
        previewTimer = setTimeout(function() {
            preview(e.icon, e.node);
        }, 300);
    });
    minder.on('hidenoterequest', function() {
        clearTimeout(previewTimer);
    });

    var previewLive = false;
    $('#kityminder').on('mousedown mousewheel DOMMouseScroll', function() {
        if (!previewLive) return;
        $previewer.fadeOut();
        previewLive = false;
    });

    $previewer.hide();
    function preview(icon, node) {
        var b = icon.getRenderBox('screen');
        var note = node.getData('note');

        $previewer[0].scrollTop = 0;
        $previewer.html(axss(marked(note)));
        
        var cw = $('#content-wrapper').width();
        var ch = $('#content-wrapper').height();
        var pw = $previewer.outerWidth();
        var ph = $previewer.outerHeight();

        var x = b.cx - pw / 2;
        var y = b.bottom + 10;

        if (x < 0) x = 10;
        if (x + pw > cw) x = cw - pw - 10;
        if (y + ph > ch) y = b.top - ph - 10;
       
        $previewer.css({
            left: Math.round(x),
            top: Math.round(y)
        });

        $previewer.show();
        previewLive = true;
    }

});