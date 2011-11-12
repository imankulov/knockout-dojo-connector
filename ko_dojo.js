// function to bind Dojo/Dijit widgets with Knockout JS observables. Accepts
// "options" objects with following list of fields:
// element                      Dojo/Dijit element to bind. You can define it as `dijit.byId("someId")`
// elementId                    Dijit element id
// elements                     A valid dojo.query parameter to find all widgets
//
// Either element, elementId or elements parameter is required
//
// elementAttribute:            Attribute of Dijit element to be changed on observable changes (default "value")
// event:                       Element's event to be listened by observable (a String), default is "onChange"
// observable (required):       KnockoutJS observable to bind on other side. Usually looks like `viewModel.someValue`
// dojoEventHandler:            Function which changes observable value on a
//                              basis of new value received from Dojo. Can be set to null in  case of
//                              one-way knockout -> dojo binding
// knockoutObservableHandler:   Function which changes Dijit widget state on a
//                              basis of new knockout observable value. Can be set to null in case of
//                              one-way dojo -> knockout binding
//
//
// Textbox usage sample:
// -----------------------------------------------------------------------
// 
// js:
// var viewModel = {
//      firstName: ko.observable()
// };
// 
// html:
// <input type="text" name="firstName" data-dojo-type="dijit.form.TextBox" id="firstName">
//
// binding:
// bindDojoAndKnockout({element: dijit.byId('firstName'), observable: viewModel.firstName});
//
// Checkbox usage sample
// -----------------------------------------------------------------------
//
// The only difference is that elementAttribute we'd like to get value of is "checked"
// 
// js:
// var viewModel = {
//      agree: ko.observable()
// };
//
// html:
// <input type="checkbox" name="agree" data-dojo-type="dijit.form.CheckBox" id="agree">
//
// binding:
// bindDojoAndKnockout({elementId: 'agree', elementAttribute: 'checked', observable: viewModel.agree});
//
// Radio buttons usage sample
// -----------------------------------------------------------------------
// 
// Radio buttons are special case
// 1. You need to select all radio buttons with a given name
// 2. Value of knockout observable is set to currently active radio button
//
// js:
// var viewModel { 
//      drink: ko.observable()
// }
//
// html:
//     <label>
//         <input type="radio" name="drink" dojoType="dijit.form.RadioButton" value="coffee" id="coffeeButton"> Coffee
//     </label>
//     <label>
//         <input type="radio" name="drink" dojoType="dijit.form.RadioButton" value="tea" id="teaButton"> Tea
//     </label>
// binding:
// bindDojoAndKnockout({elements: 'input[type=radio]', observable: viewModel.drink})



function bindDojoAndKnockout(options) {
    if (options.element) {
        bindDojoAndKnockoutForElement(options);

    } else if (options.elementId) {
        var effectiveOptions = dojo.mixin({}, options);
        effectiveOptions.element = dijit.byId(options.elementId);
        if (effectiveOptions.element)
            bindDojoAndKnockoutForElement(effectiveOptions);

    } else if (options.elements) {

        dojo.query(options.elements).forEach(function(element){
            var effectiveOptions = dojo.mixin({}, options);
            effectiveOptions.element = dijit.byId(element.id);
            if (effectiveOptions.element)
                bindDojoAndKnockoutForElement(effectiveOptions);
        });

    }
};

function bindDojoAndKnockoutForElement(_options) {
    var defaultOptions = {
        element: undefined,
        elementAttribute: 'value',
        observable: undefined,
        event: 'onChange',
        dojoEventHandler: undefined,
        knockoutObservableHandler: undefined
    };
    var options = dojo.mixin({}, defaultOptions, _options);

    // default event handlers

    // Dojo event handler must setup observable
    function defaultDojoEventHandler() {
        var elementType = options.element.get('type');
        var elementValue = options.element.get(options.elementAttribute)
        // radio buttons, special case
        // we set up value only if value is not False
        if (elementType == 'radio') {
            if (elementValue) {
                options.observable(elementValue);
            }
        // common case
        } else {
            options.observable(elementValue);
        }
    }
    // knockout observale handler must accept value and change options.element
    function defaultKnockoutObservableHandler(newValue) {
        var elementType = options.element.get('type');
        // radio buttons, special case
        if (elementType == 'radio') {
            var elementValue = options.element.value;
            if (newValue == elementValue) {
                options.element.set('checked', true);
            } else {
                options.element.set('checked', false);
            }
        // common case
        } else {
            options.element.set(options.elementAttribute, newValue);
        }
    };
    
    if (options.dojoEventHandler === undefined)
        options.dojoEventHandler = defaultDojoEventHandler;

    if (options.knockoutObservableHandler === undefined)
        options.knockoutObservableHandler = defaultKnockoutObservableHandler;

    // setup connectors
    dojo.connect(options.element, options.event, function() {
        return options.dojoEventHandler && options.dojoEventHandler.apply(this, arguments);
    });
    options.observable.subscribe(function() {
        return options.knockoutObservableHandler && options.knockoutObservableHandler.apply(this, arguments);
    });
};
