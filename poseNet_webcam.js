// the output of our webcam
let webcam_output;
let person = '';
// to store the ML model
let poseNet;
let lstm_model;
// output of our ML model is stores in this
let poses = [];
let person_list = [];
let controller;
let input;

const options = {
  architecture: 'ResNet50',
  detectionType: 'single',
  outputStride: 32,
  scoreThreshold: 0.5,
};
let classes = ['walk', 'stand', 'left', 'right'];
let valid = 0;
let buffer = [];
let buffer_og = [];
var valid_startings = [];

let n_frames = 5;
let time_between_actions = 0.5; // In seconds

function setup() {
  createCanvas(640, 480);

  input = createInput();

  button = createButton('load key');
  button.mousePressed(load_maps);

  webcam_output = createCapture(VIDEO);
  webcam_output.size(width, height);
  //c = new Controller()
  poseNet = ml5.poseNet(webcam_output, options, modelReady);
  lstm_model = new LSTM_model();

  poseNet.on('pose', gotPose);
  webcam_output.hide();
}

async function load_model() {
  lstm_model = await load_lstm();
  lstm_ready();
}

function load_maps() {
  var imported = document.createElement('script');
  imported.src = 'https://maps.googleapis.com/maps/api/js?key='+ input.value() + '&callback=initialize';
  document.head.appendChild(imported);
}

async function gotPose(results){
  //console.log(pose)
  person = new Person(results[0]);
  if (valid == 0 && person.is_valid_first()){
    buffer.push(person);
    buffer_og.push(person);
    valid += 1;
  } else if (0 < valid && valid < n_frames - 1) {
    if (person.is_valid_first()){
      buffer_og.push(person);
    } else {
      buffer_og.push(false);
    }
    try{
      person.infer_keypoints(buffer[valid - 1]);
    } catch(error) {
      a = person;
    }
    buffer.push(person);
    valid += 1;
  } else if (valid == n_frames - 1) {
    // Only case where we process a group of frames
    if (person.is_valid_first()) {
      buffer_og.push(person);
    } else {
      buffer_og.push(false);
    }

    person.infer_keypoints(buffer[valid - 1]);
    buffer.push(person);
    // CALL THE LSTM NOW -- Function to get coordinates and predict
    process_list(buffer);
    //
    valid_startings = [];
    for (let i = 0; i < buffer_og.length; i++) {
      if (buffer_og[i]) {
        valid_startings.push(i);
      }
    }

    if (valid_startings.length > 0) {
      buffer = buffer_og.slice(valid_startings[0], buffer_og.length);
      valid = buffer.length;
    } else {
      buffer = [];
      valid = 0;
    }
    setTimeout(() => {}, time_between_actions * 1000);

  } else if (person.is_valid_first()) {
    buffer = [person];
    buffer_og = [person];
    valid = 1;
  } else {
    buffer = [];
    valid = 0;
  }
}


function process_list(buffer) {
  let coords = lstm_model.get_coordinates(buffer);
  let output = lstm_model.predict(coords);
  console.log(classes[output]);

  switch (classes[output]) {
    case 'walk':
      c.forward();
      break;
    case 'right':
      c.right();
      break;
    case 'left':
      c.left();
      break;
    default:
      break;
  }
}

function modelReady() {
  select('#status_posenet').html('Model Loaded');
}

function lstm_ready() {
  select('#status_lstm').html('LSTM loaded');
}

function draw() {
  image(webcam_output, 0, 0, width, height);
  if (person != '') {
    person.drawKeypoints();
    person.drawSkeleton();
  }
}


class Person {
  // Might be better to extend ml5's pose, but not sure how to do that.
  constructor(pose, joints_remove) {
    this.pose = pose.pose;
    this.skeleton = pose.skeleton;
    this.keypoints = pose.pose.keypoints;
    this.threshold = 0.5;
    this.keypoints.push(this.infer_neck());
    this.H = this.get_height();
    this.W = this.get_width();
    this.joints_remove = [13, 14, 15, 16];
    this.keypoints_positions = this.get_keypoints_array(this.joints_remove);
  }

  drawSkeleton() {
    for (let j = 0; j < this.skeleton.length; j++) {
      let startPoint = this.skeleton[j][0];
      let endPoint = this.skeleton[j][1];
      stroke(0, 255, 0);
      line(startPoint.position.x, startPoint.position.y, endPoint.position.x, endPoint.position.y);
    }
  }

  drawKeypoints(){
    for (let j = 0; j < this.pose.keypoints.length; j++) {
      let keypoint = this.pose.keypoints[j];
      if (keypoint.score > this.threshold) {
        fill(0, 0, 255);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }

  infer_keypoints(prev_person) {
    var that = this;
    this.keypoints.forEach( function(kp, index) {
      if (that.keypoints[index].score < that.threshold) {
        that.infer_point(index, prev_person);
      }
    });
    this.H = this.get_height();
    this.W = this.get_width();
  }

  infer_point(index, prev_person) {
    var prev_person_pos;
    if (this.keypoints[index].score < this.threshold) {
      prev_person_pos = prev_person.keypoints[index].position
      this.keypoints[index].position.x = this.keypoints[17].position.x + prev_person_pos.x - prev_person.keypoints[17].position.x;
      this.keypoints[index].position.y = this.keypoints[17].position.y + prev_person_pos.y - prev_person.keypoints[17].position.y;
    }
  }

  infer_neck() {
    var lshoulder = this.keypoints[5];
    var rshoulder = this.keypoints[6];
    var neckx = (rshoulder.position.x + lshoulder.position.x) / 2;
    var necky = (rshoulder.position.y + lshoulder.position.y) / 2;
    var confidence = min(lshoulder.score, rshoulder.score);
    var neck = {
      score: confidence,
      part: 'neck',
      position: {x: neckx, y: necky}
    }
    return neck
  }

  get_height() {
    var cand_inf = [];
    var cand_sup = [];
    var cand_inf_y;
    var cand_sup_y;

    for (var i = 0; i <= 12; i++){ // Better in two loops?
      if (i < 5 && this.keypoints[i].score > this.threshold){
        cand_sup.push(this.keypoints[i].position.y);
      } else if ((i == 11 || i == 12) && this.keypoints[i].score > this.threshold) {
        cand_inf.push(this.keypoints[i].position.y);
      }
    }

    if (cand_inf.length > 0 && cand_sup.length > 0) {
      cand_inf_y = cand_inf.sort(function (a, b) {
          return b - a;
        })[0];

      cand_sup_y = cand_sup.sort(function (a, b) {
          return a - b
        })[0];
      return cand_inf_y - cand_sup_y

    } else {
      return 0;
    }
  }

  get_width() {
    var lshoulder_x;
    var rshoulder_x;
    if (this.keypoints[5].score > this.threshold) {
      lshoulder_x = this.keypoints[5].position.x;
      if (this.keypoints[6].score > this.threshold) {
        rshoulder_x = this.keypoints[6].position.x;
        return Math.abs(rshoulder_x - lshoulder_x);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  }

  is_valid_first() {
    return (this.H > 0 && this.W > 0);
  }

  get_keypoints_array(joints_remove) {
    var kp = [];
    for (var i = 0; i < this.keypoints.length; i++) {
      if (!joints_remove.includes(i)) {
        kp.push([this.keypoints[i].position.x, this.keypoints[i].position.y]);
      }
    }
    return kp;
  }
}
