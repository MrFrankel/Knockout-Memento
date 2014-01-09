/**
 * Created by Maor.Frankel on 12/29/13.
 */

var ErrorHandler = ko.StateManager.ErrorHandler;
var stackConstructor = ko.StateManager.Stack;
var mementoConstructor = stackConstructor.Memento;

var mockObservable = function (scope){

}
describe("knockout_memento testing", function() {
    describe("Error Handling tests", function() {
        it("Should throw an error", function() {
            expect(ErrorHandler.throwError).toThrow();
        });
        var msg = "a different error occurred";
        var expected = "ko.StateManager Error: " + msg;
        it("should throw an error with a given message", function() {
            expect(ErrorHandler.throwError(msg)).toThrow((new Error().message = expected));
        });
    })
});
/*
module("");

test("Testing if error thrown", function(){
    expect(ErrorHandler.throwError()
        Error,"Must throw an error to pass");

    var msg = "a different error occurred";
    var expected = "ko.StateManager Error: " + msg;
    raises(function (){
            ko.StateManager.ErrorHandler.throwError(msg);},
        function(e) {
            return e.message === expected;},
        "Message must be as expected to pass");
});

module("Memento Tests",{
    setup: function(){
        mockObservable(this);
    }
});

test("Test Memento creation and functionality", function() {
    var dummyContex = {};
    var initValue = 20;
    var newValue = 50;
    dummyContex.testSubject = ko.observable(initValue);
    var memento = new mementoConstructor(dummyContex, dummyContex.testSubject, initValue);
    ok(memento instanceof mementoConstructor, "An object of type memento must have been created");
    var dupMemento = memento.duplicate();
    ok(dupMemento instanceof mementoConstructor, "Duplicate memento must be of type Memento");
    dummyContex.testSubject(newValue);
    strictEqual(dummyContex.testSubject(), newValue, "The test observable must have changed value to newValue");
    ok(memento.trigger(), "Trigger function must return true to signal passed");
    strictEqual(dummyContex.testSubject(), initValue, "The test observable must have changed back to initValue");
    dummyContex.testSubject(newValue);
    ok(dupMemento.trigger(), "Trigger function must return true to signal passed");
    strictEqual(dummyContex.testSubject(), initValue, "The test observable must have changed back to newValue");
    var memento = new mementoConstructor(dummyContex, dummyContex.testSubject, initValue);
    memento.clearForGc();
    ok(memento.trigger === undefined && memento.duplicate === undefined && memento.clearForGc === undefined, "All props of memento have been cleared for gc");


});

module("Stack Tests",{
    setup: function(){
        mockObservable(this);
    }});
test("Test stack creation and basic functionality", function() {
    var dummyContex = {};
    var initValue = 20;
    var newValue = 50;
    dummyContex.testSubject = ko.observable(newValue);
    var stack = new stackConstructor({errHandler:ErrorHandler});
    ok(stack instanceof ko.StateManager.Stack,"An object of type Stack must have been created");
    stack.stackChange(dummyContex,dummyContex.testSubject, initValue);
    stack.triggerUndo();
    strictEqual(dummyContex.testSubject(), initValue, "The test observable must have changed back to initValue");
    stack.triggerRedo();
    strictEqual(dummyContex.testSubject(), newValue, "The test observable must have changed back to newValue");
});
/*
test("Test stack Api", function() {
    var hMan = new HistoryManager();
    var elem = {};
    elem.subject = ko.observable();
    hMan.stackChange(elem,  elem.subject, 10);
    elem.subject(20);
    hMan.triggerUndo();
    equal(elem.subject(), 10, "observable result has been redone");
});

test("test registerObservable is undoable", function() {
    var hMan = new HistoryManager();
    var elem = {};
    elem.subject = ko.registerdObservable(10, elem,hMan);
    elem.subject(20);
    elem.subject(50);
    hMan.triggerUndo();
    hMan.triggerUndo();
    equal(elem.subject(), 10, "registerdObservable is updating in hMan");
});*/