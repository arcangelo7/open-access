from lxml import etree as ET
from datetime import datetime
import json, csv

ET.register_namespace('m', 'http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message')
ET.register_namespace('s', 'http://www.sdmx.org/resources/sdmxml/schemas/v2_1/structure')
ET.register_namespace('c', 'http://www.sdmx.org/resources/sdmxml/schemas/v2_1/common')
ET.register_namespace('g', 'http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic')
ET.register_namespace('footer', 'http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message/footer')
ET.register_namespace('xsi', 'http://www.w3.org/2001/XMLSchema-instance')

root = ET.Element("{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}GenericData")
header = ET.SubElement(root, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Header")
dataset = ET.SubElement(root, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}DataSet")

ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Test").text = "false"
ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Prepared").text = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")

# Life expectancy
with open("data/health_life_expectancy.json") as jsonfile:
    data = json.load(jsonfile)
    for row in data:
        series = ET.SubElement(dataset, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Series")
        seriesKey = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}SeriesKey")
        for key, value in row.items():
            if key != "values":
                ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id=key, value=value)
            else:
                for el in value:
                    obs = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Obs")
                    ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=el["sex"])
                    ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsValue", value=str(el["value"]))

output_dir = "data/xml/health_life_expectancy.xml"
tree = ET.ElementTree(root)
tree.write(output_dir, encoding="utf-8", xml_declaration=True, pretty_print=True)

# Education
root_edu = ET.Element("{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}GenericData")
header = ET.SubElement(root_edu, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Header")
dataset = ET.SubElement(root_edu, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}DataSet")

ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Test").text = "false"
ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Prepared").text = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")

with open("data/edu.json") as jsonfile:
    data = json.load(jsonfile)
    for row in data:
        series = ET.SubElement(dataset, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Series")
        seriesKey = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}SeriesKey")
        ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="indicator", value=row)
        for obs in data[row]:
            observation = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Obs")
            ET.SubElement(observation, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=obs["country"])
            ET.SubElement(observation, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=obs["year"])
            ET.SubElement(observation, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsValue", value=obs["value"])

output_dir = "data/xml/edu.xml"
tree = ET.ElementTree(root_edu)
tree.write(output_dir, encoding="utf-8", xml_declaration=True, pretty_print=True)

# Digital
root_digital = ET.Element("{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}GenericData")
header = ET.SubElement(root_digital, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Header")
dataset = ET.SubElement(root_digital, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}DataSet")

ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Test").text = "false"
ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Prepared").text = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")

with open("data/digital.json") as jsonfile:
    data = json.load(jsonfile)
    for row in data:
        series = ET.SubElement(dataset, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Series")
        seriesKey = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}SeriesKey")
        for key, value in row.items():
            if key != "values":
                ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id=key, value=value)
            else:
                for el in value:
                    obs = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Obs")
                    ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=el["series"])
                    ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsValue", value=str(el["value"]))

output_dir = "data/xml/digital.xml"
tree = ET.ElementTree(root_digital)
tree.write(output_dir, encoding="utf-8", xml_declaration=True, pretty_print=True)

# Paygap
root_paygap = ET.Element("{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}GenericData")
header = ET.SubElement(root_paygap, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Header")
dataset = ET.SubElement(root_paygap, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}DataSet")

ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Test").text = "false"
ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Prepared").text = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")

with open("data/paygap.json") as jsonfile:
    data = json.load(jsonfile)
    for row in data:
        series = ET.SubElement(dataset, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Series")
        seriesKey = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}SeriesKey")
        ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="indicator", value=row)
        for obs in data[row]:
            observation = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Obs")
            ET.SubElement(observation, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=obs["country"])
            ET.SubElement(observation, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=obs["year"])
            ET.SubElement(observation, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsValue", value=obs["value"])

output_dir = "data/xml/paygap.xml"
tree = ET.ElementTree(root_paygap)
tree.write(output_dir, encoding="utf-8", xml_declaration=True, pretty_print=True)

# Childcare
root_childcare = ET.Element("{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}GenericData")
header = ET.SubElement(root_childcare, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Header")
dataset = ET.SubElement(root_childcare, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}DataSet")

ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Test").text = "false"
ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Prepared").text = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")

with open("data/childcare.csv") as csvfile:
    data = list(csv.DictReader(csvfile))    
    print(data[0])
    series = ET.SubElement(dataset, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Series")
    seriesKey = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}SeriesKey")
    ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="indicator", value=data[0]["IndicatorName"])
    ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="IndicatorCode", value=data[0]["IndicatorCode"])
    ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="variable", value=data[0]["VariableName"])
    ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="unit", value=data[0]["MeasurementName"])
    for row in data:
        obs = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Obs")
        ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=row["Alpha3Code"])
        ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=row["CountryName"])
        ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=row["PeriodCode"])
        ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsValue", value=row["Value"])

output_dir = "data/xml/childcare.xml"
tree = ET.ElementTree(root_childcare)
tree.write(output_dir, encoding="utf-8", xml_declaration=True, pretty_print=True)

# Death causes
root_death = ET.Element("{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}GenericData")
header = ET.SubElement(root_death, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Header")
dataset = ET.SubElement(root_death, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}DataSet")

ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Test").text = "false"
ET.SubElement(header, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/message}Prepared").text = datetime.now().strftime("%Y-%m-%dT%H:%M:%S.%f")

with open("data/health_death_causes.csv") as csvfile:
    data = list(csv.DictReader(csvfile))    
    print(data[0])
    series = ET.SubElement(dataset, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Series")
    seriesKey = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}SeriesKey")
    ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="indicator", value=data[0]["IndicatorName"])
    ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="IndicatorCode", value=data[0]["IndicatorCode"])
    ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="variable", value=data[0]["VariableName"])
    ET.SubElement(seriesKey, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Value", id="unit", value=data[0]["MeasurementName"])
    for row in data:
        obs = ET.SubElement(series, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}Obs")
        ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=row["country_code"])
        ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=row["country"])
        ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsDimension", value=row["year"])
        ET.SubElement(obs, "{http://www.sdmx.org/resources/sdmxml/schemas/v2_1/data/generic}ObsValue", value=row["Value"])

output_dir = "data/xml/health_death_causes.xml"
tree = ET.ElementTree(root_death)
tree.write(output_dir, encoding="utf-8", xml_declaration=True, pretty_print=True)
