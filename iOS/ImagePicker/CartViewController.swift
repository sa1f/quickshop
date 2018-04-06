//
//  CartViewController.swift
//  ImagePicker
//
//  Created by Qian Rui Chow on 2018-04-03.
//  Copyright © 2018. All rights reserved.
//

import UIKit

class CartViewController: UIViewController{

    @IBOutlet weak var itemNameLabel: UILabel!
    @IBOutlet weak var quantityLabel: UILabel!
    @IBOutlet weak var priceLabel: UILabel!
    @IBOutlet weak var totalPriceTextField: UILabel!
    
    @IBOutlet weak var imageViewOne: UIImageView!
    @IBOutlet weak var imageViewTwo: UIImageView!
    @IBOutlet weak var imageViewThree: UIImageView!
    
    func getNameUrl() -> String {
        var name:String = UserDefaults.standard.object(forKey: "username") as! String
        var url:String = "http://store.saif.ms/users/"
        var path:String = "/cart/"
        return url + name + path
    }
    
    //A string array to save all the names
    var nameArray = [String]()
    var quantityArray = [Int]()
    var priceArray = [Int]()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        //calling the function that will fetch the json
        getJsonFromUrl();
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    //this function is fetching the JSON from URL
    func getJsonFromUrl(){
        //creating a NSURL
        let url = NSURL(string: getNameUrl())
        
        //fetching the data from the url
        URLSession.shared.dataTask(with: (url as? URL)!, completionHandler: {(data, response, error) -> Void in
            
            if let jsonObj = try? JSONSerialization.jsonObject(with: data!, options: .allowFragments) as? NSDictionary {
                print(jsonObj)
                //Only display when cart is not empty
                if jsonObj != nil {
                //printing the json in console
                print(jsonObj!.value(forKey: "products")!)
                
                //NAME: getting the name tag array from json and converting it to NSArray
                if let nameArray = jsonObj!.value(forKey: "products") as? NSArray {
                    for names in nameArray{
                        if let nameDict = names as? NSDictionary {
                            if let name = nameDict.value(forKey: "name") {
                                self.nameArray.append((name as? String)!)
                            }
                        }
                    }
                }
                
                //QUANTITY: getting the quantity tag array from json and converting it to NSArray
                if let quantityArray = jsonObj!.value(forKey: "products") as? NSArray {
                    for quantity in quantityArray{
                        if let quantityDict = quantity as? NSDictionary {
                            if let quan = quantityDict.value(forKey: "quantity") {
                                self.quantityArray.append((quan as? Int)!)
                            }
                            
                        }
                    }
                }
                
                //PRICE: getting the price tag array from json and converting it to NSArray
                if let priceArray = jsonObj!.value(forKey: "products") as? NSArray {
                    //looping through all the elements
                    for price in priceArray{
                        
                        //converting the element to a dictionary
                        if let priceDict = price as? NSDictionary {
                            
                            //getting the name from the dictionary
                            if let prices = priceDict.value(forKey: "price") {
                                
                                //adding the name to the array
                                self.priceArray.append((prices as? Int)!)
                            }
                            
                        }
                    }
                }
                
                OperationQueue.main.addOperation({
                    //calling display functions after fetching the json
                    //it will show the names to label
                    self.showNames()
                    self.showQuantity()
                    self.showPrice()
                    self.showPicture()
                })
            }
            }
        }).resume()
    }
    
    func showNames(){
        //looping through all the elements of the array
        for name in nameArray{
            //appending the names to label
           itemNameLabel.text  = itemNameLabel.text! + name + "\n" + "\n";
        }
    }
    
    func showQuantity(){
        for quantity in quantityArray{
            quantityLabel.text = quantityLabel.text! + "\(quantity)" + "\n" + "\n";
        }
    }
    
    func showPrice(){
        var totalPrice = 0
        for price in priceArray{
            priceLabel.text = priceLabel.text! + "\(price)" + "\n" + "\n";
            totalPrice += price
        }
        totalPriceTextField.text = "$ " + totalPriceTextField.text! + "\(totalPrice)";
    }
    
    func showPicture(){
        var count:Int = 1
        for name in nameArray {
            if name.elementsEqual("keyboard") && count == 1 {
                imageViewOne.image = UIImage(named: "keyboard")
            }
            else if name.elementsEqual("cell phone") && count == 1 {
                imageViewOne.image = UIImage(named: "cellphone")
            }
            else if name.elementsEqual("scissors") && count == 1 {
                imageViewOne.image = UIImage(named: "scissors")
            }
            
            else if name.elementsEqual("keyboard") && count == 2 {
                imageViewTwo.image = UIImage(named: "keyboard")
            }
            else if name.elementsEqual("cell phone") && count == 2 {
                imageViewTwo.image = UIImage(named: "cellphone")
            }
            else if name.elementsEqual("scissors") && count == 2 {
                imageViewTwo.image = UIImage(named: "scissors")
            }
            
            else if name.elementsEqual("keyboard") && count == 3 {
                imageViewThree.image = UIImage(named: "keyboard")
            }
            else if name.elementsEqual("cell phone") && count == 3 {
                imageViewThree.image = UIImage(named: "cellphone")
            }
            else if name.elementsEqual("scissors") && count == 3 {
                imageViewThree.image = UIImage(named: "scissors")
            }
            
            count += 1
        }
    }

}
