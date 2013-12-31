<?php
/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 13-10-11
 * Time: 下午5:17
 * To change this template use File | Settings | File Templates.
 */
header( "Content-type: text/html; charset=utf-8" );
$filter = array_key_exists( 'filter' , $_GET ) ? $_GET[ 'filter' ] : '*';
$quirk = array_key_exists( 'quirk' , $_GET );
$cov = array_key_exists( 'cov' , $_GET );
if ( !$quirk ) {
    ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<?php } ?>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Kity Test Index Page</title>
    <script type="text/javascript" src="js/tools.js"></script>
<!--    <script type="text/javascript" src="js/UserAction.js"></script>-->
    <script type="text/javascript" src="js/run.js"></script>
    <link media="screen" href="css/test.css" type="text/css"
          rel="stylesheet"/>
</head>
<body>
<div id="title">
    <h1>Kity Test Index Page</h1>
</div>

<!--浏览器插件，可调用windows api-->
<div>
    <object id="plugin" type="application/x-plugintest" width="1" height="1">
        <param name="onload" value="pluginLoaded"/>
    </object>
</div>

<div id="id_control" class="control">
    <input id="id_control_runnext" type="checkbox"/>自动下一个
    <input id="id_control_breakonerror" type="checkbox"/>出错时终止
    <input id="id_control_clearstatus" type="button" value="清除用例状态"
        onclick="removeClass(document.getElementById('id_testlist'),'running_case pass_case fail_case');"/>
</div>
<div>
    <a id="id_testlist_status" class="button"> <span
            onclick="slideToggle(document.getElementById('id_testlist');"> 折叠用例 </span> </a>
    <a id="id_srconly" class="button"><span
            onclick="slideToggle(document.getElementById('id_runningarea');">折叠执行</span> </a>
</div>
<div style="clear: both"></div>
<div id="id_testlist" class="testlist">
    <?php
    /*分析所有源码与测试代码js文件一一对应的文件并追加到当前列表中*/
    require_once "caseSource.php";
    Kiss::listcase( $filter ,$cov);
    ?>
    <div style="clear: both; overflow: hidden"></div>
</div>
<div id="id_runningarea" class="runningarea"
     style="border: solid; display: none"></div>
<div id="id_reportarea" class="reportarea" style="display: none;"></div>
<div class='clear'></div>
<div id="id_showSrcOnly" class="testlist" style="display: none;">
    <?php
    require_once "caseSource.php";
    Kiss::listSrcOnly( true );
    ?>
    <div class="clear"></div>
</div>
</body>
</html>