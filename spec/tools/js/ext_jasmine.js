/**
 * Created with JetBrains PhpStorm.
 * User: dongyancen
 * Date: 13-10-17
 * Time: 上午2:24
 * To change this template use File | Settings | File Templates.
 */
/**
 * rewrite jasmine function to support batchrun
 */
(function() {
    if (!jasmine)
        return;
    var s = jasmine.Queue.prototype.start
//        ,n = jasmine.Queue.prototype.next_
        ,f = jasmine.Runner.prototype.finishCallback;
    function _f(self,args /* failures, total */) {
        //todo  写到调用HtmlReporter后
        /*another way to apply:
        *
        * var reporterView = self.env.reporter.subReporters_[0].getReporterView();
        *totalSpecCount,completeSpecCount,failedCount,passedCount
        *reporterView.views.specs[0].detail
        * */

        var totalSpecCount = 0,failedCount = 0,passedCount = 0;
        var tmpSpec = null;
        for(var i=0;i<self.suites_.length;i++){
            for(var j=0;j<self.suites_[i].specs_.length;j++){
                totalSpecCount++;
                tmpSpec = self.suites_[i].specs_[j].results_.items_;
                for(var k=0;k<tmpSpec.length;k++){
                if(tmpSpec[k].passed_){
                    passedCount++;
                }else{
                    failedCount++;
                }
                }
            }
        }
        //display failed Suite
//        $('li.fail ol').toggle();
             if (parent && parent.brtest) {
                parent.brtest.customTrigger('done', [ new Date().getTime(), {
                failed : failedCount,
                passed : passedCount,
                detail : self.suites_,
                total  : totalSpecCount
                    //todo jscoverage
            }, window._$jscoverage || null ]);
        }
    }
    jasmine.Runner.prototype.finishCallback = function(){
        f.apply(this, arguments);
        _f(this,arguments);
    };
    jasmine.Queue.prototype.start =function(){
        //todo
        /* wait for import.php return */
//        var h = setInterval(function() {
//            if (window && window['baidu']) {
//                clearInterval(h);
                s.apply(this, arguments);
//            }
//        }, 20);
    };

//    function _n(self,args /* failures, total */) {
        /* //  do not delete the following lines:
         // the last Queue in the file has done ,there is no more Suite or Queue
         if(self.index == self.blocks.length || (this.abort && !this.ensured[self.index])){
         }
         */
//    }
//    jasmine.Queue.prototype.next_ = function() {
//        _n(this,arguments);
//        n.apply(this, arguments);
//    };

})();