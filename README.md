Obtaining Data
--------------

Psiturk provides a simple command for retrieving datasets using the <code>download datafiles</code> command in the Psiturk command-line. This creates three CSV files for event data, trial data, and question data. However, for our purposes in the HRI Lab, the formatting of these csv files may be a little difficult. Therefore, a simple CSV parser is provided below. You may modify it to fit the needs of your project database.

```python
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

# create lists for data and worker ids
data = []
ids = []

#status codes of subjects who completed experiment
statuses = [3, 4, 5]
# if you have workers you wish to exclude, add them here
exclude = []
for row in rows:
	# only use subjects who completed experiment and aren't excluded
	if row['status'] in statuses and row['uniqueid'] not in exclude:
		ids.append(row['workerid'])
		data.append(row[data_column_name])

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

# in our csv file, each row will be an entry for one worker
# each column will be a response to a question or control 
# in the order it appears in the survey
  
# create a list to store rows 
output = []
row = ''

# counter to keep track of current row
counter = 0

#loop through trial data
for trial in data:
	phase = trial['phase']
	if (phase == 'TEST'):
		s = trial['response']
		for response in s:
                        # for entries with commas
			if ',' in response:
				response = '"' + response + '"'
			row += response
			row += ', '
        # the final phase
	if (phase == 'TESTEND'):
		row += str(trial['total_time'])
                # insert worker id in front of the row
		row = ids[counter] + ', ' + row
		output.append(row)
		row = ''
		counter += 1


with open('csvfile.csv','wb') as file:
        # write the columns for the csv file
	file.write('workerid, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, time')
	file.write('\n')
	for line in output:
		file.write(line)
		file.write('\n')
```