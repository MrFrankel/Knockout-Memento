/**
 * Created by Maor.Frankel on 12/29/13.
 */
QUnit.config.autostart = false;
/*
Maintain all reference globally so we can change them easily in case of changes
 */

var msf = ko.msf;
var ErrorHandler = msf.ErrorHandler;
var stackConstructor = msf.mStack;
var mementoConstructor = stackConstructor.Memento;

var mockObservable = function (){
    dummyContext = {};
    initValue = 20;
    newValue = 50;
    dummyContext.testSubject = ko.observable(initValue);
}
module("knockout_memento testing")
module("Error Handler test");

test("Testing if error thrown", function(){
    raises(function (){
            ErrorHandler.throwError();},
        Error,"Must throw an error to pass");

    var msg = "a different error occurred";
    var expected = "ko.Memento Error: " + msg;
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
    var memento = new mementoConstructor(dummyContext, dummyContext.testSubject, initValue);
    ok(memento instanceof mementoConstructor, "An object of type memento must have been created");
    var dupMemento = memento.duplicate();
    ok(dupMemento instanceof mementoConstructor, "Duplicate memento must be of type Memento");
    dummyContext.testSubject(newValue);
    strictEqual(dummyContext.testSubject(), newValue, "The test observable must have changed value to newValue");
    ok(memento.trigger(), "Trigger function must return true to signal passed");
    strictEqual(dummyContext.testSubject(), initValue, "The test observable must have changed back to initValue");
    dummyContext.testSubject(newValue);
    ok(dupMemento.trigger(), "Trigger function must return true to signal passed");
    strictEqual(dummyContext.testSubject(), initValue, "The test observable must have changed back to newValue");
    var memento = new mementoConstructor(dummyContext, dummyContext.testSubject, initValue);
    memento.clearForGc();
    ok(memento.trigger === undefined && memento.duplicate === undefined && memento.clearForGc === undefined, "All props of memento have been cleared for gc");

});

module("Stack Tests",{
    setup: function(){
        mockObservable();
    }});
test("Test stack creation and basic functionality", function() {
    dummyContext.testSubject(newValue);
    var stack = new stackConstructor();
    ok(stack instanceof stackConstructor,"An object of type Stack must have been created");
    stack.stackChange(dummyContext,dummyContext.testSubject, initValue);
    stack.triggerUndo();
    strictEqual(dummyContext.testSubject(), initValue, "The test observable must have changed back to initValue");
    stack.triggerRedo();
    strictEqual(dummyContext.testSubject(), newValue, "The test observable must have changed back to newValue");
});

test("Test stack Api", function() {
    var stack = new stackConstructor();
    stack.stopListening();
    stack.stackChange(dummyContext, dummyContext.testSubject, initValue);
    ok(!stack.triggerUndo(), "Trigger undo should return false if stack is empty after not listening");
    stack.resumeListening();
    stack.stackChange(dummyContext, dummyContext.testSubject, initValue);
    ok(stack.triggerUndo(), "Trigger undo should return true if stack is not empty after resume listening");
    stack.stackChange(dummyContext, dummyContext.testSubject, initValue);
    stack = new stackConstructor();
    ok(!stack.triggerUndo(), "Trigger undo should return false if stack is clean after creation");
    stack.stackChange(dummyContext, dummyContext.testSubject, initValue);
    stack.reInit();
    ok(!stack.triggerUndo(), "Trigger undo should return false if stack is really after reInit");
    var stack2 = new stackConstructor();
    ok(stack !== stack2, "Creation of stack is creates a new instance");
    stack2.startSequencing();
    stack2.stackChange(dummyContext, dummyContext.testSubject, initValue);
    stack2.stackChange(dummyContext, dummyContext.testSubject, initValue*2);
    stack2.stopSequencing();
    stack2.triggerUndo();
    strictEqual(dummyContext.testSubject(), initValue, "After sequencing, value should return to initValue");
    raises(function (){
            stack2.stopSequencing();},
        Error,"Throws error");
    stack2.startSequencing();
    stack2.stackChange(dummyContext, dummyContext.testSubject, initValue);
    stack2.startSequencing();
    stack2.stackChange(dummyContext, dummyContext.testSubject, initValue*2);
    stack2.stopSequencing();
    stack2.stackChange(dummyContext, dummyContext.testSubject, initValue*3);
    stack2.stopSequencing();
    stack2.triggerUndo();
    strictEqual(dummyContext.testSubject(), initValue, "After nested sequencing, value should return to initValue");
    stack = new stackConstructor({discardUndefined:false});
    stack.stackChange(dummyContext, dummyContext.testSubject, undefined);
    strictEqual(stack.triggerUndo(),true, "TriggerUndo should return true if it undefined values were registered");
    stack = new stackConstructor({discardUndefined:true});
    stack.stackChange(dummyContext, dummyContext.testSubject, undefined);
    strictEqual(stack.triggerUndo(),false, "TriggerUndo should return false if it undefined values havnt registered");
    raises(function (){
            stack.stackChange(dummyContext, null, initValue);},
        Error,"Throws error");
});

test("test msf subscribe multi to undo/redo, Should only create 2 assertions", function() {
    var stack = msf.createStack();
    stack.stackChange(dummyContext,dummyContext.testSubject, initValue);
    var sub1 = stack.subscribeTo(function(data){
        ok(data.context === dummyContext, "context 1 return on call back")
    });
    var sub2 = stack.subscribeTo(function(data){
        ok(data.context === dummyContext, "context 2 return on call back")
    });
    var sub3 = stack.subscribeTo(function(data){
        ok(data.context === dummyContext, "context 3 return on call back")
    });
    sub2.dispose();
    stack.triggerUndo();
    sub1.dispose();
    sub3.dispose();
    stack.triggerRedo();
});


module("msf Tests",{
    setup: function(){
        mockObservable();
    }});

test("test msf creation of stacks", function() {
   msf.purgeStacks();
   var stack = msf.createStack();
   ok(stack instanceof  stackConstructor, "msf created a stack");
   strictEqual(msf.getStacks().length,1, "msf returns stacksArray");
   msf.killStack(stack);
   strictEqual(msf.getStacks().length,0, "msf returns stacksArray");
});

test("test msf subscribe to undo/redo", function() {
    var stack = msf.createStack();
    stack.stackChange(dummyContext,dummyContext.testSubject, initValue);
    var sub = stack.subscribeTo(function(data){
       ok(data.context === dummyContext, "context return on call back")
    });
    stack.triggerUndo();
    stack.triggerRedo();
    sub.dispose();
});
module("Extension test",{
    setup: function(){
        mockObservable();
    }});

test("Test extension api",function(){
    var stack = ko.msf.createStack();
    var initObj = {context:this, stack:stack};
    var tester = ko.observable(initValue).extend({registerToMS: initObj});
    tester.stopRegistering();
    tester(newValue);
    ok(!stack.triggerUndo(), "triggerUndo should return false as there are no changes listed after stopListening on observable")
    tester(initValue);
    tester.resumeRegistering();
    tester(newValue);
    stack.triggerUndo();
    strictEqual(tester(),initValue, "tester returned to previous value");
    tester.registerCurrentValue();
    tester.stopRegistering();
    tester(newValue);
    stack.triggerUndo();
    strictEqual(tester(),initValue, "tester returned to previous value");
    tester.resumeRegistering();
    tester.registerAValue(newValue);
    stack.triggerUndo();
    strictEqual(tester(),newValue, "tester returned newValue");
});

test("Test augmented api",function(){
    var stack = ko.msf.createStack();
    var initObj = {context:this, stack:stack};
    var tester = ko.registerdObservable(initValue, initObj);
    tester.stopRegistering();
    tester(newValue);
    ok(!stack.triggerUndo(), "triggerUndo should return false as there are no changes listed after stopListening on observable")
    tester(initValue);
    tester.resumeRegistering();
    tester(newValue);
    stack.triggerUndo();
    strictEqual(tester(),initValue, "tester returned to previous value");
    tester.registerCurrentValue();
    tester.stopRegistering();
    tester(newValue);
    stack.triggerUndo();
    strictEqual(tester(),initValue, "tester returned to previous value");
    tester.resumeRegistering();
    tester.registerAValue(newValue);
    stack.triggerUndo();
    strictEqual(tester(),newValue, "tester returned newValue");
});

module("FullFlows",{
    setup: function(){
        mockObservable();
    }});

test("test a full flow on single observable",function(){
    var stack = ko.msf.createStack();
    var initObj = {context:dummyContext, stack:stack};
    var tester = ko.observable(initValue).extend({registerToMS: initObj});
    tester(newValue);
    tester(newValue*2);
    stack.triggerUndo();
    strictEqual(tester(),newValue,"Undo return one value back newValue" );
    stack.triggerUndo();
    strictEqual(tester(),initValue,"Undo return one value back to initValue" );
    stack.triggerRedo();
    strictEqual(tester(),newValue,"Rndo return one value back newValue" );
});

test("test startListening and stop listening",function(){
    var stack = ko.msf.createStack();
    var initObj = {context:this, stack:stack};
    var tester = ko.observable(initValue).extend({registerToMS: initObj});
    stack.stopListening();
    tester(newValue);
    ok(!stack.triggerUndo(), "triggerUndo should return false as no changes registered");
    strictEqual(tester(), newValue, "tester should remain in newValue as change was not registered");
    stack.resumeListening();
    tester(initValue);
    stack.triggerUndo();
    strictEqual(tester(), newValue, "tester should return to in newValue as change was registered");
});

test("test sequencing and nested sequencing",function(){
    var stack = ko.msf.createStack();
    var initObj = {context:this, stack:stack};
    var tester = ko.observable(initValue).extend({registerToMS: initObj});
    stack.startSequencing();
    tester(newValue);
    tester(newValue*2);
    stack.startSequencing();
    tester(newValue*3);
    stack.stopSequencing();
    stack.stopSequencing();
    stack.triggerUndo();
    strictEqual(tester(), initValue,"All changes were undone as sequencing toke place")
});

test("test multi observables",function(){
    var stack = ko.msf.createStack();
    var initObj = {context:{}, stack:stack};
    var tester = ko.observable(initValue).extend({registerToMS: initObj});
    var tester2 = ko.observable(initValue*2).extend({registerToMS: initObj});
    tester(newValue);
    tester2(newValue*2);
    stack.triggerUndo();
    strictEqual(tester2(), initValue*2, "tester2 should have returned to initValue");
    strictEqual(tester(), newValue, "tester should have stayed as newValue");
    stack.triggerUndo();
    strictEqual(tester(), initValue, "tester should have returned to initValue");
});

test("test multi stacks",function(){
    var stack = ko.msf.createStack();
    var stack2 = ko.msf.createStack();
    var initObj = {context:{}, stack:stack};
    var initObj2 = {context:{}, stack:stack2};
    var tester = ko.observable(initValue).extend({registerToMS: initObj});
    var tester2 = ko.observable(initValue*2).extend({registerToMS: initObj2});
    tester(newValue);
    tester2(newValue*2);
    stack2.triggerUndo();
    strictEqual(tester2(), initValue*2, "tester2 should have returned to initValue");
    strictEqual(tester(), newValue, "tester should have stayed as newValue");
    ok(!stack2.triggerUndo(), "First stack should return false as there are no more changed stacked");
    stack.triggerUndo()
    strictEqual(tester(), initValue, "tester should have s have returned to initValue");
});

test("test subscriptions, should be one assertions",function(){
    var stack = ko.msf.createStack();
    var initObj = {context:dummyContext, stack:stack};
    var tester = ko.observable(initValue).extend({registerToMS: initObj});
    var sub = stack.subscribeTo(function (data){
        ok(data.context === dummyContext, "Call back gets dummyContext")
    });
    tester(newValue);
    tester(newValue*2);
    stack.triggerUndo();
    sub.dispose();
    stack.triggerUndo();
});