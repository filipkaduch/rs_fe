<template>
  <div class="about d-flex justify-content-center">
    <div id="app" class="web-camera-container">
      <div class="rounded mb-5 p-2 position-relative">
        <div class="camera-button">
            <button type="button" class="btn btn-action button is-rounded" :class="{ 'bg-primary' : !isCameraOpen, 'bg-danger' : isCameraOpen}" @click="toggleCamera">
              <span v-if="!isCameraOpen">
                Open Camera
              </span>
              <span v-else>Close Camera</span>
          </button>
        </div>
        <h3 v-if="isCameraOpen" class="text-white"> {{ mode === '1' ? `Authenticate via face recognition: ${this.userId}` : 'Register with 20 frames'}} </h3>
        <div v-show="isCameraOpen && isLoading" class="camera-loading">
          <ul class="loader-circle">
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
      </div>
      
      <div v-if="isCameraOpen" v-show="!isLoading" class="camera-box position-relative rounded" :class="{ 'flash' : isShotPhoto }">
        <div
          v-if="infoText !== null || check !== null"
          class="rounded p-2 text-white d-block align-items-center justify-content-center"
          :class="{ 'hopa' : check === 'Not detected', 'successOverlay' : check !== 'Not detected' && (parseValue(check) !== false || this.mode === '2'), 
          'warningOverlay' : check !== 'Not detected' && (parseValue(check) === false && this.mode === '1')  }">
          <h3 style="color: black;" v-if="infoText !== null && !btnDisable">{{ infoText }}</h3>
          <h3 style="color: black;" v-if="check !== null"> {{ `${check}, ${check === 'Not detected' ? 'try again!' : parseValue(check)
            ? 'authenticated!'
            : mode === '2'
              ? 'finished registering, you can return to registration!'
              : 'not successful enough! Try again'}` }}</h3>
        </div>
        <div class="camera-shutter" :class="{'flash' : isShotPhoto}"></div>
          
        <video v-show="!isPhotoTaken" ref="camera" :width="450" :height="337.5" class="rounded" autoplay></video>
        
        <canvas v-show="isPhotoTaken" id="photoTaken" ref="canvas" :width="450" class="rounded" :height="337.5"></canvas>
      </div>
      
      <div v-if="isCameraOpen && !isLoading" class="camera-shoot">
        <button type="button" class="button" @click="recognize" v-if="mode === '1'" :disabled="btnDisable">
          <b-spinner variant="primary" v-if="btnDisable" >{{ pictureCount }}</b-spinner>
          <img v-else src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png">
        </button>
        <div v-else class="d-block">
          <button type="button" class="button" style="margin-left: 20px;" :disabled="btnDisable" @click="startRecording">
            <b-spinner variant="primary" v-if="btnDisable" />
            <img v-else src="https://img.icons8.com/material-outlined/50/000000/camera--v2.png">
          </button>
          <!-- <p>{{infoText === null ? 'Start recording' : infoText}}</p> -->
        </div>
      </div>
      <div class="d-block">
        <div>
          <a href="https://github.com/filipkaduch/rs_fe">Front end Github page</a>
        </div>
        <a href="https://github.com/filipkaduch/recognition_services">Flask app serving FaceNet</a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'HelloWorld',
    data() {
        return {
          isCameraOpen: false,
          isPhotoTaken: false,
          isShotPhoto: false,
          infoText: null,
          btnDisable: false,
          isLoading: false,
          pictureCount: 0,
          overlay: false,
          interval: 0,
          check: null,
          dataUrl: '',
          pictureText: ['Frontal photo', 'Side photo 1', 'Side photo 2', 'Completed'],
          photos: [],
          userId: null,
          mode: false,
          link: '#'
        };
    },
    mounted() {
      this.userId = this.$route.query.user;
      this.mode = this.$route.query.mode; 
    },
    methods: {
        toggleCamera() {
          if(this.isCameraOpen) {
            this.isCameraOpen = false;
            this.isPhotoTaken = false;
            this.isShotPhoto = false;
            this.photos = [];
            this.check = null;
            this.infoText = null;
            this.pictureCount = 0;
            this.dataUrl = '';
            this.overlay = false;
            this.stopCameraStream();
          } else {
            this.isCameraOpen = true;
            this.createCameraElement();
          }
        },
      createCameraElement() {
        this.isLoading = true;
        
        const constraints = (window.constraints = {
          audio: false,
          video: true
        });
        navigator.mediaDevices
          .getUserMedia(constraints)
          .then(stream => {
            this.isLoading = false;
            this.$refs.camera.srcObject = stream;
          })
          .catch(error => {
            this.isLoading = false;
            console.log(error);
            alert("May the browser didn't support or there is some errors.");
          });
      },
      startRecording() {
        console.log('PROC?');
        this.infoText = 'Recording in progress';
        this.btnDisable = true;
        var i = 0
        const id = window.setInterval(function(){
            if(i >= 15) {
                clearInterval(id);
                return;
            }
            this.takePhoto();
            i++;
        }, 1000);
        this.infoText = 'Recording finished you can return to registration';
      },
      parseValue(check) {
        const regExp = /\(([^)]+)\)/;
        const matches = regExp.exec(check);

        if (check) {
          if (check.substr(0, check.indexOf(' ')) !== this.userId) {
            return false;
          }
        }
        console.log(matches);
        //matches[1] contains the value between the parentheses
        if (matches === null || matches?.length < 0) {
          return false;
        }
        return parseFloat(matches[1]) > 85;
      },
      stopCameraStream() {
        let tracks = this.$refs.camera.srcObject.getTracks();

        tracks.forEach(track => {
          track.stop();
        });
      },
      recognize() {
        this.check = null;
        this.infoText = null;
        this.takePhoto();
      },
      takePhoto() {
        if(!this.isPhotoTaken) {
          this.isShotPhoto = true;

          const FLASH_TIMEOUT = 50;

          setTimeout(() => {
            this.isShotPhoto = false;
          }, FLASH_TIMEOUT);
        }
        const canvas = document.getElementById("photoTaken").toDataURL("image/jpeg")
          .replace("image/jpeg", "image/octet-stream");

        if (this.mode === '1') {
          this.btnDisable = true;
          if (this.photos.length < 1) {
            this.downloadImage().then((data) => {
              this.check = data;
              console.log(this.check);
              console.log(typeof this.check);
              this.btnDisable = false;
            })
          } 
          
          if (this.photos.length === 1) {
            this.isPhotoTaken = !this.isPhotoTaken;
          }
        } else if(this.mode === '2') {
          if (this.photos.length < 20) {
            this.recordImage().then((data) => {
              this.check = this._.cloneDeep(data);
              console.log(this.check);
              console.log(typeof this.check);
              if (this.check !== 'Not detected') {
                // this.dataUrl = URL.createObjectURL(this.check)
                this.pictureCount++;
                this.overlay = false;
                this.btnDisable = false;
                this.photos.push(canvas);
              } else {
                this.infoText = '';
              }
            });
            // this.isPhotoTaken = !this.isPhotoTaken;
          } 
          
          if (this.photos.length === 30) {
            this.isPhotoTaken = !this.isPhotoTaken;
          }
        }
        
        const context = this.$refs.canvas.getContext('2d');
        context.drawImage(this.$refs.camera, 0, 0, 450, 337.5);
      },
      imgUrl(){
        const arrayBuffer = new Uint8Array(this.check);
        const blob  = new Blob([arrayBuffer], {type: "image/jpeg"});

        return window.URL.createObjectURL(blob);
      },
      recordImage() {
        // eslint-disable-next-line no-unused-vars
        const download = document.getElementById("downloadPhoto");
        const canvas = document.getElementById("photoTaken").toDataURL("image/png")
          .replace("image/jpeg", "image/octet-stream");
            return axios.post(`http://147.175.105.115:5001/register_user`, { headers: {
                      'Content-type':'application/json',
                      'Access-Control-Allow-Origin':'*'
                  }, data: {
                    image: canvas,
                    user: this.userId,
                    detection: this.photos.length < 20 ? 'face' : 'side',
                    directory: this.photos.length < 15 ? 'train' : 'val',
                  }})
                  .then(({data}) => {
                      return data;
                  })
                  .catch((response) => {
                      console.log(response);
                  });
          // download.setAttribute("href", canvas);
      },
      downloadImage() {
        // eslint-disable-next-line no-unused-vars
        const download = document.getElementById("downloadPhoto");
        const canvas = document.getElementById("photoTaken").toDataURL("image/png")
          .replace("image/jpeg", "image/octet-stream");
            return axios.post(`http://147.175.105.115:5001/recognize_user`, { headers: {
                      'Content-type':'application/json',
                      'Access-Control-Allow-Origin':'*',
                      'Accept': 'application/json'
                  }, data: {
                    image: canvas,
                    user: this.userId,
                    detection: 'face',
                    directory: 'val',
                  }})
                  .then(({data}) => {
                      return data;
                  })
                  .catch((response) => {
                      console.log(response);
                  }).finally(() => {
                    this.btnDisable = false;
                  });
        // download.setAttribute("href", canvas);
      }
    
  }
}
</script>

<style lang="scss">

.hopa {
  width: 100%;
  height: 100%;
  position: absolute;
  color: red;
  background: rosybrown;
  opacity: 0.6;
  border: red 4px solid;
}
.successOverlay {
  width: 100%;
  height: 100%;
  position: absolute;
  color: green;
  background: greenyellow;
  opacity: 0.6;
  border: green 4px solid;
}

.warningOverlay {
  width: 100%;
  height: 100%;
  position: absolute;
  color: darkgoldenrod;
  background: burlywood;
  opacity: 0.6;
  border: darkgoldenrod 4px solid;
}

.web-camera-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 2rem;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 15px solid #ccc;
  border-radius: 16px;
  background-color: black;
  width: 500px;

  
  .camera-button {
    margin-bottom: 2rem;
  }
  
  .camera-box {    
    .camera-shutter {
      opacity: 0;
      width: 450px;
      height: 337.5px;
      background-color: #fff;
      position: absolute;
      
      &.flash {
        opacity: 1;
      }
    }
  }
  
  .camera-shoot {
    margin: 1rem 0;
    
    button {
      height: 60px;
      width: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 100%;
      
      img {
        height: 35px;
        object-fit: cover;
      }
    }
  }
  
  .camera-loading {
    overflow: hidden;
    height: 100%;
    position: absolute;
    width: 100%;
    min-height: 150px;
    margin: 3rem 0 0 -1.2rem;
    
    ul {
      height: 100%;
      position: absolute;
      width: 100%;
      z-index: 999999;
      margin: 0;
    }
    
    .loader-circle {
      display: block;
      height: 14px;
      margin: 0 auto;
      top: 50%;
      left: 100%;
      transform: translateY(-50%);
      transform: translateX(-50%);
      position: absolute;
      width: 100%;
      padding: 0;
      
      li {
        display: block;
        float: left;
        width: 10px;
        height: 10px;
        line-height: 10px;
        padding: 0;
        position: relative;
        margin: 0 0 0 4px;
        background: #999;
        animation: preload 1s infinite;
        top: -50%;
        border-radius: 100%;
        
        &:nth-child(2) {
          animation-delay: .2s;
        }
        
        &:nth-child(3) {
          animation-delay: .4s;
        }
      }
    }
  }

  @keyframes preload {
    0% {
      opacity: 1
    }
    50% {
      opacity: .4
    }
    100% {
      opacity: 1
    }
  }
}

.alert {
  background: lightcoral;
  border: 2px solid red;
  color: white;
}

</style>