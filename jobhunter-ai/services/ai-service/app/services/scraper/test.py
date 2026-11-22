import os
for f in ['app/services/scraper/__init__.py','app/services/scraper/engine.py',
          'app/services/scraper/sources/base.py','app/services/scraper/sources/jsearch.py']:
    s = os.path.getsize(f) if os.path.exists(f) else 0
    print(f'  {\"OK\" if s > 0 else \"FAIL\":4s} {s:5d} bytes  {f}')
