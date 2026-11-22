import httpx
import os
import sys

sys.path.insert(0, "services/ai-service")
from dotenv import load_dotenv
load_dotenv("services/ai-service/.env")

key = os.getenv("JSEARCH_API_KEY", "")
host = "jsearch.p.rapidapi.com"
headers = {"X-RapidAPI-Key": key, "X-RapidAPI-Host": host}
params = {"query": "Python Developer", "num_pages": "1"}

paths = [
    "/search",
    "/api/search",
    "/v1/search",
    "/jobs/search",
    "/job-search",
    "/job_search",
    "/jobs",
    "/api/jobs",
    "/api/v1/search",
    "/api/v1/jobs/search",
]

print("Testing JSearch endpoints...")
print("Host:", host)
print()

for path in paths:
    url = "https://" + host + path
    try:
        r = httpx.get(url, params=params, headers=headers, timeout=15)
        status = r.status_code
        if status == 200:
            data = r.json()
            # Check structure
            if "data" in data:
                d = data["data"]
                if isinstance(d, dict) and "jobs" in d:
                    count = len(d["jobs"])
                elif isinstance(d, list):
                    count = len(d)
                else:
                    count = "?"
            else:
                count = "?"
            print(f"  >>> FOUND! {path} -> {status} ({count} jobs)")
            print(f"      Keys: {list(data.keys())}")
            if isinstance(data.get("data"), dict):
                print(f"      data keys: {list(data['data'].keys())}")
            break
        else:
            print(f"  {path} -> {status}")
    except Exception as e:
        print(f"  {path} -> ERROR: {e}")

print()
print("Done.")