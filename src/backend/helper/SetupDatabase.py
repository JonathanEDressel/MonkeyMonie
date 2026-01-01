import controllers.AuthDbContext as _authCtx
import helper.Helper as DBHelper

def validate_db():
    print("Setting up databases...")
    useracct_created = DBHelper.create_table("UserAcct", "" \
                    "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
                    "Username VARCHAR(50) UNIQUE, " \
                    "FirstName VARCHAR(50), " \
                    "LastName VARCHAR(50), " \
                    "UserPassword VARCHAR(255), " \
                    "UUID VARCHAR(100), " \
                    "Email VARCHAR(100) UNIQUE, " \
                    "PhoneNumber VARCHAR(20) UNIQUE, " \
                    "CreatedDate DATETIME, " \
                    "ConfirmedEmail TINYINT DEFAULT 0, " \
                    "TwoFactor TINYINT DEFAULT 1, " \
                    "LastLogin DATETIME, " \
                    "IsDemo TINYINT DEFAULT 0, " \
                    "AdminLevel VARCHAR(20), " \
                    "LastReleaseVersion VARCHAR(100), " \
                    "IsAdmin TINYINT DEFAULT 0)")
    if useracct_created:
        print("Creating admin user")
        _authCtx.has_admin()
        
    DBHelper.create_table("ErrorLog", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "EventTimeStamp DATETIME, " \
        "StackTrace Text, " \
        "Detail VARCHAR(255), " \
        "Username VARCHAR(100))")
    
    DBHelper.create_table("EventLog", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "EventTimeStamp DATETIME, " \
        "EventText VARCHAR(100), " \
        "Source VARCHAR(100), " \
        "EventType VARCHAR(100), " \
        "EventUser VARCHAR(100))")
    
    DBHelper.create_table("EmailLog", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "SentTime DATETIME, " \
        "SentFrom VARCHAR(100), " \
        "Subject VARCHAR(100), " \
        "Body LONGBLOB, " \
        "Reason VARCHAR(100), " \
        "Duration INTEGER)")
    
    DBHelper.create_table("BlockedIPs", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "IPAddress VARCHAR(100), " \
        "Notes VARCHAR(255), " \
        "DateAdded DATETIME)")
    
    DBHelper.create_table("ReportLog", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "UserId INTEGER NOT NULL, " \
        "CreatedTime DATETIME, " \
        "Duration INTEGER, " \
        "Details VARCHAR(255), " \
        "FOREIGN KEY (UserId) References UserAcct(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("ReferralLog", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "UserId INTEGER NOT NULL, " \
        "ReferralCode VARCHAR(100), " \
        "UsersReferred LONGBLOB, " \
        "MonthsDiscounted INTEGER, " \
        "UsedReferralCode TINYINT DEFAULT 0, "\
        "FOREIGN KEY (UserId) References UserAcct(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("PersonalAccounts", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL, " \
        "UserId INTEGER NOT NULL, " \
        "IsActive TINYINT DEFAULT 1," \
        "Name VARCHAR(100), " \
        "Type VARCHAR(100), " \
        "Balance FLOAT, " \
        "CreatedDate DATETIME, " \
        "FOREIGN KEY (UserId) References UserAcct(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("InvestmentAccounts", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "UserId INTEGER NOT NULL, " \
        "IsActive TINYINT DEFAULT 1," \
        "Name VARCHAR(100), " \
        "Type VARCHAR(100), " \
        "Balance FLOAT, " \
        "CreatedDate DATETIME, " \
        "Holdings LONGBLOB, " \
        "FOREIGN KEY (UserId) References UserAcct(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("AccountHoldings", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "InvestmentId INTEGER NOT NULL, " \
        "TickerSymbol VARCHAR(100), " \
        "Shares FLOAT, " \
        "FOREIGN KEY (InvestmentId) References InvestmentAccounts(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("InvestmentAccountHistory", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "AccountId INTEGER NOT NULL, " \
        "RecordedDate DATETIME, " \
        "Balance FLOAT, " \
        "FOREIGN KEY (AccountId) References InvestmentAccounts(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("PersonalAccountHistory", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "AccountId INTEGER NOT NULL, " \
        "RecordedDate DATETIME, " \
        "Balance FLOAT, " \
        "FOREIGN KEY (AccountId) References PersonalAccounts(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("ReleaseNotes", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "Version VARCHAR(100), " \
        "Notes VARCHAR(255), " \
        "DateAdded DATETIME)")
    
    DBHelper.create_table("OTPTokens", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "Username VARCHAR(255), " \
        "TokenHash VARCHAR(255), " \
        "HasUsed TINYINT DEFAULT 0, " \
        "ExpireTime DATETIME," \
        "FOREIGN KEY (Username) References UserAcct(Username))")
    
    DBHelper.create_table("RevokedTokens", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "JTI VARCHAR(255), " \
        "Revoked DATETIME)")
    
    DBHelper.create_table("DonationHistory", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "Username VARCHAR(100), " \
        "Amount VARCHAR(100), " \
        "Notes VARCHAR(255), " \
        "DateAdded DATETIME, " \
        "Method VARCHAR(100))")
    
    DBHelper.create_table("UserAssets", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL, " \
        "UserId INTEGER NOT NULL, " \
        "IsActive TINYINT DEFAULT 1," \
        "Name VARCHAR(100), " \
        "Type VARCHAR(100), " \
        "Value FLOAT, " \
        "CreatedDate DATETIME, " \
        "FOREIGN KEY (UserId) References UserAcct(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("UserAssetHistory", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT, " \
        "AssetId INTEGER NOT NULL, " \
        "RecordedDate DATETIME, " \
        "Value FLOAT, " \
        "FOREIGN KEY (AssetId) References UserAssets(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("NetWorth", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL, " \
        "UserId INTEGER NOT NULL, " \
        "TotalValue FLOAT, " \
        "FOREIGN KEY (UserId) References UserAcct(Id) ON DELETE CASCADE)")
    
    DBHelper.create_table("NetWorthHistory", "" \
        "(Id INTEGER PRIMARY KEY AUTO_INCREMENT NOT NULL, " \
        "NetWorthId INTEGER NOT NULL, " \
        "TotalValue FLOAT, " \
        "RecordedDate DATETIME, " \
        "FOREIGN KEY (NetWorthId) References NetWorth(Id) ON DELETE CASCADE)")
    
def update_columns():
    update_stacktrace()
    
def update_stacktrace():
    print("Updating ErrorLog.StackTrace column")
    DBHelper.run_query("ALTER TABLE ErrorLog MODIFY COLUMN StackTrace MEDIUMTEXT", None, False)
    
    
def add_columns():
    add_user_isactive_column()
    
def add_user_isactive_column():
    DBHelper.add_column("UserAcct", "IsActive", "TINYINT", 0)
    DBHelper.add_column("UserAcct", "ExpireDate", "DATETIME", None)
