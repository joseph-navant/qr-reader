import { Component, Prop } from '@stencil/core';
import jsQR, { QRCode, Options } from 'jsqr';
import { Point } from 'jsQR/dist/locator';

@Component({
  tag: 'qr-reader',
  styleUrl: 'qr-reader.scss'
})
export class QrReader {
  @Prop() color: string = '#64ff32';
  @Prop({ context: 'isServer' }) private isServer: boolean;

  canvas: HTMLCanvasElement;
  canvas2d: CanvasRenderingContext2D;
  request: number;
  stream: MediaStream;
  video: HTMLVideoElement;

  async componentDidLoad() {
    if (this.isServer === false && this.isMediaStreamAPISupported()) {
      await this.init();
    }
  }

  componentDidUnload() {
    this.stopStream();
  }

  private isMediaStreamAPISupported() {
    return navigator && 'mediaDevices' in navigator;
  }

  private async init() {
    this.canvas2d = this.canvas.getContext('2d');
    await this.initCamera();
    this.initStream();
    this.captureUntilDetectQR();
  }

  private async initCamera() {
    const msConstraints = {
      audio: false,
      video: {
        facingMode: 'environment'
      }
    };

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(msConstraints);
    } catch (err) {
      console.error(err);
    }
  }

  private initStream() {
    this.video.srcObject = this.stream;
  }

  private stopStream() {
    this.stream && this.stream.getTracks().forEach(track => track.stop());
    this.video.srcObject = undefined;
  }

  private captureUntilDetectQR() {
    this.request = requestAnimationFrame(() => this.tick());
  }

  private tick() {
    if (this.video && this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.drawVideoIntoCanvas();
      const code = this.getCode();
      if (code && code.data) {
        cancelAnimationFrame(this.request);
        this.drawSquare(code.location);
        this.stopStream();
      }
    }
    this.captureUntilDetectQR();
  }

  private drawVideoIntoCanvas() {
    this.canvas.height = this.video.videoHeight;
    this.canvas.width = this.video.videoWidth;
    this.canvas2d.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
  }

  private getImageData() {
    return this.canvas2d.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  private getCode() {
    const imageData = this.getImageData();
    const options: Options = {
      inversionAttempts: 'dontInvert'
    };
    return jsQR(imageData.data, imageData.width, imageData.height, options);
  }

  private drawSquare(location: QRCode['location']) {
    this.drawLine(location.topLeftCorner, location.topRightCorner, this.color);
    this.drawLine(location.topRightCorner, location.bottomRightCorner, this.color);
    this.drawLine(location.bottomRightCorner, location.bottomLeftCorner, this.color);
    this.drawLine(location.bottomLeftCorner, location.topLeftCorner, this.color);
  }

  private drawLine(begin: Point, end: Point, color: string) {
    this.canvas2d.beginPath();
    this.canvas2d.moveTo(begin.x, begin.y);
    this.canvas2d.lineTo(end.x, end.y);
    this.canvas2d.lineWidth = 4;
    this.canvas2d.strokeStyle = color;
    this.canvas2d.stroke();
  }

  render() {
    return (
      <div id="canvasContainer">
        <canvas ref={(canvas: HTMLCanvasElement) => (this.canvas = canvas)} />
        <video
          ref={(video: HTMLVideoElement) => (this.video = video)}
          autoplay
          playsinline
        />
      </div>
    );
  }
}
