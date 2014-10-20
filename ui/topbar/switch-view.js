/**
 * @fileOverview
 *
 * 移动端分享页面转换视图按钮
 *
 * @author: zhangbobell
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('topbar/switch-view', function(minder) {
    var $switch = $('<span class="switch-view" id="switch-view">转换</span>').appendTo('#panel');


    $('<div class="back"></div>').appendTo('#m-logo');

    var treeData;
    var $curView=$('<div id="curView">');
    var $preView=$('<div id="preView">');

    minder.on('uiready', function() {
        var shareView = minder.getUI('menu/share/m-share');
        shareView.ready.then(function(){
            treeData = addParentPointer(minder);

            renderNodeData(treeData, minder, $curView);
            renderNodeData(treeData, minder, $preView);
            $('#km-list-view').append($curView);
            $('#km-list-view').append($preView);
            $preView.css('x', '100%');

            $('#km-list-view').css('display', 'none');
        });
    });

    var isListView = false; // mutex : 当前是否是列表视图
    $switch.on('click', function(){
        if (!isListView ){
            $('#kityminder').css('display', 'none');
            $('#km-list-view').css('display', 'block');
            isListView = true;
        } else {
            $('#km-list-view').css('display', 'none');
            $('#kityminder').css('display', 'block');
            isListView = false;
        }
    });


    $('#km-list-view').delegate('li', 'click', function(){
        var preViewData = $(this).data();

        if (preViewData.children) {
            renderNodeData(preViewData, minder, $preView);
//            $curView.css('x');
//            console.log($preView.css('x'));
            $preView.css('x', parseInt($curView.css('x')) + 100 + '%');
//            console.log($preView.css('x'));
//            $('#km-list-view').css('x', '0');
            $('#km-list-view').transition({
                x: parseInt($('#km-list-view').css('x')) - 100 + '%',
                duration: 200,
                easing: 'ease',
                complete: function(){
                    var $temp = $curView;
                    $curView = $preView;
                    $preView = $temp;
                }
            });

            if (preViewData.parent){
                $('.back').css('display', 'block');
                $('#km-cat').css('display', 'none');
            }
        }
    });

    $('.back').on('click', function(){
        var parentViewData = $('.cur-root', $curView).data();
        renderNodeData(parentViewData, minder, $preView);
        $preView.css('x', parseInt($curView.css('x')) - 100 + '%');
//        $curView.css('x');
//        $('#km-list-view').css('x', '-100%');

        $('#km-list-view').transition({
            x: parseInt($('#km-list-view').css('x')) + 100 + '%',
            duration: 200,
            easing: 'ease',
            complete: function(){
                var $temp = $curView;
                $curView = $preView;
                $preView = $temp;
            }
        });

        if (!parentViewData.parent){
            $('.back').css('display', 'none');
            $('#km-cat').css('display', 'block');
        }
    })

    return $switch;
});

/**
 * addParentPointer - 给 minder 的 json 数据增加 parent 指针
 * @param minder - kityminder 实例
 * @returns {*} - 增加了 parent 指针之后的 json 结构
 */
function addParentPointer(minder){
    var root = minder.exportJson();
    return AddParent(root);
}

/**
 * AddParent - 递归的增加 parent 指针
 * @param root - 传入的根节点
 * @returns {*}
 */
function AddParent(root){
    if (root.children){
        $.each(root.children, function(idx, ele){
            ele.parent = root;
            AddParent(ele);
        });
    }
    return root;
}

/**
 * creadNodeData - 根据 json 结构创建好视图的 jQuery 对象
 * @param node
 * @param minder
 * @returns {*} - 创建好的 jQuery 对象
 */
function renderNodeData(node, minder, $target){
    var $curRoot = createRootNode(node, minder);
    var $curList = $('<ul class="cur-list">');

    if (node.children){
        $.each(node.children, function(idx, ele){
            var $listNode = createListNode(ele, minder);
            $curList.append($listNode);
        });
    }

//    debugger;
    return $target.html($curRoot.add($curList));
}

/**
 * createRootNode - 创建当前根节点对应的 jQuery 对象
 * @param node 节点的 jQuery 对象
 * @param minder kityminder 实例
 * @returns {*|jQuery|HTMLElement} 当前根节点的 jQuery 对象
 */
function createRootNode(node, minder){
    var $root = $('<h1 class="cur-root">');
    $root.append(getNodeHtml(node, minder));

    if (node.parent){
        $root.data(node.parent);
    }
    return $root;
}

/**
 * createListNode - 创建子节点对应的 jQuery 对象
 * @param node 节点的 json 对象
 * @param minder kityminder 实例
 * @returns {*|jQuery|HTMLElement} 子节点的 jQuery 对象
 */
function createListNode(node, minder){
    var $list = $('<li>');
    $list.append(getNodeHtml(node, minder));

    // 处理子节点
    if (node.children){
        $list.addClass('clickable');
        $list.children().first().before('<span class="next-level"></span>');
        $list.data(node);
    }

    return $list;
}

/**
 * getNodeHtml - 根据传入节点的 json 对象创建该节点的 html 数据
 * @param node 节点的 json 对象
 * @param minder kityminder 实例
 * @returns {string} 返回的 html 字符串
 */
function getNodeHtml (node, minder){
    var data = node.data;
    var html = '';

    // 处理优先级
    if (data.priority){
        html += '<div class="priority priority-' + data.priority + '"></div>'
    }
    // 处理进度
    if (data.progress){
        html += '<div class="progress progress-' + data.progress + '"></div>'
    }

    // 处理超链接
    if (data.hyperlink) {
        html +='<a class="hyperlink" href="'+ data.hyperlink +'" target="_blank"></a>';
    }
    // 处理资源
    if (data.resource){
        $.each(data.resource, function(idx, ele){
            html += '<span class="resource" style="background-color: '+ minder.getResourceColor(ele).toRGB() +'">' + ele + '</span>' + ' ';
        });
    }

    // 处理文字
    if (data.text) {
        html += '<span class="text">' + (data.text || '') + '</span>';
    }
    return html;
}
