import time
from datetime import datetime
from pipeline.update_index import run_batch_update

TARGET_HOUR = 3
TARGET_MINUTE = 0

def main():
    last_run_day = None

    while True:
        now = datetime.now()
        current_day = now.date()

        if now.hour == TARGET_HOUR and now.minute == TARGET_MINUTE and last_run_day != current_day:
            try:
                processed = run_batch_update()
                print(f"[{now.isoformat()}] Batch success: {processed} mangas processed")
                last_run_day = current_day
            except Exception as e:
                print(f"[{now.isoformat()}] Batch error: {e}")

        time.sleep(30)

if __name__ == "__main__":
    main()