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
    var $input = $search.find('input');

    minder.addShortcut('ctrl+f', function() {
        $input[0].focus();
        $input[0].select();
    });

    $input.on('keydown', function(e) {
        if (e.keyCode == 13) {
            doSearch($input.val());
        }
        if (e.keyCode == 27) {
            $input[0].blur();
        }
    });

    var nodeSequence;

    minder.on('contentchange', makeNodeSequence);

    function makeNodeSequence() {
        nodeSequence = [];
        minder.getRoot().traverse(function(node) {
            nodeSequence.push(node);
        });
    }

    function doSearch(keyword) {
        if (!/\S/.exec(keyword)) {
            $input[0].focus();
            $input[0].select();
            return;
        }

        keyword = keyword.toLowerCase();

        var newSearch = doSearch.lastKeyword != keyword;

        doSearch.lastKeyword = keyword;

        var startIndex = newSearch ? 0 : doSearch.lastIndex + 1 || 0;
        var endIndex = startIndex + nodeSequence.length - 1;

        for (var i = startIndex; i <= endIndex; i++) {
            var node = nodeSequence[i % nodeSequence.length];
            var text = node.getText().toLowerCase();
            if (text.indexOf(keyword) != -1) {
                setSearchResult(node);
                doSearch.lastIndex = i;
                break;
            }
        }

        function setSearchResult(node) {
            minder.execCommand('camera', node, 50);
            setTimeout(function() {
                minder.select(node, true);
            }, 60);
        }
    }
    return $search;
});