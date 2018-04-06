//
//  MyAccountViewController.swift
//  ImagePicker
//
//  Created by Qian Rui Chow on 2018-04-01.
//  Copyright © 2018. All rights reserved.
//

import UIKit
import Alamofire
import SDWebImage

class MyAccountViewController: UIViewController {
    
    @IBOutlet weak var myAccPicDisplay: UIImageView!
    @IBOutlet weak var myAccNameDisplay: UILabel!
    
    func getNameUrl() -> String {
        var name:String = UserDefaults.standard.object(forKey: "username") as! String
        var url:String = "http://store.saif.ms/users/"
        var path:String = "/picture"
        return url + name + path
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        getProfilePicFromUrl()
        myAccNameDisplay.text = UserDefaults.standard.string(forKey: "username")
    }
    
    func getProfilePicFromUrl() {
        var url:String = getNameUrl()
        while url.isEmpty {
            url = getNameUrl()
        }

        let userPictureURL = URL(string: url)!
        print("getNameUrl prints: \(getNameUrl())")
        
        myAccPicDisplay.sd_setImage(with: URL(string: url), placeholderImage: myAccPicDisplay.image)
        
//        // Creating a session object with the default configuration.
//        let session = URLSession(configuration: .default)
//
//        // Define download task. The download task will download the contents of the URL as a Data object and then display profile picture
//        let downloadPicTask = session.dataTask(with: userPictureURL) { (data, response, error) in
//            // The download has finished.
//            if let e = error {
//                print("Error downloading user picture: \(e)")
//            } else {
//                // No errors found.
//                if let res = response as? HTTPURLResponse {
//                    print("Downloaded user picture with response code \(res.statusCode)")
//                    if let imageData = data {
//                        // Finally convert that Data into an image
//                        let image = UIImage(data: imageData)
//                        // Display donwloaded image
//                        self.myAccPicDisplay.image = image
//
//                    } else {
//                        print("Couldn't get image: Image is nil")
//                    }
//                } else {
//                    print("Couldn't get response code for some reason")
//                }
//            }
//        }
//
//        downloadPicTask.resume()
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    

}
