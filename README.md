#knockout-memento

##Wait a memento, what does it do??

knockout-memento is a library enabling developers to maintain stack of all changes made to kncokout observables in the system,
Basically it gives you the ability to create memento stacks which you can then register a certain observable to, this stack will maintain the previous states of these observables.
These states can then be reinstated by triggering undo/redo on any given stack.



##Getting Started
```javascript
//start using it!
var testSub = ko.observable(50).extend({registerToMS: null});

testSub(100);
testSub(150);

newStack.triggerUndo(); //testSub() === 100
newStack.triggerUndo(); //testSub() === 50
newStack.triggerRedo(); //testSub() === 100
```

##Multiple observables, one stack
```javascript
//start using it!
var testSub = ko.observable(50).extend({registerToMS: null});
var testSub = ko.observable(50).extend({registerToMS: null});

testSub(100);
testSub2("second");
testSub(150);

newStack.triggerUndo(); //testSub() === 100
newStack.triggerUndo(); //testSub2() === "first"
newStack.triggerRedo(); //testSub2() === "second"
```

##Multiple observables, Multiple stacks
```javascript
//start using it!
var newStack = ko.msf.createNewMStack({stackLimit:50,discardUndefined:false });
var newStack2 = ko.msf.createNewMStack({stackLimit:50,discardUndefined:false });
var testSub = ko.observable(50).extend({registerToMS: {context:this, stack:newStack}});
var testSub2 = ko.observable("first").extend({registerToMS: {context:this, stack:newStack}});
var testSub3 = ko.observable("Maor").extend({registerToMS: {context:this, stack:newStack2}});

testSub(100);
testSub2("second");
testSub(150)
testSub3("Lia");
testSub2("third");

newStack.triggerUndo(); //testSub() === 100
newStack.triggerUndo(); //testSub2() === "second"
newStack2.triggerUndo() //testSub3() === "Maor"
newStack.triggerRedo(); //testSub2() === "third"
newStack2.triggerUndo() //testSub3() === "Lia"
```

##Sequencing changes
   ```javascript
   //start using it!
   var testSub = ko.observable(50).extend({registerToMS: null});
   var testSub2 = ko.observable("first").extend({registerToMS: null});

   newStack.startSequencing();
   testSub(100);
   testSub2("second");
   testSub(150);
   newStack.stopSequencing();

   newStack.triggerUndo(); //testSub() === 50, testSub2() === "first"
   newStack.triggerRedo(); //testSub() === 150, testSub2() === "second"
   ```

##Using augmented observable
   ```javascript
   //start using it!
   var newStack = ko.msf.createNewMStack({stackLimit:50,discardUndefined:false });
   var initObj = {context:this, stack:newStack};
   var testSub = ko.registerdObservable(50, initObj);

   var sub = newStack.subscribeTo(function (memento){
        console.log(memento.context) // reference to observable container
        console.log(memento.subject) // reference to observable
        console.log(memento.value) // value of observable to be changed to
   });

   testSub(100);
   testSub2("second");
   testSub(150);

   newStack.triggerUndo(); //testSub() === 50, testSub2() === "first"
   newStack.triggerRedo(); //testSub() === 150, testSub2() === "second"

   sub.dispose();
   ```

##Subscribe to undo/redo
   ```javascript
   //start using it!
   var newStack = ko.msf.createNewMStack({stackLimit:50,discardUndefined:false });
   var initObj = {context:this, stack:newStack};
   var testSub = ko.observable(50).extend({registerToMS: initObj});

   var sub = newStack.subscribeTo(function (memento){
        console.log(memento.context) // reference to observable container
        console.log(memento.subject) // reference to observable
        console.log(memento.value) // value of observable to be changed to
   });

   testSub(100);
   testSub2("second");
   testSub(150);

   newStack.triggerUndo(); //testSub() === 100
   newStack.triggerUndo(); //testSub2() === "first"
   newStack.triggerRedo(); //testSub2() === "second"
   ```
##General API
  ```javascript

    /***
    * returns the array of stacks
    * @returns {Array}
    */
    ko.msf.getStacks()

    /**
     * Clears all stacks in the system
     */
    ko.msf.purgeStacks()

    /**
     * Creates a new stack and returns it
     * @param options set of stack options
     * @returns {ko.msf.mStack}
     */
    ko.mcf.createNewStack()

    /**
     * Destroys a given stack
     * @param stack
     * @returns {boolean}
     */
    ko.mcf.killMStack()

    /**
     * Returns the first stack in the list, creates one if non have been created before
     * @returns {ko.msf.ms}
     */
    ko.mcf.getDefaultStack()


    /**
    * Clears stack for gc
    **/
    ko.msf.mStack.clearForGc()

    /**
    * re initializes the stack
    **/
    ko.msf.mStack.reInit()

    /**
    * Weather or not the stack is currently triggering a memento
    * @returns {boolean}
     */
     ko.msf.mStack.isUpdating()

     /**
     * Stop listening to changes
     **/
     ko.msf.mStack.stopListening()

     /**
     * Resume listening to changes
     **/
     ko.msf.mStack.resumeListening()

     /**
     * Let's a caller subscribe a call back function before any mementos are triggered
     * @param cb
     * @returns {{}} dispose object
     */
     ko.msf.mStack.subscribeTo()

     /**
     * Handler for external calls to stack, creates mementos and stacks them to undo
     *@param context The object containing the observable
     *@param subject The observable that has changed
     *@param val The previous value of the observable
     **/
     ko.msf.mStack.stackChange()

     /**
     * Trigger an undo
     **/
     ko.msf.mStack.triggerUndo()

     /**
     * Trigger a redo
     **/
     ko.msf.mStack.triggerRedo()

     /**
     * When this function is called, all following actions will be triggered as a single undo, Don't forget to stopSequencing!!!
    **/
    ko.msf.mStack.startSequencing()

    /**
    * When this function is called, all actions that have been buffers in the sequence will be pushed to undo
    **/
    ko.msf.mStack.stopSequencing()
```

##Demo
A demo can be found in the demo folder fo this project

##License
MIT [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)

     

 
