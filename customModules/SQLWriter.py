"""Service classes."""

from Utils import Namespace, MimetypeSelector, EnvironmentFactory
from SQLEndpoint import SQLEndpoint
from jinja2 import Template
from os import listdir, chdir, getcwd, walk
from os.path import isfile, join, exists
from flask import Response
import sys
import re
from flask_login import session
import json


class SQLWriter:
	settings = {}
	basedir = "components/sqlwriter/"
	flod = None
	env = None
	sqlserver = None

	def __init__(self, settings, app=None):
		"""Initializes class"""
		self.settings = settings
		self.ns = Namespace()
		self.mime = MimetypeSelector()
		self.sqlserver = SQLEndpoint(self.settings)
		self.flod = self.settings["flod"] if "flod" in self.settings else None
		e = EnvironmentFactory(self.settings, app)
		self.env = e.getEnvironment()

	def operations(self):
		print "hola Services"

	def test(self, r):
		if r["request"].method != 'POST':
			return {"accepted": False}
		myPath = r["localUri"].replace(self.settings["ns"]["local"], "", 1).split("/")
		file = myPath.pop(0)
		if exists(self.basedir + file):
			return {"accepted": True, "url": r["localUri"]}
		return {"accepted": False}

	def execute(self, req):
		"""Serves a URI, given that the test method returned True"""
		myPath = req["url"].replace(self.settings["ns"]["local"], "", 1).split("/")
		file = myPath.pop(0)
		currentDir = getcwd()
		sqlWriterService = self.basedir + file
		uri = req["url"]
		updatePath = "%s/" % sqlWriterService
		templatePath = "%s/" % sqlWriterService
		templateName =  self.mime.getExtension(req["request"].accept_mimetypes.best)
		queries = {}
		first={}
		renderedQueries = []
		for root, dirs, files in walk(updatePath):
			for filename in files:
				try:
					currentEndpoint = "local"
					_aux = root.rstrip("/").split("/").pop()
					if _aux != "queries":
						currentEndpoint = _aux
					if not filename.endswith(".update"):
						continue
					sqlQuery = self.env.get_template("%s/%s" % (root, filename))
					renderedSqlQuery = sqlQuery.render(queries=queries, first=first, uri=uri, session=session, flod=self.flod, args=myPath)
					if re.match("^\s*(insert|update|delete)", renderedSqlQuery, flags=re.IGNORECASE) is None:
						return {"content": "Not a valid SQL INSERT/UPDATE/DELETE query", "status": 500}
					renderedQueries.append({"query": renderedSqlQuery, "name": filename.replace(".query", "")})
				except Exception, ex:
					print sys.exc_info()
					print ex
					return {"content": "A problem with the SQL endpoint occurred", "status": 500}
		for q in renderedQueries:
			try:
				self.sqlserver.query(q["query"], currentEndpoint, update=True)
			except:
				print sys.exc_traceback.tb_lineno 
				return {"content": "{\"success\": false}", "status": 500, "mimetype": "application/json"}

		chdir(currentDir)
		# try:
		# 	if templateName == "json" and not isfile( "%s%s.template" % (templatePath, templateName)):
		# 		out = json.dumps(queries)
		# 	else:
		# 		content = self.env.get_template("%s%s.template" % (templatePath, templateName))
		# 		out = content.render(queries=queries, uri=uri, session=session, flod=self.flod, args=myPath)
		# except Exception:
		# 	print sys.exc_info()
		# 	return {"content": "{\"success\": false}", "status": 500, "mimetype": "application/json"}
		return {"content": "{\"success\": true}", "mimetype": "application/json"}


