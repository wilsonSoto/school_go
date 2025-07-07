import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Camera, CameraResultType, CameraSource,PermissionStatus  } from '@capacitor/camera'; // Import CameraSource
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'; // Import DomSanitizer for security

@Component({
  standalone: false,
  selector: 'app-camera',
  templateUrl: 'camera.component.html',
  styleUrls: ['camera.component.scss']
})
export class CameraComponent implements OnInit {
  @Input() action: string = '';
  @Output() handleActionImages = new EventEmitter<any>();

  public capturedImage: SafeUrl | undefined;

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    // You might want to initialize something here if needed
  }

   permissionStatus: PermissionStatus | undefined;

  /**
   * Checks the current permission status for the camera.
   * @returns Promise<PermissionStatus>
   */
  async checkCameraPermissions(): Promise<PermissionStatus> {
    try {
      const status = await Camera.checkPermissions();
      this.permissionStatus = status;
      return status;
    } catch (error) {
      console.error('Error checking camera permissions:**********************************************', error);
      throw error; // Re-throw or handle as needed
    }
  }

  async selectImageSource() {
    this.checkCameraPermissions()

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
      });

      if (image.webPath) {
        this.capturedImage = this.sanitizer.bypassSecurityTrustUrl(image.webPath);
        console.log('Image captured/selected:', this.capturedImage);

        this.handleActionImages.emit(this.capturedImage)
      }
    } catch (error) {
      console.error('Error taking or selecting picture:', error);
    }
  }


 async takePicture () {
   await this.checkCameraPermissions()

  const image = await Camera.getPhoto({
    quality: 90,
    resultType: CameraResultType.Uri
  });

  var imageUrl = image.webPath;

  this.capturedImage = imageUrl;
  this.handleActionImages.emit(imageUrl)
};
}
