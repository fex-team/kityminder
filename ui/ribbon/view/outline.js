/**
 * @fileOverview
 *
 * 大纲视图
 *
 * @author: yangxiaohu
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('ribbon/view/outline', function(minder) {

    var $commandbutton = minder.getUI('widget/commandbutton');
    var $tabs = minder.getUI('ribbon/tabs');
    var notice = minder.getUI('widget/notice');

    var $outlinePanel = new FUI.LabelPanel({
        label: minder.getLang('panels.level'),
        column: true
    }).appendTo($tabs.view);

    var $outlineButton = $commandbutton
        .generate('outline', openDialog)
        .addClass('large')
        .appendTo($outlinePanel);

    var $outlineDialog = new FUI.Dialog({
        width: 180,
        height: 260,
        padding: 0,
        layout: 'right-bottom',
        mask: null,
        buttons: [],
        prompt: true,
        caption: minder.getLang('ui.command.outline')
    }).appendTo(document.getElementById('content-wrapper'));

    $($outlineDialog.getFootElement()).hide();
    $($outlineDialog.getBodyElement()).css('padding', '0px');

    var $dialogBody = $($outlineDialog.getBodyElement());

    var $outlineView = $('<div id="outlineView" class="outlineView"></div>').appendTo($dialogBody);

    renderOutline();

    function renderOutline() {
        $('<ul>').append(createOutline(km.getRoot())).appendTo($outlineView.empty());
    }

    var liCount = 0;
    function createOutline(tree) {
        var children = tree.getChildren();
        var html = '';
        var title = tree.getText();

        var $sign = $('<div>').addClass('sign').text('-');
        var $text = $('<div>').text(title).addClass('text').data('text', tree);
        var $li = $('<li>').append($text);

        // $text.css('padding-left', tree.getLevel() * 12 + 'px');
        liCount++;

        if(liCount % 2) {
            $li.addClass('odd');
        }
        if (children.length) {
            var $ul = $('<ul>').appendTo($li).addClass('item-child');

            $li.prepend($sign);
            children.forEach(function(child) {
                $ul.append(createOutline(child));
            })
        }

        return $li;

    }
    var isFirst = true;
    function openDialog() {
        $outlineDialog.open();
        if(isFirst) {
            notice.info(minder.getLang('ui.outline_exit_hint'), false, 4000);
        }
        isFirst = false;
    }

    minder.addShortcut('F12', openDialog);
    minder.on('contentchange', renderOutline);

    $outlineView.delegate('div', 'click', function(e){
        var node = $(e.target).closest('div').data('text');
        minder.execCommand('camera', node, 500);
        e.stopPropagation();
    })

    $outlineView.delegate('div.sign', 'click', function(e){
        var $node = $(e.target);
        if( $node.text() == '+') {
            $node.text('-');
        }
        else {
            $node.text('+');
        }
        $node.siblings('ul').fadeToggle();
        e.stopPropagation();
    })

    return $outlineButton;
});
