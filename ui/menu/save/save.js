/**
 * @fileOverview
 *
 * 保存菜单（二级菜单）
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('menu/save/save', function(minder) {
    return minder.getUI('menu/menu').createSubMenu('save');
});