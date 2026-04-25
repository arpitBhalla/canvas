import { useState } from 'react'
import { Database, Hash, Layers } from 'lucide-react'
import VariableList from '../variables/VariableList'
import DataSourcePanel from '../data/DataSourcePanel'
import LayersPanel from '../layers/LayersPanel'

type Tab = 'layers' | 'variables' | 'data'

export default function LeftSidebar() {
  const [tab, setTab] = useState<Tab>('layers')

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="px-3 pt-3 pb-2">
        <div className="flex p-0.5 bg-gray-100 rounded-lg">
          <TabButton active={tab === 'layers'} onClick={() => setTab('layers')} icon={<Layers size={13} />}>
            Layers
          </TabButton>
          <TabButton active={tab === 'variables'} onClick={() => setTab('variables')} icon={<Hash size={13} />}>
            Vars
          </TabButton>
          <TabButton active={tab === 'data'} onClick={() => setTab('data')} icon={<Database size={13} />}>
            Data
          </TabButton>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scroll-thin">
        {tab === 'layers' && <LayersPanel />}
        {tab === 'variables' && <VariableList />}
        {tab === 'data' && <DataSourcePanel />}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-md transition-all ${
        active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}
