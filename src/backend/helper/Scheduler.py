from controllers.ErrorController import log_error_to_db
from apscheduler.schedulers.background import BackgroundScheduler
import models.PersonalRecordModel as PersonalRecord
import controllers.AccountDbContext as _actDbCtx
import random

def update_personal_acts():
    try:
        print("Updating personal accounts")
        acts = _actDbCtx.get_all_personal_accounts()
        for act in acts:
            try:
                _actDbCtx.add_personal_record(act.Id, act.Balance)
                print(f"Updated user {act.UserId} with account {act.Id, act.Balance}")
            except Exception as e:
                log_error_to_db(e)
                print(f"Failed to update user ({act.UserId}) with account id ({act.Id}) - ", e)
        return True
    except Exception as e:
        log_error_to_db(e)
        print("Failed to update some accounts")
        return False
    
    
def start_scheduler(minutes):
    try:
        if not isinstance(minutes, int):
            minutes = int(minutes)
        scheduler = BackgroundScheduler()
        scheduler.add_job(
            update_personal_acts,
            "interval",
            hours=1,
            max_instances=1,
            coalesce=True
        )
        scheduler.start()
    except Exception as e:
        log_error_to_db(e)
        print("Failed to start scheduler")