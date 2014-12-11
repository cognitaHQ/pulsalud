
# Copyright (c) 2014, Cognita.io
# All rights reserved.
# See BSD-3

import sys, os
import csv
from collections import defaultdict
import itertools

seriePFile = sys.argv[1] #"SerieP_txt_2012.txt"
FONASAdataFile = "FONASA-2012-data.csv"
FONASAcomunasFile = "FONASA-2012-comunas.csv"


def juanindex(x, target):
	assert target > 0.0001
	f = x/target

	if x < 0.0001: return 0
	elif f < 0.5: return 1
	elif f < 0.75: return 2
	elif f < 0.95: return 3
	elif f < 1.25: return 4

	return 5

def cumplimiento(x, totpop, target):
		cump = x/totpop
		j=juanindex(cump,target)
		return(cump, target, j)

#### MAIN

# obtener compensados por comuna

seriep = csv.reader(open(seriePFile),delimiter=';')

compensadosDiabetes=dict()
compensadosHipertension=dict()

comuna2est = defaultdict(set)
for row in seriep:
	if row[4]=="P4180300":		# diabeticos compensados
		mes, establecimiento, comuna, poblacion = row[0], row[3], row[6], int(row[7])
		comuna2est[comuna].add(establecimiento)
		if compensadosDiabetes.get(establecimiento,0) < poblacion:
			compensadosDiabetes[establecimiento] = poblacion
	elif row[4]=="P4180200":	# hipertensos compensados
		mes, establecimiento, comuna, poblacion = row[0], row[3], row[6], int(row[7])
		comuna2est[comuna].add(establecimiento)
		if compensadosHipertension.get(establecimiento,0) < poblacion:
			compensadosHipertension[establecimiento] = poblacion


# agrupemos por comuna

totDiabetesComuna = dict()
totHipertensionComuna = dict()

for comuna, establecimientos in comuna2est.items():
	totalDiabetesComuna = 0
	totalHipertensionComuna = 0

	for e in establecimientos:
		try:
			totalDiabetesComuna += compensadosDiabetes.get(e,0)
			totalHipertensionComuna += compensadosHipertension.get(e,0)
		except KeyError:
			print "No hay establecimiento %s en compensados" % e
			exit(1)
		except:
			print "Error en %s, %s" % (comuna, e)
			exit(1)
	totDiabetesComuna[comuna]=totalDiabetesComuna
	totHipertensionComuna[comuna]=totalHipertensionComuna

	# print comuna, totalComuna

# ahora obtengamos el nombre para las comunas

fdata = csv.reader(open(FONASAdataFile,'rU'),delimiter=',')

c2name=dict()
mycids = comuna2est.keys()

for row in fdata:
	cid = row[7]
	if cid in mycids:
		c2name[cid]=row[8]


# ahora calculamos el denominador

c2p15 = defaultdict(int)
c2p65 = defaultdict(int)

fcomunas = csv.reader(open(FONASAcomunasFile,'rU'),delimiter=',')

for row in fcomunas:
	idregion, comuna, p15, p65 = row[0], row[3], row[7], row[7]

	try:
		rid = int(idregion)
	except:
		continue

	#print comuna
	c2p15[comuna]+=int(p15.replace(",",""))
	c2p65[comuna]+=int(p65.replace(",",""))

#####

# output!

for comuna in mycids:

	name = c2name.get(comuna,"")


	p15,p65 = c2p15[name], c2p65[name]
	totPop = p15*0.1 + p65*0.25
	if totPop >0.1:
		diabetes=cumplimiento(totDiabetesComuna[comuna], totPop, 0.20)
		hipertension=cumplimiento(totHipertensionComuna[comuna], totPop, 0.47)
	else:
		diabetes = (0.0, 0.0, 0)
		hipertension = (0.0, 0.0, 0)

	resultados = [comuna, name]
	resultados.extend(diabetes)
	resultados.extend(hipertension)

	# ID, NAME, D, D, D, H, H, H
	# print "%s\t%s\t%.2f\t%.2f\t%d\t%.2f\t%.2f\t%d" % resultados
	print "%s\t%s\t%.2f\t%.2f\t%d\t%.2f\t%.2f\t%d" % tuple(resultados)





