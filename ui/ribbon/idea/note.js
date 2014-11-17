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

    marked.setOptions({
        breaks: true
    });

    var $attachment = minder.getUI('ribbon/idea/attachment');

    var $noteButtonMenu = new FUI.ButtonMenu({
        id: 'note-button-menu',
        text: minder.getLang('ui.note'),
        layout: 'bottom',
        buttons: [{}, {
            label: minder.getLang('ui.note')
        }],
        menu: {
            items: [minder.getLang('ui.removenote')]
        }
    }).appendTo($attachment);

    $noteButtonMenu.on('select', function() {
        minder.execCommand('note', null);
    });

    var $notePanel = $('<div id="note-panel"></div>');
    var $title = $('<h2>节点备注</h2>').appendTo($notePanel);
    var $close = $('<a class="close"></a>').appendTo($notePanel).click(hide);

    var $tab = $('<div class="tab">' + 
        '<a class="edit-tab">编辑</a>' + 
        '<a class="preview-tab">预览</a>' + 
        '<a class="help" href="https://www.zybuluo.com/techird/note/46064" target="_blank">支持 GFM 语法书写</a>' + 
        '</div>').appendTo($notePanel);

    var $editTab = $tab.find('.edit-tab');
    var $previewTab = $tab.find('.preview-tab');

    var $editor = $('<div class="note-editor"></div>').appendTo($notePanel);
    var $preview = $('<div class="note-preview"></div>').appendTo($notePanel);

    var $previewer = $('<div id="note-previewer"></div>').appendTo('#content-wrapper');

    var noteVisible = false;

    $editor.on('keydown keyup keypress mouedown mouseup click contextmenu', function(e) {
        e.stopPropagation();
    });

    var editor = new window.CodeMirror($editor[0], {
        mode: 'gfm',
        lineWrapping: true,
        dragDrop: false
    });
    
    minder.on('uiready', function() {
        editor.setSize('100%', '100%');
    });
    
    var visible = false;
    var selectedNode = null;

    function axss(value) {
        var div = document.createElement('div');
        div.innerHTML = value;
        $(div).find('script').remove();
        for (var name in div) {
            if (name.indexOf('on') === 0) {
                div.removeAttribute(name);
            }
        }
        return div.innerHTML;
    }

    function updateEditorView() {
        if (noteVisible && selectedNode != minder.getSelectedNode()) {
            selectedNode = minder.getSelectedNode();
            var note = minder.queryCommandValue('note') || '';
            editor.setValue(note);

            if (selectedNode) {
                $notePanel.removeAttr('disabled');
                $title.text('备注 - ' + selectedNode.getText());
            } else {
                $notePanel.attr('disabled', 'disabled');
                $title.text('选择节点添加备注');
            }

            if ($previewTab.hasClass(activeTabClass)) {
                $preview.html(marked(note));
            }
        }
    }

    function updateNodeData() {
        if (selectedNode && minder.queryCommandState('note') != -1) {
            minder.execCommand('note', editor.getValue());
        }
    }

    minder.on('interactchange', updateEditorView);
    editor.on('change', updateNodeData);
    $noteButtonMenu.bindCommandState(minder, 'note');
    $noteButtonMenu.on('buttonclick', show);
    minder.on('editnoterequest', show);
    minder.on('shownoterequest', preview);

    $('#kityminder').after($notePanel);
    
    hide();
    
    var previewLive = false;
    $('#kityminder').on('mousedown mousewheel DOMMouseScroll', function() {
        if (!previewLive) return;
        $previewer.fadeOut();
        previewLive = false;
    });

    $previewer.hide();
    function preview(e) {
        var icon = e.icon;
        var node = e.node;
        var b = icon.getRenderBox('screen');
        var note = node.getData('note');

        $previewer.html(marked(axss(note)));
        
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

    var activeTabClass = 'active-tab';

    function editMode() {
        if ($editTab.hasClass(activeTabClass)) return;
        $preview.hide();
        $previewTab.removeClass(activeTabClass);

        $editor.show().addClass(activeTabClass);
        $editTab.addClass(activeTabClass);
    }

    function previewMode() {
        if ($previewTab.hasClass(activeTabClass)) return;

        $editor.hide();
        $editTab.removeClass(activeTabClass);
        $preview.html(marked(axss(editor.getValue()))).show();
        $previewTab.addClass(activeTabClass);
    }

    $editTab.click(editMode);
    $previewTab.click(previewMode);

    function show() {
        noteVisible = true;
        $notePanel.show();
        editMode();
        updateEditorView();
        $('#content-wrapper').addClass('note-panel-visible');
    }

    function hide() {
        noteVisible = false;
        $notePanel.hide();
        $('#content-wrapper').removeClass('note-panel-visible');
    }

});