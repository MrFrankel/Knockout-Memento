#knockout-amd-helpers

##What is the point of this library?

This plugin is designed to be a lightweight and flexible solution to working with AMD modules in Knockout.js. It provides two key features:

1- Augments the default template engine to allow it to load **external templates** using the AMD loader's text plugin. This lets you create your templates in individual HTML files and pull them in as needed by name (ideally in production the templates are included in your optimized file).

2- Creates a `module` binding that provides a flexible way to load data from an AMD module and either bind it against a template or against an anonymous/inline template.

##template engine

When this plugin is loaded it overrides the default template engine with a version that retains all of the normal functionality, but can also load external templates by using the AMD loader's text plugin.

For example, when doing:

    <ul data-bind="template: { name: 'items', foreach: items }"></ul>

The engine will first check to see if there is a `script` tag with the id of `items` and if not, it will dynamically require the template using the AMD loader's text plugin. By default, it will use `templates/` as the default path and `.tmpl.html` as the suffix.  So, in this case it would require `text!templates/items.tmpl.html`. Since, the path is built dynamically, if your template lives in a sub-directory, then you could specify your template like: `sub/path/items`.

These defaults can be overridden by setting properties on `ko.amdTemplateEngine`. For example:

    ko.amdTemplateEngine.defaultPath = "your/path/to/templates";
    ko.amdTemplateEngine.defaultSuffix = ".template.html";
    ko.amdTemplateEngine.defaultRequireTextPluginName = "text";
    
##module binding

This plugin also creates a `module` binding that provides a number of ways to bind directly against an AMD module. The binding accepts a number of options and tries to make smart choices by default.

###Choosing data to bind against

Once the `module` binding loads an AMD module, there are three scenarios for how it determines the actual data to bind against:

1. **constructor function** - If the module returns a function, then it is assumed that it is a constructor function and a new instance is used as the data.

2. **object returned** - If the module returns an object directly, then the binding will look for an initializer function (called `initialize` by default) and:

    a. if there is no initializer or the function does not return a value, then the data will be used directly.
  
    b. if the initializer function returns a value, then it will be used as the data.
  
So, this allows the binding to either construct a new instance, use data directly, or call a function that returns data.

###Basic example (with inline template):

    <div data-bind="module: 'one'">
         <div data-bind="text: name"></div>
    </div>
    
In this example, it will load the module `one`, determine what data to bind against, and use the inline template.

###Basic example (named template - could be external)

    <div data-bind="module: 'one'"></div>

In this example, it will load the module `one`, determine what data to bind against, and use `one` as the template, which is resolved by the template engine as described above. 

###Example with options

    <div data-bind="module: { name: 'one', data: initialData }"></div>

In this example, it will follow the same logic as the previous example, but it will pass the `initialData` to the module.
    
###Example with all options   
    
    <div data-bind="module: { name: 'one', data: initialData, template: 'oneTmpl',
                              initializer: 'createItem', disposeMethod: 'clean', afterRender: myAfterRender }"></div>
    
This example includes a number of options options that can be passed to the `module` binding. In this case, the template is overriden to use `oneTmpl`, a custom initializer function is used, a custom disposal method is specified, and an `afterRender` function is passed on to the template binding.

###Dynamically binding against a module

The `module` binding supports binding against an observable or passing an observable for the `name`, `template` and `data` options. The content will be appropriately updated based on the new values. This allows you to dynamically bind an area to a module that is updated as the user interacts with your site.

###$module context variable

The `module` binding adds a `$module` context variable that can be bound against. This can be useful when you want to bind against the equivalent of `$root` for just your module. When modules are nested inside other modules, `$module` will always refer to the root of the current module.

###module binding options

####name
Provide the name of the module to load. The module will be loaded by combining the name with the value of `ko.bindingHandlers.module.baseDir` (defaults to empty). The name will also be used as the template, if the `template` option is not specified and the element does not have any child elements (inline template).

####data
The `data` option is used to pass values into a constructor function or into the initializer function if the module returns an object directly. If an array is specified, then it will be applied as the arguments to the function (if you really want to pass an array as the first argument, then you would have to wrap it in an array like `[myarray]`).

####template
The `template` option provides the ability to override the template used for the module. In some cases, you may want to share a template across multiple modules or bind a module against multiple templates.

####initializer
If the module returns an object (rather than a constructor function), then the binding will attempt to call an initializer function, if it exists. By default, this function is called `initialize`, but you can override the name of the function to call using this option or globally by setting `ko.bindingHandlers.module.initializer` to the name of the function that you want to use.

####disposeMethod
When a module is swapped out, you can specify a custom function name to call to do any necessary clean up.

####afterRender
The `afterRender` function will be passed on the the template binding, if specified.

###module binding global options
There are a couple of options that can be set globally for convenience.

####ko.bindingHandlers.module.baseDir (default: "")
The `baseDir` is used in building the path to use in the `require` statement. If your modules live in the `modules` directory, then you can specify it globally here.

####ko.bindingHandlers.module.initializer (default: "initialize")
This allows the ability to globally override the function that the `module` binding calls after loading an AMD module that does not return a constructor.

####ko.bindingHandlers.module.disposeMethod (default: "dispose")
The dispose method name can be globally overriden. This function is optionally called when a module is being removed/swapped.

##Dependencies

* Knockout 2.0+

##Examples
The `examples` directory contains a sample using [require.js](http://requirejs.org/) and using [curl.js](https://github.com/cujojs/curl).

##License
MIT [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)

     

 
