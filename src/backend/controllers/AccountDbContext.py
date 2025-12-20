from flask import jsonify
from datetime import datetime, timezone
from .ErrorController import log_error_to_db
from models.PersonalAccountModel import PersonalAccount
from bs4 import BeautifulSoup
import re
import requests
import helper.Helper as DBHelper
import models.PersonalAccountModel as PersonalAccount
import models.PersonalRecordModel as PersonalRecord

#Investment Accounts
def add_taxable_account():
    return jsonify({"result": "success", "status": 200}), 200
    
#Personal Accounts
def add_personal_account(userid, name, type, balance):
    try:
        params = ["UserId", "Name", "Type", "Balance", "CreatedDate"]
        dte = datetime.now(timezone.utc)
        values = (userid, name, type, balance, dte)
        acctid = DBHelper.insert_into("PersonalAccounts", params, values)
        if acctid <= 0:
            print(f"Account ({name}) added successfully")
            
        #create an assign from data to model function
        res = PersonalAccount.PersonalAccount()
        res.Id = acctid
        res.DateAdded = dte
        res.Name = name
        res.Type = type
        res.Balance = balance
        return res
    except Exception as e:
        log_error_to_db(e)
        return -1
   
def update_personal_account(acctid, name, type, balance):
    try:
        sql = "UPDATE PersonalAccounts SET Name = %s, Type = %s, Balance = %s WHERE Id = %s;"
        params = (name, type, balance, acctid)
        print(f"Updating personal account {acctid}")
        add_personal_record(acctid, balance)
        return DBHelper.run_query(sql, params, False)
    except Exception as e:
        log_error_to_db(e)
        return False
    
def update_personal_account_balance(acctid, balance):
    try:
        sql = "UPDATE PersonalAccounts SET Balance = %s WHERE Id = %s;"
        params = (balance, acctid)
        print(f"Updating personal account balance for account {acctid}")
        return DBHelper.run_query(sql, params, False)
    except Exception as e:
        log_error_to_db(e)
        return False
   
def remove_personal_account(acctid, userid):
    try:
        sql = "DELETE FROM PersonalAccounts WHERE Id = %s AND UserId = %s"
        params = (acctid, userid)
        print(f"Removing personal account {acctid} for user {userid}")
        return DBHelper.run_query(sql, params, False)
    except Exception as e:
        log_error_to_db(e)
        return False
    
def get_personal_accounts(userid):
    try:
        sql = "SELECT pa.Id, pa.UserId, pa.Balance, pa.Name, pa.Type, pa.CreatedDate From PersonalAccounts as pa " \
            "WHERE pa.UserId = %s Order by pa.Id Desc"
        params = (userid,)
        accounts = DBHelper.run_query(sql, params, True)
        res = []
        for a in accounts:
            tmp = PersonalAccount.data_to_model(a)
            res.append(tmp)
        return res
    except Exception as e:
        log_error_to_db(e)
        return -1
    
def get_all_personal_accounts():
    try:
        sql = "SELECT pa.Id, pa.UserId, pa.Balance, pa.Name, pa.Type, pa.CreatedDate From PersonalAccounts as pa " \
            "Order by pa.Id Desc"
        accounts = DBHelper.run_query(sql, None, True)
        res = []
        for a in accounts:
            tmp = PersonalAccount.data_to_model(a)
            res.append(tmp)
        return res
    except Exception as e:
        log_error_to_db(e)
        return -1
    
def personal_acct_is_users(acctid, userid):
    try:
        print(userid)
        acts = get_personal_accounts(userid)
        hasAccount = False
        print('ACTS - ', acts)
        for act in acts:
            if act.Id == acctid:
                hasAccount = True
                break
        return hasAccount
    except Exception as e:
        log_error_to_db(e)
        return False
    
#PersonalAccountHistory
def add_personal_record(accountid, balance):
    try:
        params = ["AccountId", "RecordedDate", "Balance"]
        values = (accountid, datetime.now(timezone.utc), balance)
        id = DBHelper.insert_into("PersonalAccountHistory", params, values)
        if id > 0:
            print(f"Account ({accountid}) record added successfully")
        return id
    except Exception as e:
        log_error_to_db(e)
        return False

def get_personal_history(userid):
    try:
        if not isinstance(userid, int):
            userid = int(userid)
            
        sql = "Select Id, UserId, IsActive, Name, Type, Balance, CreatedDate " \
            "From PersonalAccounts Where userid = %s"
        params = (userid,)
        data = DBHelper.run_query(sql, params, fetch=True)
        accounts = []
        for d in data:
            tmp = PersonalAccount.data_to_model(d)
            accounts.append(tmp)
        for act in accounts:
            acctid = act.Id
            records = get_personal_account_history(acctid)
            act.Records = records.copy()
        return accounts
    except Exception as e:
        log_error_to_db(e)
        return False

def get_personal_account_history(acctid):
    try:
        if not isinstance(acctid, int):
            acctid = int(acctid)
        
        sql = "Select Id, AccountId, RecordedDate, Balance From PersonalAccountHistory " \
            "Where AccountId = %s Order By RecordedDate Asc"
        params = (acctid,)
        data = DBHelper.run_query(sql, params, fetch=True)
        res = []
        for d in data:
            tmp = PersonalRecord.data_to_model(d)
            res.append(tmp)
        return res
    except Exception as e:
        log_error_to_db(e)
        return False
    
#User Assets
def get_house_details(address):
    if not address:
        return jsonify({"error": "Please provide an address"}), 400

    try:
        search_address = address.replace(" ", "-").replace(",", "")
        url = f"https://www.realtor.com/realestateandhomes-search/{search_address}"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        }

        response = requests.get(url, headers=headers)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        price_tag = soup.find("span", {"data-label": "pc-price"})
        if not price_tag:
            return jsonify({"error": "Could not find market value"}), 404

        price_text = price_tag.get_text().replace("$", "").replace(",", "").strip()
        market_value = int(re.sub(r"[^\d]", "", price_text))

        return jsonify({
            "address": address,
            "market_value": market_value
        })
    except Exception as e:
        log_error_to_db(e)
        return jsonify({"error": "Please provide an address"}), 400