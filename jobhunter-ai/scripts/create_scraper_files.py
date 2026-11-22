import os

# Read the existing script
with open('scripts/create_scraper_files.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the jsearch section
old_endpoint = 'self.BASE_URL + \"/search\"'
new_endpoint = 'self.BASE_URL + \"/search-v2\"'

old_parsing = '''data = response.json()
                jobs = []
                for raw in data.get(\"data\", [])[:limit]:'''

new_parsing = '''data = response.json()
                jobs_data = data.get(\"data\", {})
                if isinstance(jobs_data, dict):
                    raw_jobs = jobs_data.get(\"jobs\", [])
                elif isinstance(jobs_data, list):
                    raw_jobs = jobs_data
                else:
                    raw_jobs = []
                jobs = []
                for raw in raw_jobs[:limit]:'''

content = content.replace(old_endpoint, new_endpoint)
content = content.replace(old_parsing, new_parsing)

with open('scripts/create_scraper_files.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Script updated!')
print('Endpoint v2:', new_endpoint in content)
print('Parsing v2:', 'jobs_data' in content)