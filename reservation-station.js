function ReservationStation(name, instructionSet) {
    // Avoid modifying Object prototype since jQuery is dumb
    this.watcher = watcher;
    this.bindValueToElement = bindValueToElement;
    this.bindValueToDataAttr = bindValueToDataAttr;

    $('#reservation_station').append('\
        <tr id="' + 'rs_' + name + '"> \
            <td class="rs_name"><strong>' + name +
        '</strong>\
        </td> \
            <td class="rs_busy"></td>\
            <td class="rs_op"></td>\
            <td class="rs_vj"></td>\
            <td class="rs_vk"></td>\
            <td class="rs_qj"></td>\
            <td class="rs_qk"></td>\
            <td class="rs_a"></td>\
            <td class="rs_result"></td>\
        </tr>'
    )

    this.bindValueToElement('busy', `#rs_${name}>.rs_busy`);
    this.bindValueToElement('op', `#rs_${name}>.rs_op`);
    this.bindValueToElement('vj', `#rs_${name}>.rs_vj`);
    this.bindValueToElement('vk', `#rs_${name}>.rs_vk`);
    this.bindValueToElement('qj', `#rs_${name}>.rs_qj`);
    this.bindValueToElement('qk', `#rs_${name}>.rs_qk`);
    this.bindValueToElement('a', `#rs_${name}>.rs_a`);
    this.bindValueToElement('result', `#rs_${name}>.rs_result`);

    this.watcher('class', function(x) {
        $(`#rs_${name}`).removeClass().addClass(x);
    })

    this.getUniqueSelector = function() {
        return `#rs_${name}`;
    }

    this.bindValueToDataAttr('highlight', this, 'highlight');

    this.highlight = [];

    this.triggerHighlightUpdate = function () {
        this.highlight = this.highlight;
    }


    this.name = name;
    this.instructionSet = instructionSet;
    this.instruction = undefined;
    this.class = 'primary';

    this.busy = false;
    this.op = undefined;
    this.vj = undefined;
    this.vk = undefined;
    this.qj = undefined;
    this.qk = undefined;
    this.a = undefined;
    this.result = undefined;

    this.isSuitable = function(instructionName) {
        return this.instructionSet.indexOf(instructionName) !== -1;
    }

    this.tick = function() {
        if (this.instruction !== undefined) {
            if (this.instruction.cycle >= this.instruction.latency) {
                this.write_result();
            } else {
                this.execute();
            }
        }
    }

    this.write_result = function() {
        if (rsp.cdbAvailable()) {
            console.log('im done bitches');
            this.instruction.result_written = true;
            this.instruction.class = 'success';
            if (this.instruction.operation) {
                rb.getRegister(this.instruction.arg1).value = this.instruction.operation(this.vj, this.vk);
            }
            rb.getRegister(this.instruction.arg1).status = undefined;
            rb.getRegister(this.instruction.arg1).class = '';
            rsp.cdb(this.name, rb.getRegister(this.instruction.arg1).value);
            this.reset();
        } else {
            console.error('Common Data Bus is not available, stalling write result.');
        }
    }

    this.reset = function() {
        this.instruction = undefined;
        this.class = 'primary';

        this.class = '';
        this.busy = false;
        this.op = undefined;
        this.vj = undefined;
        this.vk = undefined;
        this.qj = undefined;
        this.qk = undefined;
        this.a = undefined;
        this.highlight = [];
        this.result = undefined;
    }

    this.execute = function() {
        if ((this.vj !== undefined || this.a !== undefined) && this.vk !== undefined) {
            this.instruction.execute();
            this.instruction.class = 'info'
            this.class = 'info';
        } else {
            this.instruction.class = 'danger';
            this.class = 'danger';
        }
    }

    this.cdb = function(name, result) {
        if (name == this.qj) {
            this.qj = undefined;
            this.vj = result;
        } else if (name == this.qk) {
            this.qk = undefined;
            this.vk = result;
        }
    }

    this.issue = function(instruction) {
        this.busy = true;
        this.op = instruction.name;
        this.instruction = instruction;
        this.class = 'info';
        instruction.issued = true;
        instruction.class = 'info';

        // Update register status
        rb.getRegister(instruction.arg1).status = this.name;
        rb.getRegister(instruction.arg1).class = 'danger';

        instruction.highlight.push(this.getUniqueSelector());
        instruction.triggerHighlightUpdate();

        if (rb.getRegister(instruction.arg1) != undefined) {
            rb.getRegister(instruction.arg1).highlight.push(this.getUniqueSelector());
            rb.getRegister(instruction.arg1).highlight.push(instruction.getUniqueSelector());
            rb.getRegister(instruction.arg1).triggerHighlightUpdate();
        }
        if (rb.getRegister(instruction.arg2) != undefined) {
            rb.getRegister(instruction.arg2).highlight.push(this.getUniqueSelector());
            rb.getRegister(instruction.arg2).highlight.push(this.getUniqueSelector());
            rb.getRegister(instruction.arg2).triggerHighlightUpdate();
        }

        this.highlight.push(`#${instruction.arg2}`);
        this.highlight.push(`#${instruction.arg3}`);
        this.highlight.push(`#instruction_${instruction.uid}`)
        this.triggerHighlightUpdate();

        // Fill j parameter
        if (rb.isRegister(instruction.arg2)) {

            var r2 = rb.getRegister(instruction.arg2);
            if (r2.status === undefined) {
                // Register bank is updated
                this.vj = r2.value;
                this.qj = 0;
            } else {
                // Register bank is dirty, wait for RS
                this.qj = r2.status;

            }
        } else {
            this.a = instruction.arg2;
        }

        // Fill k parameter
        var r3 = rb.getRegister(instruction.arg3);

        if (r3.status === undefined) {
            // Register bank is updated
            this.vk = r3.value;
            this.qk = 0;
        } else {
            // Register bank is dirty, wait for RS
            console.log(r3);
            this.qk = r3.status;

        }
    }
}
