describe("utils", function () {
    var kityMinderDiv  = document.createElement("div");
    kityMinderDiv.id = "kityminder";
    kityMinderDiv.style.height = "500px";
    kityMinderDiv.style.position = "relative";
    var obj;
    var km;
    var flag = true;


    beforeEach(function(){
        if(flag){
            document.getElementById('HTMLReporter').appendChild(kityMinderDiv);
            km = KM.getKityMinder('kityminder');
            obj = document.getElementById('kityminder');
            flag = false;
        }
    });

    afterEach(function(){
//        document.body.removeChild(kityMinderDiv);
//        console.log(km);

    });


//        var kityMinderDiv  = document.createElement("div");
//        kityMinderDiv.id = "kityminder";
//        kityMinderDiv.style.height = "500px";
//        kityMinderDiv.style.position = "relative";
//        var obj;
//        var km;
//        var flag = true;
//
//        if(flag){
//            document.body.appendChild(kityMinderDiv);
//            km = KM.getKityMinder('kityminder');
//            obj = document.getElementById('kityminder');
//            flag = false;
//        }



    describe('compareObject',function(){
        var obj1 = {
            'test':[1,2],
            'test1':1
            };
        var obj2 = utils.clonePlainObject(obj1);

        it('相等',function(){
//            console.log(km);
            console.log(document.getElementById('kityminder'));

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
    });describe('compareObject',function(){
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
    });describe('compareObject',function(){
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
    });describe('compareObject',function(){
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