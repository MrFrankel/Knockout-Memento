/**
 * Created by Maor.Frankel on 12/31/13.
 * Extensions are a list of ko extenders and augmented observables set as api for the component
 */

/**
 * registerToMs is a ko extender which can be assigned to any observable making it a registered observable to a given memento stack
 * @param target is the observable which has been extended, this is passed automatically by the extend funtion of ko
 * @param options is an object containing possible option set by the user
 * @returns {*} the augmented observable
 */
ko.extenders.registerToMS = function (target, options) {
    options = options || {};
    var stack = options.stack || ko.msf.getDefaultStack();

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
    /**
     * Tell this observable to stop registering its values to its stack
     */
    result.stopRegistering = function () {
        result.dontReg = true;
    };

    /**
     * Tell this observable to resume registering its values to its stack
     */
    result.resumeRegistering = function () {
        result.dontReg = false;
    };

    /**
     * Tell this observable to register its current value
     */
    result.registerCurrentValue = function () {
        result.registerAValue(target());
    };
    /**
     * Tell the observable to register a given value
     * @param valueToReg the value to register
     */
    result.registerAValue = function (valueToReg) {
        stack.stackChange(options.context, result, valueToReg);
    };

    /**
     * Let the world know the observable has changed
     */
    result.valueHasMutated = function () {
        result.notifySubscribers(target);
    };


    return result;
};

/**
 * registerdObservable is a augmented observable registered  a given memento stack
 * @param initialValue the first value to be set on the observable
 * @param options is an object containing possible option set by the user
 * @returns {*} the augmented observable
 */

ko.registerdObservable = function (initialValue, options) {
    //private variables
    var _actualValue = ko.observable(initialValue);
    options = options || {};
    var stack = options.stack || ko.msf.getDefaultStack();
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
    /**
     * Tell this observable to stop registering its values to its stack
     */
    result.stopRegistering = function () {
        result.dontReg = true;
    };

    /**
     * Tell this observable to resume registering its values to its stack
     */
    result.resumeRegistering = function () {
        result.dontReg = false;
    };

    /**
     * Tell this observable to register its current value
     */
    result.registerCurrentValue = function () {
        result.registerAValue(_actualValue());
    };
    /**
     * Tell the observable to register a given value
     * @param valueToReg the value to register
     */
    result.registerAValue = function (valueToReg) {
        stack.stackChange(options.context, result, valueToReg);
    };

    /**
     * Let the world know the observable has changed
     */
    result.valueHasMutated = function () {
        result.notifySubscribers(_actualValue);
    };


    return result;
};