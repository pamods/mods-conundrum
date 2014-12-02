// parse yyyymmdd date format
function parse_yyyymmdd(str) {
    if(!/^(\d){8}$/.test(str)) return "-";
    var y = str.substr(0,4),
        m = str.substr(4,2),
        d = str.substr(6,2);
    return new Date(y,m-1,d);
}

// Read a string in the format "hh:mm" and convert it to a UTC date.
function from_utc_time_string(str) {
	var timeComponents = str.split(":");
	var d = new Date();
	timeComponents[1] -= d.getTimezoneOffset();
	return Date.UTC(1970,0,1,parseInt(timeComponents[0]),parseInt(timeComponents[1]));
}

function to_00_str(num) {
	var str = "" + num;
	if(num < 10)
		str = "0" + str;
	return str;
}

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}