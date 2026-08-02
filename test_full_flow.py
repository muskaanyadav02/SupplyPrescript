import requests

BASE = "http://127.0.0.1:8000"

print("=== Step 1: Get a shipment ===")
shipments = requests.get(f"{BASE}/shipments").json()
if not shipments:
    print("ERROR: no shipments found.")
    exit()
shipment_id = shipments[0]["id"]
print(f"Using shipment_id: {shipment_id}")

print("\n=== Step 2: Predict ===")
pred = requests.get(f"{BASE}/predict/{shipment_id}").json()
print(pred)
if "error" in pred:
    print("ERROR at predict step.")
    exit()
prediction_id = pred["prediction_id"]

print("\n=== Step 3: Prescribe ===")
prescribe = requests.post(f"{BASE}/prescribe/{prediction_id}").json()
print(prescribe)
if "error" in prescribe or not prescribe.get("options"):
    print("ERROR at prescribe step (no options generated).")
    exit()
prescription_id = prescribe["options"][0]["prescription_id"]

print("\n=== Step 4: Execute decision ===")
execute = requests.post(f"{BASE}/decisions/{prescription_id}/execute").json()
print(execute)

print("\n=== Step 4b: Execute again (idempotency check) ===")
execute_again = requests.post(f"{BASE}/decisions/{prescription_id}/execute").json()
print(execute_again)
if execute["decision_id"] != execute_again["decision_id"]:
    print("WARNING: idempotency may be broken — different decision_id returned!")
else:
    print("Idempotency confirmed: same decision_id returned.")

print("\n=== Step 5: Analytics ===")
analytics = requests.get(f"{BASE}/analytics/decision-roi").json()
print(analytics)

print("\n=== FULL FLOW TEST COMPLETE ===")