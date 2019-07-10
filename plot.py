# Simple Python script to create a plot of the results from the experiment 
from sqlalchemy import create_engine, MetaData, Table
import json

# setup database
db_url = "sqlite:///participants.db"
table_name = 'turkdemo'
data_column_name = 'datastring'
# boilerplace sqlalchemy setup
engine = create_engine(db_url)
metadata = MetaData()
metadata.bind = engine
table = Table(table_name, metadata, autoload=True)
# make a query and loop through
s = table.select()
rows = s.execute()

data = []
ids = []

#status codes of subjects who completed experiment
donecounter = 0
statuses = [5]
# if you have workers you wish to exclude, add them here
exclude = []
for row in rows:
    # only use subjects who completed experiment and aren't excluded
    if row['status'] in statuses and row['uniqueid'] not in exclude:
            data.append(row[data_column_name])
            ids.append(row['workerid'])


# parse each participant's datastring as json object
# and take the 'data' sub-object
data = [json.loads(part)['data'] for part in data]

# insert uniqueid field into trialdata in case it wasn't added
# in experiment:
for part in data:
    for record in part:
        record['trialdata']['uniqueid'] = record['uniqueid']

# flatten nested list so we just have a list of the trialdata recorded
# each time psiturk.recordTrialData(trialdata) was called.
data = [record['trialdata'] for part in data for record in part]

# Put all subjects' trial data into a dataframe object from the
# 'pandas' python library: one option among many for analysis
# data_frame = pd.DataFrame(data)


#loop through trial data
output = []
row = ''
counter = 0
for trial in data:
	phase = trial['phase']
	if (phase == 'INITIAL'):
		row += trial['condition']
		row += ', '
	if (phase == 'TEST'):
		s = trial['response']
		for response in s:
			row += response
			row += ', '
	if (phase == 'TESTEND'):
		row += str(trial['total_time'])
		row = ids[counter] + ', ' + row
		output.append(row)
		row = ''
		counter += 1




with open('csvfile.csv','wb') as file:
    # write the columns for the csv file
	file.write('workerid, condition, age, gender, ethnicity, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20, a21, a22, a23, a24, a25, a26, a27, a28, video, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, c1, c2, d1, d2, d3, d4, d5, d6, d7, d8, d9, d10, d11, d12, e1, e2, e3, e4, e5, e6, e7, e8, e9, 10, e11, time')
	file.write('\n')
	for line in output:
		file.write(line)
		file.write('\n')
