<?php
/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 13-12-10
 * Time: 上午1:48
 * To change this template use File | Settings | File Templates.
 */
header('Content-Type: text/javascript');
$import = 'import.js';
function custom_strEmpty($s){
    $str = strlen(trim($s));
    if(empty($str)){
       return true;
    }
    return false;
}
function importSrc(){
    require_once 'config.php';
    global $import;
   if(file_exists(Config::$projroot.Config::$test_PATH.$import)){
        $cnt = file_get_contents(Config::$projroot.Config::$test_PATH.$import);
    }
    if($cnt == ''){
        if(Config::$DEBUG)
            print "fail read file : ".Config::$test_PATH.$import;
        return '';
    }
    $is = array();
    $flag_ownSrc = 1;
    $caseName = $_GET[ 'f' ];
    $this_src = Config::$projroot.Config::$src_PATH.$caseName.".js";
    //正则匹配，提取所有(///import xxx;)中的xxx
    preg_match_all('/\/\/\/import\s+([^;]+);?/ies', $cnt, $is, PREG_PATTERN_ORDER);
    foreach($is[1] as $i) {
        if(strcasecmp($i,$caseName)==0){
            $flag_ownSrc = 0;
        }
        $path = $i . '.js';
        $srcFile = Config::$projroot . Config::$src_PATH . $path;
        if (file_exists($srcFile)) {
            echo "document.write('<script charset=utf-8 src=\"$srcFile\"></script>');\n";
        }
    }
    if(file_exists($this_src)){
        $file=fopen($this_src,"r");
        while(!feof($file))
        {
            $statment = fgets($file);
            if(custom_strEmpty($statment)){
                continue ;
            }else if(preg_match('/\/\/\/import\s+([^;]+);?/ies', $statment,$r)){
                echo "document.write('<script charset=utf-8 src=\"".Config::$projroot . Config::$src_PATH.$r[1].".js\"></script>');\n";
            }else{
                break;
            }
        }
        fclose($file);
    }
    //加载与用例同名的原文件,并避免重复加载
    if($flag_ownSrc){
        echo "document.write('<script charset=utf-8 src=\"".$this_src."\"></script>');\n";
    }
}
importSrc();