import pandas as pd
import csv, json
import country_converter as coco

country_codes = {
    "UK": "United Kingdom",
    "EU27_2007": "EU 27 countries (2007-2013)",
    "EU28": "EU 28 countries (2013-2020)",
    "EU27_2020": "EU 27 countries (from 2020)",
    "DE_TOT": "Germany including former GDR",
    "EEA31": "EEA (2013-2020)",
    "EEA30_2007": "EEA (2007-2013)",
    "EA19": "Euro area - 19 countries (from 2015)",
    "EA18": "Euro area - 18 countries (2014)",
    "EFTA": "European Free Trade Association",
    "EL": "Greece"
}

def converter (country_code):
    return country_codes[country_code]

# with open("data/temp/health_life_expectancy.csv") as csvfile:
#     life_expectancy = list(csv.DictReader(csvfile))
#     life_expectancy_new = list()
#     categories = set()
#     for row in life_expectancy:
#         if (row["sex"] != "T"):
#             if (row["geo"] in categories):
#                 prev_dict = next(item for item in life_expectancy_new if (item["country_code"] == row["geo"]))
#                 if(coco.convert(names=row["geo"], to="name_short", not_found="None") == "None"):
#                     prev_dict["values"].append({"country": converter(row["geo"]), "sex": row["sex"], "value": float(row["value"])})
#                 else:
#                     prev_dict["values"].append({"country": coco.convert(names=row["geo"], to="name_short", not_found=None), "sex": row["sex"], "value": float(row["value"])})
#             else:
#                 if(coco.convert(names=row["geo"], to="name_short", not_found="None") == "None"):
#                     life_expectancy_new.append({"country_code": row["geo"], "country": converter(row["geo"]), "values": [{"country": converter(row["geo"]), "sex": row["sex"], "value": float(row["value"])}]})
#                 else:
#                     life_expectancy_new.append({"country_code": row["geo"], "country": coco.convert(names=row["geo"], to="name_short", not_found=None), "values": [{"country": coco.convert(names=row["geo"], to="name_short", not_found=None), "sex": row["sex"], "value": float(row["value"])}]})
#             categories.add(row["geo"])
#     life_expectancy_new = sorted(life_expectancy_new, key = lambda i: i["values"][0]["value"], reverse=True)

# with open("data/health_life_expectancy.json", "w") as jsonfile:
#     json.dump(life_expectancy_new, jsonfile)

with open("data/temp/health_death_causes.csv") as csvfile:
    death_causes = list(csv.DictReader(csvfile))
    death_causes_new = list()
    country_causes = dict()
    for row in death_causes:
        if (row["UNIT"] == "NBFEMEPF" or row["UNIT"] == "NBMALEPH"):
            if (((row["COU"] + row["Year"]) in country_causes) and (row["Variable"] in country_causes[row["COU"] + row["Year"]])):
                for item in death_causes_new:
                    if (item["country_code"] == row["COU"] and item["indicator"] == row["Variable"] and item["year"] == row["Year"]):
                        if (row["UNIT"] == "NBFEMEPF"):
                            item["value_f"] = row["Value"]
                            item["note_f"] = row["Flags"]
                        elif (row["UNIT"] == "NBMALEPH"):
                            item["value_m"] = row["Value"]
                            item["note_m"] = row["Flags"]
            else:
                if (row["UNIT"] == "NBFEMEPF"):
                    death_causes_new.append({"indicator": row["Variable"], "country_code": row["COU"], "country": row["Country"], "year": row["Year"], "value_f": row["Value"], "note_f": row["Flags"]})
                elif (row["UNIT"] == "NBMALEPH"):
                    death_causes_new.append({"indicator": row["Variable"], "country_code": row["COU"], "country": row["Country"], "year": row["Year"], "value_m": row["Value"], "note_m": row["Flags"]})
            country_causes.setdefault(row["COU"] + row["Year"], {row["Variable"]})
            country_causes[row["COU"] + row["Year"]].add(row["Variable"])

with open("data/health_death_causes.csv", "w", newline="") as csvfile:
    dict_writer = csv.DictWriter(csvfile, death_causes_new[0].keys())
    dict_writer.writeheader()
    dict_writer.writerows(death_causes_new)

# a = pd.read_csv("data/temp/paygap_2006-2018_new.csv")
# b = pd.read_csv("data/temp/paygap_2016-2019_new.csv")
# merged = a.merge(b, on=["country_code", "year"], how="outer")
# merged.to_csv("data/paygap.csv", index=False)