/**
 * @fileOverview
 *
 * 节点笔记支持
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('ribbon/idea/note', function(minder) {

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

    $noteButtonMenu.bindCommandState(minder, 'note');

    minder.on('shownoterequest', console.log.bind(console));

    var $notePanel = $('<div id="note-panel">');

    $('#kityminder').after($notePanel);

    var um = UM.getEditor('note-panel', {
        UMEDITOR_HOME_URL: 'lib/umeditor/dist/',

        toolbar:[
            'undo redo | bold italic underline strikethrough | superscript subscript | forecolor backcolor removeformat',
            '| insertorderedlist insertunorderedlist | paragraph | fontfamily fontsize' ,
            '| justifyleft justifycenter justifyright justifyjustify',
            '| link unlink',
            '| horizontal fullscreen'
        ]
    });

    um.ready(function() {
        this.container.id = 'note-panel'; 
    });
});