# Converting a JS Grammar File to another "weird" format using Type Arrays

## Using the demo

As the title states, I took a JS Grammar file and converted it to a fake ".gram2" file __just for fun__. Which actually shaved off (in regards to the .gram files in this repo) 9 bytes. This is down to how I manipulated the files not really because I used Type Arrays.

To test this, simply run a server:

e.g. `serve .`

(in case you do not have one, you can install the `serve` package using `npm install -g serve`)

And load the page in a browser by going to http://localhost:5000

On screen will appear the original .gram file upon reconversion.

## Converting .gram files

Place a JS Grammar file in the `rawSrc` folder and run `node create_gram-node.js`. you will find the exported file in the `v2` folder.

The browser example only loads `test-grammar.gram2` from the `v2` folder, so you'll have to edit line 107 of `js/convert-to-text.js` to load your own .gram file onto the page.