/**
 * @fileOverview
 *
 * 打开菜单（二级菜单）
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
KityMinder.registerUI('menu/open/open', function(minder) {
    return minder.getUI('menu/menu').createSubMenu('open', true);
});