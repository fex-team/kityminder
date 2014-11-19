/**
 * @fileOverview
 *
 * 插入和管理图片
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

KityMinder.registerUI('ribbon/idea/image', function(minder) {

    var $attachment = minder.getUI('ribbon/idea/attachment');

    var $imageButtonMenu = new FUI.ButtonMenu({
        id: 'image-button-menu',
        text: minder.getLang('ui.image'),
        layout: 'bottom',
        buttons: [{}, {
            label: minder.getLang('ui.image')
        }],
        menu: {
            items: [minder.getLang('ui.removeimage')]
        }
    }).appendTo($attachment);

    $imageButtonMenu.bindCommandState(minder, 'image');

    var $imageDialog = new FUI.Dialog({
        width: 600,
        height: 600,
        prompt: true,
        className: 'image-dialog',
        caption: minder.getLang('ui.image')
    }).appendTo(document.getElementById('content-wrapper'));

    var $dialogBody = $($imageDialog.getBodyElement());

    // writed by yangxiaohu 2014-10-20
    var tabs = new FUI.Tabs( {
        buttons: [ "图片搜索", "插入图片" ]
    } );

    $dialogBody.html([
        '<div id="img_buttons"></div>',
        '<div id="img_panels"></div>'
        ].join(''));
    tabs.appendButtonTo( document.getElementById( 'img_buttons') );
    tabs.appendPanelTo( document.getElementById( 'img_panels'));

    tabs.getPanel(0).getContentElement().innerHTML =  ['<div class="searchBar"><label>关键字：</label><input id="img_searchTxt" type="text" placeholder="请输入搜索关键词">',
        '<button id="img_searchBtn">百度一下</button></div>',
        '<div id="img_searchList"><ul id="img_searchListUl"></ul></div>'
        ].join('');

    tabs.getPanel(1).getContentElement().innerHTML =  ['<p><label>图片地址：</label><input type="url" class="image-url fui-widget fui-selectable" /></p>',
        '<p><label>提示文本：</label><input type="text" class="image-title fui-widget fui-selectable" /></p>',
        '<img class="image-preview" src="" style="max-height: 200px;" />'].join('');

    //the content below is from xujinquan's ueditor
    /*搜索图片 */

    $G = function ( id ) {
        return document.getElementById( id )
    };

    function SearchImage() {
        this.init();
    }

    SearchImage.prototype = {
        lang: {
             searchRemind : '请输入搜索关键词',
             searchLoading : '图片加载中，请稍后……',
             searchRetry : '抱歉，没有找到图片！请重试一次！',
        },
        data: {
            imgUrl: '',
            imgTitle: '',
        },
        init: function () {
            this.initEvents();
        },
        initEvents: function(){
            var _this = this;

            /* 点击搜索按钮 */
            $('#img_searchBtn').on('click', function(){
                var key = $G('img_searchTxt').value;
                if(key && key != _this.lang.searchRemind) {
                    _this.getImageData();
                }
            });
            /* 搜索框聚焦 */
            $('#img_searchTxt').on('focus', function(){
                var key = $G('img_searchTxt').value;
                if(key && key == _this.lang.searchRemind) {
                    $G('img_searchTxt').value = '';
                }
            });
            /* 搜索框回车键搜索 */
            $('#img_searchTxt').on('keydown', function(e){
                var keyCode = e.keyCode || e.which;
                if (keyCode == 13) {
                    $G('img_searchBtn').click();
                    return false;
                }
            });

            /* 选中图片 */

            $('#img_searchList').on('click', function(e){
                var target = e.target || e.srcElement,
                    $li = $(target).closest('li');

                _this.data.imgUrl = $li.find('img').attr('src');
                _this.data.imgTitle = $li.find('span').attr('title');

                $li.siblings('.selected').removeClass('selected');
                $li.addClass('selected');
            });
        },
        /* 改变图片大小 */
        scale: function (img, w, h) {
            var ow = img.width,
                oh = img.height;

            if (ow >= oh) {
                img.width = w * ow / oh;
                img.height = h;
                img.style.marginLeft = '-' + parseInt((img.width - w) / 2) + 'px';
            } else {
                img.width = w;
                img.height = h * oh / ow;
                img.style.marginTop = '-' + parseInt((img.height - h) / 2) + 'px';
            }
        },
        getImageData: function(){
            var _this = this,
                key = $G('img_searchTxt').value,
                keepOriginName = '1';
                url = "http://image.baidu.com/i?ct=201326592&cl=2&lm=-1&st=-1&tn=baiduimagejson&istype=2&rn=3200&fm=index&pv=&word=" + key + "&ie=utf-8&oe=utf-8&keeporiginname=" + keepOriginName + "&" + +new Date;

            $G('img_searchListUl').innerHTML = _this.lang.searchLoading;
            $.ajax({url : url,
                    dataType: 'jsonp',
                    scriptCharset: 'GB18030',
                    success:function(json){
                        var list = [];
                        if(json && json.data) {
                            for(var i = 0; i < json.data.length; i++) {
                                if(json.data[i].objURL) {
                                    list.push({
                                        title: json.data[i].fromPageTitleEnc,
                                        src: json.data[i].objURL,
                                        url: json.data[i].fromURL
                                    });
                                }
                            }
                        }
                        _this.setList(list);
                    },
                    error:function(){
                        $G('img_searchListUl').innerHTML = _this.lang.searchRetry;
                }
            });
        },
        /* 添加图片到列表界面上 */
        setList: function (list) {
            var i, item, p, img, title, _this = this,
                listUl = $G('img_searchListUl');

            listUl.innerHTML = '';
            if(list.length) {
                for (i = 0; i < list.length; i++) {
                    item = document.createElement('li');
                    img = document.createElement('img');
                    title = document.createElement('span');

                    img.setAttribute('src', list[i].src);
                    title.innerHTML = list[i].title;

                    item.appendChild(img);
                    item.appendChild(title);
                    listUl.appendChild(item);

                    img.onerror = function() {
                        $(this).closest('li').remove();
                    };
                }
            } else {
                listUl.innerHTML = _this.lang.searchRetry;
            }
        },
        getInsertList: function () {
            var child,
                src,
                align = getAlign(),
                list = [],
                items = $G('img_searchListUl').children;
            for(var i = 0; i < items.length; i++) {
                child = items[i].firstChild && items[i].firstChild.firstChild;
                if(child.tagName && child.tagName.toLowerCase() == 'img' && $(items[i]).hasClass('selected')) {
                    src = child.src;
                    list.push({
                        src: src,
                        _src: src,
                        alt: src.substr(src.lastIndexOf('/') + 1),
                        floatStyle: align
                    });
                }
            }
            return list;
        }
    };

    var searchImage = new SearchImage();
    // the end content writed by yangxiaohu

    var $url = $dialogBody.find('.image-url');
    var $title = $dialogBody.find('.image-title');
    var $preview = $dialogBody.find('.image-preview');
    var $errorMsg = $('<span class="validate-error"></span>');

    $imageDialog.on('ok', function() {
        var index = tabs.getSelectedIndex();

        switch(index) {
            case 1:
                minder.execCommand('image', $url.val(), $title.val());
                break;
            case 0:
                minder.execCommand('image', searchImage.data.imgUrl, searchImage.data.imgTitle);
                break;
        }

    });

    $imageDialog.on('open', function() {
        var image = minder.queryCommandValue('image');
        $url.val(image.url);
        $title.val(image.title);
        $preview.attr('src', image.url || '');
        error(false);
    });

    function error(value) {
        if (value) {
            $url.addClass('validate-error');
            $errorMsg.text('图片无法加载');
            // $ok.disable();
        } else {
            $url.removeClass('validate-error');
            $errorMsg.text('');
            // $imageDialog.enable();
        }
        return value;
    }

    $url.after($errorMsg);

    $url.on('input', function() {
        var url = $url.val();
        if (/^https?\:\/\/(\w+\.)+\w+/.test(url)) {
            $preview.attr('src', url);
            error(false);
            // $imageDialog.disable();
            $preview.addClass('loading');
        } else {
            error(true);
        }
    });

    $preview.on('load', function() {
        error(false);
        $preview.removeClass('loading');
    }).on('error', function() {
        if ($preview.attr('src')) error(true);
        $preview.removeClass('loading');
    });

    $imageButtonMenu.on('buttonclick', function() {
        $imageDialog.open();
        $url[0].focus();
    });

    $imageButtonMenu.on('select', function() {
        minder.execCommand('removeimage');
    });

    return $imageButtonMenu;
});