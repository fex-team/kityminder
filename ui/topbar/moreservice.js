/**
 * @fileOverview
 *
 * 搜索节点功能
 *
 * @author: yangxiaohu
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('topbar/moreservice', function(minder) {
    var $service;
    var $link = $('<link>').attr('href', "http://baiduoffice.duapp.com/public/assets/style/moreService.css").attr('rel', "stylesheet");

    $('head').append($link);

    $.getScript('http://baiduoffice.duapp.com/public/widget/moreService.js', startService);

    $service =  $('<div id="moreservice"></div>');

    function startService(){
        $service.prependTo('#panel').moreService({button: {float: 'left', width: '40px', height: '40px', 'border-right': '1px solid rgba(255, 255, 255, .5)'}});
    };

    return $service;
});