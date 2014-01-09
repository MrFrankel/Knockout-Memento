ko.MCT.MStack.Memento = function (contex,subj, val) {
    var subject = subj || (function () { }); //Set subject or set default empty function(because we deal with observable default must be dummy function)
    var value = val !== undefined ? val :  "";                    //Set value or default empty string
    /*
    * Trigger a previous value change on the subject
    */
    this.trigger = function() {
        subject(value);
        return this.clearForGc();

    };
    
   /*
   * Create a duplicate object with same subject and current subject value
   *@return duplicate memento containing subject current value
   */
    this.duplicate = function () {
        var duplicate = new ko.MCT.MStack.Memento(contex, subject, subject());
        return duplicate;
    };
    /*
    * Clear all references so object is collected
    */
    this.clearForGc = function () {
      subject = undefined;
      value = undefined;
      contex = undefined;
      for (var property in this) {
           if (this.hasOwnProperty(property)) {
               this[property] = undefined;
           }
       }
        return true;
    };
};
