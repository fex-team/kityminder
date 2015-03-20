#!/bin/bash
echo '这是在mac系统上部署本地的kityminder的自动化部署脚本';
echo '@author dafei<wlfkongl@163.com>';

echo '';
echo '目前通过这个脚本可以在mac系统轻松的搭建本地的kityminder应用 , 但是它有缺陷 , 由于百度云不对个人账号开放 , 实际上它是没有存储系统的一个脑图 , 只能在本地使用.';
echo '';
echo '如果你搭建好了觉得不爽 , 你只要删除你本地的所有kityminder文件即可';
echo '';
echo '现在我们开始进入正题.';
echo '';
echo '请输入你的网站目录(建议是空目录,或者是不存在的目录):';
read documentRoot;

if [ ! -d "$documentRoot" ]; then
	echo "$documentRoot不存在,创建$documentRoot"
	mkdir -p $documentRoot;
fi
cd $documentRoot;

#从源码库获取代码
git clone https://github.com/fex-team/kityminder.git $documentRoot;


#安装模块
git submodule init;
git submodule update;

#本地安装
npm init;

#模块名字kityminder2
echo "请输入模块名字,默认(kityminder),如果不清楚,请留空";
read moduleName;
if [ -z "$moduleName" ]; then
	moduleName='kityminder';
fi
echo "使用模块名字$moduleName";
sudo npm install $moduleName --save-dev;
sudo npm install grunt-postcss

npm install;

#安装bower依赖

sudo npm install bower -g;

#安装需要的库(没有这步一些依赖的前端文件将编译不出来)

bower install;

#如果不存在

sudo npm install -g grunt-cli;

#初始化
grunt;

echo '';
echo '*************************';
echo '恭喜!';
echo '项目已经初始化完毕';
echo '*************************';
echo '';
echo '为了让项目正式可以运行 , 你还需要完成以下操作:(假设你本地的域名为:www.youdomain.com)';
echo '1) 用百度开发者账号登陆 , http://developer.baidu.com/; 找到开发者服务管理 , 点击创建工程; 进入新创建的工程 , 选择[其他api] ; 再选择[安全设置]; 在授权回调页面填写(不包括中括号)[http://www.youdomain.com/edit.html]; 在根域名绑定填写[youdomain.com]; 勾上限制访问OpenAPI的referer;然后确定';
echo '2) 在新创建的工程的基本信息 , 找到API key, 并复制;编辑项目根目录的index.html , 在大概27行找到apiKey[这个是naotu.baidu.com的apikey],用复制后的apikey替换文件中的apikey';

echo '现在可以访问http://www.youdomain.com了!';

echo '';
echo '如果你没有搭建网站的经验 , 请google或者百度 nginx搭建网站,apache搭建网站';

echo '另外 , 百度云不开放给个人使用 , 所以要自己配套云存储 , 具体怎么配套 , 就得看lib/fio/provider/netdisk/';
