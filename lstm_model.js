class LSTM_model {
	constructor() {
		this.load();
	}

	async load(){
		this.model = await tf.loadLayersModel('https://raw.githubusercontent.com/javirk/virtual-walk-js/master/model/LSTM/model.json')
	}

	predict(coords) {
		let prediction = this.model.predict(coords);
		const y = tf.tidy(() => {
			return this.argMax(prediction.dataSync());
		});
		return y
	}

	argMax(array) {
	  return [].map.call(array, (x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
	}

	get_coordinates(list_persons) {
	    var xs = [];
	    var hs = [];
	    var ws = [];
			var avg_h = 0;
			var avg_w = 0;
	    for (var i = 0; i < list_persons.length; i++) {
	      xs.push(list_persons[i].keypoints_positions);
	      hs.push(list_persons[i].H);
	      ws.push(list_persons[i].W);
				avg_h += list_persons[i].H;
				avg_w += list_persons[i].W;
	    }
			avg_h /= (list_persons.length - 1);
			avg_w /= (list_persons.length - 1);

			var mean_0 = 0;
			var mean_1 = 0;
			for (var i = 0; i < xs.length; i++) {
				for (var j = 0; j < xs[0].length; j++) {
					mean_0 += xs[i][j][0];
					mean_1 += xs[i][j][1];
				}
			}
			mean_0 /= (xs.length * xs[0].length);
			mean_1 /= (xs.length * xs[0].length);

			var x = xs;
			for (var i = 0; i < xs.length; i++) {
				for (var j = 0; j < xs[0].length; j++) {
					x[i][j][0] = (xs[i][j][0] - mean_0) / avg_h;
					x[i][j][1] = (xs[i][j][1] - mean_0) / avg_w;
				}
			}
			var coords = tf.tensor(this.flatten(x));
			coords = coords.reshape([1, list_persons.length, xs[0].length * 2]);
			return coords
	}

	flatten(arr) {
		var that = this;
		// From https://stackoverflow.com/questions/10865025/merge-flatten-an-array-of-arrays
	  return arr.reduce(function (flat, toFlatten) {
	    return flat.concat(Array.isArray(toFlatten) ? that.flatten(toFlatten) : toFlatten);
	  }, []);
	}
}



async function execute(){
	let xy;
	model = await loadModel();
	xy = await prepareData();
	data_x = xy[0];
	data_y = xy[1];

	var output = model.predict(data_x);
	console.log('Real ' + data_y);
	console.log('Predicted ' + output);
}
