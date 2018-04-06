//
//  LoginViewController.swift
//  ImagePicker
//
//  Created by Qian Rui Chow on 2018-03-19.
//  Copyright © 2018. All rights reserved.
//

import UIKit
import SQLite
import SQLite3
import Alamofire

class LoginViewController: UIViewController {
    let defaults = UserDefaults.standard
    
    @IBOutlet weak var usernameTextField: UITextField!
    @IBOutlet weak var passwordTextField: UITextField!
    
    @objc func keyboardWillShow(notification: NSNotification) {
        if let keyboardSize = (notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue {
            if self.view.frame.origin.y == 0{
                self.view.frame.origin.y -= keyboardSize.height
            }
        }
    }
    
    @objc func keyboardWillHide(notification: NSNotification) {
        if let keyboardSize = (notification.userInfo?[UIKeyboardFrameBeginUserInfoKey] as? NSValue)?.cgRectValue {
            if self.view.frame.origin.y != 0{
                self.view.frame.origin.y += keyboardSize.height
            }
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view.
        NotificationCenter.default.addObserver(self, selector: #selector(LoginViewController.keyboardWillShow), name: NSNotification.Name.UIKeyboardWillShow, object: nil)
        NotificationCenter.default.addObserver(self, selector: #selector(LoginViewController.keyboardWillHide), name: NSNotification.Name.UIKeyboardWillHide, object: nil)
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        
        for textField in self.view.subviews where textField is UITextField {
            textField.resignFirstResponder()
        }
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    func loginSuccessCallback(response: [String: Any]) {
        guard let token = response["token"] as? String
            else {
                print("Response does not have token field or it cannot be casted to string.")
                return
            }
        if !token.elementsEqual("Failed") {
            let storyBoard: UIStoryboard = UIStoryboard(name: "Main", bundle: nil)
            let newViewController = storyBoard.instantiateViewController(withIdentifier: "mainmenu") as! MainMenuViewController
            self.present(newViewController, animated: true, completion: nil)
            
            defaults.set(usernameTextField.text, forKey: "username")
            let test = defaults.object(forKey: "username") as! String
            
        } else {
            //display Alert message "username and/or password do not match"
            let alertController = UIAlertController(title: "Alert", message:
                "Username and/or password do not match", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))
            
            self.present(alertController, animated: true, completion: nil)
        }
    }
    
    func getCurrentUsername() -> String {
        return defaults.object(forKey: "username") as! String
    }
    
    @IBAction func LoginButtonTapped(_ sender: Any) {
        //double check if fields are filled
        var allFieldsFilled = false
        if((usernameTextField.text?.isEmpty)! || (passwordTextField.text?.isEmpty)!){
            allFieldsFilled = false
            //display Alert message "all fields required"
            let alertController = UIAlertController(title: "Alert", message:
                "All fields are required", preferredStyle: UIAlertControllerStyle.alert)
            alertController.addAction(UIAlertAction(title: "Dismiss", style: UIAlertActionStyle.default,handler: nil))

            self.present(alertController, animated: true, completion: nil)
        }
        else{
            allFieldsFilled = true
        }
        
        
        let params: [String: Any] = ["name": usernameTextField.text, "password": passwordTextField.text]
        makePostCallWithAlamofire(path: "login", params: params, successCallback: loginSuccessCallback)
    }

}
