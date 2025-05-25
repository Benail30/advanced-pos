import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

type TableInfo = {
  name: string;
  count: number;
};

type SchemaField = {
  name: string;
  type: string;
  isPrimary?: boolean;
  isRequired?: boolean;
  isUnique?: boolean;
  isForeignKey?: boolean;
  references?: string;
  default?: any;
};

export default function DbViewer() {
  const router = useRouter();
  const { table } = router.query;
  
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [viewRecord, setViewRecord] = useState<any>(null);
  
  // Fetch available tables when component mounts
  useEffect(() => {
    async function fetchTables() {
      try {
        setLoading(true);
        const response = await fetch('/api/db-viewer');
        const data = await response.json();
        
        if (data.tables) {
          setTables(data.tables);
        }
      } catch (err) {
        setError('Failed to load tables');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTables();
  }, []);
  
  // Fetch table data when table query parameter changes
  useEffect(() => {
    if (!table) {
      setLoading(false);
      return;
    }
    
    async function fetchTableData() {
      setLoading(true);
      setViewRecord(null);
      
      try {
        const response = await fetch(`/api/db-viewer?table=${table}`);
        const data = await response.json();
        
        if (data.data) {
          setTableData(data.data);
          setSchema(data.schema || []);
        } else {
          setError('No data found');
        }
      } catch (err) {
        setError('Failed to load table data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTableData();
  }, [table]);
  
  // Filter data based on search input
  const filteredData = tableData.filter((row) => {
    if (!filterValue) return true;
    
    return Object.values(row).some((value) => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(filterValue.toLowerCase());
    });
  });
  
  // Get columns for the current table
  const columns = schema.map(field => field.name);
  
  // Handle view record
  const handleViewRecord = (record: any) => {
    setViewRecord(record);
  };
  
  // Close detail view
  const handleCloseDetail = () => {
    setViewRecord(null);
  };
  
  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>Database Viewer | {table || 'Tables'}</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-4">Database Viewer</h1>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Sidebar with table list */}
        <div className="w-full md:w-1/4 bg-gray-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Database Tables</h2>
          <div className="space-y-1">
            {tables.map(tableInfo => (
              <Link 
                key={tableInfo.name}
                href={`/db-viewer?table=${tableInfo.name}`}
                className={`flex justify-between items-center p-3 rounded ${
                  table === tableInfo.name ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
                }`}
              >
                <span className="font-medium">{tableInfo.name}</span>
                <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {tableInfo.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Main content area */}
        <div className="w-full md:w-3/4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Loading data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 text-red-700">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          ) : !table ? (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold mb-6">Database Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tables.map(tableInfo => (
                  <div key={tableInfo.name} className="bg-gray-50 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium capitalize">{tableInfo.name}</h3>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{tableInfo.count}</p>
                    <Link 
                      href={`/db-viewer?table=${tableInfo.name}`}
                      className="text-blue-500 hover:underline mt-3 inline-block"
                    >
                      View details →
                    </Link>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-gray-600">
                Select a table from the sidebar to view its data
              </p>
            </div>
          ) : viewRecord ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold capitalize">
                  {table} Record Details
                </h2>
                <button 
                  onClick={handleCloseDetail}
                  className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-blue-50"
                >
                  Back to List
                </button>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  {Object.entries(viewRecord).map(([key, value]) => (
                    <div key={key} className="border-b pb-3">
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="mt-1 text-base">
                        {value === null ? (
                          <span className="text-gray-400 italic">null</span>
                        ) : typeof value === 'object' ? (
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        ) : (
                          String(value)
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-500 text-white p-4">
                <h2 className="text-xl font-semibold capitalize">
                  {table} Table
                  <span className="ml-2 bg-white text-blue-600 px-2 py-1 rounded text-sm">
                    {filteredData.length} records
                  </span>
                </h2>
                <p className="text-sm mt-1">Browse, search and view details of records</p>
              </div>
              
              <div className="p-4 border-b">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg pl-10"
                  />
                  <svg 
                    className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {filteredData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {filterValue ? (
                    <>
                      <p className="font-medium">No matching records found</p>
                      <p className="text-sm mt-1">Try changing your search criteria</p>
                    </>
                  ) : (
                    <p>No data available in this table</p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                        {schema.map(field => (
                          <th 
                            key={field.name} 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            title={`Type: ${field.type}${field.isPrimary ? ' • Primary Key' : ''}${field.isRequired ? ' • Required' : ''}`}
                          >
                            <div className="flex items-center">
                              {field.name}
                              {field.isPrimary && (
                                <span className="ml-1 text-yellow-500" title="Primary Key">🔑</span>
                              )}
                              {field.isForeignKey && (
                                <span className="ml-1 text-blue-500" title={`Foreign Key: ${field.references}`}>🔗</span>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleViewRecord(row)} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                          </td>
                          {columns.map(column => (
                            <td key={`${rowIndex}-${column}`} className="px-6 py-4 whitespace-nowrap">
                              {row[column] === null ? (
                                <span className="text-gray-400 italic">null</span>
                              ) : typeof row[column] === 'object' ? (
                                <span className="text-gray-500">[Object]</span>
                              ) : typeof row[column] === 'boolean' ? (
                                <span className={row[column] ? 'text-green-600' : 'text-red-600'}>
                                  {row[column] ? 'true' : 'false'}
                                </span>
                              ) : (
                                String(row[column])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 