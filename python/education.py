import csv, json
import pandas as pd
import country_converter as coco

edu = dict()

with open("data/temp/edu_primary.csv") as csvfile:
    edu_primary = list(csv.DictReader(csvfile))
    edu_primary_new = dict()
    edu["primary"] = list()
    for row in edu_primary:
        edu["primary"].append({"country": row["country"], "year": row["year"], "value": row["primary_education"]})

with open("data/temp/edu_upper_secondary.csv") as csvfile:
    edu_upper_secondary = list(csv.DictReader(csvfile))
    edu["secondary"] = list()
    for row in edu_upper_secondary:
        edu["secondary"].append({"country": row["Geographic area"], "year": row["TIME_PERIOD"], "value": row["OBS_VALUE"]})

with open("data/temp/edu_gender_ratios_for_mean_years_of_schooling.csv") as csvfile:
    edu_ratio = list(csv.DictReader(csvfile))
    edu["ratio"] = list()
    for row in edu_ratio:
        edu["ratio"].append({"country": row["country"], "year": row["year"], "value": row["gender_ratio"]})

with open("data/edu.json", "w") as jsonfile:
    json.dump(edu, jsonfile)

# with open("data/temp/edu_upper_secondary_new.csv", "w", newline="") as csvfile:
#     dict_writer = csv.DictWriter(csvfile, edu_upper_secondary_new[0].keys())
#     dict_writer.writeheader()
#     dict_writer.writerows(edu_upper_secondary_new)

# a = pd.read_csv("data/temp/edu_primary.csv")
# b = pd.read_csv("data/temp/edu_upper_secondary_new.csv")
# merged = a.merge(b, on=["country", "country_code", "year"], how="outer")
# merged.to_csv("data/temp/edu_primary_secondary.csv", index=False)

# with open("data/edu_ratio_new.csv", "w", newline="") as csvfile:
#     dict_writer = csv.DictWriter(csvfile, edu_ratio_new[0].keys())
#     dict_writer.writeheader()
#     dict_writer.writerows(edu_ratio_new)

# a = pd.read_csv("data/temp/edu_primary_secondary.csv")
# b = pd.read_csv("data/temp/edu_gender_ratios_for_mean_years_of_schooling.csv")
# merged = a.merge(b, on=["country", "year"], how="outer")
# merged.to_csv("data/edu.csv", index=False)