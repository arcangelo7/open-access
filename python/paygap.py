import csv, json

paygap_dict = dict()

with open("data/temp/paygap.csv") as csvfile:
    paygap = list(csv.DictReader(csvfile))
    paygap_new = dict()
    paygap_dict["paygap"] = list()
    for row in paygap:
        paygap_dict["paygap"].append({"country": row["GEO"], "year": row["TIME"], "value": row["Value"], "note": row["Flag and Footnotes"]})

with open("data/paygap.json", "w") as jsonfile:
    json.dump(paygap_dict, jsonfile)


