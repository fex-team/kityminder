describe("node", function () {

    var root = new KM.MinderNode('root');
    var first = new KM.MinderNode('first');
    first.appendChild(new KM.MinderNode('first.first'));
    var second = new KM.MinderNode('second');
    second.appendChild(new KM.MinderNode('second.first'));
    root.appendChild(first);
    root.appendChild(second);
    describe('contains',function(){
        it('root contain first',function(){
            expect(root.contains(first)).toBeTruthy();
        });
        it('root contain first.first',function(){
            expect(root.contains(first.getFirstChild())).toBeTruthy();
        });
        it('first not contain second',function(){
            expect(root.contains(first.getFirstChild())).toBeTruthy();
        });
        it('first contain first',function(){
            expect(first.contains(first)).toBeTruthy();
        });
    });
    describe('getCommonAncestor',function(){
        it('first second commonAncestor is root',function(){
            expect(first.getCommonAncestor(second)).toBe(root);
        });
        it('root first.first commonAncestor is root',function(){
            expect(first.getFirstChild().getCommonAncestor(root)).toBe(root);
        });
        it('second.first first.first commonAncestor is root',function(){
            var a = first.getFirstChild(),b=second.getFirstChild();
            expect(a.getCommonAncestor(b)).toBe(root);
        });
    });
    describe('setData',function(){
        it('name and value both exist',function(){
            root.setData('test',1);
            expect(root.getData('test')).toBe(1);
        });
        it('name only exist clear property',function(){
            root.setData('test');
            expect(root.getData('test')).toBeUndefined();
        });
        it('name is object',function(){
            root.setData({
                'test':1
            });
            expect(root.getData('test')).toBe(1);
        });
        it('name and value both empty',function(){
            root.setData('test',1);
            root.setData('test1',2);
            root.setData();
            expect(root.getData('test')).toBeUndefined();
            expect(root.getData('test1')).toBeUndefined();
        });
    });
});