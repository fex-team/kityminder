
describe("editor.receiver", function () {
    debugger
    var _div = window.document.createElement('div');
    _div.id ="testDiv";
    var km = KM.getMinder('testDiv');
    var sel = new KM.Minder.Selection();
    var range = new KM.Minder.Range();
    var receiver = new KM.Minder.Receiver(this,sel,range);

    describe("getStartOffset",function(){

//
//        _div.innerHTML = 'xxx<br\/><br\/>xxx<br\/>';
//        it("选区在容器上", function () {
//
//            range.startContainer = _div;
//            range.startOffset = 2;
//            expect(range.getStartOffset()).toBe(4);
//        });
//        it("选区在文本节点上", function () {
//
//            range.startContainer = _div.childNodes[3];
//            range.startOffset = 2;
//            expect(range.getStartOffset()).toBe(7);
//        });


    })

});
