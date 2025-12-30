from flask import jsonify
from helper.ErrorHandler import log_error_to_db
import robin_stocks.robinhood as rh
import requests

def robinhood_login(email, password, mfa_code=None):
    try:
        if mfa_code:
            login_result = rh.login(email, password, mfa_code=mfa_code)
        else:
            login_result = rh.login(email, password)
        return bool(login_result)
    except Exception as e:
        log_error_to_db(e)
        print(f"Login error: {str(e)}")
        return False


def make_robinhood_request_with_rh(url):
    """
    Use robin_stocks' internal request system to make authenticated calls
    """
    try:
        # Use robin_stocks' helper.request_get which handles authentication
        import robin_stocks.robinhood.helper as helper
        data = helper.request_get(url, 'regular')
        return data
    except Exception as e:
        log_error_to_db(e)
        print(f"Error making request to {url}: {str(e)}")
        return None


def get_stock_holdings():
    stock_list = []
    try:
        stock_holdings = rh.account.build_holdings()
        for symbol, data in stock_holdings.items():
            stock_list.append({
                'symbol': symbol,
                'quantity': float(data.get('quantity', 0)),
                'average_buy_price': float(data.get('average_buy_price', 0)),
                'current_price': float(data.get('price', 0)),
                'equity': float(data.get('equity', 0)),
                'percent_change': float(data.get('percent_change', 0)),
                'equity_change': float(data.get('equity_change', 0)),
                'type': 'stock'
            })
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching stock holdings: {str(e)}")
    
    return stock_list

def get_crypto_holdings():
    crypto_list = []
    try:
        crypto_positions = rh.crypto.get_crypto_positions()
        for position in crypto_positions:
            quantity = float(position.get('quantity', 0))
            if quantity > 0:
                currency_code = position.get('currency', {}).get('code', 'UNKNOWN')
                cost_basis = float(position.get('cost_bases', [{}])[0].get('direct_cost_basis', 0)) if position.get('cost_bases') else 0
                
                try:
                    quote = rh.crypto.get_crypto_quote(currency_code)
                    current_price = float(quote.get('mark_price', 0))
                except:
                    current_price = 0
                
                equity = quantity * current_price
                average_buy_price = cost_basis / quantity if quantity > 0 else 0
                
                crypto_list.append({
                    'symbol': currency_code,
                    'quantity': quantity,
                    'average_buy_price': average_buy_price,
                    'current_price': current_price,
                    'equity': equity,
                    'cost_basis': cost_basis,
                    'type': 'crypto'
                })
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching crypto holdings: {str(e)}")
    
    return crypto_list


def get_retirement_stock_holdings(positions_data):
    stock_list = []
    
    try:
        if not positions_data or 'results' not in positions_data:
            return stock_list
        
        for position in positions_data['results']:
            quantity = float(position.get('quantity', 0))
            
            if quantity <= 0:
                continue
            
            average_cost = float(position.get('average_cost', 0))
            instrument_url = position.get('instrument')
            
            if not instrument_url:
                continue
            
            instrument_data = make_robinhood_request_with_rh(instrument_url)
            
            if not instrument_data:
                continue
            
            symbol = instrument_data.get('symbol', 'UNKNOWN')
            
            try:
                quote = rh.stocks.get_latest_price(symbol)
                current_price = float(quote[0]) if quote else 0
            except:
                current_price = 0
            
            equity = quantity * current_price
            equity_change = equity - (quantity * average_cost)
            percent_change = ((current_price - average_cost) / average_cost * 100) if average_cost > 0 else 0
            
            stock_list.append({
                'symbol': symbol,
                'quantity': quantity,
                'average_buy_price': average_cost,
                'current_price': current_price,
                'equity': equity,
                'percent_change': percent_change,
                'equity_change': equity_change,
                'type': 'stock'
            })
            
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching retirement stock holdings: {str(e)}")
    
    return stock_list


def get_brokerage_account_info():
    try:
        account_profile = rh.profiles.load_account_profile()
        portfolio_profile = rh.profiles.load_portfolio_profile()
        
        account = {
            'account_number': account_profile.get('account_number'),
            'account_type': 'brokerage',
            'account_subtype': account_profile.get('type', 'cash'), 
            'account_name': 'Robinhood Brokerage',
            'cash': float(account_profile.get('cash', 0)),
            'buying_power': float(account_profile.get('buying_power', 0)),
            'equity': float(portfolio_profile.get('equity', 0)),
            'equity_previous_close': float(portfolio_profile.get('equity_previous_close', 0)),
            'withdrawable_amount': float(account_profile.get('withdrawable_amount', 0)),
            'holdings': {
                'stocks': get_stock_holdings(),
                'crypto': get_crypto_holdings()
            }
        }
        
        return account
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching brokerage account: {str(e)}")
        return None


def get_retirement_accounts():
    retirement_accounts = []
    
    try:
        nummus_url = "https://nummus.robinhood.com/accounts/"
        
        accounts_data = make_robinhood_request_with_rh(nummus_url)
        
        if not accounts_data or 'results' not in accounts_data:
            print("No retirement accounts found")
            return retirement_accounts
        print(accounts_data)
        for account in accounts_data['results']:
            account_id = account.get('id')
            account_number = account.get('account_number')
            account_type = account.get('account_type', 'ira')
            status = account.get('status')
            
            if status != 'active':
                continue
            
            portfolio_url = f"https://nummus.robinhood.com/portfolios/{account_id}/"
            portfolio_data = make_robinhood_request_with_rh(portfolio_url)
            
            if not portfolio_data:
                continue
            
            positions_url = f"https://nummus.robinhood.com/holdings/?account_id={account_id}"
            positions_data = make_robinhood_request_with_rh(positions_url)
            
            retirement_account = {
                'account_number': account_number,
                'account_type': 'retirement',
                'account_subtype': account_type.replace('_', ' ').title(),
                'account_name': f"Robinhood {account_type.replace('_', ' ').title()}",
                'cash': float(portfolio_data.get('uninvested_cash_amount', 0)),
                'equity': float(portfolio_data.get('equity', 0)),
                'equity_previous_close': float(portfolio_data.get('equity_previous_close', 0)),
                'status': status,
                'holdings': {
                    'stocks': get_retirement_stock_holdings(positions_data),
                    'crypto': []
                }
            }
            
            retirement_accounts.append(retirement_account)
            
    except Exception as e:
        log_error_to_db(e)
        print(f"Error fetching retirement accounts: {str(e)}")
    
    return retirement_accounts


def get_robinhood_accounts(email, password, mfa_code=None):
    try:
        if not robinhood_login(email, password, mfa_code):
            return jsonify({'error': 'Login failed - invalid credentials'}), 401
        
        accounts_data = []
        
        brokerage_account = get_brokerage_account_info()
        if brokerage_account:
            accounts_data.append(brokerage_account)
        
        retirement_accounts = get_retirement_accounts()
        accounts_data.extend(retirement_accounts)
        
        total_equity = sum(account['equity'] for account in accounts_data)
        total_cash = sum(account.get('cash', 0) for account in accounts_data)
        
        total_stock_holdings = sum(len(account['holdings']['stocks']) for account in accounts_data)
        total_crypto_holdings = sum(len(account['holdings']['crypto']) for account in accounts_data)
        
        rh.logout()
        
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