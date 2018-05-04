function Register(name, value = 1) {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;
    this.bindValueToDataAttr = bindValueToDataAttr;

    $('#register_header').append('<td><strong>' + name + '</strong></td>');
    $('#register_body').append('<td data-highlight="haha" id="' + name + '" >...</td>');

    this.watcher('class', function(x) {
        $(`#${name}`).removeClass().addClass(x);
    })
    this.getUniqueSelector = function() {
        return `#${name}`;
    }

    this.bindValueToElement('status', `#${name}`);

    this.bindValueToDataAttr('highlight', this, 'highlight');
    
    this.triggerHighlightUpdate = function () {
        this.highlight = this.highlight;
    }

    this.highlight = [];

    this.name = name;
    this.value = value;
    this.status = undefined;
    this.class = '';


}
