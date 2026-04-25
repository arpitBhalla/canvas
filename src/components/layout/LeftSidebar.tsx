import { useState } from 'react'
import { Database, Hash } from 'lucide-react'
import VariableList from '../variables/VariableList'
import DataSourcePanel from '../data/DataSourcePanel'

type Tab = 'variables' | 'data'

export default function LeftSidebar() {
  const [tab, setTab] = useState<Tab>('variables')

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-3 pt-3 pb-2">
        <div className="flex p-0.5 bg-gray-100 rounded-lg">
          <button
            onClick={() => setTab('variables')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'variables'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Hash size={13} />
            Variables
          </button>
          <button
            onClick={() => setTab('data')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-all ${
              tab === 'data'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Database size={13} />
            Data
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'variables' ? <VariableList /> : <DataSourcePanel />}
      </div>
    </div>
  )
}
