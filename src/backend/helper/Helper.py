from dotenv import load_dotenv
# import InitiateConnection
import mysql.connector
import bcrypt
import uuid
import os

load_dotenv()

HOST_URL=os.getenv("HOST_URL")
MYSQL_USER=os.getenv("MYSQL_USER")
MYSQL_PASSWORD=os.getenv("MYSQL_PASSWORD")
MYSQL_PROGRAM_DB=os.getenv("MYSQL_PROGRAM_DB")

def connect_to_db():
    return mysql.connector.connect(
        host=HOST_URL,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_PROGRAM_DB
    )

def run_query(query, params=None, fetch=False):
    try:
        connection = connect_to_db()
        cursor = connection.cursor(dictionary=True)
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        if fetch:
            return cursor.fetchall()
        connection.commit()
        return True
    except Exception as e:
        print(f"ERROR run_query(): {e}")
        return False
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

def insert_into(table, params, values):
    try:
        connection = connect_to_db()
        cursor = connection.cursor(dictionary=True)
        if len(params) != len(values):
            return -1
        
        sql = f"INSERT INTO {table} ("
        for i, p in enumerate(params):
            if i != len(params) - 1:
                sql += f"{params[i]},"
            else:
                sql += f"{params[i]}) "
                
        sql += "VALUES ("
        for i in range(len(values)):
            if i != len(values) - 1:
                sql += f"%s,"
            else:
                sql += f"%s);"
        
        cursor.execute(sql, values)
        connection.commit()
        sql = f"SELECT LAST_INSERT_ID(Id) as Id from {table} order by LAST_INSERT_ID(Id) desc limit 1;"
        cursor.execute(sql)
        return int(cursor.fetchone()['Id'])
    except Exception as e:
        print(f"ERROR insert_into(): {e}")
        return False
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
            
def update_value(table, field, value, where_field, where_value):
    try:
        sql = f"UPDATE {table} SET {field}=%s WHERE {where_field}=%s"
        params = (value, where_value)
        result = run_query(sql, params, fetch=False)
        return result
    except Exception as e:
        print(f"ERROR update_value(): {e}")
        return False

def create_table(table, fields):
    try:
        print(f"Checking if {table} table exists.")
        connection = connect_to_db()
        cursor = connection.cursor()
        cursor.execute("SHOW TABLES")
        exists = False
        for t in cursor:
            if t[0].lower().strip() == table.lower().strip():
                exists = True
                break
        
        if not exists:
            print(f"{table} table does not exist. Creating table...")
            sql = f"CREATE TABLE IF NOT EXISTS {table} {fields};"
            run_query(sql)
        else:
            print(f"{table} table already exists")
        return True
    except Exception as e:
        print(f"ERROR create_table(): {e}")
        return False
    
def encrypt_password(password: str | bytes):
    try:
        if isinstance(password, str):
            return  bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        return bcrypt.hashpw(password, bcrypt.gensalt())
    except Exception as e:
        print(f"ERROR encrypt_password(): {e}")

def check_passwords(plain_pass: str, hashed_pass: bytes):
    try:
        if (bcrypt.checkpw(plain_pass.encode('utf-8'), hashed_pass)):
            return True
        return False
    except Exception as e:
        print(f"ERROR check_passwords(): {e}")
        
def create_uuid():
    new_uuid = str(uuid.uuid4())
    return new_uuid