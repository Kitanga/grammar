/* Convert our .gram2 file back to text */

var isLittleEndian = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x78;

var charMapToText = {
    "0111101": "0",
    "0110100": "1",
    "0110101": "2",
    "0110110": "3",
    "0110111": "4",
    "0111000": "5",
    "0111001": "6",
    "0111010": "7",
    "0111011": "8",
    "0111100": "9",
    "0000000": "a",
    "0000001": "b",
    "0000010": "c",
    "0000011": "d",
    "0000100": "e",
    "0000101": "f",
    "0000110": "g",
    "0000111": "h",
    "0001000": "i",
    "0001001": "j",
    "0001010": "k",
    "0001011": "l",
    "0001100": "m",
    "0001101": "n",
    "0001110": "o",
    "0001111": "p",
    "0010000": "q",
    "0010001": "r",
    "0010010": "s",
    "0010011": "t",
    "0010100": "u",
    "0010101": "v",
    "0010110": "w",
    "0010111": "x",
    "0011000": "y",
    "0011001": "z",
    "0011010": "A",
    "0011011": "B",
    "0011100": "C",
    "0011101": "D",
    "0011110": "E",
    "0011111": "F",
    "0100000": "G",
    "0100001": "H",
    "0100010": "I",
    "0100011": "J",
    "0100100": "K",
    "0100101": "L",
    "0100110": "M",
    "0100111": "N",
    "0101000": "O",
    "0101001": "P",
    "0101010": "Q",
    "0101011": "R",
    "0101100": "S",
    "0101101": "T",
    "0101110": "U",
    "0101111": "V",
    "0110000": "W",
    "0110001": "X",
    "0110010": "Y",
    "0110011": "Z",
    "0111110": "[",
    "0111111": "]",
    "1000000": "<",
    "1000001": ">",
    "1000010": "-",
    "1000011": "_",
    "1000100": "(",
    "1000101": ")",
    "1000110": "{",
    "1000111": "}",
    "1001000": "+",
    "1001001": ";",
    "1001010": "|",
    "1001011": ".",
    "1001100": "#",
    "1001101": "*",
    "1001110": "/",
    "1001111": "\\",
    "1010000": "\"",
    "1010001": "'",
    "1010010": "",
    "1010011": "=",
    "1010100": "@",
    "1010101": "$",
    "1010110": " ",
    "1010111": "\n"
};

// var fileReader = new FileReader();

// var file = new ArrayBuffer();

// fileReader.onload = function () {
//     // file = this.result;
//     convertToText(this.result);
// };

// fileReader.readAsArrayBuffer(fileGram2);

getGrammar('./../v2/test-grammar.gram2', function(req) {
    var buffer = req.response;
    console.log('Buffer:', buffer);

    if (buffer) {
        var str = convertToText(buffer);

        var element = document.createElement('div');
        element.innerText = str;
        document.body.appendChild(element);
    }
})


function getGrammar(url, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url);
    request.responseType = "arraybuffer";

    request.onload = function() {
        callback(request);
    };
    // function (oEvent) {
    //     var arrayBuffer = request.response; // Note: not request.responseText
    //     if (arrayBuffer) {
    //         var byteArray = new Uint8Array(arrayBuffer);
    //         for (var i = 0; i < byteArray.byteLength; i++) {
    //             // do something with each byte in the array
    //         }
    //     }
    // };

    request.send(null);
}

function convertToText(buffer) {
    var textString = getBufferAsString(buffer);

    var textString = getString(textString);

    return textString;
}

/**
 * Convert the binary data of file and store as a string.
 *
 * @param {ArrayBuffer} buffer Contains the file's binary data
 * @returns {string}
 */
function getBufferAsString(buffer) {
    var view = new DataView(buffer);
    console.log("View:",view);
    // The final string we'll return with all the 8bit integers in binary
    var str = "";

    // We'll store the integers in here
    var bytes = [];

    // Caching the length of our file in bytes
    var length = view.byteLength;
    console.log("Length:", length);

    // Get all the integers
    for (var ix1 = 0; ix1 < length; ix1++) {
        bytes[ix1] = view.getUint8(ix1);
    }

    console.log("bytes:", bytes);

    // My PC is little endian, so we reverse the array's elements so as to get the original code
    bytes.reverse();

    // Now take these integers, convert them to binary, and make sure they are 8 bits long
    for (var ix2 = 0; ix2 < length; ix2++) {
        var byteLength = 8;
        var byte = bytes[ix2].toString(2);
        // console.log(byte.length);
        var remainder = byteLength > byte.length ? byteLength % byte.length : 0;

        if (byteLength - byte.length) {
            // var bin = remainder;
            var newBin = "";

            for (var kx = 0, length2 = byteLength - byte.length; kx < length2; kx++) {
                newBin += "0";
            }
            byte = newBin + byte;
        }
        // console.log(byte);
        str += byte;
    }

    // console.log("String:", str.split(''));
    return str.split('');
}

/**
 * Return the decoded text
 *
 * @param {string[]} str an array of bits
 * @returns {string}
 */
function getString(str) {
    console.log("String:", str);
    // Remove the first 7 bits and convert to decimal so that we know how many bits each character holds
    var charLength = parseInt(str.splice(0, 7).join(''), 2);

    // Remove the next 3 bits and check what how many bits where used for filling
    var fillCount = parseInt(str.splice(0, 3).join(''), 2);

    // console.log("Fill count:", fillCount, "\nChar length:", charLength);

    // The final string goes here
    var result = "";

    // console.log("Check text:", charMapToText[str.splice(0, charLength).join('')], "\nBinary being passed:", str.splice(0, charLength).join(''));

    console.log("String later:", str);
    console.log("Length:", str.length - fillCount);

    for (var ix = 0, length = str.length - fillCount; ix < length; ix++) {
        result += charMapToText[str.splice(0, charLength).join('')];
        
        // if (!charMapToText[str.splice(0, charLength).join('')]) {
            // console.log(ix)
        // }
    }

    // console.log(result);
    result = result.replace(/undefined/g, "");
    return result;
}