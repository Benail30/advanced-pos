const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 8080;

// Database connection
const pool = new Pool({
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  database: process.env.DATABASE_NAME || 'pos_db',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
});

// Serve static files
app.use(express.static('public'));

// Get all tables
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table schema
app.get('/api/tables/:tableName/schema', async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await pool.query(`
      SELECT 
        column_name, 
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching table schema:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table data
app.get('/api/tables/:tableName/data', async (req, res) => {
  try {
    const { tableName } = req.params;
    // Validate table name to prevent SQL injection
    if (!tableName.match(/^[a-zA-Z0-9_]+$/)) {
      return res.status(400).json({ error: 'Invalid table name' });
    }
    const result = await pool.query(`SELECT * FROM "${tableName}" LIMIT 100`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching table data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create a simple HTML page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Database Viewer</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
        }
        .container {
          display: flex;
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .sidebar {
          width: 250px;
          background-color: #f0f0f0;
          padding: 20px;
          border-right: 1px solid #ddd;
        }
        .content {
          flex: 1;
          padding: 20px;
          overflow: auto;
        }
        h1, h2, h3 {
          margin-top: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th, td {
          padding: 10px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .table-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .table-list li {
          padding: 8px 12px;
          cursor: pointer;
          border-radius: 4px;
          margin-bottom: 4px;
        }
        .table-list li:hover {
          background-color: #e0e0e0;
        }
        .table-list li.active {
          background-color: #007bff;
          color: white;
        }
        .tabs {
          display: flex;
          margin-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        .tab {
          padding: 10px 20px;
          cursor: pointer;
          border: 1px solid transparent;
          border-bottom: none;
          margin-right: 5px;
          border-radius: 4px 4px 0 0;
        }
        .tab.active {
          background-color: white;
          border-color: #ddd;
          border-bottom-color: white;
          margin-bottom: -1px;
        }
        .loading {
          text-align: center;
          padding: 20px;
          font-style: italic;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="sidebar">
          <h2>Tables</h2>
          <ul id="tableList" class="table-list">
            <li class="loading">Loading tables...</li>
          </ul>
        </div>
        <div class="content">
          <h1 id="tableName">Select a table</h1>
          <div class="tabs">
            <div class="tab active" id="schemaTab">Schema</div>
            <div class="tab" id="dataTab">Data</div>
          </div>
          <div id="schemaContent">
            <p>Select a table to view its schema</p>
          </div>
          <div id="dataContent" style="display: none;">
            <p>Select a table to view its data</p>
          </div>
        </div>
      </div>

      <script>
        // Fetch all tables
        fetch('/api/tables')
          .then(response => response.json())
          .then(tables => {
            const tableList = document.getElementById('tableList');
            tableList.innerHTML = '';
            
            tables.forEach(table => {
              const li = document.createElement('li');
              li.textContent = table.table_name;
              li.onclick = () => selectTable(table.table_name);
              tableList.appendChild(li);
            });
            
            if (tables.length === 0) {
              tableList.innerHTML = '<li>No tables found</li>';
            }
          })
          .catch(error => {
            console.error('Error fetching tables:', error);
            document.getElementById('tableList').innerHTML = 
              '<li>Error loading tables</li>';
          });

        // Tab switching
        document.getElementById('schemaTab').onclick = () => {
          document.getElementById('schemaTab').classList.add('active');
          document.getElementById('dataTab').classList.remove('active');
          document.getElementById('schemaContent').style.display = 'block';
          document.getElementById('dataContent').style.display = 'none';
        };

        document.getElementById('dataTab').onclick = () => {
          document.getElementById('dataTab').classList.add('active');
          document.getElementById('schemaTab').classList.remove('active');
          document.getElementById('dataContent').style.display = 'block';
          document.getElementById('schemaContent').style.display = 'none';
        };

        // Select a table
        function selectTable(tableName) {
          // Update active table in sidebar
          const items = document.querySelectorAll('#tableList li');
          items.forEach(item => {
            if (item.textContent === tableName) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          });

          // Update table name in content area
          document.getElementById('tableName').textContent = tableName;
          
          // Fetch schema
          document.getElementById('schemaContent').innerHTML = '<p class="loading">Loading schema...</p>';
          fetch(\`/api/tables/\${tableName}/schema\`)
            .then(response => response.json())
            .then(columns => {
              let html = '<table><thead><tr><th>Column</th><th>Type</th><th>Nullable</th><th>Default</th></tr></thead><tbody>';
              columns.forEach(column => {
                html += \`<tr>
                  <td>\${column.column_name}</td>
                  <td>\${column.data_type}</td>
                  <td>\${column.is_nullable === 'YES' ? 'Yes' : 'No'}</td>
                  <td>\${column.column_default || ''}</td>
                </tr>\`;
              });
              html += '</tbody></table>';
              document.getElementById('schemaContent').innerHTML = html;
            })
            .catch(error => {
              console.error('Error fetching schema:', error);
              document.getElementById('schemaContent').innerHTML = 
                '<p>Error loading schema</p>';
            });
          
          // Fetch data
          document.getElementById('dataContent').innerHTML = '<p class="loading">Loading data...</p>';
          fetch(\`/api/tables/\${tableName}/data\`)
            .then(response => response.json())
            .then(data => {
              if (data.length === 0) {
                document.getElementById('dataContent').innerHTML = '<p>No data in this table</p>';
                return;
              }
              
              // Create table headers from the first row
              const columns = Object.keys(data[0]);
              let html = '<table><thead><tr>';
              columns.forEach(column => {
                html += \`<th>\${column}</th>\`;
              });
              html += '</tr></thead><tbody>';
              
              // Add data rows
              data.forEach(row => {
                html += '<tr>';
                columns.forEach(column => {
                  const value = row[column] === null ? 'NULL' : row[column];
                  html += \`<td>\${value}</td>\`;
                });
                html += '</tr>';
              });
              html += '</tbody></table>';
              
              document.getElementById('dataContent').innerHTML = html;
            })
            .catch(error => {
              console.error('Error fetching data:', error);
              document.getElementById('dataContent').innerHTML = 
                '<p>Error loading data</p>';
            });
        }
      </script>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, () => {
  console.log(`Database viewer running at http://localhost:${port}`);
  
  // Open the browser automatically
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  const { exec } = require('child_process');
  exec(`${command} http://localhost:${port}`);
}); 