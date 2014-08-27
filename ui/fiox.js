/**
 * @fileOverview
 *
 * 拓展 fio 的能力
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('fiox', function(minder) {
    var eve = minder.getUI('eve');
    eve.setup(fio.user);
});