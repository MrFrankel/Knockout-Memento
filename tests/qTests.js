/**
 * Created by Maor.Frankel on 12/29/13.
 */
QUnit.config.autostart = false;
/*
Maintain all reference globally so we can change them easily in case of changes
 */

var MCT = ko.MCT;
var ErrorHandler = MCT.ErrorHandler;
var stackConstructor = MCT.MStack;
var mementoConstructor = stackConstructor.Memento;

var mockObservable = function (){
    dummyContex = {};
    initValue = 20;
    newValue = 50;
    dummyContex.testSubject = ko.observable(initValue);
}
module("knockout_memento testing")
module("Error Handler test");

test("Testing if error thrown", function(){
    raises(function (){
            ErrorHandler.throwError();},
        Error,"Must throw an error to pass");

    var msg = "a different error occurred";
    var expected = "ko.MCT Error: " + msg;
    raises(function (){
            ErrorHandler.throwError(msg);},
        function(e) {
            return e.message === expected;},
        "Message must be as expected to pass");
});

module("Memento Tests",{
    setup: function(){
        mockObservable();
    }
});

test("Test Memento creation and functionality", function() {
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
        mockObservable();
    }});
test("Test stack creation and basic functionality", function() {
    dummyContex.testSubject(newValue);
    var stack = new stackConstructor({errHandler:ErrorHandler});
    ok(stack instanceof stackConstructor,"An object of type Stack must have been created");
    stack.stackChange(dummyContex,dummyContex.testSubject, initValue);
    stack.triggerUndo();
    strictEqual(dummyContex.testSubject(), initValue, "The test observable must have changed back to initValue");
    stack.triggerRedo();
    strictEqual(dummyContex.testSubject(), newValue, "The test observable must have changed back to newValue");
});

test("Test stack Api", function() {
    var stack = new stackConstructor({errHandler:ErrorHandler});
    stack.stopListening();
    stack.stackChange(dummyContex, dummyContex.testSubject, initValue);
    ok(!stack.triggerUndo(), "Trigger undo should return false if stack is empty after not listening");
    stack.resumeListening();
    stack.stackChange(dummyContex, dummyContex.testSubject, initValue);
    ok(stack.triggerUndo(), "Trigger undo should return true if stack is not empty after resume listening");
    stack.stackChange(dummyContex, dummyContex.testSubject, initValue);
    stack = new stackConstructor({errHandler:ErrorHandler});
    ok(!stack.triggerUndo(), "Trigger undo should return false if stack is clean after creation");
    stack.stackChange(dummyContex, dummyContex.testSubject, initValue);
    stack.reInit();
    ok(!stack.triggerUndo(), "Trigger undo should return false if stack is really after reInit");
    var stack2 = new stackConstructor({errHandler:ErrorHandler});
    ok(stack !== stack2, "Creation of stack is creates a new instance");
    stack2.startSequencing();
    stack2.stackChange(dummyContex, dummyContex.testSubject, initValue);
    stack2.stackChange(dummyContex, dummyContex.testSubject, initValue*2);
    stack2.stopSequencing();
    stack2.triggerUndo();
    strictEqual(dummyContex.testSubject(), initValue, "After sequencing, value should return to initValue");
    raises(function (){
            stack2.stopSequencing();},
        Error,"Throws error");
    stack2.startSequencing();
    stack2.stackChange(dummyContex, dummyContex.testSubject, initValue);
    stack2.startSequencing();
    stack2.stackChange(dummyContex, dummyContex.testSubject, initValue*2);
    stack2.stopSequencing();
    stack2.stackChange(dummyContex, dummyContex.testSubject, initValue*3);
    stack2.stopSequencing();
    stack2.triggerUndo();
    strictEqual(dummyContex.testSubject(), initValue, "After nested sequencing, value should return to initValue");
    stack = new stackConstructor({errHandler:ErrorHandler}, {discardeUndefined:false});
    stack.stackChange(dummyContex, dummyContex.testSubject, undefined);
    strictEqual(stack.triggerUndo(),true, "TriggerUndo should return true if it undefined values were registered");
    stack = new stackConstructor({errHandler:ErrorHandler}, {discardeUndefined:true});
    stack.stackChange(dummyContex, dummyContex.testSubject, undefined);
    strictEqual(stack.triggerUndo(),false, "TriggerUndo should return false if it undefined values havnt registered");
    raises(function (){
            stack.stackChange(dummyContex, null, initValue);},
        Error,"Throws error");
});
module("MCT Tests")

test("test MCT creation of stacks", function() {
   var stack = MCT.createNewMStack();
   ok(stack instanceof  stackConstructor, "MCT created a stack");
   strictEqual(MCT.getMStacks().length,1, "MCT returns stacksArray");
   MCT.killMStack(stack);
   strictEqual(MCT.getMStacks().length,0, "MCT returns stacksArray");
});