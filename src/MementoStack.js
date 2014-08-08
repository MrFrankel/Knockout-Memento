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
    var dirty  =ko.observable(false);
    
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
            buffer.unshift(memento.duplicate());
            updating = true;
            memento.trigger(subscribers);
            updating = false;
        }.bind(this));
        oStack.push(buffer.splice(0));//Push duplicate memento to mirror stack
        buffer.length = 0;
        dirty(undoStack.length > 0);
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
         dirty(false);
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
         dirty(true);

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

    this.isDirty = ko.computed(function (){
        return dirty();
    });

};