from .ErrorDbContext import log_error

def log_error_to_db(exc: Exception, username = "n/a"):
    try:
        log_error(exc)
    except Exception as e:
        print("ERROR WHILE LOGGING ERROR:", e)
        print("Original error:", exc)