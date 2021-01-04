import pandas as pd
import csv

with open("data/temp/paygap_2006-2018.csv") as csvfile:
    paygap2006 = list(csv.DictReader(csvfile))
    paygap2006_new = list()
    for row in paygap2006:
        paygap2006_new.append({"indicator": "paygap", "country_code": row["Alpha3Code"], "year": row["TIME"], "value": row["Value"]})

with open("data/temp/paygap_2006-2018_new.csv", "w", newline="") as csvfile:
    dict_writer = csv.DictWriter(csvfile, paygap2006_new[0].keys())
    dict_writer.writeheader()
    dict_writer.writerows(paygap2006_new)

with open("data/temp/paygap_2016-2019.csv") as csvfile:
    paygap2016 = list(csv.DictReader(csvfile))
    paygap2016_new = list()
    for row in paygap2016:
        paygap2016_new.append({"indicator": "paygap", "country_code": row['ï»¿"Alpha3Code"'], "year": row["TIME"], "value": row["Value"]})

with open("data/temp/paygap_2016-2019_new.csv", "w", newline="") as csvfile:
    dict_writer = csv.DictWriter(csvfile, paygap2016_new[0].keys())
    dict_writer.writeheader()
    dict_writer.writerows(paygap2016_new)

a = pd.read_csv("data/temp/paygap_2006-2018_new.csv")
b = pd.read_csv("data/temp/paygap_2016-2019_new.csv")
merged = a.merge(b, on=["country_code", "year"], how="outer")
merged.to_csv("data/paygap.csv", index=False)
