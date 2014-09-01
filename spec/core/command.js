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
        kityMinderDiv.style.display = "block";
    });

    afterEach(function(){
        obj = null;
        kityMinderDiv.style.display = "none";
        document.body.removeChild(kityMinderDiv);
    });




    it('',function(){

        console.log(obj);
    })
});