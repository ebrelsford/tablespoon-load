var csv2json = require('csv2json');
var filesniffer = require('mapbox-file-sniff');
var fs = require('fs');
var stream = require('stream');


function sniff (filename, callback) {
    var fileContents = fs.readFileSync(filename);
    var isGeo = false;

    filesniffer.sniff(fileContents, function (err, filetype) {
        if (filetype) {
            // File was recognized by mapbox-file-sniff, must be geographic
            isGeo = true;
        }
        else {
            // Not recognized by mapbox-file-sniff, try to figure it out using
            // extensions
            if (filename.endsWith('.csv')) {
                filetype = 'csv';
            }
            else if (filename.endsWith('.json')) {
                filetype = 'json';
            }
        }

        callback(fileContents, filetype, isGeo);
    });
}


function load (filename, callback) {
    sniff(filename, function (buffer, filetype, isGeo) {
        // Convert file back to a stream for the sake of converters
        var fileStream = new stream.Readable();
        fileStream._read = function noop() {};
        fileStream.push(buffer);

        // Detect file type, invoke correct glue
        switch (filetype) {
            case 'csv': callback(fileStream.pipe(csv2json()));
            case 'json': callback(fileStream);
        }
    });
}


module.exports = load;
