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
