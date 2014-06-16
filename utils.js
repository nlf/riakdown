exports.reverseString = function (str) {
    var input = '' + str;
    var output = '';

    for (var i = 0, l = input.length; i < l; i++) {
        output += String.fromCharCode(~input[i].charCodeAt() & 0x7F);
    }

    return output;
};

exports.increment = function (str) {
    if (str === null || str === '') {
        return str;
    }

    var output = +str;

    if (isNaN(output)) {
        output = str;
        output[output.length - 1] = String.fromCharCode(output[output.length - 1].charCodeAt() + 1);
    } else {
        if (output % 1 !== 0) {
            output = Math.ceil(output);
        } else {
            output = output + 1;
        }
    }

    return output;
};

exports.decrement = function (str) {
    if (str === null || str === '') {
        return str;
    }

    var output = +str;

    if (isNaN(output)) {
        output = str;
        output[output.length - 1] = String.fromCharCode(output[output.length - 1].charCodeAt() - 1);
    } else {
        if (output % 1 !== 0) {
            output = Math.floor(output);
        } else {
            output = output - 1;
        }
    }

    return output;
};

exports.roundDown = function (str) {
    if (str === null || str === '') {
        return str;
    }

    var output = +str;
    
    if (isNaN(output)) {
        return str;
    } else {
        if (output % 1 !== 0) {
            output = Math.floor(output);
        }
    }

    return output;
};

exports.roundUp = function (str) {
    if (str === null || str === '') {
        return str;
    }

    var output = +str;
    
    if (isNaN(output)) {
        return str;
    } else {
        if (output % 1 !== 0) {
            output = Math.ceil(output);
        }
    }

    return output;
};
