import csv, json

with open("data/temp/digital.csv") as csvfile:
    digital = list(csv.DictReader(csvfile))
    digital_new = list()
    categories = set()
    for row in digital:
        if (row["CATEGORY"] in categories):
            prev_dict = next(item for item in digital_new if (item["category"] == row["CATEGORY"]))
            prev_dict["values"].append({"country": row["CATEGORY"], "series": row["ï»¿SERIES"], "value": float(row["VALUE"]), "note": row["NOTE"]})
        else:
            digital_new.append({"category": row["CATEGORY"], "code": row["CODE"], "values": [{"country": row["CATEGORY"], "series": row["ï»¿SERIES"], "value": float(row["VALUE"]), "note": row["NOTE"]}]})  
        categories.add(row["CATEGORY"])

with open("data/digital.json", "w") as jsonfile:
    json.dump(digital_new, jsonfile)

