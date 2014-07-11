( function () {

    // 用于存储整个快捷菜单的机构信息的字符串
    var helpInfo='';

    $.ajax( {
        type: 'get',
        dataType: 'text',
        url: 'dialogs/help/operation.txt',
        success: function(text) {
            createHelpHtml(text);
        }
    } );
    function createHelpHtml(text) {
        var txt = text;

        // 用于存储获取的某一行数据
        var line = '';
        // 用于临时存储处理一条line字符串之后的结果
        var result = '';
        // 判断是否为第一个份菜单，用于控制div.shortcuts-table标签前是否添加</div>。
        var isFirstTable = true;
        // // 判断是否为每份菜单的第一项
        // var isFirstTr = true;

        // 正则表达式 start
        // 1、匹配菜单分类标题
        var reg_thead = /^##/g;
        // 2、匹配菜单项
        var reg_tcell = /\:/g;
        // 3、匹配键值
        var reg_key = /\`(.+?)\`/g;
        // var 4、匹配快捷键组合选择
        var reg_opt= /or|\+|,/gi;
        // 菜单分类标题1
        var temp = '';
        var xmlhttp;
        var arr, keys, info;


        // help-container start
        helpInfo += '<div class="help-container">';
        // help-header start
        helpInfo += '<h2 class="help-header">操作说明</h2>';
        // help-header end
        // help-article start
        helpInfo += '<div class="help-article row">';
        // 开始读取operation.txt文件信息

        txt.split('\n').forEach(function(line) {
            result = '';

            // 如果line以##开头，表明是菜单分类标题
            if(reg_thead.test(line)) {

                // isFirstTr = true;
                // 如果不是第一个分类菜单，那么就需要在添加下一个开始标签之前，为上一个菜单添加结束标签
                if(!isFirstTable) {
                    result += '</table>';
                }
                // 处理第一个分类菜单后，就需要把标示第一个分类菜单的变量改变
                else {
                    isFirstTable = false;
                }
                temp = line.substring(line.lastIndexOf(" "));
                result += '<table class="shortcuts-table "><tr><td></td><td><span class="shortcuts-thead">' + temp + '</span></td>';
            }
            else if (/\S/.test(line)) {
            // else if(reg_tcell.test(line)) {

                result += '<tr class="shortcuts-tbody"><td class="shortcuts-group"><div class="right">';

                arr = line.split(':');
                keys = arr[0];
                info = arr[1];

                keys = keys.replace(reg_key, '<span class="shortcuts-key label $1">$1</span>');

                result += keys;

                result += '</div></td><td class="shortcuts-use">' + info + '</td>';
                // 加最后一项的结尾标签
                result += '</tr>';
            }

            // 处理完每一行之后，将result添加到helpInfo之后
            helpInfo += result;
            result = '';
        });

        // 要在处理完最后一个分类菜单后，为这个菜单添加结束标签
        helpInfo += '<table>';

        // 读取operation.txt文件信息完毕
        helpInfo += '</div>';
        // help-article end
        helpInfo += '</div>';
        // // help-container end
        // $("#help").html(helpInfo);

        KM.registerWidget( 'help', {
            tpl: helpInfo,
            initContent: function ( km ) {
                var lang = km.getLang( 'dialogs.help' ),
                    html;
                if ( lang ) {
                    html = $.parseTmpl( this.tpl, lang );
                }
                this.root().html( html );
            },
            initEvent: function ( km, $w ) {
                // var margin = 10px;
                // var table = $("table");//这里是区块名称
                // var table_W = table[0].offsetWidth + margin;//取区块的实际宽度（包含间距，这里使用源生的offsetWidth函数，不适用jQuery的width()函数是因为它不能取得实际宽度，例如元素内有pandding就不行了）
                // alert("me"); 
                // function pbl(){//瀑布流布局函数
                //     var h = [];//记录区块高度的数组
                //     var n = 2;//两列显示
                //     for(var i = 0;i < table.length;i++) {//有多少个table就循环多少次
                //         table_H = table[i].offsetHeight;//获取每个table的高度
                //         if(i < 2) {//n是一行最多的table，所以小于n就是第一行了
                //             h[i] = table_H;//把每个li放到数组里面
                //             table.eq(i).css("top",0);//第一行的Li的top值为0
                //             table.eq(i).css("left",i * table_W);//第i个li的左坐标就是i*li的宽度
                //             }
                //         else{
                //             min_H = Math.min.apply(null,h) ;//取得数组中的最小值，区块中高度值最小的那个
                //             minKey = getarraykey(h, min_H);//最小的值对应的指针
                //             h[minKey] += table_H + margin ;//加上新高度后更新高度值
                //             table.eq(i).css("top",min_H + margin);//先得到高度最小的Li，然后把接下来的li放到它的下面
                //             table.eq(i).css("left",minKey * table_W); //第i个li的左坐标就是i*li的宽度
                //         }
                //     }
                // }

                // /* 使用for in运算返回数组中某一值的对应项数(比如算出最小的高度值是数组里面的第几个) */
                // function getarraykey(s, v) {
                //     for(k in s) {
                //         if(s[k] == v) {
                //             return k;
                //         }
                //     }
                // }
            },
            width: 1000
        } );

    }
} )();