/**
 * MementoStackFactory is the creator and manager for mementos stacks, it is responsible for creating stacks, destroying them and also acts as an entry point to the
 * @name Memento Stack Factory
 * @namespace ko
 */
ko.msf = (function () {
    var mStacks = [];       //Array of stacks in the system

    /**
   * returns the array of stacks
   * @namespace ko.msf
   * @returns {Array}
   */
    var getStacks = function(){
        return mStacks;
    };
    /**
     * Cleares all stacks in the system
     */
    var clearStacks = function () {
        mStacks.forEach(function (stack) {
            stack.reInit();
        });
    };
    /**
     * Cleares all stacks in the system
     */
    var purgeStacks = function(){
        mStacks.forEach(function(stack){
            stack.clearForGc();
        });
        mStacks.length = 0;
    };

    /**
     * Creates a new stack and returns it
     * @param options set of stack options
     * @returns {ko.msf.mStack}
     */
    var createStack = function(options){
        var newStack = new ko.msf.mStack(options);
        mStacks.push(newStack);
        return newStack;

    };

    /**
     * Destroys a given stack
     * @param stack
     * @returns {boolean}
     */
    var killStack = function(stack){
        var indexOf = mStacks.indexOf(stack);
        if (indexOf == -1)
            return false;
        stack.clearForGc();
        mStacks.splice(indexOf, 1);
        return true;
    };

    /**
     * Returns the first stack in the list, createts one if non have been created before
     * @returns {ko.msf.ms}
     */
    var getDefaultStack = function(){
        return mStacks.length ? mStacks[0] :createStack();
    };

    /**
     * Returns the last stack in the list
     * @returns {ko.msf.ms}
     */
    var getLastStack = function () {
        if (mStacks.length > 0) {
            return mStacks[mStacks.length - 1];
        }
        else {
            return undefined;
        }
    };

    //API
    return {
        getStacks: getStacks,
        killStack: killStack,
        purgeStacks: purgeStacks,
        clearStacks: clearStacks,
        getDefaultStack: getDefaultStack,
        getLastStack:getLastStack,
        createStack: createStack
    };
})();
/**
 * Created by Maor.Frankel on 12/31/13.
 * MementoStack is the main core functionality of the ko_memento library, its mission is to listen to any observable registered to it
 * and maintain a stack of mementos containing changes made to them in the order that they occurred. it also has the responsibility of
 * triggering these mementos into action and maintaining a mirror stack for redo's
 */

/**
 * @MementoStackFactory is the creator and manager for mementos stacks, it is responsible for creating stacks, destroying them and also acts as an entry point to the
 * @author Maor Frankel
 * @version 1.0.0
 * @constructor
 */
ko.msf.mStack = function (options) {
    options = options || {};//in case no settings variable has been passed
    options = {
        stackLimit: options.stackLimit || 50,
        discardUndefined: options.discardUndefined|| false
    };


    var errHandler = ko.msf.ErrorHandler;
    var listen = true;
    var subscribers = [];             //Array listing all subscribers to this stack
    var undoStack = [];               //Array containing all undo's
    var redoStack = [];               //Array containing all redo's
    var seqBufferArray = [];          //Buffer array holding all sequenced actions to be stored as a single undo/redo
    var sequencingMode = 0  ;         //Flag stating all current changes registering should be stacked
    var updating = false;             //Flag stating an update is in progress and new stack changed should not be registered
    
    /**
     * Pushes a buffer into a given stack
     *@param stack stack The stack which we want to push on
     *@param buffer buffer The buffer we want to preserve
    **/
    var pushBuffer = function(stack, buffer) {
        if (stack.length > options.stackLimit)//Make sure we limit the stack
            stack.shift(); //If over limit, remove first member

            stack.push(buffer.splice(0));//Push buffer to given stack
            buffer.length = 0;//Purge buffer
        };

    /**
    * Executes trigger on a given stack
    *@param cStack The Stack to be triggered
    *@param oStack The mirror stack
    **/
    var trigger = function (cStack, oStack) {
        var mementos = cStack.pop();//Get mementos
        if (!mementos)//Make sure we are not at the bottom of the stack
           return false;

        var buffer = [];
        mementos.forEach(function (memento) {
            buffer.push(memento.duplicate());
            updating = true;
            memento.trigger(subscribers);
            updating = false;
        }.bind(this));
        oStack.push(buffer.splice(0));//Push duplicate memento to mirror stack
        buffer.length = 0;

        return true;
    };

    /**
    * Clears all stacks of all history
    **/
    var purgeStacks = function () {
        undoStack.length = 0;
        redoStack.length = 0;
    };


    /**
    * Clears stack for gc
    **/
    this.clearForGc = function () {
         subscribers.length = 0;
         undoStack.length = 0;
         redoStack.length = 0;
         seqBufferArray.length = 0;
         for (var property in this) {
             if (this.hasOwnProperty(property)) {
                 this[property] = undefined;
             }
         }

         return true;
    };

    /**
    * re initializes the stack
    **/
    this.reInit = function () {
         purgeStacks();
         seqBufferArray.length = 0;
         updating = false;
         sequencingMode = false;
    };

    /**
    * Weather or not the stack is currently triggering a memento
    * @returns {boolean}
     */
     this.isUpdating = function () {
         return updating;
     };

     /**
     * Stop listening to changes
     **/
     this.stopListening = function () {
         listen = false;
     };

     /**
     * Resume listening to changes
     **/
     this.resumeListening = function () {
         listen = true;
     };

     /**
     * Let's a caller subscribe a call back function before any mementos are triggered
     * @param cb
     * @returns {{}}
     */
     this.subscribeTo = function (cb){
          if(!cb instanceof Function){
             errHandler.throwError("Subscriber is not an instance of Function");
             return false;
          }
          subscribers.push(cb);

         var sub = {};//create an emtpy object to call dispose on
          sub.dispose = function () {//this functin maintains the given call back closure so it can be triggered latter on
            var indexOf = subscribers.indexOf(cb);
            subscribers.splice(indexOf, 1);
          };

         return sub;
        };

     /**
     * Handler for external calls to stack, creates mementos and stacks them to undo
     *@param context The object containing the observable
     *@param subject The observable that has changed
     *@param val The previous value of the observable
     **/
     this.stackChange = function (context, subject, val) {
          if (updating || !listen)//Make sure we are not currently updating or not listening
             return false;

         if (!subject){ // make sure no empty subject or values are set
             errHandler.throwError("No subject has been passed to register on");
             return false;
         }
         if(options.discardUndefined && val === undefined ){//discard undefined or null values
            return false;
          }

         redoStack.length = 0; //clear redo array after new undo is pushed
         var memento = new ko.msf.mStack.Memento(context, subject, val);
         seqBufferArray.push(memento);
         if (sequencingMode > 0) /// if we are stacking, don't push to undoStack
             return true;

         pushBuffer(undoStack, seqBufferArray);

          return true;
     };

     /**
     * Trigger an undo
     **/
     this.triggerUndo = function () {
          return trigger(undoStack, redoStack);
     };

     /**
     * Trigger a redo
     **/
     this.triggerRedo = function () {
          return trigger(redoStack, undoStack);
     };

     /**
     * When this function is called, all following actions will be triggered as a single undo, Don't forget to stopSequencing!!!
    **/
    this.startSequencing = function () {
         sequencingMode += 1;
    };

    /**
    * When this function is called, all actions that have been buffers in the sequence will be pushed to undo
    **/
    this.stopSequencing = function () {
         sequencingMode -= 1;
         if(sequencingMode < 0){
            sequencingMode = 0;
            errHandler.throwError("Sequencing Mode has been stooped but but never started, ignored");
         }

         if (sequencingMode > 0){
             return;
         }
         pushBuffer(undoStack, seqBufferArray.reverse());
    };

    this.hasUndos = function () {
        return (undoStack.length > 0);
    };

    this.hasRedos = function () {
        return (redoStack.length > 0);
    };

};
/**
 * Created by Maor.Frankel on 12/31/13.
 * Extensions are a list of ko extenders and augmented observables set as api for the component
 */

/**
 * registerToMs is a ko extender which can be assigned to any observable making it a registered observable to a given memento stack
 * @param target is the observable which has been extended, this is passed automatically by the extend funtion of ko
 * @param options is an object containing possible option set by the user
 * @returns {*} the augmented observable
 */
ko.extenders.registerToMS = function (target, options) {
    options = options || {};
    var stack = options.stack || ko.msf.getDefaultStack();

    //computed observable that we will return
    var result = ko.computed({
        //always return the actual value
        read: function () {
            return target();
        },
        //stored in a temporary spot until commit
        write: function (newValue) {
            if (!result.dontReg) {
                result.registerCurrentValue();
            }
            target(newValue);
        }
    });
    result.dontReg = false;
    /**
     * Tell this observable to stop registering its values to its stack
     */
    result.stopRegistering = function () {
        result.dontReg = true;
    };

    /**
     * Tell this observable to resume registering its values to its stack
     */
    result.resumeRegistering = function () {
        result.dontReg = false;
    };

    /**
     * Tell this observable to register its current value
     */
    result.registerCurrentValue = function () {
        result.registerAValue(target());
    };
    /**
     * Tell the observable to register a given value
     * @param valueToReg the value to register
     */
    result.registerAValue = function (valueToReg) {
        stack.stackChange(options.context, result, valueToReg);
    };

    /**
     * Let the world know the observable has changed
     */
    result.valueHasMutated = function () {
        result.notifySubscribers(target);
    };


    return result;
};

/**
 * registerdObservable is a augmented observable registered  a given memento stack
 * @param initialValue the first value to be set on the observable
 * @param options is an object containing possible option set by the user
 * @returns {*} the augmented observable
 */

ko.registerdObservable = function (initialValue, options) {
    //private variables
    var _actualValue = ko.observable(initialValue);
    options = options || {};
    var stack = options.stack || ko.msf.getDefaultStack();
    //computed observable that we will return
    var result = ko.computed({
        //always return the actual value
        read: function () {
            return _actualValue();
        },
        //stored in a temporary spot until commit
        write: function (newValue) {
            if (!result.dontReg)
                result.registerCurrentValue();
            _actualValue(newValue);
        }
    });
    /**
     * Tell this observable to stop registering its values to its stack
     */
    result.stopRegistering = function () {
        result.dontReg = true;
    };

    /**
     * Tell this observable to resume registering its values to its stack
     */
    result.resumeRegistering = function () {
        result.dontReg = false;
    };

    /**
     * Tell this observable to register its current value
     */
    result.registerCurrentValue = function () {
        result.registerAValue(_actualValue());
    };
    /**
     * Tell the observable to register a given value
     * @param valueToReg the value to register
     */
    result.registerAValue = function (valueToReg) {
        stack.stackChange(options.context, result, valueToReg);
    };

    /**
     * Let the world know the observable has changed
     */
    result.valueHasMutated = function () {
        result.notifySubscribers(_actualValue);
    };


    return result;
};

/**
 * @MementoStackFactory is the creator and manager for mementos stacks, it is responsible for creating stacks, destroying them and also acts as an entry point to the
 * @author Maor Frankel
 * @version 1.0.0
 * @constructor
 */
ko.msf.mStack.Memento = function (contex,subject, value) {
    var context = contex || (function () { }); //Set subject or set default empty function(because we deal with observable default must be dummy function)


    var notifySubscribers = function(cbs){
        if(cbs instanceof  Array){ // in case no subscribers have been passed
            cbs.forEach(function(cb){
                cb({
                    context:context,
                    subject:subject,
                    value:value
                });
            });
        }
    };

    /**
     * Trigger this memento
     * @param cbs array of subscribers
     * @returns {*} the result of clearForGc();
     */
    this.trigger = function(cbs) {
        notifySubscribers(cbs);
        subject(value);
        return this.clearForGc();

    };
    
   /**
   * Create a duplicate object with same subject and current subject value
   *@return duplicate memento containing subject current value
   **/
    this.duplicate = function () {
        return (new ko.msf.mStack.Memento(context, subject, subject()));

    };
    /**
    * Clear all references so object is collected
    **/
    this.clearForGc = function () {
      subject = undefined;
      value = undefined;
      context = undefined;
      for (var property in this) {
           if (this.hasOwnProperty(property)) {
               this[property] = undefined;
           }
       }
        return true;
    };
};

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