describe("minder.command", function () {
    //初始化kityminder
    var kityMinderDiv  = document.createElement("div");
    kityMinderDiv.id = "kityminder";
    kityMinderDiv.style.height = "500px";
    kityMinderDiv.style.position = "relative";
    var obj;
    var km;

    beforeEach(function(){
        document.body.appendChild(kityMinderDiv);
        km = KM.getMinder('kityminder', window.KITYMINDER_CONFIG);
        obj = document.getElementById('kityminder');
    });

    afterEach(function(){
//        obj = null;
//        document.body.removeChild(kityMinderDiv);
    });
    //kityminder初始化end


    it('',function(){

    })
});