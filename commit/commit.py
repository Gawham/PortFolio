import subprocess
import json
import time
import signal
from datetime import datetime, timedelta, timezone
from collections import defaultdict
import os

OUTPUT_DIR = "repo_commit_outputs"
FINAL_FILE = "daily_commit_counts.json"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# --- Date range ---
start_date = "2024-06-01T00:00:00Z"
end_date = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

# --- Repos to skip ---
SKIPPED_REPOS = ["Gawham/InsdrDeepface"]

# --- Get repos ---
repos = subprocess.run(
    [
        "gh", "repo", "list",
        "--limit", "1000",
        "--json", "nameWithOwner",
        "--jq", ".[].nameWithOwner"
    ],
    capture_output=True,
    text=True
).stdout.strip().split("\n")

global_counts = defaultdict(int)

class TimeoutException(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutException()

# Register the signal handler
signal.signal(signal.SIGALRM, timeout_handler)

def fetch_repo_commits(repo):
    daily_counts = defaultdict(int)
    page = 1

    while True:
        result = subprocess.run(
            [
                "gh", "api",
                f"/repos/{repo}/commits?since={start_date}&until={end_date}&per_page=100&page={page}",
                "--jq", ".[] | .commit.author.date"
            ],
            capture_output=True,
            text=True
        )

        dates = result.stdout.strip().split("\n")

        if not dates or dates == ['']:
            break

        for d in dates:
            date_only = d[:10]
            daily_counts[date_only] += 1

        page += 1

    return daily_counts

# --- Process repos ---
for repo in repos:
    safe_repo_name = repo.replace("/", "_")
    repo_file = os.path.join(OUTPUT_DIR, f"{safe_repo_name}.json")

    # Skip already processed or explicitly ignored repos
    if repo in SKIPPED_REPOS:
        print(f"Skipping {repo} (explicitly skipped)")
        continue

    if os.path.exists(repo_file):
        print(f"Skipping {repo} (already processed)")
        # Load existing data to include in global count
        with open(repo_file, "r") as f:
            repo_data = json.load(f)
            for item in repo_data:
                global_counts[item["date"]] += item["commit_count"]
        continue

    print(f"\nProcessing {repo}...")

    signal.alarm(5)
    try:
        repo_counts = fetch_repo_commits(repo)
    except TimeoutException:
        print(f"Timeout processing {repo} (more than 5 seconds). Skipping...")
        continue
    finally:
        signal.alarm(0)

    # --- Fill missing days ---
    start = datetime.fromisoformat("2024-06-01").replace(tzinfo=timezone.utc)
    end = datetime.now(timezone.utc)

    current = start
    repo_data = []

    while current <= end:
        date_str = current.strftime("%Y-%m-%d")
        count = repo_counts.get(date_str, 0)

        repo_data.append({
            "date": date_str,
            "commit_count": count
        })

        global_counts[date_str] += count
        current += timedelta(days=1)

    # --- Save per-repo JSON ---
    with open(repo_file, "w") as f:
        json.dump(repo_data, f, indent=2)

    print(f"Saved {repo_file}")

# --- Save global aggregated file ---
final_data = [
    {"date": date, "commit_count": count}
    for date, count in sorted(global_counts.items())
]

with open(FINAL_FILE, "w") as f:
    json.dump(final_data, f, indent=2)

print(f"\nSaved final aggregated file: {FINAL_FILE}")
print(f"Total commits across all repos: {sum(global_counts.values())}")