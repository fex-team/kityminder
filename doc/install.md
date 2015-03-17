##这是在mac系统下部署的过程

#从源码库获取代码
git clone https://github.com/fex-team/kityminder.git naotu.xxx.com;

cd naotu.xxx.com;

#安装模块
git submodule init;
git submodule update;

#本地安装
npm init;

#模块名字kityminder2
sudo npm install kityminder2 --save-dev;
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

/data1/htdocs/naotu.xxx.com


#需要在http://developer.baidu.com/
#登陆并在安全设置中增加回调地址

#同时获取到他的apikey
写入到edit.html


#ok , 到了这里 , 你可以在本地配置网站环境了(apache , nginx ) , 配置好了后就可以访问了.


#另外 , 百度云不开放给个人使用 , 所以要自己配套云存储 , 具体怎么配套 , 就得看lib/fio/provider/netdisk/
