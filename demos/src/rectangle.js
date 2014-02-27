function cbox(id){
    this.stack = ko.msf.createStack({discardeUndefined:true, stackLimit:50})
    var initObj = {context:this, stack:this.stack};
    this.opacity = ko.observable(1).extend({registerToMS: initObj});
    this.X = ko.observable(200).extend({registerToMS: initObj});
    this.Y = ko.observable(200).extend({registerToMS: initObj});
    this.width = ko.observable(100).extend({registerToMS: initObj});
    this.height = ko.observable(100).extend({registerToMS: initObj});
    this.uiElem = $('#' + id);


    this.uiElem.draggable({
        scroll: false,
        cursor: 'move',
        start:function(event, ui){
        }.bind(this),
        drag:function(event, ui){
            $('#xinput').val(ui.position.left);
            $('#yinput').val(ui.position.top);
        }.bind(this),
        stop:function(event, ui){
            this.stack.startSequencing();
            this.X(ui.position.left);
            this.Y(ui.position.top);
            this.stack.stopSequencing();
        }.bind(this)
    });
    this.uiElem.resizable({
        handles: "n, e, s, w, ne, se, sw, nw",
        start:function(event, ui){
        }.bind(this),
        resize:function(event, ui){
            $('#widthinput').val(Math.round(ui.size.width));
            $('#heightinput').val(Math.round(ui.size.height));
            $('#xinput').val(ui.position.left);
            $('#yinput').val(ui.position.top);
        }.bind(this),

        stop:function(event, ui){
            this.stack.startSequencing();
            this.width(Math.round(ui.size.width));
            this.height(Math.round(ui.size.height));
            this.X(ui.position.left);
            this.Y(ui.position.top);
            this.stack.stopSequencing();

        }.bind(this)
    });
}
var ce = new cbox("box");

function setOpacity(val, commit){
    ce.opacity.dontCommit = commit;
    ce.opacity(val);
    ce.opacity.dontCommit = !commit;
}

ko.bindingHandlers.Xc = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var jqElement = $(element),
            val = ko.utils.unwrapObservable(valueAccessor());
        jqElement.css('left', parseInt(val,10));

    }
};
ko.bindingHandlers.Yc = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var jqElement = $(element),
            val = ko.utils.unwrapObservable(valueAccessor());
        jqElement.css('top', parseInt(val,10));
    }
};
ko.bindingHandlers.Hc = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var jqElement = $(element),
            val = ko.utils.unwrapObservable(valueAccessor());
        jqElement.css('height', parseInt(val,10));

    }
};
ko.bindingHandlers.Wc = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var jqElement = $(element),
            val = ko.utils.unwrapObservable(valueAccessor());
        jqElement.css('width', parseInt(val,10));
    }
};
ko.bindingHandlers.opacity = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {

    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var jqElement = $(element),
            val = ko.utils.unwrapObservable(valueAccessor());
        jqElement.css('opacity', val);
    }
};
ko.applyBindings(ce);