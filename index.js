var ge = require('ge');

var obj = new ge.GAUSS();

obj.initialize();

obj.executeString("print \"Hello World\"");
console.log(obj.getOutput());

obj.executeString("x = reshape(seqa(1,1,10), 5, 2)");

var x = obj.getMatrix("x");

console.log('x size = ' + x.getRows() + 'x' + x.getCols());

for (let n of x.getData()) {
    console.log('Value is = ' + n);
}

obj.executeString("s = \"hello world\"");
obj.executeString("sa = reshape(s, 5, 5)");

var s = obj.getString("s");
var sa = obj.getStringArray("sa");
var sa_data = sa.getData();

obj.shutdown();

