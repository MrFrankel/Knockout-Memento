ko.extenders.registerToSM = function (target, options) {
    var errors = {};
    options = options || {};
    var stack = options.stack || ko.StateManager.getDefaultStack();

    //computed observable that we will return
    var result = ko.computed({
        //always return the actual value
        read: function () {
            return target();
        },
        //stored in a temporary spot until commit
        write: function (newValue) {
            if (!result.dontReg)
                result.registerCurrentValue();
            target(newValue);
        }
    });
    result.dontReg = false;

    result.stopRegistering = function () {
        result.dontReg = true;
    };

    result.resumeRegistering = function () {
        result.dontReg = false;
    };

    result.registerCurrentValue = function () {
        result.registerAValue(target());
    };

    result.registerAValue = function (valueToReg) {
        stack.stackChange(options.contex, result, valueToReg);
    };

    result.valueHasMutated = function () {
        result.notifySubscribers(_actualValue);
    };


    return result;
};


ko.registerdObservable = function (initialValue, reff, careTaker) {
    //private variables
    var _actualValue = ko.observable(initialValue);


    //computed observable that we will return
    var result = ko.computed({
        //always return the actual value
        read: function () {
            return _actualValue();
        },
        //stored in a temporary spot until commit
        write: function (newValue) {
            if (!result.dontReg)
                result.registerCurrentValue();
            _actualValue(newValue);
        }
    });
    result.dontReg = false;

    result.stopRegistering = function () {
        result.dontReg = true;
    };

    result.resumeRegistering = function () {
        result.dontReg = false;
    };

    result.registerCurrentValue = function () {
        result.registerAValue(_actualValue());
    };

    result.registerAValue = function (valueToReg) {
        careTaker.stackChange(reff, result, valueToReg);
    };

    result.valueHasMutated = function () {
        result.notifySubscribers(_actualValue);
    };


    return result;
};