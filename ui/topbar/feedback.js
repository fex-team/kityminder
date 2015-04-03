/**
 * @fileOverview
 *
 * 快速反馈按钮
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('topbar/feedback', function(minder) {
    var $quickvisit = minder.getUI('topbar/quickvisit');

    var $feedback = $quickvisit.add('feedback', 'right');

    function quickFeedback() {
        var $menu = minder.getUI('menu/menu');
        $menu.$tabs.select(5);
        $menu.show();
    }
    $feedback.click(quickFeedback);
    minder.addShortcut('f1', quickFeedback);

    return $feedback;
});