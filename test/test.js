
var assert = require('assert');

var ge = require('ge');

var obj = new ge.GAUSS();

describe('GAUSS', function() {
  before(function() {
    obj.initialize();
  });

  after(function() {
    obj.shutdown();
  });

  describe('Basic workspace test', function() {
    var wh1;
    before(function() {
      wh1 = obj.createWorkspace("wh1");
    });
    it('should have name() be equal to "wh1"', function() {
      assert.equal("wh1", wh1.name());
    });
    it('should return true for destroying workspace', function() {
      assert.equal(true, obj.destroyWorkspace(wh1));
    });
    it('should return null for destroyed workspace pointer', function() {
      assert.equal(null, wh1.workspace());
    });
  });
  
  describe('Basic workspace test #2', function() {
    var wh2;
    before(function() {
      wh2 = obj.createWorkspace("wh2");
    });
    it('should correctly set the active workspace', function() {
      obj.setActiveWorkspace(wh2);
      assert.equal(wh2.name(), obj.getActiveWorkspace().name());
    });
    it('should update name correctly', function() {
      wh2.setName("wh222");
      obj.updateWorkspaceName(wh2);
      assert.equal("wh222", wh2.name());
    });
    it('should create multple workspaces', function() {
      let count = 100;
      let i;
      for (i = 0; i < count; i++) {
        let t = obj.createWorkspace("temp" + i);
      }
      for (i = 0; i < count; i++) {
        obj.destroyWorkspace(obj.getWorkspace("temp" + i));
      }
    });
  });
  
  describe('GEMatrix', function() {
    describe('scalar', function() {
      var x;
      before(function() {
        obj.executeString("x = 5");
      });
      it('should fetch value', function() {
          x = obj.getMatrix("x");
          assert.notEqual(null, x);
      });
      it('should equal assigned value', function() {
          assert.equal(5, x.getElement());
      });
    });
    describe('2x2', function() {
      var x;
      before(function() {
        obj.executeString("x = { 1 2, 3 4 }");
        x = obj.getMatrixAndClear("x");
      });
      it('should be correct rows', function() {
          assert.equal(2, x.getRows());
      });
      it('should be correct cols', function() {
          assert.equal(2, x.getCols());
      });
      it('should match assigned data', function() {
          assert.deepEqual([1, 2, 3, 4], x.getData());
      });
      it('should be correct size', function() {
          assert.equal(4, x.size());
      });
    });
    describe('cleared out', function() {
      var x;
      before(function() {
        x = obj.getMatrix("x");
      });
      it('should fetch a cleared out matrix', function() {
          assert.equal(1, x.getRows());
          assert.equal(1, x.getCols());
          assert.equal(0, x.getElement());
      });
    });
    describe('complex', function() {
      var x;
      before(function() {
        obj.executeString("x = complex(seqa(1,1,8), seqa(9,1,8))");
        x = obj.getMatrix("x");
      });
      it('should equal correct total size', function() {
          assert.equal(16, x.getData(true).length);
      });
      it('should equal correct real size', function() {
          assert.equal(8, x.size());
      });
      it('should equal assigned real data', function() {
          assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8], x.getData());
      });
      it('should equal assigned real data with getElement', function() {
          i = 1;
          num = 1;
  
          for (i = 0; i < x.size(); i++) {
            assert.equal(num, x.getElement(i));
            num += 1;
          }
  
          assert.deepEqual([9, 10, 11, 12, 13, 14, 15, 16], x.getImagData());
  
      });
      it('direct: should equal assigned real data', function() {
          x_d = obj.getMatrixDirect("x");

          num = 1;
          i = 1;
  
          for (i = 0; i < x_d.size(); i++) {
            assert.equal(num, x_d.getitem(i));
            num += 1;
          }
      });
    });
    describe('assign to workspace', function() {
      it('should set and fetch scalar', function() {
          data = 10;
          x = new ge.GEMatrix(data);
          assert.ok(obj.setSymbol(x, "y"));
          y = obj.getMatrix("y");
          assert.notEqual(null, y);
          assert.deepEqual(data, y.getElement());
      });
      it('should set and fetch matrix', function() {
          data = [...Array(10).keys()];
          x = new ge.GEMatrix(data);
          assert.ok(obj.setSymbol(x, "y"));
          y = obj.getMatrix("y");
          assert.notEqual(null, y);
          assert.deepEqual(data, y.getData());
      });
      it('should set and fetch complex #1', function() {
          data = [...Array(10).keys()];
          complex = [...Array(10).keys()];
          x = new ge.GEMatrix(data, complex, 10, 1);
          assert.ok(obj.setSymbol(x, "y"));
          y = obj.getMatrix("y");
          assert.notEqual(null, y);
          assert.deepEqual(data, y.getData());
          assert.deepEqual(data.concat(complex), y.getData(true));
          assert.deepEqual(complex, y.getImagData());
      });
      it('should set and fetch complex #2', function() {
          data = [...Array(20).keys()];
          complex = data.slice(10);
          x = new ge.GEMatrix(data, 10, 1, true);
          assert.ok(obj.setSymbol(x, "y"));
          y = obj.getMatrix("y");
          assert.notEqual(null, y);
          assert.deepEqual(data.slice(0,10), y.getData());
          assert.deepEqual(data, y.getData(true));
          assert.deepEqual(complex, y.getImagData());
      });
      it('should set and fetch direct matrix', function() {
          x = new ge.doubleArray(10);

          for (i = 0; i < 10; ++i) {
              x.setitem(i, i);
          }

          assert.ok(obj._setSymbol(x, "y"));
          y = obj.getMatrix("y");
          assert.notEqual(null, y);
          assert.deepEqual([...Array(10).keys()], y.getData());
      });
    });
  });
  describe('GEArray', function() {
    describe('basic', function() {
      var au, as, data;
      before(function() {
        data = [...Array(50).keys()];
        obj.executeString("ai = seqa(1,1,24); aj = seqa(25,1,24);");
        obj.executeString("as = areshape(ai, 2|3|4); at = areshape(aj, 2|3|4); au = complex(as,at)");
      });
      it('should retrieve real/complex', function() {
          as = obj.getArray("as");
          assert.notEqual(null, as);
          au = obj.getArray("au");
          assert.notEqual(null, au);
      });
      it('should match defined orders', function() {
          assert.deepEqual([2, 3, 4], au.getOrders());
      });
      it('should have correct dimension count', function() {
          assert.equal(3, au.getDimensions());
      });
      it('should have correct size', function() {
          assert.equal(24, au.size());
      });
      it('should have correct real data #1', function() {
          assert.deepEqual(data.slice(1,25), as.getData());
      });
      it('should have correct real data #2', function() {
          assert.deepEqual(data.slice(1,25), au.getData());
      });
      it('should have correct complex data', function() {
          assert.deepEqual(data.slice(25,49), au.getImagData());
      });
      it('should have correct plane data', function() {
          assert.deepEqual([5, 6, 7, 8, 17, 18, 19, 20], au.getPlane([0, 2, 0]).getData());
      });
      it('should have correct vector data', function() {
          assert.deepEqual([6, 18], au.getVector([0, 2, 2]));
      });
    });
    describe('assignment', function() {
      var a2, a3;
      it('should store to workspace', function() {
          a2 = new ge.GEArray([2, 2, 2], [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0]);
          assert.ok(obj.setSymbol(a2, "a2"));
      });
      it('should retrieve and validate', function() {
          a3 = obj.getArrayAndClear("a2");
          assert.notEqual(null, a3);

          assert.deepEqual([2, 2, 2], a3.getOrders());
          assert.equal(3, a3.getDimensions());
      });
      it('should retrieve cleared array', function() {
        a2 = obj.getArray("a2");
        assert.deepEqual([1], a2.getOrders());
        assert.equal(1, a2.getDimensions());
        assert.deepEqual([0], a2.getData());
      });
    });
  });
  describe('Strings', function() {
    describe('basic', function() {
      var str;
      before(function() {
          str = "Hello World";
      });
      it('should assign string', function() {
          assert.ok(obj.setSymbol(str, "s"));
      });
      it('should retrieve string', function() {
          s = obj.getString("s");
          assert.equal("Hello World", s);
          assert.equal(11, s.length);
      });
      it('should have correct type', function() {
          assert.equal(ge.GESymType.STRING, obj.getSymbolType("s"));
      });
    });
    describe('temporary workspace', function() {
      var tempWh;
      before(function() {
          tempWh = obj.createWorkspace("temp");
      });
      it('should save string separately', function() {
          // Change the value of 's' in GAUSS
          obj.executeString("s = \"Goodbye World\"", tempWh);
          s = obj.getString("s");
          assert.equal("Hello World", s);
          s = obj.getString("s", tempWh);
          assert.equal("Goodbye World", s);
      });
      it('should have correct type', function() {
          assert.equal(ge.GESymType.STRING, obj.getSymbolType("s", tempWh));
      });
    });
  });
  describe('GEStringArray', function() {
    describe('basic', function() {
      var sa, sa2;
      before(function() {
          obj.executeString("string sa = { this is a test, one two three four, five six seven eight }");
      });
      it('should retrieve from symbol table', function() {
          sa = obj.getStringArray("sa");
          assert.notEqual(null, sa);
      });
      it('should be correct size', function() {
          assert.equal(12, sa.size());
      });
      it('should fetch correct element', function() {
          assert.equal("EIGHT", sa.getElement(2,3));
          assert.equal("EIGHT", sa.getData()[11]);
      });
      it('should assign to workspace', function() {
          sa2 = ["one", "two", "three", "four"]
          gesa2 = new ge.GEStringArray(sa2, 2, 2);
          assert.ok(obj.setSymbol(gesa2, "sa2"));
      });
      it('should match assigned value', function() {
          sa = obj.getStringArray("sa2");
          assert.notEqual(null, sa);
          assert.equal(4, sa.size());
          assert.deepEqual(sa2, sa.getData());
      });
    });
  });
});

