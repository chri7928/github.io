const https = require('https');
const url = require('url');
var fetch = require('node-fetch');

var countCallbacks = 0;

module.exports = {
	/**
		Chris Andrews - Code adapted from Yakjive.com

	    ArrayList
		.length
		.capacity
		.allowDuplicateKeys <-- note get()
		    will only get the first duplicate if true
		.add()
		.get(i) -- by index
		.getByKey(k)
		.getKeyByIndex(i) -- zero-based
		.hasKey(k)

	    Constructor function
		newArrayList(allowDupKeys)
	*/

	ArrayList: function (){
	    this.length = 0;
	    this.capacity = 10; //Why?  Not sure why I needed this.
	    this.allowDuplicateKeys = false;
	    this.keys = [];
	    this.items = [];
	    this.working = false;
	},

	newArrayList: function (allowDupKeys=false){
	    var arrayList = new this.ArrayList();
	    arrayList.allowDuplicateKeys = allowDupKeys;

	    arrayList.add = async function (key, item){
			//while (this.working){
			//	await this.sleep(5);
			//}
			this.working = true;
			var index = -1;

			if (key === null){
				this.working = false;
				return index;
			}

			if (!this.allowDuplicateKeys){
				for (i = 0; i < this.length; i++){
					if (key === this.keys[i]){
						index = i;
					}
				}
			}

			if (index > -1){
				this.items[index] = item;
			} else {
				this.keys.push(key);
				this.items.push(item);
				this.length = this.keys.length;
				index = this.length - 1;
			}
			this.working = false;
			return index; // the index where the item was inserted
		};

	    arrayList.getByKey = function (key){
			var result = null;
			for (i = 0; i < this.length; i++){
				if (this.keys[i] === key){
					result = this.items[i];
				}
			}
			return result;
		};
	    arrayList.hasKey = function (key){
			var result = null;
			for (i = 0; i < this.length; i++){
				if (this.keys[i] === key){
					return true;
				}
			}
			return false;
		};
	    arrayList.get = function (index){
			var result = null;
			result = this.items[index];
			return result;
		};
	    arrayList.getKeyByIndex = function (index){
			var result = null;
			result = this.keys[index];
			return result;
		};
	    arrayList.removeByKey = function (key){
			alert("removeByKey not implemented");
			this.length--;
		};
	    arrayList.removeByIndex = function (index){
			alert("removeByIndex not implemented");
			this.length--;
		};
		arrayList.toString = function(){
			var result = "";
			for (i = 0; i < this.length; i++){
//				result += this.keys[i] + ":" + this.items[i] + "\r\n";
				result += this.keys[i] + "\r\n";
			}
			return result;
		};
	    return arrayList;
	},

	inArray: function(key, arry){
		for (i in arry){
			if (key === arry[i]){
				return true;
			}
		}
		return false;
	},

	sleep: function (ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	},

	int32FromArray: function (a){
		var result = 0;
		for (var i = 0; i < 4; i++){
			if (a[i] > 0){
				result += (a[i] << (i * 8));
			}
		}
		return result;
	},

	//This version uses fetch with async/await to attempt to save on some url calls. Seems to work.
	//Assume that you get either JSON or Binary
	getSafeURL2: async function (tUrl, callback, keepBinary=false){
//console.log(tUrl);
		if (countCallbacks > 10000){
			setTimeout(function(){module.exports.getSafeURL2(tUrl, callback, keepBinary);}, 50);
			return;
		}
		countCallbacks++;
		var keepTrying = true;
		do {
			try {
				let value = await fetch(tUrl.href);
				if (keepBinary){
					value.buffer().then(res => {
						callback(res);
					}).catch((e) => {
						console.log("In fetch binary: ", tUrl.href);
						console.log(e);
					});
				} else {
					value.json().then(res => {
						callback(res);
					}).catch((e) => {
						console.log("In fetch JSON: ", tUrl.href);
						console.log(e);
					});
				}
				keepTrying = false;
			} catch (e) {
				if ((e.code === 'ETIMEDOUT') || (e.code === 'ECONNRESET')) {
//					console.log('.');
				} else {
					console.log('In getUrl: ' + tUrl.href);
					console.log(e.code);
					keepTrying = false;
				}
			}
		} while (keepTrying);
		countCallbacks--;
	},

	callbacksDone: function (){
		return (countCallbacks === 0);
	},

	getCallbacks: function () {
		return countCallbacks;
	}
}
