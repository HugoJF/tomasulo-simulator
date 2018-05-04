/**
 * DOM BINDING FUNCTIONS
 */

// data-attr guarda qual register, station e instruction deve highlightar
// mouse-over busca data-* e adiciona classe
// mouseleave procura todos com classe "highlight" e remove

var watcher = function(propertyName, setter) {
    Object.defineProperty(this, propertyName, {
        get: () => this['_' + propertyName],
        set: x => {
            setter(x);
            this['_' + propertyName] = x
        }
    })
}

var bindValueToElement = function(propertyName, selector) {
    this.watcher(propertyName, function(x) {
        $(selector).html((x || "").toString());
    })
}

var bindValueToDataAttr = function(propertyName, element, dataAttrName) {
    this.watcher(propertyName, function(x) {
        $(element.getUniqueSelector()).attr(`data-${dataAttrName}`, (x.join(';') || "").toString());
    })
}
