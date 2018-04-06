//
//  UserData.swift
//  ImagePicker
//
//  Created by Qian Rui Chow on 2018-03-20.
//  Copyright © 2018 Qian Rui Chow. All rights reserved.
//
import Foundation
import SQLite

class UserData {
    static let shared = UserData()
    
    private let tblUser = Table("tblUser")
    
    private let userName = Expression<String>("userName")
    private let password = Expression<Int64>("password")
    
    private init() {
        //Create a table if not exists
        do {
            if let connection = Database.shared.connection {
                try connection.run(tblUser.create(temporary: false, ifNotExists: true, withoutRowid: false, block: { (table) in
                    table.column(self.userName, primaryKey: true)
                    table.column(self.password)
                }))
//                print("Create table tblUser sucessfully")
            } else {
                print("Create table tblUser failed.")
            }
        } catch {
            let nserror = error as NSError
            print("create table tblUser failed. Error is: \(nserror), \(nserror.userInfo)")
        }
    }
    
    //Insert a record to tblDepartment
    func insert(username: String, password: Int64) -> Int64? {
        do {
            let insert = tblUser.insert(self.userName <- username,
                                        self.password <- password)
            let insertedId = try Database.shared.connection!.run(insert)
            return insertedId
        } catch {
            let nserror = error as NSError
            print("Cannot insert new User. Error is: \(nserror), \(nserror.userInfo)")
            return nil
        }
    }
    
    //How to query(find) all records in tblDepartment ?
    func queryAll() -> AnySequence<Row>? {
        do {
            return try Database.shared.connection?.prepare(self.tblUser)
        } catch {
            let nserror = error as NSError
            print("Cannot query(list) all tblUser. Error is: \(nserror), \(nserror.userInfo)")
            return nil
        }
    }
    
    func toString(user: Row) {
        print("User details. userName = \(user[self.userName]), password = \(user[self.password])")
    }
    
    func getPassword(user: Row) -> Int64 {
        return user[self.password]
    }
    
    func getUsername(user: Row) -> String {
        return user[self.userName]
    }
    
    //Filter function
    func filter() -> AnySequence<Row>? {
        do {
            return try Database.shared.connection?.prepare(self.tblUser.filter(self.password == 123))
        } catch {
            let nserror = error as NSError
            print("Cannot query(list) user-qianrui. Error is: \(nserror), \(nserror.userInfo)")
            return nil
        }
    }
    
}

