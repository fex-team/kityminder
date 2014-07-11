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
        var reg_key = /\`[\w\/]+\`/g;
        // var 4、匹配快捷键组合选择
        var reg_opt= /or|\+/gi;
        // 菜单分类标题1
        var temp = '';
        var xmlhttp;


        // help-container start
        helpInfo += '<div class="help-container">';
        // help-header start
        helpInfo += '<h2 class="help-header page-header">操作说明</h2>';
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
                result += '<table class="shortcuts-table "><tr><td></td><td><span class="label shortcuts-thead">' + temp + '</span></td>';
            }
            else {
            // else if(reg_tcell.test(line)) {

                result += '<tr class="shortcuts-tbody"><td class="shortcuts-group"><div class="right">';

                while ((arr = reg_key.exec(line)) != null) {
                    var arr1 = arr.toString();
                    result += '<span class="shortcuts-key label">' + arr1.substring(1,arr1.length-1) + '</span>';

                    var arr2 = reg_opt.exec(line);

                    if(arr2 != null){
                        result += '<span class="label shortcuts-opt">' + arr2 + '</span>';
                    }
                };


                temp = line.substring(line.lastIndexOf(" "));
                result += '</div></td><td class="shortcuts-use">' + temp + '</td>';
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
            initEvent: function ( km, $w ) {},
            width: 590
        } );
    }
} )();