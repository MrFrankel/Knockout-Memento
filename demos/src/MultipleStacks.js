/**
 * Created by Maor.Frankel on 2/27/14.
 */
'use strict'
var stack1 = ko.msf.createStack();//Create a new stack
var stack2 = ko.msf.createStack();

var viewModel = {
    inputVal1:ko.observable(10).extend({registerToMS: {context:this, stack:stack1}}),//register each observable to a a given stack.
    inputVal2:ko.observable(10).extend({registerToMS: {context:this, stack:stack2}})
}

ko.applyBindings(viewModel);