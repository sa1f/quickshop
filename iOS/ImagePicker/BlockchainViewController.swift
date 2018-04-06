//
//  BlockchainViewController.swift
//  ImagePicker
//
//  Created by Qian Rui Chow on 2018-03-21.
//  Copyright © 2018. All rights reserved.
//

import UIKit
import WebKit

class BlockchainViewController: UIViewController {

    @IBOutlet weak var myWebView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        //Load website of blockchain
        let url = URL(string: "http://store.saif.ms:8080/blockchain")
        let request = URLRequest(url: url!)
        myWebView.load(request)
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
}
