class State():
    '''State can be used to push entire application state to GUI.'''
    def __init__(self):
        self.defaults = {
            'config': None,
            'status': 'Ready'
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