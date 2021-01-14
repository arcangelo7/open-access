import csv, json

# Childcare
with open("data/childcare.csv", "r", encoding='utf-8') as csvfile:
    childcare = list(csv.DictReader(csvfile))
with open("data/json/childcare.json", "w") as jsonfile:
    json.dump(childcare, jsonfile)
# Health - Death causes
with open("data/health_death_causes.csv", "r", encoding='utf-8') as csvfile:
    health_death_causes = list(csv.DictReader(csvfile))
with open("data/json/health_death_causes.json", "w") as jsonfile:
    json.dump(health_death_causes, jsonfile)
# Labour
with open("data/labour.csv", "r", encoding='utf-8') as csvfile:
    labour = list(csv.DictReader(csvfile))
with open("data/json/labour.json", "w") as jsonfile:
    json.dump(labour, jsonfile)