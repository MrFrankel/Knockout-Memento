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
    var getMStacks = function(){
        return mStacks;
    };

    /**
     * Cleares all stacks in the system
     */
    var purgeMStacks = function(){
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
    var createNewMStack = function(options){
        var newStack = new ko.msf.mStack(options);
        mStacks.push(newStack);
        return newStack;

    };

    /**
     * Destroys a given stack
     * @param stack
     * @returns {boolean}
     */
    var killMStack = function(stack){
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
        if(mStacks.length > 0)
            return mStacks[0];
        else
            return createNewMStack();
    };

    //API
    return {
        getMStacks:getMStacks,
        killMStack:killMStack,
        purgeMStacks:purgeMStacks,
        getDefaultStack:getDefaultStack,
        createNewMStack:createNewMStack
    };
})();