/**
 * Created by dongyancen on 14-3-26.
 */
var fs = require('fs');
var browsers = ['Chrome', 'Firefox', 'PhantomJS', 'IE'];
var result_forBrowser = {};
var jsonFileBasePath = './spec/coverage/json_files/';
var jsonFiles = fs.readdirSync(jsonFileBasePath);
var finalJsonFile = 'defaultFileName';
var curPath = '/spec';
var resultPath = 'spec/coverage';

//找出所有的json文件
for (var i = 0; i < jsonFiles.length; i++) {
    // json文件名必须是有8位的日期和6位的时间戳如:-20140326_161249
    if (!isJsonFiles(jsonFiles[i])) {
        jsonFiles.splice(i, 1);
        i--;
    }
}
//没有找到合适的文件
if(jsonFiles.length==0)return;

//先排序 按时间从小到大 及从旧到新
jsonFiles.sort(function (f1, f2) {
    var t1 = getFileTime(f1);//形如['-20140326_161249','20140326','161249']
    var t2 = getFileTime(f2);
    var dateDiff = parseInt(t1[1]) - parseInt(t2[1]);
    if (dateDiff != 0)return dateDiff;
    else return parseInt(t1[2]) - parseInt(t2[2]);
});
//以时间命名新的文件
finalJsonFile = getFileTime(jsonFiles[jsonFiles.length-1])[0].substring(1);
//如:20140326_161249

//取最新的
// 按浏览器类型分类 result_forBrowser属性形如:{'Crome':'filename1','Firefox':'filename2'}
for (i = 0; i < jsonFiles.length; i++) {
    for (var j = 0; j < browsers.length; j++) {
        if (eval('/' + browsers[j] + '/.test("' + jsonFiles[i] + '");')) {
            eval('result_forBrowser.' + browsers[j] + '="' + jsonFiles[i] + '";');
        }
    }
}

//以上得到所有要合计的json文件
//读取,合计数字,需要合计的属性: 's' 'b' 'f' 'l'
//修正路径
var jsonToWrite = null;
for (var a in result_forBrowser) {
    var r = fs.readFileSync(jsonFileBasePath + result_forBrowser[a]);
    if (!jsonToWrite) {
        jsonToWrite = JSON.parse(r);
        continue;
    } else {
        jsonToWrite = mergeResult(jsonToWrite, JSON.parse(r));
    }
}


//写文件
fs.writeFileSync(jsonFileBasePath+finalJsonFile+'.json',JSON.stringify(jsonToWrite));

function isJsonFiles(fileName) {
    var e = fileName.substring(fileName.lastIndexOf(".") + 1);
    // json文件名必须是有8位的日期和6位的时间戳如:-20140326_161249
    //否则无法判断文件生成时间,也就无法合并同一次运行产生的结果
    return e == 'json' && getFileTime(fileName);
}
function getFileTime(fileName) {
    // json文件名必须是有8位的日期和6位的时间戳如:-20140326_161249
    return fileName.match(/-(\d{8})_(\d{6})/);
}
function mergeResult(allR, addR) {
    var resultR = {};
    for (var allRKey in allR) {

        if (addR[allRKey]) {

            allR[allRKey] = mergeDetail(allR[allRKey], addR[allRKey], 's', 1);
            allR[allRKey] = mergeDetail(allR[allRKey], addR[allRKey], 'f', 1);
            allR[allRKey] = mergeDetail(allR[allRKey], addR[allRKey], 'l', 1);
            allR[allRKey] = mergeDetail(allR[allRKey], addR[allRKey], 'b', 2);
        }
        //修正路径
        resultR[fixPath(allRKey)] = allR[allRKey]
    }
    return resultR;
}
//type = 1 合并 s f l ,如:{"1":1,"2":1,"3":1}
//type = 2 合并 b ,如:{"1":[0,0],"2":[0,0]}
function mergeDetail(allEle, addEle, attrName, type) {

    if (allEle[attrName] && addEle[attrName]) {
        if (type == 1) {
            for (var k in allEle[attrName]) {
                //todo 现在没有考虑两个文件中同一项覆盖率的统计行数不一致的问题
                if ( parseInt(allEle[attrName][k])==0 &&  parseInt(addEle[attrName][k]) ==1) {
                    allEle[attrName][k] = 1;
                }
            }
        }
        else if (type == 2) {
            for (var k in allEle[attrName]) {
                //todo 现在没有考虑两个文件中同一项覆盖率的统计行数不一致的问题
                if (addEle[attrName][k]) {
                    if (parseInt(allEle[attrName][k][0])==0 &&parseInt(addEle[attrName][k][0])==1 ) {
                        allEle[attrName][k][0] = 1;
                    }
                    if (parseInt(allEle[attrName][k][1])==0 &&parseInt(addEle[attrName][k][1])==1 ) {
                        allEle[attrName][k][1] = 1;
                    }
                }
            }
        }
    }
    return allEle;
}
//修正路径
function fixPath(oldPath){
    //例如把 "D:/workspace/ufinder/_src/core/finder.js" 修正为
    // spec/coverage/_src/core/finder.js  注意这里一定要用相对路径(相对于_spec/coverage)
    var s = __dirname.replace(/\\/g,'/');
    if(s.lastIndexOf(curPath)){
        s = s.substring(0,s.lastIndexOf(curPath) );
    }
    oldPath = oldPath.replace(s,resultPath);
    return oldPath;
}
console.log(finalJsonFile);