/**
 * Created by Maor.Frankel on 12/31/13.
 */
ko.MCT.MStack = function (dependancies, settings) {
        settings = settings || {};
        settings = {
            stackLimit: settings.stackLimit || 50,
            discardeUndefined: settings.discardeUndefined || false
        };
        var errhandler = dependancies.errHandler;

        var listen = true;
        var undoStack = [];               //Array containing all undo's
        var redoStack = [];               //Array containing all redo's
        var seqBufferArray = [];          //Buffer array holding all sequenced actions to be stored as a single undo/redo
        var sequencingMode = 0  ;       //Flag stating all current changes registering should be stacked
        var updating = false;             //Flag stating an update is in progress and new stack changed should not be registered
        /*
         * Pushes a buffer into a given stack
         *@stack The stack which we want to push on
         *@buffer The buffer we want to preserve
         */
        var pushBuffer = function(stack, buffer) {
            if (stack.length > settings.stackLimit)//Make sure we limit the stack
                stack.shift(); //If over limit, remove first member

            stack.push(buffer.splice(0));//Push buffer to given stack
            buffer.length = 0;//Purge buffer
        };

        /*
         * Executes trigger on a given stack
         *@cStack The Stack to be triggered
         *@oStack The mirror stack
         */
        var trigger = function (cStack, oStack) {
            var mementos = cStack.pop();//Get mementos
            if (!mementos)//Make sure we are not at the bottom of the stack
                return false;

            var buffer = [];
            mementos.forEach(function (memento) {
                buffer.push(memento.duplicate());
                updating = true;
                memento.trigger();
                updating = false;
            }.bind(this));
            oStack.push(buffer.splice(0));//Push duplicate memento to mirror stack
            buffer.length = 0;

            return true;
        };
        /*
         * Clears all stacks of all history
         */
        var purgeStacks = function () {
            undoStack.length = 0;
            redoStack.length = 0;
        };

        /*
         * Reinitialize all data
         */
        this.clearForGc = function () {
            for (var property in this) {
                if (this.hasOwnProperty(property)) {
                    this[property] = undefined;
                }
            }
            return true;
        };
        this.reInit = function () {
            purgeStacks();
            seqBufferArray.length = 0;
            updating = false;
            sequencingMode = false;
        };

        /*
         * Clears all stacks of all history
         */
        this.isUpdating = function () {
            return updating;
        };

        /*
         * Stop listening to changes
         */
        this.stopListening = function () {
            listen = false;
        };

        /*
         * Resume listening to changes
         */
        this.resumeListening = function () {
            listen = true;
        };
        /*
         * Handler for external calls to stack, creates mementos and stacks them to undo
         *@subject The observable that has changed
         *@val The previous value of the observable
         */
        this.stackChange = function (contex, subject, val) {
            if (updating || !listen)//Make sure we are not currently updating
                return false;

            if (!subject){ // make sure no empty subject or values are set
                errhandler.throwError("No subject has been passed to register on");
                return false;
            }
            if(settings.discardeUndefined && val === undefined ){//discard undefined or null values
               return false;
            }


            redoStack.length = 0; //clear redo array after new undo is pushed
            var memento = new ko.MCT.MStack.Memento(contex, subject, val);
            seqBufferArray.push(memento);
            if (sequencingMode > 0) /// if we are stacking, don't push to undoStack
                return true;

            pushBuffer(undoStack, seqBufferArray);

            return true;
        };

        /*
         * Trigger an undo
         */
        this.triggerUndo = function () {
           return trigger(undoStack, redoStack);
        };

        /*
         * Trigger a redo
         */
        this.triggerRedo = function () {
            return trigger(redoStack, undoStack);
        };

        /*
         * When this function is called, all following actions will be triggered as a single undo, Don't forget to stopSequencing!!!
         */
        this.startSequencing = function () {
            sequencingMode += 1;
        };

        /*
         * When this function is called, all actions that have been buffers in the sequence will be pushed to undo
         */
        this.stopSequencing = function () {
            sequencingMode -= 1;
            if(sequencingMode < 0){
               sequencingMode = 0;
                errhandler.throwError("Sequencing Mode has been stooped but but never started, ignored");
            }

            if (sequencingMode > 0){
                return;
            }
            pushBuffer(undoStack, seqBufferArray.reverse());
        };


};