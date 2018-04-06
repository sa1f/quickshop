/*
 * ViewController.swift
 * Purpose: Register View Controller
 */

import UIKit
import MobileCoreServices
import QuartzCore
import Vision
import SQLite
import SQLite3
import Alamofire

class ViewController: UIViewController {
    let imagePicker = UIImagePickerController()

    @IBOutlet weak var imageView: UIImageView!
    @IBOutlet weak var usernameTextField: UITextField!
    @IBOutlet weak var passwordTextField: UITextField!
    @IBOutlet weak var repeatPasswordTextField: UITextField!
    
    fileprivate var selectedImage: UIImage! {
        didSet {
            imageView?.image = selectedImage
            let faceDetector = FaceDetector()
            DispatchQueue.global().async {
                faceDetector.highlightFaces(for: self.selectedImage) { (resultImage) in
                    DispatchQueue.main.async {
                        self.imageView?.image = resultImage
                    }
                }
            }
        }
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }
    
    // Function for keyboard to collapse when user is done with typing
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        for textField in self.view.subviews where textField is UITextField {
            textField.resignFirstResponder()
        }
    }
    
    // Function that resize user image display
    override func viewDidAppear(_ animated: Bool) {
        imageView.layer.cornerRadius = imageView.frame.size.width/2
        imageView.layer.masksToBounds = true
    }
    
    // Function for app to use phone's camera
    @IBAction func openCamAction(_ sender: Any) {
        openCamera()
    }
    
    // Function for when registration is successful in server, alert message pops out telling user that registration is successful
    func registerSuccessCallback(response: [String: Any]) {
        //Alert message for "successful registration"
        let alertController = UIAlertController(title: "Successful Registration", message:
            "Please proceed to login", preferredStyle: UIAlertControllerStyle.alert)
        alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))
        alertController.view.layoutIfNeeded()
        self.present(alertController, animated: true, completion: nil)
    }
    
    // When register button is tapped, First checks if all fields are filled, password & repeatPassword matches, then sends post request to server
    @IBAction func RegisterButtonTapped(_ sender: Any) {
        
        var isAllFieldsFilled = false
        var isPasswordMatch = false
        var numFaces = faceCount()

        //check if all fields are filled
        if((usernameTextField.text?.isEmpty)! || (passwordTextField.text?.isEmpty)! || (repeatPasswordTextField.text?.isEmpty)!){
            isAllFieldsFilled = false

            //alert message for "all fields are required"
            let alertController = UIAlertController(title: "Alert", message:
                "All fields are required", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))

            self.present(alertController, animated: true, completion: nil)
        }
        else{
            isAllFieldsFilled = true
        }

        //check if password and repeatpassword are the same
        if ((passwordTextField.text?.elementsEqual(repeatPasswordTextField.text!))! != true){
            isPasswordMatch = false

            //Alert message for "passwords do not match"
            let alertController = UIAlertController(title: "Alert", message:
                "Passwords do not match", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))

            self.present(alertController, animated: true, completion: nil)
        }
        else{
            isPasswordMatch = true
        }

        //successful registration if all fields are filled & passwords match & numFace > 0 then
        //register user to server
        if(isPasswordMatch && isAllFieldsFilled && numFaces==1){
            let params: [String: Any] = ["name": usernameTextField.text, "password": passwordTextField.text]
            let image = imageView.image
            let imgData = UIImageJPEGRepresentation(image!, 0.2)!
            let path = "register"
            let quickShopEndpoint: String = "http://store.saif.ms/"

            Alamofire.upload(multipartFormData: { multipartFormData in
                multipartFormData.append(imgData, withName: "picture", fileName: "register.jpg", mimeType: "image/jpeg")
                for (key, value) in params {
                    multipartFormData.append((value as AnyObject).data(using: String.Encoding.utf8.rawValue)!, withName: key)
                }
            }, to: quickShopEndpoint + path , method: .post, headers: nil, encodingCompletion: registerSuccessCallback)
        }
        else if (numFaces<=0){
            //Alert user that picture has 0 faces
            let alertController = UIAlertController(title: "Alert", message:
                "Picture has 0 face. Please upload a picture with only 1 face.", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))
            
            self.present(alertController, animated: true, completion: nil)
        }
        else if (numFaces>1){
            //Alert user that picture has more than 1 faces
            let alertController = UIAlertController(title: "Alert", message:
                "Picture has \(numFaces) face. Please upload a picture with only 1 face.", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))
            
            self.present(alertController, animated: true, completion: nil)
        }
    }
    
    func registerSuccessCallback(response: SessionManager.MultipartFormDataEncodingResult) {
        let alertController = UIAlertController(title: "Successful registration", message:
            "Please proceed to login.", preferredStyle: UIAlertControllerStyle.alert)
        alertController.addAction(UIAlertAction(title: "Ok", style: UIAlertActionStyle.default,handler: nil))
        alertController.view.layoutIfNeeded()
        self.present(alertController, animated: true, completion: nil)
    }
    
    // Function for front camera to detect number of faces
    func normalizeImageRotation(_ image: UIImage) -> UIImage {
        if (image.imageOrientation == UIImageOrientation.up) { return image }
        
        UIGraphicsBeginImageContextWithOptions(image.size, false, image.scale)
        image.draw(in: CGRect(x: 0, y: 0, width: image.size.width, height: image.size.height))
        let normalizedImage = UIGraphicsGetImageFromCurrentImageContext()!
        UIGraphicsEndImageContext()
        return normalizedImage
    }
    
    @IBAction func ValidButtonTapped(_ sender: Any) {
        if (self.imageView.image == nil){
            //no image set
            print("NO PIC")
            selectedImage = UIImage(named: "blankFace")
            
            //Alert message for "no face detected because no picture selected"
            let alertController = UIAlertController(title: "\(faceCount()) Face Detected", message:
                "Please select a picture with your face", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))
            
            self.present(alertController, animated: true, completion: nil)
        }
        else{
            //image set
           print("YES PIC")
//            selectedImage = self.imageView.image
            selectedImage = normalizeImageRotation(self.imageView.image!)
            
            //Alert message for "face detected"
            var numFace = faceCount()
            
            if(numFace <= 0){
                //case where 0 face detected
                let alertController = UIAlertController(title: "\(numFace) Face Detected", message:
                    "Picture is not valid. Please choose a picture with your face for successful registration.", preferredStyle: UIAlertControllerStyle.alert)
                alertController.addAction(UIAlertAction(title: "Ok", style: UIAlertActionStyle.default,handler: nil))
                
                self.present(alertController, animated: true, completion: nil)
            }
            else{
                //case where 1 or more faces are detected
                let alertController = UIAlertController(title: "\(numFace) Face Detected", message:
                    "Picture is valid", preferredStyle: UIAlertControllerStyle.alert)
                alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))
                
                self.present(alertController, animated: true, completion: nil)
            }
            
        }
    }
    
    func openCamera() {
        guard UIImagePickerController.isSourceTypeAvailable(.camera) else {
            print("This device doesn't have a camera.")
            return
        }
        
        imagePicker.sourceType = .camera
        imagePicker.cameraDevice = .rear
//        imagePicker.mediaTypes = [kUTTypeImage as String]
        imagePicker.mediaTypes = UIImagePickerController.availableMediaTypes(for:.camera)!
        imagePicker.delegate = self
        
        present(imagePicker, animated: true)
    }
    
    @IBAction func LibraryTapped(_ sender: Any) {
        openPhotoLibrary()
    }
    
    func openPhotoLibrary() {
        guard UIImagePickerController.isSourceTypeAvailable(.photoLibrary) else {
            print("can't open photo library")
            return
        }

        imagePicker.sourceType = .photoLibrary
        imagePicker.delegate = self

        present(imagePicker, animated: true)
    }
}

extension ViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [String : Any]) {
        defer {
            picker.dismiss(animated: true)
        }
        
        print(info)
        // get the image
        guard let image = info[UIImagePickerControllerOriginalImage] as? UIImage else {
            return
        }
        
        // do something with it
        imageView.image = image
        
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        defer {
            picker.dismiss(animated: true)
        }
        
        print("did cancel")
    }
    
    func faceCount() -> Int {
        if self.imageView.image == nil {
            return 0
        }
        
        let myImage = CIImage(image: normalizeImageRotation(self.imageView.image!))!
        
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
    
}
