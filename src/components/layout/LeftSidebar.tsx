import { useState } from 'react'
import VariableList from '../variables/VariableList'
import DataSourcePanel from '../data/DataSourcePanel'

type Tab = 'variables' | 'data'

export default function LeftSidebar() {
  const [tab, setTab] = useState<Tab>('variables')

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('variables')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'variables'
              ? 'text-violet-600 border-b-2 border-violet-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Variables
        </button>
        <button
          onClick={() => setTab('data')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            tab === 'data'
              ? 'text-violet-600 border-b-2 border-violet-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Data
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === 'variables' ? <VariableList /> : <DataSourcePanel />}
      </div>
    </div>
  )
}
