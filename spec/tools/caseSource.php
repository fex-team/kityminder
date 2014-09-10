<?php
/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 13-10-10
 * Time: 上午1:20
 * To change this template use File | Settings | File Templates.
 */
require_once 'config.php';
class Kiss
{
    public $projroot ;

    public $name;

    public $srcPath;

    public $testPath;

    public $empty = false;

    public $case_id;

    function __construct(  $name = ''  )
    {
        $this->projroot = Config::$projroot;
        $this->srcPath = Config::$projroot.Config::$src_PATH;
        $this->testPath = Config::$projroot.Config::$test_PATH;
        $this->name = $name;
        $this->case_id = 'id_case_' . join( '_' , explode( '.' , $name ) );
    }
    public function print_js(  $cov)
    {

        if($cov){
            $basePath =  '../../spec/coverage';
        }
        else{
            $basePath =  '../../src';
        }

//        print "<script src='../../dist/dev.php'></script>";

        print "<script type='text/javascript' src='./js/UserAction.js' ></script>\n";

        /* load case and case dependents*/
        $ps = explode( '/' , $this->name );
        /*load helper*/
        foreach(Config::$helperFiles as $f){
            if ( file_exists( $this->testPath .  $f  ) ) {
                print '<script type="text/javascript" src="' . $this->testPath . $f  . '"></script>' . "\n";
            }
        }





        //先引用kity
        print "<script src='../../lib/jquery-2.1.0.min.js'></script>\n";
        print "<script src='../../lib/jquery.xml2json.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/jquery.transit.min.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/jquery.blob.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/zip.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/promise-1.0.0.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/ZeroClipboard.min.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/fui/dev-lib/jhtmls.min.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/fui/dist/fui.all.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/fio/src/fio.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/fio/provider/netdisk/oauth.js' charset='utf-8'></script>\n";
        print "<script src='../../lib/fio/provider/netdisk/netdisk.js' charset='utf-8'></script>\n";



        print "<script src='../../lib/kity/dist/kity.js' charset='utf-8'></script>\n";

        //分成两部分:一部分默认加载(可配置),一部分针对文件加载(例如在文件头部有注释标注依赖文件,根据依赖文件动态加载)
        // core里面的文件全部加载,module加载用例对应的src文件,最后加载与用例同名的原文件
        $importurl = "{$this->testPath}tools/import.php?f=$this->name";
        if ( $cov ) $importurl .= '^&cov=true';
        print "<script type='text/javascript' src='".$importurl."' ></script>\n";

        print "<script src='../../kityminder.config.js' charset='utf-8'></script>\n";
        print "<script src='../../lang/zh-cn/zh-cn.js' charset='utf-8'></script>\n";
        print "<script type='text/javascript'>zip.inflateJSPath = '../../lib/inflate.js';</script>\n";
        print "<script type='text/javascript'>window._bd_share_config={'common':{'bdSnsKey':{},'bdMini':'2','bdMiniList':[],'bdPic':'','bdStyle':'1','bdSize':'32'},'share':{}};with(document)0[(getElementsByTagName('head')[0]||body).appendChild(createElement('script')).src='http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion='+~(-new Date()/36e5)];</script>\n";
//        print "<script>zip.inflateJSPath = '../../lib/inflate.js';</script>\n";
//        print "<script src='../../lib/baidu-frontia-js-full-1.0.0.js' charset='utf-8'></script>\n";
//        print "<script src='../../social/draftmanager.js' charset='utf-8'></script>\n";
//        print "<script src='../../social/social.js' charset='utf-8'></script>\n";


        //引用测试文件
        print '<script type="text/javascript" src="' .$this->testPath.$this->name. '.js"></script>' . "\n";

        print "<link href='../../ui/theme/default/css/default.all.css' rel='stylesheet'>\n";
//        print "<link href='../../themes/default/css/import.css' type='text/css' rel='stylesheet' />\n";
        print "<link href='../../favicon.ico' type='image/x-icon' rel='shortcut icon'>\n";
        print "<link href='../../favicon.ico' type='image/x-icon' rel='apple-touch-icon-precomposed'>\n";
    }
    public function match( $matcher )
    {
        if ( $matcher == '*' )
            return true;
        $len = strlen( $matcher );

        /**
         * 处理多选分支，有一个成功则成功，filter后面参数使用|切割
         * @var unknown_type
         */
        $ms = explode( ',' , $matcher );
        if ( sizeof( $ms ) > 1 ) {
            foreach ( $ms as $matcher1 ) {
                if ( $this->match( $matcher1 ) )
                    return true;
            }
            return false;
        }

        /**
         * 处理反向选择分支
         */
        if ( substr( $matcher , 0 , 1 ) == '!' ) {
            $m = substr( $matcher , 1 );
            if ( substr( $this->name , 0 , strlen( $m ) ) == $m )
                return false;
            return true;
        }

        if ( $len > strlen( $this->name ) ) {
            return false;
        }
        return substr( $this->name , 0 , $len ) == $matcher;
    }
    public static function listcase( $matcher = "*" ,$cov)
    {

        require_once 'fileHelper.php';
        /*get files both in src path and test path*/
        $caselist = getSameFile(Config::$projroot.Config::$src_PATH , Config::$projroot.Config::$test_PATH , '' );
        sort($caselist,SORT_STRING);
        foreach ( $caselist as $caseitem ) {
            /*remove '.js' */
            $name = substr( $caseitem , 0 , -3 );
            $c = new Kiss(  $name );
            if ( $c->empty )
                continue;
            if ( $c->match( $matcher ) ) {
                $newName = explode( '\\.' , $name );
                $newName = $newName[ count( $newName ) - 1 ];

                if($cov){
                    $covMsg = "&cov=true";
                }else{
                    $covMsg="";
                }
                print( "<a href=\"run.php?case=$name".$covMsg."\" id=\"$c->case_id\"  target=\"_blank\" title=\"$name\" onclick=\"run('$name');return false;\">". $newName . "</a>" );
            }
        }
    }
    public static function listSrcOnly( $print = true  )
    {
        $srcpath = Config::$projroot.Config::$src_PATH;
        $testpath = Config::$projroot.Config::$test_PATH;
        require_once 'fileHelper.php';
        $caselist = getSameFile( $srcpath , $testpath , '' );
        $srclist = getSrcOnlyFile( $srcpath , $testpath , '' );
        $srcList = array();
        foreach ( $srclist as $case ) {
            if ( in_array( $case , $caselist ) )
                continue;
            $name = str_replace( '/' , '.' , substr( $case , 0 , -3 ) );
            $tag = "<a  title=\"$name\">" . ( strlen( $name ) > 20 ? substr( $name , 6 )
                    : $name ) . "</a>";
            array_push( $srcList , $tag );
            if ( $print )
                echo $tag;
        }
        return $srcList;
    }
}