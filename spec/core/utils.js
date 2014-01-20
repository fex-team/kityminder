describe("utils", function () {


    describe('compareObject',function(){
        var obj1 = {
            'test':[1,2],
            'test1':1
            };
        var obj2 = utils.clonePlainObject(obj1);

        it('相等',function(){
            expect(utils.compareObject(obj1,obj2)).toBeTruthy();
        });
        it('长度不同',function(){
            obj2.test2 = '1';
            expect(utils.compareObject(obj1,obj2)).toBeFalsy();
        })

        it('数组中的数据不同',function(){
            obj1.test[2] = {};
            expect(utils.compareObject(obj1,obj2)).toBeFalsy();
        })
    });

});