import csv, itertools, re, pandas

with open("data/temp/labour_force.csv") as csvfile:
    labour_force = list(csv.DictReader(csvfile))
    labour_force_new = list()
    list_of_years = list()
    for key in labour_force[0]:
        if ("YR" in key):
            list_of_years.append(key)
    for values in itertools.product(labour_force, list_of_years):
        labour_force_new.append({"country_name": values[0]["country_name"], "country_code": values[0]["country_code"], "year": re.sub("YR", "", values[1]), "female_labour_force": values[0][values[1]]})

with open("data/temp/labour_force_new.csv", "w", newline="") as csvfile:
    dict_writer = csv.DictWriter(csvfile, labour_force_new[0].keys())
    dict_writer.writeheader()
    dict_writer.writerows(labour_force_new)

with open("data/temp/marital_status.csv") as csvfile:
    marital_status_new = list()
    marital_status = list(csv.DictReader(csvfile))
    dict_of_years = dict()

    for row in marital_status:
        if ((row["source.label"][0:3] in dict_of_years) and (row["time"] in dict_of_years[row["source.label"][0:3]])):
            prev_dict = next(item for item in marital_status_new if (item["country_code"] == row["source.label"][0:3] and item["year"] == row["time"]))
            prev_dict[row["classif2.label"]] = row["obs_value"]
        else:
            marital_status_new.append({"country_name": row["ï»¿ref_area.label"], "country_code": row["source.label"][0:3], "year": row["time"], "total": row["obs_value"]})
        dict_of_years.setdefault(row["source.label"][0:3], {row["time"]})
        dict_of_years[row["source.label"][0:3]].add(row["time"])

keys = ["country_name", "country_code", "year", "total", "single", "married", "union_cohabiting", "widowed", "divorced", "single_widowed_divorced", "married_union_cohabiting", "not_elsewhere_classified"]

with open("data/temp/marital_status_new.csv", "w", newline="") as csvfile:
    dict_writer = csv.DictWriter(csvfile, keys)
    dict_writer.writeheader()
    dict_writer.writerows(marital_status_new)

a = pandas.read_csv("data/temp/labour_force_new.csv")
b = pandas.read_csv("data/temp/marital_status_new.csv")
merged = a.merge(b, on=["country_name", "country_code", "year"], how="outer")
merged.to_csv("data/labour.csv", index=False)

