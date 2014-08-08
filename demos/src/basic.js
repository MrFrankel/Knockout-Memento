/**
 * Created by Maor.Frankel on 2/27/14.
 */
'use strict'
//createing a View Model with the registered observable

var UndoRedoStack= ko.msf.createStack();
var DrityStack= ko.msf.createStack();

var viewModel = {
    undoinputVal:ko.observable(10).extend(
        {
            registerToMS: {
                stack:UndoRedoStack
            }
        }),
    dirtInputVal:ko.observable(10).extend(
        {
            registerToMS:
            {
                stack:DrityStack
            }
        })
}


ko.applyBindings(viewModel);