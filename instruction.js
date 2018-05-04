function Instruction(params) {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;
    this.bindValueToDataAttr = bindValueToDataAttr;

    var {
        uid,
        name,
        latency,
        arg1,
        arg2,
        arg3,
        operation
    } = params;

    $('#instructions').append(
        `<tr class="instruction highlight" id="instruction_${uid}">\
        <td class="name"><strong>${name} ${arg1}, ${arg2}, ${arg3}</strong> [${latency} cycles]</td>\
        <td class="issued"></td>\
        <td class="executed"></td>\
        <td class="result_written"></td>\
        </tr>`
    );

    this.uid = uid;
    this.name = name;
    this.latency = latency;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.arg3 = arg3;
    this.operation = operation;
    this.displayFormat = '{{NAME}} {{ARG1}} {{ARG2}} {{ARG3}} [{{LATENCY}} cycles]'
    this.cycle = 0;

    this.getUniqueSelector = function() {
        return `#instruction_${uid}`;
    }

    this.bindValueToElement('issued', `${this.getUniqueSelector()}>.issued`);
    this.bindValueToElement('executed', `${this.getUniqueSelector()}>.executed`);
    this.bindValueToElement('result_written', `${this.getUniqueSelector()}>.result_written`);

    this.bindValueToDataAttr('highlight', this, 'highlight');

    this.triggerHighlightUpdate = function () {
        this.highlight = this.highlight;
    }

    this.watcher('class', function(x) {
        $(`#instruction_${uid}`).removeClass().addClass(x).addClass('instruction');
    })

    this.issued = false;
    this.executed = false;
    this.result_written = false;
    this.class = '';
    this.highlight = [
        `#${this.arg2}`,
        `#${this.arg3}`
    ];

    this.execute = function() {
        this.cycle++;
        this.executed = `${this.cycle} / ${this.latency}`;
    }
}
