// the output of our webcam
let webcam_output;
// to store the ML model
let poseNet;
// output of our ML model is stores in this
let poses = [];
let person_list = [];

const options = {
  architecture: 'ResNet50',
  detectionType: 'single',
  outputStride: 32,
  scoreThreshold: 0.5,
};

function setup() {
  createCanvas(640, 480);

  webcam_output = createCapture(VIDEO);
  webcam_output.size(width, height);

  poseNet = ml5.poseNet(webcam_output, options, modelReady);

  poseNet.on('pose', gotPose);
  webcam_output.hide();
}

function gotPose(results){
  //console.log(pose)
  poses = results
  //person_list.push(results[0])
}

function modelReady() {
  select('#status').html('Model Loaded');
}

function draw() {
  image(webcam_output, 0, 0, width, height);
  drawKeypoints();
  drawSkeleton();
}


class Person {
  // Might be better to extend ml5's pose, but not sure how to do that.
  constructor(pose) {
    this.pose = pose.pose;
    this.skeleton = pose.skeleton;
    this.keypoints = pose.pose.keypoints;
    this.threshold = 0.5;
    this.keypoints.push(this.infer_neck());
    this.H = this.get_height();
    this.W = this.get_width();
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
      if (keypoint.score > 0.2) {
        fill(0, 0, 255);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }

  infer_keypoints(prev_person) {
    var that = this;
    this.keypoints.array.forEach( function(kp, index) {
      if (that.keypoints[index].score < this.threshold) {
        that.infer_point(index, prev_person);
      }
    });
    this.H = this.get_height();
    this.W = this.get_width();
  }

  infer_point(index, prev_person) {
    if (this.keypoints[index].score < this.threshold) {
      this.keypoints[index].position.x = this.keypoints[17].position.x + prev_person.keypoints[index].position.x - prev_person.keypoints[17].position.x;
      this.keypoints[index].position.y = this.keypoints[17].position.y + prev_person.keypoints[index].position.y - prev_person.keypoints[17].position.y;
    }
  }

  infer_neck() {
    lshoulder = this.keypoints[5];
    rshoulder = this.keypoints[6];
    neckx = (rshoulder.position.x + lshoulder.position.x) / 2;
    necky = (rshoulder.position.y + lshoulder.position.y) / 2;
    confidence = min(lshoulder.score, rshoulder.score);
    neck = {
      score: confidence,
      part: 'neck',
      position: {x: neckx, y: necky}
    }
    return neck
  }

  get_height() {
    var cand_inf = [this.keypoints[11], this.keypoints[12]];
    var cand_inf = [];
    var cand_sup = [];

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
    if (this.keypoints[5].score > this.threshold) {
      lshoulder_x = this.keypoints[5].x
      if (this.keypoints[6].score > this.threshold) {
        rshoulder_x = this.keypoints[6].x
        return Math.abs(rshoulder_x - lshoulder_x)
      } else {
        return 0
      }
    } else {
      return 0
    }
  }

  is_valid_first() {
    return (this.H > 0 && this.W > 0);
  }
}