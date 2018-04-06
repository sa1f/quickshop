//
//  CheckFacesViewController.swift
//  ImagePicker
//
//  Created by Qian Rui Chow on 2018-03-21.
//  Copyright © 2018 Abhilash. All rights reserved.
//

import UIKit
import CoreImage

class CheckFacesViewController: UIViewController, UINavigationControllerDelegate, UIImagePickerControllerDelegate {

    @IBAction func NumberOfFacesDetectedTapped(_ sender: Any) {
        
    }
    
    func faceCount() -> Int {
        let myImage = CIImage(image: myImageView.image!)!
        
        //Set up the detecor
        let accuracy = [CIDetectorAccuracy: CIDetectorAccuracyHigh]
        let faceDetector = CIDetector(ofType: CIDetectorTypeFace, context: nil, options: accuracy)
        let faces = faceDetector?.features(in: myImage, options: [CIDetectorSmile:true])
        var faceCount = 0
        
        if !faces!.isEmpty
        {
            for face in faces as! [CIFaceFeature]
            {
                faceCount += 1
            }
        }
        return faceCount
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
