/* Code used to convert and a gram file into a gram2 file */

var fs = require('fs');
var path = require('path');

var isLittleEndian = new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x78;

var charMapToBin = {
    "0": "0111101",
    "1": "0110100",
    "2": "0110101",
    "3": "0110110",
    "4": "0110111",
    "5": "0111000",
    "6": "0111001",
    "7": "0111010",
    "8": "0111011",
    "9": "0111100",
    "a": "0000000",
    "b": "0000001",
    "c": "0000010",
    "d": "0000011",
    "e": "0000100",
    "f": "0000101",
    "g": "0000110",
    "h": "0000111",
    "i": "0001000",
    "j": "0001001",
    "k": "0001010",
    "l": "0001011",
    "m": "0001100",
    "n": "0001101",
    "o": "0001110",
    "p": "0001111",
    "q": "0010000",
    "r": "0010001",
    "s": "0010010",
    "t": "0010011",
    "u": "0010100",
    "v": "0010101",
    "w": "0010110",
    "x": "0010111",
    "y": "0011000",
    "z": "0011001",
    "A": "0011010",
    "B": "0011011",
    "C": "0011100",
    "D": "0011101",
    "E": "0011110",
    "F": "0011111",
    "G": "0100000",
    "H": "0100001",
    "I": "0100010",
    "J": "0100011",
    "K": "0100100",
    "L": "0100101",
    "M": "0100110",
    "N": "0100111",
    "O": "0101000",
    "P": "0101001",
    "Q": "0101010",
    "R": "0101011",
    "S": "0101100",
    "T": "0101101",
    "U": "0101110",
    "V": "0101111",
    "W": "0110000",
    "X": "0110001",
    "Y": "0110010",
    "Z": "0110011",
    "[": "0111110",
    "]": "0111111",
    "<": "1000000",
    ">": "1000001",
    "-": "1000010",
    "_": "1000011",
    "(": "1000100",
    ")": "1000101",
    "{": "1000110",
    "}": "1000111",
    "+": "1001000",
    ";": "1001001",
    "|": "1001010",
    ".": "1001011",
    "#": "1001100",
    "*": "1001101",
    "/": "1001110",
    "\\": "1001111",
    "\"": "1010000",
    "'": "1010001",
    ":": "1010010",
    "=": "1010011",
    "@": "1010100",
    "$": "1010101",
    " ": "1010110",
    "\n": "1010111"
};

/**
 * Takes the content and encodes it as a unsigned 7bit integer
 *
 * @param {string} gramText The .gram file content as text
 * 
 * @returns {string[]} An array of bits in string format
 */
function convertToGram2(gramText) {
    // Split string into it's individual characters.
    var str = gramText.split('');

    // Create an array and fill it with the 7bit characters
    var gram2Text = [];

    for (var ix = 0, length = str.length; ix < length; ix++) {
        gram2Text[ix] = charMapToBin[str[ix]];
    }

    return gram2Text;
}

/**
 * Adds header info to the binary data and also adds the filler bits to the end of the file if needed
 *
 * @param {string[]} gram2Bin An array of bits in string format
 */
function addHeader(gram2Bin) {
    // Start off by adding a single bit to the header array
    var header = ['0000111'].join('').split('');

    // Make sure that the string has a length of 3, since the filler takes up 3 bits
    var fillBitCount = 3;

    // Placed these variables here instead of stuffing the fillCount variable 
    var totalBitsPerCharacter = 8;
    var totalBitsHeader = (console.log(header.length), header.length) + fillBitCount;
    var totalBitsGram2Bin = gram2Bin.join('').length;
    var totalBitsWithoutFill = totalBitsHeader + totalBitsGram2Bin;
    var remainder = totalBitsWithoutFill % totalBitsPerCharacter;

    // Now find out how many bits we'll need to make sure that the whole file is divisible by 8 (so that we have an exact number of bytes)
    var fillCount = remainder ? (totalBitsPerCharacter - remainder).toString(2) : "000";

    if (fillBitCount - fillCount.length) {
        // var bin = fillCount;
        var newBin = "";

        for (var ix = 0, length = fillBitCount - fillCount.length; ix < length; ix++) {
            newBin += "0";
        }
        fillCount = newBin + fillCount;
    } else if (fillBitCount < fillCount.length) {
        fillCount = "000";
    }

    // Add bits to the end of the header
    header.push(fillCount);

    // Finally, let's concat the two arrays and add the filler bits
    var file = header.concat(gram2Bin);

    for (var ix = 0, length = parseInt(fillCount, 2); ix < length; ix++) {
        // 
        file.push('0');
    }

    // console.log("file array:", file);

    // console.log("File:", file.join(''));
    // console.log("File length", file.join('').length);
    return file.join('');
}

/**
 * Create the .gram2 file
 *
 * @param {string} fileContent The file content as a string
 * @param {string} fileName The file's name
 */
function createGram2(fileContent, fileName) {
    // Add the header bits to the converted gram2 binary representation
    var gram2Bin = convertToGram2(fileContent);

    // Add header info and fill any stray bits so that this file is divisible by 8
    gram2Bin = addHeader(gram2Bin);

    // Now create the file

    // First create an array buffer with the same number of bytes as the file we'll create
    var totalBytes = gram2Bin.length / 8;

    // Create an Uint8 typed array
    var uint8 = new Uint8Array(totalBytes);

    // Create an array of strings consisting of 8 bit binary digits
    var uint8Gram2Bin = [];
    /** @type string[] */
    var gram2BinArray = gram2Bin.split('');

    for (var ix = 0, length = totalBytes; ix < length; ix++) {
        uint8Gram2Bin.push(gram2BinArray.splice(0, 8));
    }

    if (isLittleEndian) {
        uint8Gram2Bin.reverse();
    }

    // Take this newly created array and use it to fill the typed array we created earlier
    for (var ix = 0, length = totalBytes; ix < length; ix++) {
        // Here we parse the binary as a decimal number and place it in the uint8 typed array
        uint8[ix] = parseInt(uint8Gram2Bin[ix].join(''), 2);
    }

    // The path to the file
    var filePath = path.join(__dirname, '/v2', fileName + ".gram2");

    // Here we create and place the file in the v2 folder
    fs.writeFile(filePath, new Buffer(uint8), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Written:", uint8.length, "bytes to\n", filePath);
        }
    });
}

/**
 * Creates a .gram2 file which uses 7 bits for each character instead of 8.
 * 
 * File Format
 * 
 * FillCount_Content
 * 
 *  111_______000...
 * 
 * The [FillCount] tells the parser how many bits where used to make sure that this file is divisible by eight. i could have also set that in the header, but felt that that would bloat up the file.
 * 
 * The [Content] is the text content
 */
function createGram2File() {
    // Get all the names of files and firectories in current folder
    const dirname = path.join(__dirname,'rawSrc');
    fs.readdir(dirname, (err, files) => {
        // If error, console log it
        if (err) {
            console.log(err);
        } else {
            // Otherwise, continue
            console.log('Got list of files:', files);
            files.forEach(file => {
                // If this file name contains .gram...
                if (file.includes('.gram')) {
                    // console.log('Working on', file);
                    // ...read the file contents...
                    fs.readFile(path.join(dirname,file), 'utf8', (err, data) => {
                        if (err) throw err;
                        // Now create the .gram2 file and save it in the v2 folder
                        createGram2(data, file.replace('.gram', ''));
                    });
                }
            });
        }
    });
}
createGram2File();