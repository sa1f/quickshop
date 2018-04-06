//
//  Database.swift
//  SQLiteExample
//
//  Created by Qian Rui Chow on 2018-03-20.
//  Copyright © 2018 Qian Rui Chow. All rights reserved.
//

import Foundation
import SQLite

class Database {
    static let shared = Database()
    public let connection: Connection?
    public let databaseFileName = "SQLiteExample.sqlite3"
    private init(){
        let dbPath = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first as String!
        
        do {
            connection = try Connection("\(dbPath!)/(databaseFileName)")
        } catch {
            connection = nil
            let nserror = error as NSError
            print ("Cannot connect to database. error is: \(nserror), \(nserror.userInfo)")
        }
    }
}
