<?php
/**
 * Created by JetBrains PhpStorm.
 * User: dongyancen
 * Date: 13-10-10
 * Time: 上午1:17
 * To change this template use File | Settings | File Templates.
 */
header( "Content-type: text/html; charset=utf-8" );
header( "Cache-Control: no-cache, max-age=10, must-revalidate" );
if ( !array_key_exists( 'quirk' , $_GET ) ) {
    print '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
}
;
require_once "caseSource.php";
$c = new Kiss( $_GET[ 'case' ] );
$title = $c->name;
$cov = array_key_exists( 'cov' , $_GET );
?>
<html>
<head>
    <title>Jasmine Spec Runner</title>

    <link rel="shortcut icon" type="image/png" href="lib/jasmine-1.3.0/jasmine_favicon.png">
    <link rel="stylesheet" type="text/css" href="lib/jasmine-1.3.0/jasmine.css">
    <script type="text/javascript" src="lib/jasmine-1.3.0/jasmine.js"></script>
    <script type="text/javascript" src="lib/jasmine-1.3.0/jasmine-html.js"></script>
    <script type="text/javascript" src="js/ext_jasmine.js"></script>
    <?php $c->print_js($cov); ?>

</head>
<script type="text/javascript">
    //todo
    //     if (parent && parent.brtest) {
    //            parent.$(parent.brtest).trigger('done', [ new Date().getTime(), {
    //                failed : args[0],
    //                passed : args[1],
    //                detail:args[2]
    //            }, window._$jscoverage || null ]);
    //        }
    (function() {
        var jasmineEnv = jasmine.getEnv();
        jasmineEnv.updateInterval = 1000;

        var htmlReporter = new jasmine.HtmlReporter();

        jasmineEnv.addReporter(htmlReporter);

        jasmineEnv.specFilter = function(spec) {
            return htmlReporter.specFilter(spec);
        };

        var currentWindowOnload = window.onload;

        window.onload = function() {
            if (currentWindowOnload) {
                currentWindowOnload();
            }
            execJasmine();
        };

        function execJasmine() {
            jasmineEnv.execute();
        }

    })();
</script>
<body>
</body>
</html>