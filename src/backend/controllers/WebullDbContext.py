from flask import jsonify
from helper.ErrorHandler import log_error_to_db
from webull import webull

wb = webull()

def webull_login(email, password, trading_pin=None, mfa_code=None):
    try:
        # Login to Webull
        login_result = wb.login(email, password)
        
        if not login_result:
            return False
        
        # If MFA is required
        if mfa_code:
            wb.get_mfa(mfa_code)
        
        # Get account ID (required for most operations)
        account_id = wb.get_account_id()
        
        if not account_id:
            print("Failed to get account ID")
            return False
        
        # Set trading PIN if provided
        if trading_pin:
            wb.get_trade_token(trading_pin)
        
        return True
    except Exception as e:
        log_error_to_db(e)
        print(f"Login error: {str(e)}")
        return False


def get_webull_stock_holdings():
    stock_list = []
    try:
        # Get portfolio positions
        positions = wb.get_positions()
        
        if not positions:
            return stock_list
        
        for position in positions:
            ticker = position.get('ticker', {}).get('symbol', 'UNKNOWN')
            quantity = float(position.get('position', 0))
            
            if quantity <= 0:
                continue
            
            cost_price = float(position.get('costPrice', 0))
            current_price = float(position.get('marketValue', 0)) / quantity if quantity > 0 else 0
            market_value = float(position.get('marketValue', 0))
            unrealized_profit = float(position.get('unrealizedProfitLoss', 0))
            unrealized_profit_ratio = float(position.get('unrealizedProfitLossRate', 0))
            
            stock_list.append({
                'symbol': ticker,
                'quantity': quantity,
                'average_buy_price': cost_price,
                'current_price': current_price,
                'equity': market_value,
                'percent_change': unrealized_profit_ratio * 100,
                'equity_change': unrealized_profit,
                'type': 'stock'
            })
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching stock holdings: {str(e)}")
    
    return stock_list


def get_webull_crypto_holdings():
    crypto_list = []
    try:
        # Webull crypto API (if available)
        # Note: Webull's crypto support may be limited in the API
        crypto_positions = wb.get_crypto_positions()
        
        if not crypto_positions:
            return crypto_list
        
        for position in crypto_positions:
            symbol = position.get('symbol', 'UNKNOWN')
            quantity = float(position.get('quantity', 0))
            
            if quantity <= 0:
                continue
            
            average_cost = float(position.get('averageCost', 0))
            current_price = float(position.get('currentPrice', 0))
            market_value = float(position.get('marketValue', 0))
            
            crypto_list.append({
                'symbol': symbol,
                'quantity': quantity,
                'average_buy_price': average_cost,
                'current_price': current_price,
                'equity': market_value,
                'cost_basis': quantity * average_cost,
                'type': 'crypto'
            })
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching crypto holdings: {str(e)}")
    
    return crypto_list


def get_webull_brokerage_account_info():
    try:
        # Get account details
        account_details = wb.get_account()
        
        if not account_details:
            print("No account details found")
            return None
        
        account_id = wb.get_account_id()
        
        net_liquidation = float(account_details.get('netLiquidation', 0))
        cash_balance = float(account_details.get('accountMembers', [{}])[0].get('value', 0) 
                           if account_details.get('accountMembers') else 0)
        
        for member in account_details.get('accountMembers', []):
            if member.get('key') == 'cashBalance':
                cash_balance = float(member.get('value', 0))
                break
        
        buying_power = float(account_details.get('buyingPower', 0))
        
        account = {
            'account_number': account_id,
            'account_type': 'brokerage',
            'account_subtype': 'cash',  
            'account_name': 'Webull Brokerage',
            'cash': cash_balance,
            'buying_power': buying_power,
            'equity': net_liquidation,
            'equity_previous_close': 0,  
            'withdrawable_amount': cash_balance,
            'holdings': {
                'stocks': get_webull_stock_holdings(),
                'crypto': get_webull_crypto_holdings()
            }
        }
        
        return account
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching brokerage account: {str(e)}")
        return None


def get_webull_retirement_accounts():
    retirement_accounts = []
    
    try:
        # Webull IRA account access
        # Note: The webull library may have limited IRA support
        # This is a placeholder - you may need to implement custom API calls
        
        # Check if user has IRA accounts
        all_accounts = wb.get_account()
        
        # Webull's IRA implementation may vary
        # You might need to make direct API calls similar to Robinhood
        
        print("Webull retirement account support is limited in the current library")
        
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching retirement accounts: {str(e)}")
    
    return retirement_accounts


def get_webull_accounts(email, password, trading_pin=None, mfa_code=None):
    try:
        if not webull_login(email, password, trading_pin, mfa_code):
            return jsonify({'error': 'Login failed - invalid credentials'}), 401
        
        accounts_data = []
        
        brokerage_account = get_webull_brokerage_account_info()
        if brokerage_account:
            accounts_data.append(brokerage_account)
        
        retirement_accounts = get_webull_retirement_accounts()
        accounts_data.extend(retirement_accounts)
        
        total_equity = sum(account['equity'] for account in accounts_data)
        total_cash = sum(account.get('cash', 0) for account in accounts_data)
        
        total_stock_holdings = sum(len(account['holdings']['stocks']) for account in accounts_data)
        total_crypto_holdings = sum(len(account['holdings']['crypto']) for account in accounts_data)
        
        return jsonify({
            'success': True,
            'total_accounts': len(accounts_data),
            'total_equity': total_equity,
            'total_cash': total_cash,
            'total_holdings': {
                'stocks': total_stock_holdings,
                'crypto': total_crypto_holdings
            },
            'accounts': accounts_data
        }), 200
        
    except Exception as e:
        log_error_to_db(e)
        return jsonify({'error': f'Failed to fetch accounts and holdings: {e}'}), 500