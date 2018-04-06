//
//  AlamofireHTTPCalls.swift
//  ImagePicker
//
//  Created by Qian Rui Chow on 2018-03-22.
//  Copyright © 2018. All rights reserved.
//

import Alamofire

let quickShopEndpoint: String = "http://store.saif.ms/"

func makeGetCallWithAlamofire(path: String, params: [String: Any], successCallback: @escaping ([String: Any]) -> Void) {
    Alamofire.request("http://saif.ms:3000/users/%7B--username--%7D/cart/", method: .get, parameters: params,
                      encoding: JSONEncoding.default)
        .responseJSON { response in
            guard response.result.error == nil else {
                // got an error in getting the data, need to handle it
                print("error calling GET")
                print(response.result.error!)
                return
            }
            // make sure we got some JSON since that's what we expect
            guard let json = response.result.value as? [String: Any] else {
                print("didn't get object as JSON from API")
                if let error = response.result.error {
                    print("Error: \(error)")
                }
                return
            }
            
            print("response json: ")
            print(json)
            successCallback(json)
    }
}

func makePostCallWithAlamofire(path: String, params: [String: Any], successCallback: @escaping ([String: Any]) -> Void) {
    Alamofire.request(quickShopEndpoint + path, method: .post, parameters: params,
                      encoding: JSONEncoding.default)
        .responseJSON { response in
            guard response.result.error == nil else {
                // got an error in getting the data, need to handle it
                print("error calling POST")
                print(response.result.error!)
                return
            }
    
            // make sure we got some JSON since that's what we expect
            guard let json = response.result.value as? [String: Any] else {
                print("didn't get object as JSON from API")
                if let error = response.result.error {
                    print("Error: \(error)")
                }
                return
            }
        
            print("response json: ")
            print(json)
            successCallback(json)
    }
}

