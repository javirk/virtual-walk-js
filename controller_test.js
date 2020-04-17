let c;

class Controller {
  constructor(init_pos = {lat: 42.345573, lng: -71.098326}) {
    this.init_post = init_pos;
    this.panorama = new google.maps.StreetViewPanorama(
      document.getElementById('pano'), {
        position: init_pos,
        pov: {
          heading: ,
          pitch: 3.40
        }
      });

    this.degs_per_second = 60.0;
    this.rotate_fps = 100.0;
    this.qty_movement = 90;
  }

  right(){
    // Source: https://www.andrewnoske.com/wiki/Google_Maps_API_-_Street_View_Panorama_Animated
    var that = this;
    var initial_pov = this.panorama.getPov();

    var timer = setInterval(function() {
      var pov = that.panorama.getPov();
      if (pov.heading > initial_pov.heading + that.qty_movement){
        clearInterval(timer);
        return;
      }
      pov.heading += that.degs_per_second / that.rotate_fps;
      that.panorama.setPov(pov);
    }, 1000 / this.rotate_fps);
  }

  left() {
    var that = this;
    var initial_pov = this.panorama.getPov();

    var timer = setInterval(function() {
      var pov = that.panorama.getPov();
      if (pov.heading < initial_pov.heading - that.qty_movement){
        clearInterval(timer);
        return;
      }
      pov.heading -= that.degs_per_second / that.rotate_fps;
      that.panorama.setPov(pov);
    }, 1000 / this.rotate_fps);
  }

  forward(){
    var links = this.panorama.getLinks();
    var heading = this.panorama.getPov().heading;
    var max = 1000;
    var i_max = 0;
    var diff_heading;

    for (var i in links){
      diff_heading = 180 - Math.abs((Math.abs(links[i].heading - heading) % 360) - 180)
      if (diff_heading < max){
        max = diff_heading;
        i_max = i;
      }
    }
    this.panorama.setPano(links[i_max].pano);
  }

}

function initialize() {
  c = new Controller();
}
