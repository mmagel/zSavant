'''
with open('MERGEDSCRIPTS.js') as f:
    haystack = f.read()

if not haystack:
    sys.exit("Could not read haystack data :-(")

with open('ALLCUSTFIELDS.js') as f:
    for needle in (line.strip() for line in f):
        orig = needle
        needle = "'"+needle+"'"
        if needle in haystack:
            print(orig)
        else:
            print(needle, '')
'''



import glob
import os
os.chdir( "/Users/rob/Documents/SDMayer/Golden Gate Global/scripts/all scripts/" )
#/Users/rob/Documents/SDMayer/Golden\ Gate\ Global/scripts/all\ scripts
for file in glob.glob('*.js'):
    #print 'DEBUG: file=>{0}<'.format(file)
    with open(file) as f:
        haystack = f.read()
#    if 'struct' in contents:
#        print file
    with open('/Users/rob/Documents/SDMayer/Golden Gate Global/scripts/ALLCUSTFIELDS.js') as n:
        for needle in (line.strip() for line in n):
            orig = needle
            needle = "'"+needle+"'"
            my_string=''
            if needle in haystack:
                if orig !='':
                    print('<tr><td>'+ orig+ '</td><td>{0}</td></tr>'.format(file) )
  #                  my_string = my_string+ (orig+ ',{0}'.format(file) )
  #                  with open("/Users/rob/Documents/SDMayer/Golden Gate Global/scripts/results.csv") as z:
  #                      z.write(my_string)