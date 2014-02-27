/**
 * Created by Maor.Frankel on 2/27/14.
 */
'use strict'

var viewModel = {
    inputVal1:ko.observable(10).extend({registerToMS: null}),//register both observable, with no init params passed, they will all register to the default stack
    inputVal2:ko.observable(10).extend({registerToMS: null})
}

ko.applyBindings(viewModel);