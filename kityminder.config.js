( function () {
    function getKMBasePath( docUrl, confUrl ) {

        return getBasePath( docUrl || self.document.URL || self.location.href, confUrl || getConfigFilePath() );

    }

    function getConfigFilePath() {

        var configPath = document.getElementsByTagName( 'script' );

        return configPath[ configPath.length - 1 ].src;

    }

    function getBasePath( docUrl, confUrl ) {

        var basePath = confUrl;


        if ( /^(\/|\\\\)/.test( confUrl ) ) {

            basePath = /^.+?\w(\/|\\\\)/.exec( docUrl )[ 0 ] + confUrl.replace( /^(\/|\\\\)/, '' );

        } else if ( !/^[a-z]+:/i.test( confUrl ) ) {

            docUrl = docUrl.split( "#" )[ 0 ].split( "?" )[ 0 ].replace( /[^\\\/]+$/, '' );

            basePath = docUrl + "" + confUrl;

        }

        return optimizationPath( basePath );

    }

    function optimizationPath( path ) {

        var protocol = /^[a-z]+:\/\//.exec( path )[ 0 ],
            tmp = null,
            res = [];

        path = path.replace( protocol, "" ).split( "?" )[ 0 ].split( "#" )[ 0 ];

        path = path.replace( /\\/g, '/' ).split( /\// );

        path[ path.length - 1 ] = "";

        while ( path.length ) {

            if ( ( tmp = path.shift() ) === ".." ) {
                res.pop();
            } else if ( tmp !== "." ) {
                res.push( tmp );
            }

        }

        return protocol + res.join( "/" );

    }
    window.KITYMINDER_CONFIG = {
        'KITYMINDER_HOME_URL': getKMBasePath(),
        //定义工具栏
        toolbars: [
            'hand | zoom-in zoom zoom-out | collapsenode expandnode | undo redo | bold italic | fontfamily fontsize forecolor | saveto | hyperlink unhyperlink | markers | node | help'
        ]
        //只读模式，默认是false
        //readOnly: true

        //设置主题
        //,defaultlayoutstyle : 'default' //设置默认的主题
        //,layoutstyle : []   //添加有那些主图

        //回退相关选项
        //,maxUndoCount:20  //最大可回退的次数，默认20

        //语言默认是zh-cn
        //,lang:'zh-cn'

        //设置km整体的z-index大小
        //,zIndex : 1000
        //设置初始加载时展开的层数和子节点数目阈值
        //默认是全部展开，0表示全部展开
        // ,
        // defaultExpand: {
        //     defaultLayer: 2,
        //     defaultSubShow: 5
        // }
        //配置放大缩小的比例
        //,zoom:[50,80,100,120,150,200]
    };
} )();