
describe("editor.range", function () {
    var _div = document.createElement('div');
    _div.setAttribute('contenteditable', true);

    var range = new KM.Minder.Range(_div);
    describe("getStartOffset",function(){


        _div.innerHTML = 'xxx<br\/><br\/>xxx<br\/>';
        it("选区在容器上", function () {

            range.startContainer = _div;
            range.startOffset = 2;
            expect(range.getStartOffset()).toBe(4);
        });
        it("选区在文本节点上", function () {

            range.startContainer = _div.childNodes[3];
            range.startOffset = 2;
            expect(range.getStartOffset()).toBe(7);
        });


    });
    describe("setStartOffset",function(){


        _div.innerHTML = 'sdfsdfsdfsdf<br><br>sdf3<br>23232<br>';
        it("选区在容器上", function () {
            range.container = _div;
            debugger
            range.setStartOffset(26);

            expect(range.startContainer).toBe(_div);
        });
//        it("选区在文本节点上", function () {
//
//            range.startContainer = _div.childNodes[3];
//            range.startOffset = 2;
//            expect(range.getStartOffset()).toBe(7);
//        });


    })

});
