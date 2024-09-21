class State():
    '''State can be used to push entire application state to GUI.'''
    def __init__(self):
        self.cache = None
        self.testDefaults = {
            'serialNumber': 'Serial Number',
            'partNumber': 'Part Number',
            'partDescription': '',
            'rev': '--',
            'barcode': '',
            'success': True,
            'stepHistory': [],
            'stepHistoryVectors': [],
            'ffNumber': '',
            'ffName': ''
        }
        self.defaults = {
            'config': None,

            # GUI Elements
            'hostname': 'PC Name',
            'status': 'Idle',
            'indicators': {'RLY': False, 'NET': False, 'SQL': False},
            'progress': 0,
            'sequenceList': [],
            'sequenceRevision': '',
            'stepList': [],
            'stepIndex': 0,
            'stepNumber': '',
            'stepName': '',
            'instructions': '<h4>Standby for instructions.</h4>',
            'testStartTime': 0,
            'testDuration': 0,
            'testComment': '',
            'testWarning': '',
            'sequenceSelected': 'hot_loader',
            'detailedLogPath': 'detailed.log',
            'user': 'operator',
            'repeat': 1,
            'repeatCount': 1,
            'repeatSuccess': 0,
            'batchBarcodes': [],
            'batch': 1,
            'batchCount': 1,
            'batchSuccess': 0,

            # Test Data
            'testdata': [self.testDefaults],
            
            # Trigger Data
            'autoType': None,
            'showPicture': [''],
            'stepping': False,
            'focus': '',
            'countDownExpiration': 0,
            'failMode': 'stopOnFail',   #stopOnFail, pauseOnFail, continueOnFail
            'getAttention': ''
        }
        self.resetToDefaults()

    def add(self, key, value = None):
        """Add an item to the cache.
        Args:
            key (str): The key for the value.
            value: The optional value to be stored.
        """
        self.cache[key] = value


    def set(self, key, value):
        """
        Set a value in the cache.
        Args:
            key (str): The key for the value.
            value: The value to be stored.
        """
        if key in self.cache:
            self.cache[key] = value
    
    def get(self, key):
        """
        Get a value from the cache.
        Args:
            key (str): The key for the value.
        Returns:
            The value associated with the key, or None if not found.
        """
        if key in self.cache:
            return self.cache[key]
    
    def delete(self, key):
        """
        Delete a value from the cache.
        Args:
            key (str): The key for the value.
        """
        if key in self.cache:
            del self.cache[key]

    def clear(self):
        """
        Clear the entire cache.
        """
        self.cache.clear()
    
    def resetToDefaults(self):
        """Reset cache to default values."""
        self.cache = self.defaults