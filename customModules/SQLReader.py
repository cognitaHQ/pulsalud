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


class SQLReader:
	settings = {}
	basedir = "components/sqlreader/"
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
		service = self.basedir + file
		uri = req["url"]
		queryPath = "%s/queries/" % service
		templatePath = "%s/" % service
		templateName =  self.mime.getExtension(req["request"].accept_mimetypes.best)
		try:
			onlyfiles = [f for f in listdir(queryPath) if isfile(join(queryPath, f))]
		except OSError:
			print "Warning: Can't find path %s for queries." % templatePath
			onlyfiles = []
		queries = {}
		first={}
		for root, dirs, files in walk(queryPath):
			for filename in files:
				try:
					currentEndpoint = "local"
					_aux = root.rstrip("/").split("/").pop()
					if _aux != "queries":
						currentEndpoint = _aux
					if not filename.endswith(".query"):
						continue
					sqlQuery = self.env.get_template("%s/%s" % (root, filename))
					renderedSqlQuery = sqlQuery.render(queries=queries, first=first, uri=uri, session=session, flod=self.flod, args=myPath)
					if re.match("^\s*select", renderedSqlQuery, flags=re.IGNORECASE) is None:
						return {"content": "Not a valid SQL Select query", "status": 500}
					results = self.sqlserver.query(renderedSqlQuery, currentEndpoint)
					_name = filename.replace(".query", "")
					queries[_name] = []
					if results is not None:
						queries[_name] = results

				except Exception, ex:
					print sys.exc_info()
					print ex
					return {"content": "A problem with the SQL endpoint occurred", "status": 500}
		chdir(currentDir)
		try:
			if templateName == "json" and not isfile( "%s%s.template" % (templatePath, templateName)):
				out = json.dumps(queries)
			else:
				content = self.env.get_template("%s%s.template" % (templatePath, templateName))
				out = content.render(queries=queries, uri=uri, session=session, flod=self.flod, args=myPath)
		except Exception:
			print sys.exc_info()
			return {"content": "Rendering problems" , "status": 500}
		return {"content": out, "mimetype": "text/html"}


