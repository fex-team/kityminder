describe("command", function () {
    var kityMinderDiv  = document.createElement("div");
    kityMinderDiv.id = "kityminder";
    kityMinderDiv.style.height = "500px";
    kityMinderDiv.style.position = "relative";
    var obj;
    var km;



    beforeEach(function(){
    document.body.appendChild(kityMinderDiv);
        km = KM.getKityMinder('kityminder');
        obj = document.getElementById('kityminder');
    });

    afterEach(function(){
//        obj = null;
//        document.body.removeChild(kityMinderDiv);
    });




    it('',function(){

        console.log(obj);
    })
});