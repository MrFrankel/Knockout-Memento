suite("ErrorHandlerTest");
test("throw a message", function(){
       test("should print out, an error occured", function(){
            var errH = new ErrorHandler();
           expect(errH.throwError("an error occured")).to.throw(Error);
       })
 })
