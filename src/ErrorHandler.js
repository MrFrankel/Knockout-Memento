/**
 * Created by Maor.Frankel on 12/31/13.
 */


 ko.MCT.ErrorHandler =  (function(){
    var throwError = function (msg){
        var err = new Error();
        err.message = "ko.MCT Error: " + msg;
        throw err;
    };

    //Public
    return{
        throwError: throwError
    };
})();