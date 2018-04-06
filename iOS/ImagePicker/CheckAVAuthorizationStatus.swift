/*
 * File for Permission to use Camera in iPhone
 */

import AVFoundation
import Foundation
import UIKit

func checkCameraAuthorizationStatus() -> Bool {
var result:Bool = false
let cameraMediaType = AVMediaType.video
let cameraAuthorizationStatus = AVCaptureDevice.authorizationStatus(for: cameraMediaType)

switch cameraAuthorizationStatus {
case .denied: break
case .authorized: result = true;  break
case .restricted: break
    
case .notDetermined:
    // Prompting user for the permission to use the camera.
    AVCaptureDevice.requestAccess(for: cameraMediaType) { granted in
        if granted {
            print("Granted access to \(cameraMediaType)")
        } else {
            print("Denied access to \(cameraMediaType)")
        }
    }
}
    return result
}

