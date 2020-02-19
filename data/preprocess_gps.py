import csv
import datetime
import json

car_assignments = {}
with open('car-assignments.csv', 'r') as ca_file:
    reader = csv.reader(ca_file)
    for row in reader:
        if row[2] != "" and row[2] != "CarID":
            car_assignments[row[2]] = {'LastName': row[0], 'FirstName': row[1], 'EmpType': row[3], 'EmpTitle': row[4]}

gps_data = {}
gps_data_by_id = {}
header = None
delta = datetime.timedelta(seconds=10) # time interval between gps reading for the long version
epsilon = datetime.timedelta(seconds=15) # if they have stopped this many seconds, that is considered a stop.
with open('gps.csv', 'r') as gps_file:
    reader = csv.reader(gps_file)
    header = next(reader)
    for row in reader:
        date_only = datetime.datetime.strptime(row[0], '%m/%d/%Y %H:%M:%S').strftime('%m/%d/%Y')
        car_id = int(row[1])
        if car_id not in gps_data.keys():
            gps_data[car_id] = {}
            gps_data_by_id[car_id] = []

        if date_only not in gps_data[car_id].keys():
            gps_data[car_id][date_only] = []

        gps_data[car_id][date_only].append([row[0], row[2], row[3]])
        gps_data_by_id[car_id].append(row)



with open('gps_reduced.csv', 'w+') as gps_reduced_file:
        writer = csv.writer(gps_reduced_file, delimiter=',')
        writer.writerow(header)
        

        for ci in gps_data_by_id.keys():
            previous_row = gps_data_by_id[ci][0]
            writer.writerow(previous_row)
            for row in gps_data_by_id[ci]:

                past_time = datetime.datetime.strptime(previous_row[0], '%m/%d/%Y %H:%M:%S')
                current_time = datetime.datetime.strptime(row[0], '%m/%d/%Y %H:%M:%S')
                delta_time = current_time-past_time

                if delta_time >= delta:
                    print(delta_time)
                    writer.writerow(row)
                    previous_row = row

gps_reduced_file.close()

with open('processed_gps.json', 'w+') as outfile:
    json.dump(gps_data, outfile)
#print(gps_data)
