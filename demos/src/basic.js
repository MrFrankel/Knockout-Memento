/**
 * Created by Maor.Frankel on 2/27/14.
 */
'use strict'
//createing a View Model with the registered observable
var viewModel = {
    inputVal:ko.observable(10).extend({registerToMS: null})//extend to regiterToMs sets the observable as an undoable observable, no need to set any attributes on it
}

ko.applyBindings(viewModel);