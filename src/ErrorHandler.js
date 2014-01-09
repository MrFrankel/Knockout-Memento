/**
 * @MementoStackFactory
 * @author Maor Frankel
 * @version 1.0.0
 * @constructor
 */

ko.msf.ErrorHandler =  (function(){
     /**
      * Throws a Memento exception
      * @param msg  String to add to Memento Error as an exception
      */
    var throwError = function (msg){
        var err = new Error();
        err.message = "ko.Memento Error: " + msg;
        throw err;
    };

    //Public
    return{
        throwError: throwError
    };
})();