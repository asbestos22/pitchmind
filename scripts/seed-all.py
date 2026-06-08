#!/usr/bin/env python3
"""Seed all 72 matches × 5 users with auto-retry on rate limits."""
import json, time, urllib.request, sys, os, random

API = os.getenv("API_URL", "http://localhost:8787")

USERS = [
    {"name": "F5",    "bias": "HOME", "conf": (65, 90)},
    {"name": "Aleko", "bias": "AWAY", "conf": (30, 60)},
    {"name": "Tita",  "bias": "DRAW", "conf": (50, 75)},
    {"name": "Rex",   "bias": "HOME", "conf": (80, 95)},
    {"name": "Nina",  "bias": "none", "conf": (40, 70)},
]

MATCHES = [
    ("2026-06-11","19:00","Mexico","South Africa","MEX-SOU"),
    ("2026-06-12","02:00","South Korea","Czechia","SOU-CZE"),
    ("2026-06-12","19:00","Canada","Bosnia-Herzegovina","CAN-BOS"),
    ("2026-06-13","01:00","United States","Paraguay","UNI-PAR"),
    ("2026-06-13","19:00","Qatar","Switzerland","QAT-SWI"),
    ("2026-06-13","22:00","Brazil","Morocco","BRA-MOR"),
    ("2026-06-14","01:00","Haiti","Scotland","HAI-SCO"),
    ("2026-06-14","04:00","Australia","Türkiye","AUS-TUR"),
    ("2026-06-14","17:00","Germany","Curaçao","GER-CUR"),
    ("2026-06-14","20:00","Netherlands","Japan","NET-JAP"),
    ("2026-06-14","23:00","Ivory Coast","Ecuador","IVO-ECU"),
    ("2026-06-15","02:00","Sweden","Tunisia","SWE-TUN"),
    ("2026-06-15","16:00","Spain","Cape Verde","SPA-CAP"),
    ("2026-06-15","19:00","Belgium","Egypt","BEL-EGY"),
    ("2026-06-15","22:00","Saudi Arabia","Uruguay","SAU-URU"),
    ("2026-06-16","01:00","Iran","New Zealand","IRA-NEW"),
    ("2026-06-16","19:00","France","Senegal","FRA-SEN"),
    ("2026-06-16","22:00","Iraq","Norway","IRA-NOR"),
    ("2026-06-17","01:00","Argentina","Algeria","ARG-ALG"),
    ("2026-06-17","04:00","Austria","Jordan","AUS-JOR"),
    ("2026-06-17","17:00","Portugal","Congo DR","POR-CON"),
    ("2026-06-17","20:00","England","Croatia","ENG-CRO"),
    ("2026-06-17","23:00","Ghana","Panama","GHA-PAN"),
    ("2026-06-18","02:00","Uzbekistan","Colombia","UZB-COL"),
    ("2026-06-18","16:00","Czechia","South Africa","CZE-SOU"),
    ("2026-06-18","19:00","Switzerland","Bosnia-Herzegovina","SWI-BOS"),
    ("2026-06-18","22:00","Canada","Qatar","CAN-QAT"),
    ("2026-06-19","01:00","Mexico","South Korea","MEX-SOU1"),
    ("2026-06-19","19:00","United States","Australia","UNI-AUS"),
    ("2026-06-19","22:00","Scotland","Morocco","SCO-MOR"),
    ("2026-06-20","00:30","Brazil","Haiti","BRA-HAI"),
    ("2026-06-20","03:00","Türkiye","Paraguay","TUR-PAR"),
    ("2026-06-20","17:00","Netherlands","Sweden","NET-SWE"),
    ("2026-06-20","20:00","Germany","Ivory Coast","GER-IVO"),
    ("2026-06-21","00:00","Ecuador","Curaçao","ECU-CUR"),
    ("2026-06-21","04:00","Tunisia","Japan","TUN-JAP"),
    ("2026-06-21","16:00","Spain","Saudi Arabia","SPA-SAU"),
    ("2026-06-21","19:00","Belgium","Iran","BEL-IRA"),
    ("2026-06-21","22:00","Uruguay","Cape Verde","URU-CAP"),
    ("2026-06-22","01:00","New Zealand","Egypt","NEW-EGY"),
    ("2026-06-22","17:00","Argentina","Austria","ARG-AUS"),
    ("2026-06-22","21:00","France","Iraq","FRA-IRA"),
    ("2026-06-23","00:00","Norway","Senegal","NOR-SEN"),
    ("2026-06-23","03:00","Jordan","Algeria","JOR-ALG"),
    ("2026-06-23","17:00","Portugal","Uzbekistan","POR-UZB"),
    ("2026-06-23","20:00","England","Ghana","ENG-GHA"),
    ("2026-06-23","23:00","Panama","Croatia","PAN-CRO"),
    ("2026-06-24","02:00","Colombia","Congo DR","COL-CON"),
    ("2026-06-24","19:00","Bosnia-Herzegovina","Qatar","BOS-QAT"),
    ("2026-06-24","19:00","Switzerland","Canada","SWI-CAN"),
    ("2026-06-24","22:00","Morocco","Haiti","MOR-HAI"),
    ("2026-06-24","22:00","Scotland","Brazil","SCO-BRA"),
    ("2026-06-25","01:00","Czechia","Mexico","CZE-MEX"),
    ("2026-06-25","01:00","South Africa","South Korea","SOU-SOU"),
    ("2026-06-25","20:00","Curaçao","Ivory Coast","CUR-IVO"),
    ("2026-06-25","20:00","Ecuador","Germany","ECU-GER"),
    ("2026-06-25","23:00","Japan","Sweden","JAP-SWE"),
    ("2026-06-25","23:00","Tunisia","Netherlands","TUN-NET"),
    ("2026-06-26","02:00","Paraguay","Australia","PAR-AUS"),
    ("2026-06-26","02:00","Türkiye","United States","TUR-UNI"),
    ("2026-06-26","19:00","Norway","France","NOR-FRA"),
    ("2026-06-26","19:00","Senegal","Iraq","SEN-IRA"),
    ("2026-06-27","00:00","Cape Verde","Saudi Arabia","CAP-SAU"),
    ("2026-06-27","00:00","Uruguay","Spain","URU-SPA"),
    ("2026-06-27","03:00","Egypt","Iran","EGY-IRA"),
    ("2026-06-27","03:00","New Zealand","Belgium","NEW-BEL"),
    ("2026-06-27","21:00","Croatia","Ghana","CRO-GHA"),
    ("2026-06-27","21:00","Panama","England","PAN-ENG"),
    ("2026-06-27","23:30","Colombia","Portugal","COL-POR"),
    ("2026-06-27","23:30","Congo DR","Uzbekistan","CON-UZB"),
    ("2026-06-28","02:00","Algeria","Austria","ALG-AUS"),
    ("2026-06-28","02:00","Jordan","Argentina","JOR-ARG"),
]

def pick_winner(bias):
    if bias == "HOME": return "HOME"
    if bias == "AWAY": return "AWAY"
    if bias == "DRAW": return "DRAW"
    return random.choice(["HOME", "AWAY", "DRAW"])

def predict(user, match, pick_val, confidence):
    date, time_, home, away, match_id = match
    body = json.dumps({
        "user": user, "matchId": match_id, "home": home, "away": away,
        "pick": pick_val, "confidence": confidence, "take": ""
    }).encode()
    req = urllib.request.Request(
        f"{API}/api/predict",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())
    except Exception as e:
        return {"error": str(e)}

def p(msg):
    print(msg, flush=True)

def main():
    total = len(MATCHES) * len(USERS)
    p(f"\n=== Seeding {len(MATCHES)} matches x {len(USERS)} users = {total} predictions ===")
    p(f"Delay: 8s between requests, auto-retry on 429\n")
    
    done = 0
    failed = 0
    
    for user in USERS:
        p(f"\n-- {user['name']} ({user['bias']} bias) --")
        for match in MATCHES:
            pw = pick_winner(user["bias"])
            conf = random.randint(user["conf"][0], user["conf"][1])
            
            for attempt in range(5):
                result = predict(user["name"], match, pw, conf)
                err = result.get("error", "")
                if not err:
                    done += 1
                    p(f"  OK {user['name']}: {match[4]} -> {pw} ({conf}%) [{done}/{total}]")
                    break
                elif "429" in err:
                    # Parse retry_after_seconds from error
                    retry_after = 60 * (attempt + 2)
                    try:
                        if "retry_after_seconds" in err:
                            retry_after = int(err.split("retry_after_seconds\":")[1].split("}")[0])
                    except: pass
                    p(f"  WAIT {user['name']}: {match[4]} -- 429, sleeping {retry_after}s (attempt {attempt+1}/5)")
                    time.sleep(retry_after)
                else:
                    failed += 1
                    p(f"  ERR {user['name']}: {match[4]} -- {err[:100]}")
                    break
            
            time.sleep(8)
    
    p(f"\n=== Done: {done} seeded, {failed} failed ===")

if __name__ == "__main__":
    main()
