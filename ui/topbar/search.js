/**
 * @fileOverview
 *
 * 搜索节点功能
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('topbar/search', function(minder) {
    var $search = $('<div id="search"><input type="search" /></div>').appendTo('#panel');

    return $search;
});