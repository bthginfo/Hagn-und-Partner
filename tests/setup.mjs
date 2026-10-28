// Mark test workers explicitly before any server module selects its data source.
process.env.NODE_ENV = 'test';
