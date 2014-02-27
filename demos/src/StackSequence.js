/**
 * Created by Maor.Frankel on 2/27/14.
 */
'use strict'


var box = $('#box');
var stack = ko.msf.getDefaultStack();//get the default stack reference

var viewModel = {
    boxWidth:ko.observable(100).extend({registerToMS: {context:this, stack:stack}}),//register both observables to the same stack
    boxHeight:ko.observable(100).extend({registerToMS: {context:this, stack:stack}})
}

function changeSize(input){
    stack.startSequencing();//before changing any of the observables, make sure that the stack is in sequencing mode. so both changes are stacked as one action
    var value = parseInt(input.value,10);
    viewModel.boxWidth(value);
    viewModel.boxHeight(value);
    stack.stopSequencing();// stop sequencing, pushes all sequenced changes to the stack
}

stack.subscribeTo(function (data){//this function will be called for every observable that is being re/un done
    var value = data.value;
    $('input').val(value);
})
ko.applyBindings(viewModel);



