/**
 * @fileOverview
 *
 * 关键帧
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('slideshow/frame', function(minder) {

    // key api
    
    /**
     * @see src/core/node.js
     * @type {MinderNode}
     */
    var root = minder.getRoot();

    /**
     * 获取当前内容区域
     * @see ui/nav.js
     * @type {kity.Box}
     */
    var view = minder.getRenderContainer().getBoundaryBox();

    /**
     * 获取当前可是区域
     * @see src/module/view.js
     * @type {kity.Box}
     */
    var visibleView = minder.getViewDragger().getView();

    /**
     * 设置视野的偏移，使画布左上角坐标和指定的点坐标重合
     * @see src/module/view.js
     *
     * @param {kity.Point} point
     */
    //minder.getViewDragger().moveTo(new kity.Point(100, 100));

    console.log('frame loaded.');
});