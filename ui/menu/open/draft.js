/**
 * @fileOverview
 *
 * 草稿箱功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/open/draft', function(minder) {
    var $open = minder.getUI('menu/open/open');
    var $panel = $($open.draft.getContentElement()).addClass('draft-file-list');
    var drafts = minder.getUI('widget/locallist').use('draft');

    $panel.append('<h2>草稿箱</h2>');
});