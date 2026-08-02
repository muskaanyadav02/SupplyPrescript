import pickle

with open("models/feature_columns.pkl", "rb") as f:
    cols = pickle.load(f)
print("Feature columns:", cols)

with open("models/xgboost_model.pkl", "rb") as f:
    model = pickle.load(f)
print("Model type:", type(model))
print(model)