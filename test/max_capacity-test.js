'use strict';

var buster = require("buster");

var Capacity = require("../src/max_capacity.js");

buster.testCase("Max capacity test", {

    setUp : function() {
        this.capacity = new Capacity();
    },

    "isOverlappingRangeButNotSubRange" : {
        "should only be true if one overlaps another, without being subrange" : function() {

            var r1 = {
                "fromIncl" : 3,
                "toIncl" : 10,
                "capacity" : 100
            };

            var r2 = {
                "fromIncl" : 5,
                "toIncl" : 11,
                "capacity" : 100
            };

            var r3 = {
                "fromIncl" : 1,
                "toIncl" : 5,
                "capacity" : 100  
            }

            var r4 = { // subrange of r1
                "fromIncl" : 5,
                "toIncl" : 7,
                "capacity" : 100  
            }

            assert.equals(this.capacity.isOverlappingRangeButNotSubRange(r1, r2), true);
            assert.equals(this.capacity.isOverlappingRangeButNotSubRange(r1, r3), true);
            assert.equals(this.capacity.isOverlappingRangeButNotSubRange(r2, r3), true);
            assert.equals(this.capacity.isOverlappingRangeButNotSubRange(r1, r4), false);
        }
    },

    "getOverlappingRanges" : {
        "should find overlapping range" : function() {
            this.capacity.addRestriction(1, 10, 100); // Should find this
            this.capacity.addRestriction(1, 4, 100); // Should not find this
            this.capacity.addRestriction(12, 14, 100); // Should not find this
            var overlapping = {
                "fromIncl" : 5,
                "toIncl" : 11,
                "capacity" : 100
            };

            assert.equals(this.capacity.getOverlappingRanges(this.capacity.restrictions, overlapping), [0]);
        }
    },

    "getMaxCapacity" : {

        "should find max with one restriction" : function() {
            this.capacity.addRestriction(1, 10, 100);

            assert.equals(this.capacity.getMaxCapacity(), 100);
        },

        "should find max for 2 non-intersecting restrictions" : function() {
            this.capacity.addRestriction(1, 5, 100);
            this.capacity.addRestriction(6, 10, 100);

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with 3 restrictions, 1 more restrictive (in range) subrange of another" : function() {
            this.capacity.addRestriction(1, 6, 100);
            this.capacity.addRestriction(7, 10, 100);
            this.capacity.addRestriction(1, 5, 100); // This should be considered

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with 3 restrictions, 1 more restrictive (in capacity only) subrange of another" : function() {
            this.capacity.addRestriction(1, 6, 100);
            this.capacity.addRestriction(7, 10, 100);
            this.capacity.addRestriction(1, 6, 50); // This should be considered

            assert.equals(this.capacity.getMaxCapacity(), 150);
        },

        "should find max capacity with 3 restrictions, 1 more restrictive (in capacity and range - creates suffix range) subrange of another" : function() {
            this.capacity.addRestriction(1, 6, 100);
            this.capacity.addRestriction(7, 10, 100);
            this.capacity.addRestriction(1, 5, 50); // This should be considered, and first should be shifted down to 50

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with 3 restrictions, 1 more restrictive (in capacity and range - creates prefix range) subrange of another" : function() {
            this.capacity.addRestriction(1, 6, 100);
            this.capacity.addRestriction(7, 10, 100);
            this.capacity.addRestriction(2, 6, 50); // This should be considered, and first should be shifted down to 50

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with 3 restrictions, 1 more restrictive (in capacity and range - creates prefix and suffix range) subrange of another" : function() {
            this.capacity.addRestriction(1, 6, 100);
            this.capacity.addRestriction(7, 10, 100);
            this.capacity.addRestriction(2, 5, 50); // This should be considered, and first should be shifted down to 50

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with 4 restrictions, 1 more restrictive subrange of another, and 1 more lenient subrange" : function() {
            this.capacity.addRestriction(1, 6, 100);
            this.capacity.addRestriction(7, 10, 100);
            this.capacity.addRestriction(1, 5, 100); // This should be considered
            this.capacity.addRestriction(8, 10, 200); // This should be ignored

            assert.equals(this.capacity.getMaxCapacity(), 200);
        },

        "should find max capacity with many restrictions, all non-intersecting" : function() {
            var total = 0;
            for(var i = 1; i <= 10; i++) {
                total += 100;
                this.capacity.addRestriction(i, i, 100);
            }

            assert.equals(this.capacity.getMaxCapacity(), total);
        },
    }

});