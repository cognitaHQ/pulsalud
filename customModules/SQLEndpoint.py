from Utils import Singleton
from sqlalchemy import create_engine
import sys
class SQLEndpoint:
    __metaclass__ = Singleton
    """Class in charge of managing the SQL Endpoints."""

    endpoints = {}
    settings = {}

    def __init__(self, settings):
        """Initialize."""
        self.settings = settings
        for k, e in self.settings["sqlserver"].iteritems():
            self.endpoints[k] = create_engine(e, convert_unicode=True)
            print "Creating engine named %s using %s" % (k, e)

    def query(self, q, thisEndpoint="local", update=False):
        """Query an endpoint."""
        if thisEndpoint not in self.endpoints:
            #Fail gracefully
            print "SQL endpoint '%s' not found, will use 'local' instead" % thisEndpoint
            thisEndpoint = "local"
        conn = self.endpoints[thisEndpoint].connect()
        results = []
        try:
            if update:
                conn.execute(q)
            else:
                r = conn.execute(q)
                for row in r:
               		results.append(row)
                return results
        except:
            print sys.exc_info()
            print sys.exc_traceback.tb_lineno 
            results = (None, None)
            raise
        finally:
        	conn.close()
        return results
